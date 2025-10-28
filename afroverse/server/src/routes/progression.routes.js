const express = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  getUserProgression,
  grantXp,
  markQualifyingAction,
  useFreeze,
  grantFreeze,
  getStreakStatus,
  getQualifyingActionsStatus,
  claimReward,
  handleDailyLogin
} = require('../controllers/progressionController');

const router = express.Router();

// Validation rules
const grantXpValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('xp').isInt({ min: 1 }).withMessage('XP must be a positive integer'),
  body('reason').isString().withMessage('Reason is required'),
  body('context').optional().isObject().withMessage('Context must be an object')
];

const markQualifyingActionValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('action').isIn(['transform', 'vote_bundle', 'battle_action']).withMessage('Invalid action')
];

const useFreezeValidation = [
  body('confirm').isBoolean().withMessage('Confirmation must be a boolean')
];

const grantFreezeValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('count').optional().isInt({ min: 1, max: 10 }).withMessage('Count must be between 1 and 10'),
  body('source').optional().isString().withMessage('Source must be a string')
];

const claimRewardValidation = [
  body('rewardId').isString().withMessage('Reward ID is required')
];

// Public routes (no authentication required)
router.post('/xp',
  grantXpValidation,
  handleValidationErrors,
  grantXp
);

router.post('/qualify',
  markQualifyingActionValidation,
  handleValidationErrors,
  markQualifyingAction
);

router.post('/freeze/grant',
  grantFreezeValidation,
  handleValidationErrors,
  grantFreeze
);

// Protected routes (authentication required)
router.get('/progression',
authenticateToken,
generalLimiter,
  getUserProgression
);

router.get('/streak',
  authenticateToken,
  generalLimiter,
  getStreakStatus
);

router.get('/qualifying-actions',
  authenticateToken,
  generalLimiter,
  getQualifyingActionsStatus
);

router.post('/freeze/use',
authenticateToken,
generalLimiter,
  useFreezeValidation,
  handleValidationErrors,
  useFreeze
);

router.post('/reward/claim',
authenticateToken,
generalLimiter,
  claimRewardValidation,
  handleValidationErrors,
  claimReward
);

router.post('/daily-login',
  authenticateToken,
  generalLimiter, // 1 request per day
  handleDailyLogin
);

module.exports = router;
