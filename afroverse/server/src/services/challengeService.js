const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const User = require('../models/User');
const Tribe = require('../models/Tribe');
const { logger } = require('../utils/logger');
const { getQueue } = require('../queues/queueManager');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const progressionService = require('./progressionService');
const { io } = require('../sockets/socketService');

const challengeQueue = getQueue('challengeQueue');

// Daily challenge templates
const DAILY_CHALLENGE_TEMPLATES = [
  {
    title: 'Zulu Warrior Monday',
    description: 'Create 1 transformation',
    emoji: '⚔️',
    objective: 'create_transformation',
    targetValue: 1,
    culturalTheme: 'zulu_warrior',
    rewards: { xp: 25, clanPoints: 1 },
    difficulty: 'easy',
  },
  {
    title: 'Battle Judge Tuesday',
    description: 'Vote on 10 battles',
    emoji: '⚖️',
    objective: 'vote_battles',
    targetValue: 10,
    culturalTheme: 'general',
    rewards: { transformationCredits: 1 },
    difficulty: 'easy',
  },
  {
    title: 'Warrior Wednesday',
    description: 'Win or participate in 1 battle',
    emoji: '🏆',
    objective: 'participate_battle',
    targetValue: 1,
    culturalTheme: 'general',
    rewards: { xp: 50 },
    difficulty: 'medium',
  },
  {
    title: 'Recruitment Thursday',
    description: 'Invite 1 friend',
    emoji: '👥',
    objective: 'invite_friend',
    targetValue: 1,
    culturalTheme: 'general',
    rewards: { premiumStyleUnlock: '24h_unlock' },
    difficulty: 'medium',
  },
  {
    title: 'Friday Frenzy',
    description: 'Upload 2 transformations',
    emoji: '🔥',
    objective: 'upload_transformations',
    targetValue: 2,
    culturalTheme: 'general',
    rewards: { xp: 30, clanPoints: 2 },
    difficulty: 'medium',
  },
  {
    title: 'Tribe Support Saturday',
    description: 'Support your tribe - Vote 20 times',
    emoji: '🤝',
    objective: 'support_tribe',
    targetValue: 20,
    culturalTheme: 'general',
    rewards: { xp: 100 },
    difficulty: 'hard',
  },
  {
    title: 'Wildcard Sunday',
    description: 'Complete any activity',
    emoji: '🎲',
    objective: 'wildcard_activity',
    targetValue: 1,
    culturalTheme: 'wildcard',
    rewards: { streakSaver: true },
    difficulty: 'easy',
  },
];

// Weekly challenge templates
const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    title: 'Battle of Nations',
    description: 'Most winning battles',
    emoji: '⚔️',
    objective: 'weekly_battles',
    culturalTheme: 'general',
    rewards: { multiplier: 2, totemUnlocked: 'victory_totem' },
  },
  {
    title: 'Great Recruitment Week',
    description: 'Most referrals',
    emoji: '👥',
    objective: 'weekly_referrals',
    culturalTheme: 'general',
    rewards: { multiplier: 1.5, badgeUnlocked: 'recruiter_badge' },
  },
  {
    title: 'Heritage Week',
    description: 'Most transformations',
    emoji: '🎨',
    objective: 'weekly_transformations',
    culturalTheme: 'general',
    rewards: { multiplier: 1.5, totemUnlocked: 'heritage_totem' },
  },
];

