const eventsService = require('../services/eventsService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const eventController = {
  /**
   * GET /api/events/current
   * Gets current active event
   */
  async getCurrentEvent(req, res) {
    try {
      const event = await eventsService.getCurrentActiveEvent();
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'No active event found.',
        });
      }
      
      res.status(200).json({
        success: true,
        event: {
          id: event._id,
          type: event.type,
          title: event.title,
          description: event.description,
          emoji: event.emoji,
          startAt: event.startAt,
          endAt: event.endAt,
          objective: event.objective,
          multipliers: event.multipliers,
          rewards: event.rewards,
          status: event.status,
          isCurrentlyActive: event.isCurrentlyActive,
          isUpcoming: event.isUpcoming,
        },
      });
    } catch (error) {
      logger.error('Error getting current event:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve current event.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/upcoming
   * Gets upcoming event
   */
  async getUpcomingEvent(req, res) {
    try {
      const event = await eventsService.getUpcomingEvent();
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'No upcoming event found.',
        });
      }
      
      res.status(200).json({
        success: true,
        event: {
          id: event._id,
          type: event.type,
          title: event.title,
          description: event.description,
          emoji: event.emoji,
          startAt: event.startAt,
          endAt: event.endAt,
          objective: event.objective,
          multipliers: event.multipliers,
          rewards: event.rewards,
          status: event.status,
          isCurrentlyActive: event.isCurrentlyActive,
          isUpcoming: event.isUpcoming,
        },
      });
    } catch (error) {
      logger.error('Error getting upcoming event:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve upcoming event.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/war/standings
   * Gets current clan war standings
   */
  async getClanWarStandings(req, res) {
    try {
      const standings = await eventsService.getClanWarStandings();
      
      res.status(200).json({
        success: true,
        standings,
      });
    } catch (error) {
      logger.error('Error getting clan war standings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve clan war standings.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/power-hour
   * Gets power hour status
   */
  async getPowerHourStatus(req, res) {
    try {
      const powerHourStatus = await eventsService.getPowerHourStatus();
      
      if (!powerHourStatus) {
        return res.status(404).json({
          success: false,
          message: 'No power hour scheduled for today.',
        });
      }
      
      res.status(200).json({
        success: true,
        powerHour: powerHourStatus,
      });
    } catch (error) {
      logger.error('Error getting power hour status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve power hour status.', 
        error: error.message 
      });
    }
  },

  /**
   * POST /api/events/war/score
   * Updates clan war score (internal use)
   */
  async updateClanWarScore(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityType, value = 1, metadata = {} } = req.body;
    const userId = req.user.id;

    try {
      await eventsService.updateClanWarScore(userId, activityType, value, metadata);
      
      res.status(200).json({
        success: true,
        message: 'Clan war score updated successfully.',
      });
    } catch (error) {
      logger.error('Error updating clan war score:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update clan war score.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/stats
   * Gets user's event participation statistics
   */
  async getUserEventStats(req, res) {
    const userId = req.user.id;

    try {
      const stats = await eventsService.getUserEventStats(userId);
      
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Error getting user event stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve user event statistics.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/history
   * Gets user's event participation history
   */
  async getUserEventHistory(req, res) {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    try {
      const UserEvent = require('../models/UserEvent');
      const userEvents = await UserEvent.find({
        userId,
        isActive: true,
      })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

      res.status(200).json({
        success: true,
        events: userEvents.map(ue => ({
          id: ue._id,
          event: {
            id: ue.eventId._id,
            type: ue.eventId.type,
            title: ue.eventId.title,
            description: ue.eventId.description,
            emoji: ue.eventId.emoji,
            objective: ue.eventId.objective,
            startAt: ue.eventId.startAt,
            endAt: ue.eventId.endAt,
          },
          participationStats: ue.participationStats,
          activities: ue.activities.slice(-10), // Last 10 activities
          rewardsEarned: ue.rewardsEarned,
          createdAt: ue.createdAt,
        })),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: userEvents.length === parseInt(limit),
        },
      });
    } catch (error) {
      logger.error('Error getting user event history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve user event history.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/leaderboard
   * Gets event participation leaderboard
   */
  async getEventLeaderboard(req, res) {
    const { eventType = 'clan_war', limit = 50 } = req.query;

    try {
      const UserEvent = require('../models/UserEvent');
      const Event = require('../models/Event');
      
      // Get current event
      let currentEvent;
      if (eventType === 'clan_war') {
        currentEvent = await Event.getCurrentClanWar();
      } else if (eventType === 'power_hour') {
        currentEvent = await Event.getTodaysPowerHour();
      }
      
      if (!currentEvent) {
        return res.status(404).json({
          success: false,
          message: `No active ${eventType} event found.`,
        });
      }
      
      // Get top contributors
      const topContributors = await UserEvent.getTopContributors(currentEvent._id, parseInt(limit));
      
      const leaderboard = topContributors.map((ue, index) => ({
        rank: index + 1,
        user: {
          id: ue.userId._id,
          username: ue.userId.username,
          tribe: ue.userId.tribe ? {
            id: ue.userId.tribe._id,
            name: ue.userId.tribe.name,
            displayName: ue.userId.tribe.displayName,
            emblem: ue.userId.tribe.emblem,
          } : null,
        },
        stats: {
          totalActions: ue.participationStats.totalActions,
          totalXP: ue.participationStats.totalXP,
          totalClanPoints: ue.participationStats.totalClanPoints,
          totalCoins: ue.participationStats.totalCoins,
          multiplierBonus: ue.participationStats.multiplierBonus,
        },
      }));

      res.status(200).json({
        success: true,
        leaderboard,
        event: {
          id: currentEvent._id,
          type: currentEvent.type,
          title: currentEvent.title,
          objective: currentEvent.objective,
        },
      });
    } catch (error) {
      logger.error('Error getting event leaderboard:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve event leaderboard.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/events/tribe-war
   * Gets user's tribe war status
   */
  async getTribeWarStatus(req, res) {
    const userId = req.user.id;

    try {
      const User = require('../models/User');
      const Tribe = require('../models/Tribe');
      const Event = require('../models/Event');

      const user = await User.findById(userId).populate('tribe');
      if (!user.tribe) {
        return res.status(400).json({
          success: false,
          message: 'User is not in a tribe.',
        });
      }

      const tribe = await Tribe.findById(user.tribe._id);
      const currentWar = await Event.getCurrentClanWar();

      if (!currentWar) {
        return res.status(404).json({
          success: false,
          message: 'No active clan war found.',
        });
      }

      // Get standings
      const standings = await eventsService.getClanWarStandings();
      const tribeRank = standings.findIndex(s => s.tribe.id.toString() === tribe._id.toString()) + 1;

      res.status(200).json({
        success: true,
        war: {
          id: currentWar._id,
          title: currentWar.title,
          description: currentWar.description,
          emoji: currentWar.emoji,
          objective: currentWar.objective,
          startAt: currentWar.startAt,
          endAt: currentWar.endAt,
          rewards: currentWar.rewards,
        },
        tribe: {
          id: tribe._id,
          name: tribe.name,
          displayName: tribe.displayName,
          emblem: tribe.emblem,
          score: tribe.clanWar.currentWar.score || 0,
          rank: tribeRank,
          lastUpdated: tribe.clanWar.currentWar.lastUpdated,
        },
        standings: standings.slice(0, 10), // Top 10
      });
    } catch (error) {
      logger.error('Error getting tribe war status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve tribe war status.', 
        error: error.message 
      });
    }
  },
};

module.exports = eventController;
