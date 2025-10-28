const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const achievementController = require('../controllers/achievementController');

// Public routes (no authentication required)
router.get('/', achievementController.getAllAchievements);
router.get('/categories', achievementController.getCategories);
router.get('/rarities', achievementController.getRarities);
router.get('/stats', achievementController.getStats);
router.get('/leaderboard', [
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 100 }),
], achievementController.getLeaderboard);
router.get('/:achievementId', [
  check('achievementId', 'Achievement ID is required').notEmpty(),
], achievementController.getAchievement);

// Protected routes (authentication required)
router.use(authenticateToken);

router.get('/me', achievementController.getUserAchievements);
router.post('/claim/:achievementId', [
  check('achievementId', 'Achievement ID is required').notEmpty(),
], achievementController.claimReward);

// Admin routes (require admin authentication)
router.post('/initialize', achievementController.initializeAchievements);
router.post('/reset/:userId', [
  check('userId', 'User ID is required').isMongoId(),
], achievementController.resetUserAchievements);

// Internal routes (for other services)
router.post('/progress', [
  check('userId', 'User ID is required').isMongoId(),
  check('metric', 'Metric is required').notEmpty(),
  check('value', 'Value must be a number').isNumeric(),
], achievementController.updateProgress);

module.exports = router;
