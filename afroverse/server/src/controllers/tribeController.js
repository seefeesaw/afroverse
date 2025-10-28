const tribeService = require('../services/tribeService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const Tribe = require('../models/Tribe');

const tribeController = {
  /**
   * GET /api/tribes
   * Get all tribes
   */
  async getAllTribes(req, res) {
    try {
      const tribes = await Tribe.find()
        .select('name displayName motto emblem stats rankings')
        .sort({ 'rankings.weeklyRank': 1 })
        .lean();

      res.status(200).json({
        success: true,
        tribes: tribes.map(tribe => ({
          id: tribe._id,
          name: tribe.name,
          displayName: tribe.displayName,
          motto: tribe.motto,
          emblem: tribe.emblem,
          weeklyRank: tribe.rankings.weeklyRank,
          weeklyPoints: tribe.stats.weeklyPoints,
          totalPoints: tribe.stats.totalPoints,
          members: tribe.stats.members,
        })),
      });
    } catch (error) {
      logger.error('Error getting tribes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tribes',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/tribes/:tribeId
   * Get specific tribe details
   */
  async getTribe(req, res) {
    try {
      const { tribeId } = req.params;
      const tribe = await Tribe.findById(tribeId)
        .select('name displayName motto description emblem stats rankings')
        .lean();

      if (!tribe) {
        return res.status(404).json({
          success: false,
          message: 'Tribe not found',
        });
      }

      res.status(200).json({
        success: true,
        tribe: {
          id: tribe._id,
          name: tribe.name,
          displayName: tribe.displayName,
          motto: tribe.motto,
          description: tribe.description,
          emblem: tribe.emblem,
          weeklyRank: tribe.rankings.weeklyRank,
          weeklyPoints: tribe.stats.weeklyPoints,
          totalPoints: tribe.stats.totalPoints,
          members: tribe.stats.members,
          allTimeRank: tribe.rankings.allTimeRank,
          lastResetAt: tribe.rankings.lastResetAt,
        },
      });
    } catch (error) {
      logger.error('Error getting tribe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tribe',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/tribes/leaderboard
   * Get tribe leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { period = 'week', limit = 50 } = req.query;
      const leaderboard = await tribeService.getLeaderboard(period, parseInt(limit));

      res.status(200).json({
        success: true,
        period,
        leaderboard,
      });
    } catch (error) {
      logger.error('Error getting tribe leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve leaderboard',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/tribes/join
   * Join a tribe
   */
  async joinTribe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { tribeId } = req.body;
      const userId = req.user.id;

      const result = await tribeService.joinTribe(tribeId, userId);

      res.status(200).json({
        success: true,
        message: 'Successfully joined tribe',
        tribe: result.tribe,
      });
    } catch (error) {
      logger.error('Error joining tribe:', error);
      
      if (error.message === 'Tribe not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'Cannot switch tribe yet') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to join tribe',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/tribes/my-tribe
   * Get user's current tribe
   */
  async getMyTribe(req, res) {
    try {
      const userId = req.user.id;
      const snapshot = await tribeService.getUserTribeSnapshot(userId);

      if (!snapshot) {
        return res.status(404).json({
          success: false,
          message: 'No tribe found',
        });
      }

      res.status(200).json({
        success: true,
        ...snapshot,
      });
    } catch (error) {
      logger.error('Error getting my tribe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve your tribe',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/tribes/points/award
   * Award points to user's tribe (internal/admin)
   */
  async awardPoints(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { reason, points } = req.body;
      const userId = req.user.id;

      // Get user's tribe
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user || !user.tribe || !user.tribe.id) {
        return res.status(400).json({
          success: false,
          message: 'User is not in a tribe',
        });
      }

      const result = await tribeService.awardPoints({
        tribeId: user.tribe.id,
        userId,
        reason,
        points,
      });

      res.status(200).json({
        success: true,
        message: 'Points awarded successfully',
        ...result,
      });
    } catch (error) {
      logger.error('Error awarding points:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to award points',
        error: error.message,
      });
    }
  },
};

module.exports = tribeController;


