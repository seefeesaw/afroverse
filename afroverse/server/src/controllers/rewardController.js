const rewardService = require('../services/rewardService');
const achievementService = require('../services/achievementService');
const { logger } = require('../utils/logger');

// Get user achievements
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await achievementService.getUserAchievements(userId);

    res.json({
      success: true,
      ...achievements
    });
  } catch (error) {
    logger.error('Error getting user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};

// Get unclaimed rewards (inbox)
const getUnclaimedRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const rewards = await rewardService.getUnclaimedRewards(userId);

    res.json({
      success: true,
      items: rewards.map(reward => ({
        id: reward.id,
        type: reward.type,
        key: reward.key,
        label: reward.label,
        qty: reward.qty,
        expiresAt: reward.expiresAt,
        grantedAt: reward.grantedAt,
        grantedBy: reward.grantedBy
      }))
    });
  } catch (error) {
    logger.error('Error getting unclaimed rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unclaimed rewards'
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
        message: 'Reward ID is required'
      });
    }

    const result = await rewardService.claimReward(userId, rewardId);
    const inventory = await rewardService.getUserInventory(userId);

    res.json({
      success: true,
      inventory,
      toast: `${result.reward.label} added to your inventory`
    });
  } catch (error) {
    logger.error('Error claiming reward:', error);
    
    if (error.message === 'Reward not found') {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    if (error.message === 'Reward already claimed') {
      return res.status(409).json({
        success: false,
        message: 'Reward already claimed'
      });
    }
    
    if (error.message === 'Reward expired') {
      return res.status(410).json({
        success: false,
        message: 'Reward expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to claim reward'
    });
  }
};

// Equip cosmetic
const equipCosmetic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slot, key } = req.body;

    if (!slot || !key) {
      return res.status(400).json({
        success: false,
        message: 'Slot and key are required'
      });
    }

    const result = await rewardService.equipCosmetic(userId, slot, key);
    const equipped = await rewardService.getEquippedCosmetics(userId);

    res.json({
      success: true,
      equipped
    });
  } catch (error) {
    logger.error('Error equipping cosmetic:', error);
    
    if (error.message === 'Cosmetic not owned') {
      return res.status(403).json({
        success: false,
        message: 'Cosmetic not owned'
      });
    }
    
    if (error.message === 'Temporary cosmetic expired') {
      return res.status(410).json({
        success: false,
        message: 'Temporary cosmetic expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to equip cosmetic'
    });
  }
};

// Get user inventory
const getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const inventory = await rewardService.getUserInventory(userId);

    res.json({
      success: true,
      ...inventory
    });
  } catch (error) {
    logger.error('Error getting user inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory'
    });
  }
};

// Get equipped cosmetics
const getEquippedCosmetics = async (req, res) => {
  try {
    const userId = req.user.id;
    const equipped = await rewardService.getEquippedCosmetics(userId);

    res.json({
      success: true,
      equipped
    });
  } catch (error) {
    logger.error('Error getting equipped cosmetics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get equipped cosmetics'
    });
  }
};

// Get achievements by category
const getAchievementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const achievements = await achievementService.getAchievementsByCategory(category);

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    logger.error('Error getting achievements by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements by category'
    });
  }
};

// Get achievements by rarity
const getAchievementsByRarity = async (req, res) => {
  try {
    const { rarity } = req.params;
    const achievements = await achievementService.getAchievementsByRarity(rarity);

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    logger.error('Error getting achievements by rarity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements by rarity'
    });
  }
};

// Get all achievements
const getAllAchievements = async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    logger.error('Error getting all achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};

// Get achievement by key
const getAchievementByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const achievement = await achievementService.getAchievementByKey(key);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      achievement
    });
  } catch (error) {
    logger.error('Error getting achievement by key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievement'
    });
  }
};

// Get user achievement statistics
const getUserAchievementStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const statistics = await achievementService.getUserAchievementStatistics(userId);

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    logger.error('Error getting user achievement statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievement statistics'
    });
  }
};

// Get recent achievements
const getRecentAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;
    const achievements = await achievementService.getRecentAchievements(userId, parseInt(limit));

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    logger.error('Error getting recent achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent achievements'
    });
  }
};

// Get achievement progress summary
const getAchievementProgressSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await achievementService.getAchievementProgressSummary(userId);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    logger.error('Error getting achievement progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress summary'
    });
  }
};

// Get achievement categories
const getAchievementCategories = async (req, res) => {
  try {
    const categories = achievementService.getAchievementCategories();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error('Error getting achievement categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};

// Get rarity info
const getRarityInfo = async (req, res) => {
  try {
    const { rarity } = req.params;
    const info = achievementService.getRarityInfo(rarity);

    res.json({
      success: true,
      rarity: rarity,
      info
    });
  } catch (error) {
    logger.error('Error getting rarity info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rarity info'
    });
  }
};

// Get reward statistics
const getRewardStatistics = async (req, res) => {
  try {
    const statistics = await rewardService.getRewardStatistics();

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    logger.error('Error getting reward statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reward statistics'
    });
  }
};

// Get cosmetic statistics
const getCosmeticStatistics = async (req, res) => {
  try {
    const statistics = await rewardService.getCosmeticStatistics();

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    logger.error('Error getting cosmetic statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cosmetic statistics'
    });
  }
};

// Get top reward earners
const getTopRewardEarners = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const earners = await rewardService.getTopRewardEarners(parseInt(limit));

    res.json({
      success: true,
      earners
    });
  } catch (error) {
    logger.error('Error getting top reward earners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top reward earners'
    });
  }
};

// Get top cosmetic collectors
const getTopCosmeticCollectors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const collectors = await rewardService.getTopCosmeticCollectors(parseInt(limit));

    res.json({
      success: true,
      collectors
    });
  } catch (error) {
    logger.error('Error getting top cosmetic collectors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top cosmetic collectors'
    });
  }
};

// Get top achievers
const getTopAchievers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const achievers = await achievementService.getTopAchievers(parseInt(limit));

    res.json({
      success: true,
      achievers
    });
  } catch (error) {
    logger.error('Error getting top achievers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top achievers'
    });
  }
};

// Get achievement completion rates
const getAchievementCompletionRates = async (req, res) => {
  try {
    const rates = await achievementService.getAchievementCompletionRates();

    res.json({
      success: true,
      rates
    });
  } catch (error) {
    logger.error('Error getting achievement completion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get completion rates'
    });
  }
};

module.exports = {
  getUserAchievements,
  getUnclaimedRewards,
  claimReward,
  equipCosmetic,
  getUserInventory,
  getEquippedCosmetics,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getAllAchievements,
  getAchievementByKey,
  getUserAchievementStatistics,
  getRecentAchievements,
  getAchievementProgressSummary,
  getAchievementCategories,
  getRarityInfo,
  getRewardStatistics,
  getCosmeticStatistics,
  getTopRewardEarners,
  getTopCosmeticCollectors,
  getTopAchievers,
  getAchievementCompletionRates
};
