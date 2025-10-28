const Event = require('../models/Event');
const UserEvent = require('../models/UserEvent');
const User = require('../models/User');
const Tribe = require('../models/Tribe');
const { logger } = require('../utils/logger');
const { getQueue } = require('../queues/queueManager');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const progressionService = require('./progressionService');
const { io } = require('../sockets/socketService');

const eventQueue = getQueue('eventQueue');

// Clan War objectives and their corresponding activity types
const CLAN_WAR_OBJECTIVES = {
  most_battles_won: {
    title: 'Most Battles Won',
    description: 'Win the most battles this week',
    emoji: '⚔️',
    activityTypes: ['battle_won'],
    pointsPerAction: 10,
  },
  most_transformations: {
    title: 'Most Transformations',
    description: 'Create the most transformations this week',
    emoji: '🎨',
    activityTypes: ['transformation_created'],
    pointsPerAction: 5,
  },
  most_votes_contributed: {
    title: 'Most Votes Contributed',
    description: 'Cast the most votes this week',
    emoji: '🗳️',
    activityTypes: ['battle_voted'],
    pointsPerAction: 1,
  },
  most_active_members: {
    title: 'Most Active Members',
    description: 'Have the most active members this week',
    emoji: '👥',
    activityTypes: ['daily_login', 'any_activity'],
    pointsPerAction: 2,
  },
  most_referrals: {
    title: 'Most Referrals',
    description: 'Recruit the most new members this week',
    emoji: '📈',
    activityTypes: ['friend_invited'],
    pointsPerAction: 15,
  },
  most_engagement: {
    title: 'Most Engagement',
    description: 'Generate the most overall engagement this week',
    emoji: '🔥',
    activityTypes: ['transformation_created', 'battle_won', 'battle_voted', 'friend_invited'],
    pointsPerAction: 3,
  },
};

