const progressionService = require('../services/progressionService');
const streakService = require('../services/streakService');
const { logger } = require('../utils/logger');

// Get user progression summary
const getUserProgression = async (req, res) => {
  try {
    const userId = req.user.id;
    const progression = await progressionService.getUserProgression(userId);

    res.json({
      success: true,
      ...progression
    });
  } catch (error) {
    logger.error('Error getting user progression:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progression'
    });
  }
};

// Grant XP (internal service endpoint)
const grantXp = async (req, res) => {
  try {
    const { userId, xp, reason, context } = req.body;

    if (!userId || !xp || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const result = await progressionService.grantXp(userId, xp, reason, context);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error granting XP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grant XP'
    });
  }
};

// Mark qualifying action (internal)
const markQualifyingAction = async (req, res) => {
  try {
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const result = await streakService.markQualifyingAction(userId, action);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error marking qualifying action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark qualifying action'
    });
  }
};

// Use freeze
const useFreeze = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required'
      });
    }

    const result = await streakService.useFreeze(userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error using freeze:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to use freeze'
    });
  }
};

// Grant freeze (admin/payment endpoint)
const grantFreeze = async (req, res) => {
  try {
    const { userId, count = 1, source = 'admin' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await streakService.grantFreeze(userId, count, source);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error granting freeze:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grant freeze'
    });
  }
};

// Get streak status
const getStreakStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await streakService.getStreakStatus(userId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Error getting streak status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak status'
    });
  }
};

// Get qualifying actions status
const getQualifyingActionsStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await streakService.getQualifyingActionsStatus(userId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Error getting qualifying actions status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get qualifying actions status'
    });
  }
};

// Claim reward
const claimReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: 'Reward ID required'
      });
    }

    const result = await progressionService.claimReward(userId, rewardId);

    res.json({
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
};

// Handle daily login
const handleDailyLogin = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await streakService.handleDailyLogin(userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error handling daily login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to handle daily login'
    });
  }
};

module.exports = {
  getUserProgression,
  grantXp,
  markQualifyingAction,
  useFreeze,
  grantFreeze,
  getStreakStatus,
  getQualifyingActionsStatus,
  claimReward,
  handleDailyLogin
};
