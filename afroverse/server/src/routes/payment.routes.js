const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  createCheckoutSession,
  createPaymentIntent,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  getSubscriptionAnalytics,
  getPurchaseAnalytics,
  getSubscriptionMetrics,
  getUserSubscriptionHistory,
  createTrialSubscription,
  getSubscriptionConversionRate,
  getSubscriptionChurnRate
} = require('../controllers/paymentController');

const router = express.Router();

// Validation rules
const checkoutSessionValidation = [
  body('plan').optional().isIn(['monthly', 'weekly']).withMessage('Plan must be monthly or weekly')
];

const paymentIntentValidation = [
  body('type').isIn(['boost', 'streak_insurance', 'instant_finish']).withMessage('Invalid purchase type'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

const trialSubscriptionValidation = [
  body('days').optional().isInt({ min: 1, max: 30 }).withMessage('Trial days must be between 1 and 30')
];

// Public routes (webhooks)
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes (authentication required)
router.post('/checkout-session',
  authenticateToken,
  generalLimiter,
  checkoutSessionValidation,
  validateRequest,
  createCheckoutSession
);

router.post('/payment-intent',
  authenticateToken,
  generalLimiter,
  paymentIntentValidation,
  validateRequest,
  createPaymentIntent
);

router.get('/subscription/status',
  authenticateToken,
  generalLimiter,
  getSubscriptionStatus
);

router.post('/subscription/cancel',
  authenticateToken,
  generalLimiter,
  cancelSubscription
);

router.get('/subscription/history',
  authenticateToken,
  generalLimiter,
  getUserSubscriptionHistory
);

router.post('/subscription/trial',
  authenticateToken,
  generalLimiter,
  trialSubscriptionValidation,
  validateRequest,
  createTrialSubscription
);

// Analytics routes (admin only - add admin middleware later)
router.get('/analytics/subscription',
  generalLimiter,
  getSubscriptionAnalytics
);

router.get('/analytics/purchase',
  generalLimiter,
  getPurchaseAnalytics
);

router.get('/analytics/metrics',
  generalLimiter,
  getSubscriptionMetrics
);

router.get('/analytics/conversion-rate',
  generalLimiter,
  getSubscriptionConversionRate
);

router.get('/analytics/churn-rate',
  generalLimiter,
  getSubscriptionChurnRate
);

module.exports = router;