const eventsService = {
  /**
   * Creates a new clan war event for the week
   * @param {Date} startDate - Start date (Monday)
   * @returns {Promise<Object>} The created clan war event
   */
  async createClanWar(startDate = new Date()) {
    const now = new Date(startDate);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(7, 0, 0, 0); // 7 AM Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999); // Sunday 11:59 PM
    
    const weekNumber = this.getWeekNumber(startOfWeek);
    const year = startOfWeek.getFullYear();
    
    // Select random objective
    const objectives = Object.keys(CLAN_WAR_OBJECTIVES);
    const objective = objectives[Math.floor(Math.random() * objectives.length)];
    const objectiveData = CLAN_WAR_OBJECTIVES[objective];
    
    const event = await Event.create({
      type: 'clan_war',
      title: `🔥 Clan War - ${objectiveData.title}`,
      description: objectiveData.description,
      emoji: objectiveData.emoji,
      startAt: startOfWeek,
      endAt: endOfWeek,
      objective,
      status: 'scheduled',
      rewards: {
        clanBadge: `warrior_${objective}`,
        badgeDuration: 7,
        premiumStyles: 3,
        doubleXPDuration: 48,
        crownIcon: true,
      },
      clanWar: {
        weekNumber,
        year,
      },
    });
    
    // Initialize all tribes for this war
    await this.initializeTribesForWar(event._id, objective, weekNumber, year);
    
    logger.info(`Created clan war for week ${weekNumber}, ${year}: ${objectiveData.title}`);
    return event;
  },

  /**
   * Creates a power hour event for today
   * @param {Date} date - The date for the power hour
   * @returns {Promise<Object>} The created power hour event
   */
  async createPowerHour(date = new Date()) {
    const today = new Date(date);
    const powerHourStart = new Date(today);
    powerHourStart.setHours(19, 0, 0, 0); // 7 PM
    
    const powerHourEnd = new Date(powerHourStart);
    powerHourEnd.setMinutes(powerHourEnd.getMinutes() + 60); // 60 minutes
    
    // Check if power hour already exists for today
    const existingPowerHour = await Event.getTodaysPowerHour();
    if (existingPowerHour) {
      return existingPowerHour;
    }
    
    const event = await Event.create({
      type: 'power_hour',
      title: '⚡ Power Hour',
      description: 'Double XP and Clan Points for 60 minutes!',
      emoji: '⚡',
      startAt: powerHourStart,
      endAt: powerHourEnd,
      status: 'scheduled',
      multipliers: {
        xp: 2,
        clanPoints: 2,
        transformationCredits: 1,
        coins: 1,
      },
      rewards: {
        powerHourMultipliers: {
          xp: 2,
          clanPoints: 2,
        },
      },
      powerHour: {
        timezone: 'UTC',
        localTime: '19:00',
        duration: 60,
        notificationSent: false,
      },
    });
    
    logger.info(`Created power hour for ${today.toDateString()}`);
    return event;
  },

  /**
   * Initializes all tribes for a clan war
   * @param {string} eventId - The event ID
   * @param {string} objective - The war objective
   * @param {number} weekNumber - Week number
   * @param {number} year - Year
   */
  async initializeTribesForWar(eventId, objective, weekNumber, year) {
    const tribes = await Tribe.find({});
    
    for (const tribe of tribes) {
      tribe.clanWar.currentWar = {
        weekNumber,
        year,
        objective,
        score: 0,
        rank: null,
        lastUpdated: new Date(),
      };
      await tribe.save();
    }
    
    logger.info(`Initialized ${tribes.length} tribes for clan war`);
  },

  /**
   * Updates clan war score for a tribe based on user activity
   * @param {string} userId - The user ID
   * @param {string} activityType - The activity type
   * @param {number} value - The activity value
   * @param {Object} metadata - Additional metadata
   */
  async updateClanWarScore(userId, activityType, value = 1, metadata = {}) {
    const user = await User.findById(userId);
    if (!user.tribe) return;
    
    const currentWar = await Event.getCurrentClanWar();
    if (!currentWar) return;
    
    const tribe = await Tribe.findById(user.tribe);
    if (!tribe) return;
    
    // Check if activity counts for current objective
    const objectiveData = CLAN_WAR_OBJECTIVES[currentWar.objective];
    if (!objectiveData.activityTypes.includes(activityType)) {
      return;
    }
    
    // Calculate points
    const points = value * objectiveData.pointsPerAction;
    
    // Update tribe score
    tribe.clanWar.currentWar.score = (tribe.clanWar.currentWar.score || 0) + points;
    tribe.clanWar.currentWar.lastUpdated = new Date();
    await tribe.save();
    
    // Update user participation
    await this.updateUserEventParticipation(userId, currentWar._id, activityType, value, {
      xpEarned: 0, // Will be calculated by multipliers
      clanPointsEarned: points,
      coinsEarned: 0,
      multiplierApplied: 1,
    });
    
    // Emit real-time update
    io.to(`tribe_${tribe._id}`).emit('clan_war_update', {
      score: tribe.clanWar.currentWar.score,
      objective: currentWar.objective,
      lastActivity: activityType,
    });
    
    logger.info(`Updated clan war score for tribe ${tribe.name}: +${points} points`);
  },

  /**
   * Updates user event participation
   * @param {string} userId - The user ID
   * @param {string} eventId - The event ID
   * @param {string} activityType - The activity type
   * @param {number} value - The activity value
   * @param {Object} rewards - Rewards earned
   */
  async updateUserEventParticipation(userId, eventId, activityType, value, rewards = {}) {
    const event = await Event.findById(eventId);
    if (!event) return;
    
    // Get or create user event participation
    let userEvent = await UserEvent.findOne({
      userId,
      eventId,
      isActive: true,
    });
    
    if (!userEvent) {
      userEvent = await UserEvent.create({
        userId,
        eventId,
        eventType: event.type,
        eventDate: new Date(),
        weekNumber: event.clanWar?.weekNumber,
        year: event.clanWar?.year,
        participationStats: {
          totalActions: 0,
          totalXP: 0,
          totalClanPoints: 0,
          totalCoins: 0,
          multiplierBonus: 0,
        },
        activities: [],
        rewardsEarned: [],
        isActive: true,
      });
    }
    
    // Apply multipliers if power hour is active
    const multipliers = event.getCurrentMultipliers();
    const xpEarned = (rewards.xpEarned || 0) * multipliers.xp;
    const clanPointsEarned = (rewards.clanPointsEarned || 0) * multipliers.clanPoints;
    const coinsEarned = (rewards.coinsEarned || 0) * multipliers.coins;
    
    // Update participation stats
    userEvent.participationStats.totalActions += value;
    userEvent.participationStats.totalXP += xpEarned;
    userEvent.participationStats.totalClanPoints += clanPointsEarned;
    userEvent.participationStats.totalCoins += coinsEarned;
    
    if (multipliers.xp > 1 || multipliers.clanPoints > 1) {
      userEvent.participationStats.multiplierBonus += 
        (xpEarned - (rewards.xpEarned || 0)) + 
        (clanPointsEarned - (rewards.clanPointsEarned || 0));
    }
    
    // Add activity
    userEvent.activities.push({
      type: activityType,
      count: value,
      xpEarned,
      clanPointsEarned,
      coinsEarned,
      multiplierApplied: multipliers.xp,
      timestamp: new Date(),
    });
    
    await userEvent.save();
    
    // Emit user update
    io.to(userId.toString()).emit('event_participation_update', {
      eventType: event.type,
      totalActions: userEvent.participationStats.totalActions,
      totalXP: userEvent.participationStats.totalXP,
      totalClanPoints: userEvent.participationStats.totalClanPoints,
      multiplierBonus: userEvent.participationStats.multiplierBonus,
    });
  },

  /**
   * Gets current active event
   * @returns {Promise<Object>} Current active event
   */
  async getCurrentActiveEvent() {
    return await Event.getCurrentActiveEvent();
  },

  /**
   * Gets upcoming event
   * @returns {Promise<Object>} Upcoming event
   */
  async getUpcomingEvent() {
    return await Event.getUpcomingEvent();
  },

  /**
   * Gets current clan war standings
   * @returns {Promise<Array>} Clan war standings
   */
  async getClanWarStandings() {
    const currentWar = await Event.getCurrentClanWar();
    if (!currentWar) return [];
    
    const tribes = await Tribe.find({})
      .sort({ 'clanWar.currentWar.score': -1 })
      .select('name displayName emblem clanWar stats');
    
    return tribes.map((tribe, index) => ({
      rank: index + 1,
      tribe: {
        id: tribe._id,
        name: tribe.name,
        displayName: tribe.displayName,
        emblem: tribe.emblem,
      },
      score: tribe.clanWar.currentWar.score || 0,
      members: tribe.stats.members,
      lastUpdated: tribe.clanWar.currentWar.lastUpdated,
    }));
  },

  /**
   * Gets power hour status
   * @returns {Promise<Object>} Power hour status
   */
  async getPowerHourStatus() {
    const powerHour = await Event.getTodaysPowerHour();
    if (!powerHour) return null;
    
    const now = new Date();
    const timeUntilStart = powerHour.startAt.getTime() - now.getTime();
    const timeUntilEnd = powerHour.endAt.getTime() - now.getTime();
    
    return {
      event: powerHour,
      isActive: powerHour.isCurrentlyActive,
      isUpcoming: powerHour.isUpcoming,
      timeUntilStart: Math.max(0, timeUntilStart),
      timeUntilEnd: Math.max(0, timeUntilEnd),
      multipliers: powerHour.getCurrentMultipliers(),
    };
  },

  /**
   * Processes clan war completion and distributes rewards
   */
  async processClanWarCompletion() {
    const currentWar = await Event.getCurrentClanWar();
    if (!currentWar) return;
    
    // Get final standings
    const standings = await this.getClanWarStandings();
    
    // Update event with final standings
    currentWar.clanWar.finalStandings = standings.map(standing => ({
      tribe: standing.tribe.id,
      score: standing.score,
      rank: standing.rank,
    }));
    
    if (standings.length > 0) {
      currentWar.clanWar.winningTribe = standings[0].tribe.id;
    }
    
    currentWar.status = 'completed';
    await currentWar.save();
    
    // Distribute rewards to winning tribe
    if (standings.length > 0) {
      const winningTribe = await Tribe.findById(standings[0].tribe.id);
      if (winningTribe) {
        // Update tribe war history
        winningTribe.clanWar.warHistory.push({
          weekNumber: currentWar.clanWar.weekNumber,
          year: currentWar.clanWar.year,
          objective: currentWar.objective,
          finalScore: standings[0].score,
          finalRank: 1,
          won: true,
          rewards: currentWar.rewards,
          completedAt: new Date(),
        });
        
        winningTribe.clanWar.totalWarsWon += 1;
        winningTribe.clanWar.currentStreak += 1;
        winningTribe.clanWar.longestStreak = Math.max(
          winningTribe.clanWar.longestStreak,
          winningTribe.clanWar.currentStreak
        );
        
        await winningTribe.save();
        
        // Notify all tribe members
        const tribeMembers = await User.find({ tribe: winningTribe._id });
        for (const member of tribeMembers) {
          await notificationService.createNotification(member._id, {
            type: 'clan_war_won',
            title: `🏆 Clan War Victory!`,
            message: `${winningTribe.displayName} won the weekly clan war!`,
            deeplink: '/app/events',
          });
        }
        
        logger.info(`Tribe ${winningTribe.displayName} won clan war: ${currentWar.title}`);
      }
    }
    
    // Update other tribes' war history
    for (let i = 1; i < standings.length; i++) {
      const tribe = await Tribe.findById(standings[i].tribe.id);
      if (tribe) {
        tribe.clanWar.warHistory.push({
          weekNumber: currentWar.clanWar.weekNumber,
          year: currentWar.clanWar.year,
          objective: currentWar.objective,
          finalScore: standings[i].score,
          finalRank: standings[i].rank,
          won: false,
          rewards: {},
          completedAt: new Date(),
        });
        
        tribe.clanWar.currentStreak = 0; // Reset streak for non-winners
        await tribe.save();
      }
    }
  },

  /**
   * Sends power hour notification
   */
  async sendPowerHourNotification() {
    const powerHour = await Event.getTodaysPowerHour();
    if (!powerHour || powerHour.powerHour.notificationSent) return;
    
    const now = new Date();
    const timeUntilStart = powerHour.startAt.getTime() - now.getTime();
    
    // Send notification 5 minutes before power hour
    if (timeUntilStart <= 5 * 60 * 1000 && timeUntilStart > 0) {
      const users = await User.find({});
      
      for (const user of users) {
        await notificationService.createNotification(user._id, {
          type: 'power_hour_starting',
          title: `⚡ Power Hour Starting Soon!`,
          message: 'Double XP and Clan Points in 5 minutes!',
          deeplink: '/app/events',
        });
      }
      
      powerHour.powerHour.notificationSent = true;
      await powerHour.save();
      
      logger.info('Sent power hour notifications to all users');
    }
  },

  /**
   * Gets week number for a given date
   * @param {Date} date - The date
   * @returns {number} Week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  },

  /**
   * Gets user's event participation stats
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User's event stats
   */
  async getUserEventStats(userId) {
    const userEvents = await UserEvent.find({
      userId,
      isActive: true,
    }).populate('eventId');
    
    const stats = {
      totalEventsParticipated: userEvents.length,
      totalActions: 0,
      totalXP: 0,
      totalClanPoints: 0,
      totalCoins: 0,
      multiplierBonus: 0,
      clanWarsParticipated: 0,
      powerHoursParticipated: 0,
      recentActivities: [],
    };
    
    for (const userEvent of userEvents) {
      stats.totalActions += userEvent.participationStats.totalActions;
      stats.totalXP += userEvent.participationStats.totalXP;
      stats.totalClanPoints += userEvent.participationStats.totalClanPoints;
      stats.totalCoins += userEvent.participationStats.totalCoins;
      stats.multiplierBonus += userEvent.participationStats.multiplierBonus;
      
      if (userEvent.eventType === 'clan_war') {
        stats.clanWarsParticipated += 1;
      } else if (userEvent.eventType === 'power_hour') {
        stats.powerHoursParticipated += 1;
      }
      
      // Add recent activities
      stats.recentActivities.push(...userEvent.activities.slice(-5));
    }
    
    // Sort recent activities by timestamp
    stats.recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    stats.recentActivities = stats.recentActivities.slice(0, 10);
    
    return stats;
  },
};

module.exports = eventsService;
