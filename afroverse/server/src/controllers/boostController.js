const boostService = require('../services/boostService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const boostController = {
  /**
   * POST /api/boost/video
   * Boost a video
   */
  async boostVideo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { videoId, tier } = req.body;
      const userId = req.user.id;

      const result = await boostService.boostVideo(userId, videoId, tier);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error boosting video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to boost video'
      });
    }
  },

  /**
   * POST /api/boost/tribe
   * Boost a tribe
   */
  async boostTribe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { tribeId, tier } = req.body;
      const userId = req.user.id;

      const result = await boostService.boostTribe(userId, tribeId, tier);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error boosting tribe:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to boost tribe'
      });
    }
  },

  /**
   * GET /api/boost/video/:videoId
   * Get boost info for a video
   */
  async getVideoBoost(req, res) {
    try {
      const { videoId } = req.params;

      const boost = await boostService.getVideoBoost(videoId);
      const multiplier = await boostService.getVideoMultiplier(videoId);

      res.status(200).json({
        success: true,
        boost,
        multiplier
      });

    } catch (error) {
      logger.error('Error getting video boost:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video boost'
      });
    }
  },

  /**
   * GET /api/boost/tribe/:tribeId
   * Get boost info for a tribe
   */
  async getTribeBoost(req, res) {
    try {
      const { tribeId } = req.params;

      const boost = await boostService.getTribeBoost(tribeId);

      res.status(200).json({
        success: true,
        boost
      });

    } catch (error) {
      logger.error('Error getting tribe boost:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get tribe boost'
      });
    }
  },

  /**
   * GET /api/boost/tiers
   * Get available boost tiers
   */
  async getBoostTiers(req, res) {
    try {
      const videoTiers = boostService.getBoostTiers();
      const tribeTiers = boostService.getTribeBoostTiers();

      res.status(200).json({
        success: true,
        video: videoTiers,
        tribe: tribeTiers
      });

    } catch (error) {
      logger.error('Error getting boost tiers:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get boost tiers'
      });
    }
  },
};

module.exports = boostController;
