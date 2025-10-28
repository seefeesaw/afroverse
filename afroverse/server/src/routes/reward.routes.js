const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
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
} = require('../controllers/rewardController');

const router = express.Router();

// Validation rules
const claimRewardValidation = [
  body('rewardId').notEmpty().withMessage('Reward ID is required')
];

const equipCosmeticValidation = [
  body('slot').isIn(['frame', 'title', 'confetti']).withMessage('Invalid slot'),
  body('key').notEmpty().withMessage('Key is required')
];

const categoryValidation = [
  param('category').isIn(['streak', 'battle', 'vote', 'tribe', 'leaderboard', 'transform', 'seasonal']).withMessage('Invalid category')
];

const rarityValidation = [
  param('rarity').isIn(['common', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity')
];

// Protected routes (authentication required)
router.get('/achievements',
  authenticateToken,
  generalLimiter,
  getUserAchievements
);

router.get('/inbox',
  authenticateToken,
  generalLimiter,
  getUnclaimedRewards
);

router.post('/claim',
  authenticateToken,
  generalLimiter,
  claimRewardValidation,
  validateRequest,
  claimReward
);

router.post('/equip',
  authenticateToken,
  generalLimiter,
  equipCosmeticValidation,
  validateRequest,
  equipCosmetic
);

router.get('/inventory',
  authenticateToken,
  generalLimiter,
  getUserInventory
);

router.get('/equipped',
  authenticateToken,
  generalLimiter,
  getEquippedCosmetics
);

router.get('/achievements/category/:category',
  authenticateToken,
  generalLimiter,
  categoryValidation,
  validateRequest,
  getAchievementsByCategory
);

router.get('/achievements/rarity/:rarity',
  authenticateToken,
  generalLimiter,
  rarityValidation,
  validateRequest,
  getAchievementsByRarity
);

router.get('/achievements/all',
  authenticateToken,
  generalLimiter,
  getAllAchievements
);

router.get('/achievements/:key',
  authenticateToken,
  generalLimiter,
  getAchievementByKey
);

router.get('/achievements/statistics/user',
  authenticateToken,
  generalLimiter,
  getUserAchievementStatistics
);

router.get('/achievements/recent',
  authenticateToken,
  generalLimiter,
  getRecentAchievements
);

router.get('/achievements/progress',
  authenticateToken,
  generalLimiter,
  getAchievementProgressSummary
);

router.get('/achievements/categories',
  authenticateToken,
  generalLimiter,
  getAchievementCategories
);

router.get('/rarity/:rarity',
  authenticateToken,
  generalLimiter,
  rarityValidation,
  validateRequest,
  getRarityInfo
);

// Analytics routes (admin only - add admin middleware later)
router.get('/statistics/rewards',
  generalLimiter,
  getRewardStatistics
);

router.get('/statistics/cosmetics',
  generalLimiter,
  getCosmeticStatistics
);

router.get('/statistics/top-earners',
  generalLimiter,
  getTopRewardEarners
);

router.get('/statistics/top-collectors',
  generalLimiter,
  getTopCosmeticCollectors
);

router.get('/statistics/top-achievers',
  generalLimiter,
  getTopAchievers
);

router.get('/statistics/completion-rates',
  generalLimiter,
  getAchievementCompletionRates
);

module.exports = router;
