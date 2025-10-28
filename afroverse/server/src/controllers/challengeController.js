const challengeService = require('../services/challengeService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const challengeController = {
  /**
   * GET /api/challenge/daily
   * Gets today's daily challenge for the user
   */
  async getDailyChallenge(req, res) {
    const userId = req.user.id;

    try {
      const userChallenge = await challengeService.getUserDailyChallenge(userId);
      
      res.status(200).json({
        success: true,
        challenge: {
          id: userChallenge.challengeId._id,
          title: userChallenge.challengeId.title,
          description: userChallenge.challengeId.description,
          emoji: userChallenge.challengeId.emoji,
          objective: userChallenge.challengeId.objective,
          targetValue: userChallenge.challengeId.targetValue,
          culturalTheme: userChallenge.challengeId.culturalTheme,
          difficulty: userChallenge.challengeId.difficulty,
          rewards: userChallenge.challengeId.rewards,
          startDate: userChallenge.challengeId.startDate,
          endDate: userChallenge.challengeId.endDate,
        },
        progress: {
          current: userChallenge.progress,
          target: userChallenge.challengeId.targetValue,
          percentage: Math.round((userChallenge.progress / userChallenge.challengeId.targetValue) * 100),
          isCompleted: userChallenge.isCompleted,
          completedAt: userChallenge.completedAt,
        },
        userChallengeId: userChallenge._id,
      });
    } catch (error) {
      logger.error('Error getting daily challenge:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve daily challenge.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/challenge/weekly
   * Gets this week's weekly challenge for the user
   */
  async getWeeklyChallenge(req, res) {
    const userId = req.user.id;

    try {
      const userChallenge = await challengeService.getUserWeeklyChallenge(userId);
      
      res.status(200).json({
        success: true,
        challenge: {
          id: userChallenge.challengeId._id,
          title: userChallenge.challengeId.title,
          description: userChallenge.challengeId.description,
          emoji: userChallenge.challengeId.emoji,
          objective: userChallenge.challengeId.objective,
          targetValue: userChallenge.challengeId.targetValue,
          culturalTheme: userChallenge.challengeId.culturalTheme,
          difficulty: userChallenge.challengeId.difficulty,
          rewards: userChallenge.challengeId.rewards,
          startDate: userChallenge.challengeId.startDate,
          endDate: userChallenge.challengeId.endDate,
          weekNumber: userChallenge.challengeId.weekNumber,
          year: userChallenge.challengeId.year,
        },
        progress: {
          current: userChallenge.progress,
          target: userChallenge.challengeId.targetValue,
          percentage: Math.round((userChallenge.progress / userChallenge.challengeId.targetValue) * 100),
          isCompleted: userChallenge.isCompleted,
          completedAt: userChallenge.completedAt,
        },
        userChallengeId: userChallenge._id,
      });
    } catch (error) {
      logger.error('Error getting weekly challenge:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve weekly challenge.', 
        error: error.message 
      });
    }
  },

  /**
   * POST /api/challenge/progress
   * Updates user's challenge progress
   */
  async updateProgress(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { activityType, value = 1, metadata = {} } = req.body;

    try {
      const result = await challengeService.updateChallengeProgress(userId, activityType, value, metadata);
      
      res.status(200).json({
        success: true,
        message: 'Challenge progress updated successfully.',
        daily: {
          progress: result.daily.progress,
          target: result.daily.challengeId.targetValue,
          percentage: Math.round((result.daily.progress / result.daily.challengeId.targetValue) * 100),
          isCompleted: result.daily.isCompleted,
        },
        weekly: {
          progress: result.weekly.progress,
          target: result.weekly.challengeId.targetValue,
          percentage: Math.round((result.weekly.progress / result.weekly.challengeId.targetValue) * 100),
          isCompleted: result.weekly.isCompleted,
        },
      });
    } catch (error) {
      logger.error('Error updating challenge progress:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update challenge progress.', 
        error: error.message 
      });
    }
  },

  /**
   * POST /api/challenge/complete
   * Manually completes a challenge (for testing or special cases)
   */
  async completeChallenge(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { userChallengeId, challengeType } = req.body;

    try {
      const result = await challengeService.completeChallenge(userId, userChallengeId, challengeType);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge completed successfully.',
        challenge: result.challenge,
        rewards: result.rewards,
        streak: result.streak,
      });
    } catch (error) {
      logger.error('Error completing challenge:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to complete challenge.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/challenge/stats
   * Gets user's challenge statistics
   */
  async getChallengeStats(req, res) {
    const userId = req.user.id;

    try {
      const stats = await challengeService.getUserChallengeStats(userId);
      
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Error getting challenge stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve challenge statistics.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/challenge/history
   * Gets user's challenge completion history
   */
  async getChallengeHistory(req, res) {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    try {
      const UserChallenge = require('../models/UserChallenge');
      const completedChallenges = await UserChallenge.find({
        userId,
        isCompleted: true,
      })
      .populate('challengeId')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

      res.status(200).json({
        success: true,
        challenges: completedChallenges.map(uc => ({
          id: uc._id,
          challenge: {
            id: uc.challengeId._id,
            title: uc.challengeId.title,
            description: uc.challengeId.description,
            emoji: uc.challengeId.emoji,
            type: uc.challengeId.type,
            culturalTheme: uc.challengeId.culturalTheme,
            difficulty: uc.challengeId.difficulty,
            rewards: uc.challengeId.rewards,
          },
          completedAt: uc.completedAt,
          progress: uc.progress,
          rewardsClaimed: uc.rewardsClaimed,
        })),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: completedChallenges.length === parseInt(limit),
        },
      });
    } catch (error) {
      logger.error('Error getting challenge history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve challenge history.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/challenge/leaderboard
   * Gets challenge completion leaderboard
   */
  async getChallengeLeaderboard(req, res) {
    const { type = 'daily', period = 'week' } = req.query;

    try {
      const User = require('../models/User');
      let sortField = 'challenges.totalCompleted.daily';
      
      if (type === 'weekly') {
        sortField = 'challenges.totalCompleted.weekly';
      } else if (type === 'streak') {
        sortField = 'challenges.dailyStreak.current';
      }

      const users = await User.find({})
        .select('username tribe challenges')
        .sort({ [sortField]: -1 })
        .limit(50)
        .populate('tribe', 'name displayName emblem');

      const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        tribe: user.tribe ? {
          name: user.tribe.name,
          displayName: user.tribe.displayName,
          emblem: user.tribe.emblem,
        } : null,
        stats: {
          dailyCompleted: user.challenges.totalCompleted.daily || 0,
          weeklyCompleted: user.challenges.totalCompleted.weekly || 0,
          dailyStreak: user.challenges.dailyStreak.current || 0,
          weeklyStreak: user.challenges.weeklyStreak.current || 0,
        },
      }));

      res.status(200).json({
        success: true,
        leaderboard,
        type,
        period,
      });
    } catch (error) {
      logger.error('Error getting challenge leaderboard:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve challenge leaderboard.', 
        error: error.message 
      });
    }
  },

  /**
   * GET /api/challenge/tribe-weekly
   * Gets tribe weekly challenge status
   */
  async getTribeWeeklyChallenge(req, res) {
    const userId = req.user.id;

    try {
      const User = require('../models/User');
      const Tribe = require('../models/Tribe');
      const Challenge = require('../models/Challenge');

      const user = await User.findById(userId).populate('tribe');
      if (!user.tribe) {
        return res.status(400).json({
          success: false,
          message: 'User is not in a tribe.',
        });
      }

      const tribe = await Tribe.findById(user.tribe._id);
      const weeklyChallenge = await Challenge.getCurrentWeeklyChallenge();

      if (!weeklyChallenge) {
        return res.status(404).json({
          success: false,
          message: 'No active weekly challenge found.',
        });
      }

      // Get all tribes for ranking
      const allTribes = await Tribe.find({})
        .sort({ 'weeklyChallenge.score': -1 })
        .select('name displayName emblem weeklyChallenge');

      const tribeRank = allTribes.findIndex(t => t._id.toString() === tribe._id.toString()) + 1;

      res.status(200).json({
        success: true,
        challenge: {
          id: weeklyChallenge._id,
          title: weeklyChallenge.title,
          description: weeklyChallenge.description,
          emoji: weeklyChallenge.emoji,
          objective: weeklyChallenge.objective,
          rewards: weeklyChallenge.rewards,
          endDate: weeklyChallenge.endDate,
        },
        tribe: {
          name: tribe.name,
          displayName: tribe.displayName,
          emblem: tribe.emblem,
          score: tribe.weeklyChallenge.score || 0,
          rank: tribeRank,
          isCompleted: tribe.weeklyChallenge.isCompleted || false,
          completedAt: tribe.weeklyChallenge.completedAt,
          rewards: tribe.weeklyChallenge.rewards || {},
        },
        leaderboard: allTribes.slice(0, 10).map((t, index) => ({
          rank: index + 1,
          name: t.name,
          displayName: t.displayName,
          emblem: t.emblem,
          score: t.weeklyChallenge.score || 0,
        })),
      });
    } catch (error) {
      logger.error('Error getting tribe weekly challenge:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve tribe weekly challenge.', 
        error: error.message 
      });
    }
  },
};

module.exports = challengeController;