const challengeService = {
  /**
   * Creates today's daily challenge if it doesn't exist
   * @param {Date} date - The date for the challenge (defaults to today)
   * @returns {Promise<Object>} The created or existing challenge
   */
  async createTodaysDailyChallenge(date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if challenge already exists
    const existingChallenge = await Challenge.findOne({
      type: 'daily',
      startDate: { $gte: today },
      endDate: { $lt: tomorrow },
    });

    if (existingChallenge) {
      return existingChallenge;
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    const template = DAILY_CHALLENGE_TEMPLATES[dayOfWeek];

    if (!template) {
      throw new Error(`No template found for day ${dayOfWeek}`);
    }

    const challenge = await Challenge.create({
      type: 'daily',
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      objective: template.objective,
      targetValue: template.targetValue,
      culturalTheme: template.culturalTheme,
      difficulty: template.difficulty,
      rewards: template.rewards,
      startDate: today,
      endDate: tomorrow,
      isActive: true,
    });

    logger.info(`Created daily challenge for ${today.toDateString()}: ${challenge.title}`);
    return challenge;
  },

  /**
   * Creates this week's weekly challenge if it doesn't exist
   * @param {Date} date - The date for the challenge (defaults to today)
   * @returns {Promise<Object>} The created or existing challenge
   */
  async createWeeklyChallenge(date = new Date()) {
    const now = new Date(date);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get week number
    const weekNumber = this.getWeekNumber(startOfWeek);
    const year = startOfWeek.getFullYear();

    // Check if challenge already exists
    const existingChallenge = await Challenge.findOne({
      type: 'weekly',
      weekNumber,
      year,
    });

    if (existingChallenge) {
      return existingChallenge;
    }

    // Select random weekly challenge template
    const template = WEEKLY_CHALLENGE_TEMPLATES[
      Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)
    ];

    const challenge = await Challenge.create({
      type: 'weekly',
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      objective: template.objective,
      targetValue: 1, // Weekly challenges are typically "most" or "first to"
      culturalTheme: template.culturalTheme,
      difficulty: 'hard',
      rewards: template.rewards,
      startDate: startOfWeek,
      endDate: endOfWeek,
      weekNumber,
      year,
      isActive: true,
    });

    logger.info(`Created weekly challenge for week ${weekNumber}, ${year}: ${challenge.title}`);
    return challenge;
  },

  /**
   * Gets or creates today's daily challenge for a user
   * @param {string} userId - The user ID
   * @param {Date} date - The date (defaults to today)
   * @returns {Promise<Object>} User's daily challenge
   */
  async getUserDailyChallenge(userId, date = new Date()) {
    // Ensure today's challenge exists
    await this.createTodaysDailyChallenge(date);

    // Get or create user challenge
    let userChallenge = await UserChallenge.getUserDailyChallenge(userId, date);

    if (!userChallenge) {
      const challenge = await Challenge.getTodaysDailyChallenge();
      
      userChallenge = await UserChallenge.create({
        userId,
        challengeId: challenge._id,
        challengeDate: new Date(date),
        progress: 0,
        isCompleted: false,
      });

      logger.info(`Created user daily challenge for user ${userId}`);
    }

    // Populate challenge details
    await userChallenge.populate('challengeId');
    return userChallenge;
  },

  /**
   * Gets or creates this week's weekly challenge for a user
   * @param {string} userId - The user ID
   * @param {Date} date - The date (defaults to today)
   * @returns {Promise<Object>} User's weekly challenge
   */
  async getUserWeeklyChallenge(userId, date = new Date()) {
    // Ensure this week's challenge exists
    await this.createWeeklyChallenge(date);

    const weekNumber = this.getWeekNumber(date);
    const year = date.getFullYear();

    // Get or create user challenge
    let userChallenge = await UserChallenge.getUserWeeklyChallenge(userId, weekNumber, year);

    if (!userChallenge) {
      const challenge = await Challenge.getCurrentWeeklyChallenge();
      
      userChallenge = await UserChallenge.create({
        userId,
        challengeId: challenge._id,
        weekNumber,
        year,
        challengeDate: new Date(date),
        progress: 0,
        isCompleted: false,
      });

      logger.info(`Created user weekly challenge for user ${userId}`);
    }

    // Populate challenge details
    await userChallenge.populate('challengeId');
    return userChallenge;
  },

  /**
   * Updates user's challenge progress
   * @param {string} userId - The user ID
   * @param {string} activityType - The type of activity
   * @param {number} value - The value to add to progress
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Updated challenge progress
   */
  async updateChallengeProgress(userId, activityType, value = 1, metadata = {}) {
    const today = new Date();
    
    // Update daily challenge progress
    const dailyChallenge = await this.getUserDailyChallenge(userId, today);
    const dailyProgress = this.calculateProgress(dailyChallenge.challengeId, activityType, value);
    
    if (dailyProgress > 0) {
      dailyChallenge.progress = Math.min(
        dailyChallenge.progress + dailyProgress,
        dailyChallenge.challengeId.targetValue
      );
      
      // Add activity to metadata
      dailyChallenge.metadata.activities.push({
        type: activityType,
        timestamp: new Date(),
        value: dailyProgress,
      });
      
      await dailyChallenge.save();
      
      // Check if daily challenge is completed
      if (dailyChallenge.progress >= dailyChallenge.challengeId.targetValue && !dailyChallenge.isCompleted) {
        await this.completeChallenge(userId, dailyChallenge._id, 'daily');
      }
    }

    // Update weekly challenge progress
    const weeklyChallenge = await this.getUserWeeklyChallenge(userId, today);
    const weeklyProgress = this.calculateProgress(weeklyChallenge.challengeId, activityType, value);
    
    if (weeklyProgress > 0) {
      weeklyChallenge.progress = Math.min(
        weeklyChallenge.progress + weeklyProgress,
        weeklyChallenge.challengeId.targetValue
      );
      
      // Add activity to metadata
      weeklyChallenge.metadata.activities.push({
        type: activityType,
        timestamp: new Date(),
        value: weeklyProgress,
      });
      
      await weeklyChallenge.save();
      
      // Check if weekly challenge is completed
      if (weeklyChallenge.progress >= weeklyChallenge.challengeId.targetValue && !weeklyChallenge.isCompleted) {
        await this.completeChallenge(userId, weeklyChallenge._id, 'weekly');
      }
    }

    // Update tribe weekly challenge score
    await this.updateTribeWeeklyChallenge(userId, activityType, value);

    return {
      daily: dailyChallenge,
      weekly: weeklyChallenge,
    };
  },

  /**
   * Completes a challenge and distributes rewards
   * @param {string} userId - The user ID
   * @param {string} userChallengeId - The user challenge ID
   * @param {string} challengeType - 'daily' or 'weekly'
   * @returns {Promise<Object>} Completion result
   */
  async completeChallenge(userId, userChallengeId, challengeType) {
    const userChallenge = await UserChallenge.findById(userChallengeId).populate('challengeId');
    
    if (!userChallenge || userChallenge.isCompleted) {
      return { success: false, message: 'Challenge not found or already completed' };
    }

    const user = await User.findById(userId);
    const challenge = userChallenge.challengeId;

    // Mark as completed
    userChallenge.isCompleted = true;
    userChallenge.completedAt = new Date();
    await userChallenge.save();

    // Distribute rewards
    const rewards = [];
    
    if (challenge.rewards.xp > 0) {
      await progressionService.addXP(userId, challenge.rewards.xp, `challenge_${challengeType}_completion`);
      rewards.push({ type: 'xp', amount: challenge.rewards.xp });
    }

    if (challenge.rewards.clanPoints > 0) {
      // Award clan points to user's tribe
      if (user.tribe) {
        const tribe = await Tribe.findById(user.tribe);
        if (tribe) {
          await tribe.awardPoints(challenge.rewards.clanPoints);
          rewards.push({ type: 'clanPoints', amount: challenge.rewards.clanPoints });
        }
      }
    }

    if (challenge.rewards.transformationCredits > 0) {
      await progressionService.addTransformationCredit(userId, challenge.rewards.transformationCredits);
      rewards.push({ type: 'transformationCredits', amount: challenge.rewards.transformationCredits });
    }

    if (challenge.rewards.coins > 0) {
      await walletService.earnCoins(userId, challenge.rewards.coins, `challenge_${challengeType}_completion`);
      rewards.push({ type: 'coins', amount: challenge.rewards.coins });
    }

    if (challenge.rewards.streakSaver) {
      user.challenges.streakFreezes = (user.challenges.streakFreezes || 0) + 1;
      await user.save();
      rewards.push({ type: 'streakSaver', amount: 1 });
    }

    // Update user challenge stats
    if (challengeType === 'daily') {
      user.challenges.totalCompleted.daily = (user.challenges.totalCompleted.daily || 0) + 1;
      user.challenges.lastDailyChallengeDate = new Date();
      
      // Update daily streak
      await this.updateDailyStreak(userId);
    } else {
      user.challenges.totalCompleted.weekly = (user.challenges.totalCompleted.weekly || 0) + 1;
      user.challenges.lastWeeklyChallengeWeek = this.getWeekNumber(new Date());
      
      // Update weekly streak
      await this.updateWeeklyStreak(userId);
    }

    await user.save();

    // Send notification
    await notificationService.createNotification(userId, {
      type: 'challenge_completed',
      title: `🎉 Challenge Complete!`,
      message: `${challenge.title} - You earned rewards!`,
      deeplink: '/app/challenges',
    });

    // Emit real-time update
    io.to(userId.toString()).emit('challenge_completed', {
      challengeType,
      challenge: challenge,
      rewards,
      streak: {
        daily: user.challenges.dailyStreak.current,
        weekly: user.challenges.weeklyStreak.current,
      },
    });

    logger.info(`User ${userId} completed ${challengeType} challenge: ${challenge.title}`);
    
    return {
      success: true,
      challenge,
      rewards,
      streak: {
        daily: user.challenges.dailyStreak.current,
        weekly: user.challenges.weeklyStreak.current,
      },
    };
  },

  /**
   * Updates tribe weekly challenge score
   * @param {string} userId - The user ID
   * @param {string} activityType - The type of activity
   * @param {number} value - The value to add
   */
  async updateTribeWeeklyChallenge(userId, activityType, value) {
    const user = await User.findById(userId);
    if (!user.tribe) return;

    const tribe = await Tribe.findById(user.tribe);
    if (!tribe) return;

    const weeklyChallenge = await Challenge.getCurrentWeeklyChallenge();
    if (!weeklyChallenge) return;

    // Update tribe's weekly challenge score based on objective
    let scoreIncrease = 0;
    
    switch (weeklyChallenge.objective) {
      case 'weekly_battles':
        if (activityType === 'battle_won') {
          scoreIncrease = value;
        }
        break;
      case 'weekly_referrals':
        if (activityType === 'friend_invited') {
          scoreIncrease = value;
        }
        break;
      case 'weekly_transformations':
        if (activityType === 'transformation_created') {
          scoreIncrease = value;
        }
        break;
      case 'most_votes':
        if (activityType === 'battle_voted') {
          scoreIncrease = value;
        }
        break;
      case 'most_activity':
        scoreIncrease = value; // Any activity counts
        break;
    }

    if (scoreIncrease > 0) {
      tribe.weeklyChallenge.score = (tribe.weeklyChallenge.score || 0) + scoreIncrease;
      await tribe.save();

      // Emit tribe update
      io.to(`tribe_${tribe._id}`).emit('tribe_challenge_update', {
        score: tribe.weeklyChallenge.score,
        objective: weeklyChallenge.objective,
      });
    }
  },

  /**
   * Updates user's daily streak
   * @param {string} userId - The user ID
   */
  async updateDailyStreak(userId) {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.challenges.dailyStreak.lastActiveAt;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastActive || lastActive < yesterday) {
      // Streak broken or first time
      user.challenges.dailyStreak.current = 1;
    } else if (lastActive < today) {
      // Continuing streak
      user.challenges.dailyStreak.current = (user.challenges.dailyStreak.current || 0) + 1;
    }

    user.challenges.dailyStreak.longest = Math.max(
      user.challenges.dailyStreak.longest || 0,
      user.challenges.dailyStreak.current
    );
    user.challenges.dailyStreak.lastActiveAt = today;

    await user.save();
  },

  /**
   * Updates user's weekly streak
   * @param {string} userId - The user ID
   */
  async updateWeeklyStreak(userId) {
    const user = await User.findById(userId);
    const currentWeek = this.getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    const lastActiveWeek = user.challenges.weeklyStreak.lastActiveAt;
    const lastWeek = this.getWeekNumber(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    if (!lastActiveWeek || lastActiveWeek < lastWeek) {
      // Streak broken or first time
      user.challenges.weeklyStreak.current = 1;
    } else if (lastActiveWeek < currentWeek) {
      // Continuing streak
      user.challenges.weeklyStreak.current = (user.challenges.weeklyStreak.current || 0) + 1;
    }

    user.challenges.weeklyStreak.longest = Math.max(
      user.challenges.weeklyStreak.longest || 0,
      user.challenges.weeklyStreak.current
    );
    user.challenges.weeklyStreak.lastActiveAt = new Date();

    await user.save();
  },

  /**
   * Calculates progress based on activity type and challenge objective
   * @param {Object} challenge - The challenge object
   * @param {string} activityType - The activity type
   * @param {number} value - The activity value
   * @returns {number} Progress to add
   */
  calculateProgress(challenge, activityType, value) {
    switch (challenge.objective) {
      case 'create_transformation':
        return activityType === 'transformation_created' ? value : 0;
      case 'vote_battles':
        return activityType === 'battle_voted' ? value : 0;
      case 'win_battle':
        return activityType === 'battle_won' ? value : 0;
      case 'participate_battle':
        return (activityType === 'battle_won' || activityType === 'battle_participated') ? value : 0;
      case 'invite_friend':
        return activityType === 'friend_invited' ? value : 0;
      case 'upload_transformations':
        return activityType === 'transformation_created' ? value : 0;
      case 'support_tribe':
        return activityType === 'battle_voted' ? value : 0;
      case 'wildcard_activity':
        return value; // Any activity counts
      case 'weekly_battles':
        return activityType === 'battle_won' ? value : 0;
      case 'weekly_referrals':
        return activityType === 'friend_invited' ? value : 0;
      case 'weekly_transformations':
        return activityType === 'transformation_created' ? value : 0;
      default:
        return 0;
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
   * Gets user's challenge statistics
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User's challenge stats
   */
  async getUserChallengeStats(userId) {
    const user = await User.findById(userId).select('challenges');
    const completedChallenges = await UserChallenge.getUserCompletedChallenges(userId, 100);
    
    return {
      dailyStreak: user.challenges.dailyStreak,
      weeklyStreak: user.challenges.weeklyStreak,
      totalCompleted: user.challenges.totalCompleted,
      streakFreezes: user.challenges.streakFreezes,
      streakFreezesUsed: user.challenges.streakFreezesUsed,
      recentCompletions: completedChallenges.slice(0, 10),
    };
  },

  /**
   * Resets weekly challenges (called by cron job)
   */
  async resetWeeklyChallenges() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all tribes and reset their weekly challenge scores
    const tribes = await Tribe.find({});
    for (const tribe of tribes) {
      tribe.weeklyChallenge.score = 0;
      tribe.weeklyChallenge.isCompleted = false;
      tribe.weeklyChallenge.completedAt = null;
      await tribe.save();
    }

    logger.info('Weekly challenges reset for all tribes');
  },

  /**
   * Processes weekly challenge winners (called by cron job)
   */
  async processWeeklyChallengeWinners() {
    const weeklyChallenge = await Challenge.getCurrentWeeklyChallenge();
    if (!weeklyChallenge) return;

    // Get all tribes sorted by score
    const tribes = await Tribe.find({})
      .sort({ 'weeklyChallenge.score': -1 })
      .limit(10);

    if (tribes.length === 0) return;

    const winner = tribes[0];
    
    // Mark winner as completed
    winner.weeklyChallenge.isCompleted = true;
    winner.weeklyChallenge.completedAt = new Date();
    
    // Apply rewards
    if (weeklyChallenge.rewards.multiplier > 1) {
      winner.weeklyChallenge.rewards.multiplier = weeklyChallenge.rewards.multiplier;
    }
    
    if (weeklyChallenge.rewards.totemUnlocked) {
      winner.weeklyChallenge.rewards.totemUnlocked = weeklyChallenge.rewards.totemUnlocked;
    }
    
    if (weeklyChallenge.rewards.badgeUnlocked) {
      winner.weeklyChallenge.rewards.badgeUnlocked = weeklyChallenge.rewards.badgeUnlocked;
    }
    
    await winner.save();

    // Notify all tribe members
    const tribeMembers = await User.find({ tribe: winner._id });
    for (const member of tribeMembers) {
      await notificationService.createNotification(member._id, {
        type: 'tribe_challenge_won',
        title: `🏆 Tribe Victory!`,
        message: `${winner.displayName} won the weekly challenge!`,
        deeplink: '/app/tribe',
      });
    }

    logger.info(`Tribe ${winner.displayName} won weekly challenge: ${weeklyChallenge.title}`);
  },
};

module.exports = challengeService;
