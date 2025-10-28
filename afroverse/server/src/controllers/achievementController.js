const achievementService = require('../services/achievementService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const achievementController = {
  /**
   * GET /api/achievements
   * Get all achievements
   */
  async getAllAchievements(req, res) {
    try {
      const { category, rarity } = req.query;
      const achievements = await achievementService.getAllAchievements(category, rarity);

      res.status(200).json({
        success: true,
        achievements
      });

    } catch (error) {
      logger.error('Error getting achievements:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get achievements' 
      });
    }
  },

  /**
   * GET /api/achievements/me
   * Get user's achievements and progress
   */
  async getUserAchievements(req, res) {
    try {
      const userId = req.user.id;
      const userAchievements = await achievementService.getUserAchievements(userId);

      res.status(200).json({
        success: true,
        ...userAchievements
      });

    } catch (error) {
      logger.error('Error getting user achievements:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get user achievements' 
      });
    }
  },

  /**
   * POST /api/achievements/claim/:achievementId
   * Claim achievement reward
   */
  async claimReward(req, res) {
    try {
      const { achievementId } = req.params;
      const userId = req.user.id;

      const result = await achievementService.claimReward(userId, achievementId);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error claiming reward:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to claim reward' 
      });
    }
  },

  /**
   * GET /api/achievements/leaderboard
   * Get achievement leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await achievementService.getAchievementLeaderboard(parseInt(limit));

      res.status(200).json({
        success: true,
        leaderboard
      });

    } catch (error) {
      logger.error('Error getting achievement leaderboard:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get leaderboard' 
      });
    }
  },

  /**
   * GET /api/achievements/stats
   * Get achievement statistics
   */
  async getStats(req, res) {
    try {
      const stats = await achievementService.getAchievementStats();

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Error getting achievement stats:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get achievement stats' 
      });
    }
  },

  /**
   * POST /api/achievements/initialize
   * Initialize default achievements (admin only)
   */
  async initializeAchievements(req, res) {
    try {
      await achievementService.initializeAchievements();

      res.status(200).json({
        success: true,
        message: 'Achievements initialized successfully'
      });

    } catch (error) {
      logger.error('Error initializing achievements:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to initialize achievements' 
      });
    }
  },

  /**
   * POST /api/achievements/reset/:userId
   * Reset user achievements (admin only)
   */
  async resetUserAchievements(req, res) {
    try {
      const { userId } = req.params;
      await achievementService.resetUserAchievements(userId);

      res.status(200).json({
        success: true,
        message: 'User achievements reset successfully'
      });

    } catch (error) {
      logger.error('Error resetting user achievements:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to reset user achievements' 
      });
    }
  },

  /**
   * GET /api/achievements/:achievementId
   * Get specific achievement details
   */
  async getAchievement(req, res) {
    try {
      const { achievementId } = req.params;
      
      const Achievement = require('../models/Achievement');
      const achievement = await Achievement.findById(achievementId);

      if (!achievement) {
        return res.status(404).json({ 
          success: false, 
          message: 'Achievement not found' 
        });
      }

      res.status(200).json({
        success: true,
        achievement
      });

    } catch (error) {
      logger.error('Error getting achievement:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get achievement' 
      });
    }
  },

  /**
   * POST /api/achievements/progress
   * Update achievement progress (internal use)
   */
  async updateProgress(req, res) {
    try {
      const { userId, metric, value } = req.body;

      if (!userId || !metric || value === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: userId, metric, value' 
        });
      }

      const newlyUnlocked = await achievementService.checkAchievements(userId, metric, value);

      res.status(200).json({
        success: true,
        newlyUnlocked: newlyUnlocked.length,
        achievements: newlyUnlocked
      });

    } catch (error) {
      logger.error('Error updating achievement progress:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to update progress' 
      });
    }
  },

  /**
   * GET /api/achievements/categories
   * Get achievement categories
   */
  async getCategories(req, res) {
    try {
      const Achievement = require('../models/Achievement');
      const categories = await Achievement.distinct('category', { isActive: true });

      res.status(200).json({
        success: true,
        categories
      });

    } catch (error) {
      logger.error('Error getting achievement categories:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get categories' 
      });
    }
  },

  /**
   * GET /api/achievements/rarities
   * Get achievement rarities
   */
  async getRarities(req, res) {
    try {
      const Achievement = require('../models/Achievement');
      const rarities = await Achievement.distinct('rarity', { isActive: true });

      res.status(200).json({
        success: true,
        rarities
      });

    } catch (error) {
      logger.error('Error getting achievement rarities:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get rarities' 
      });
    }
  },
};

module.exports = achievementController;
