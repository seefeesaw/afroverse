const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');
const { logger } = require('../utils/logger');

// Create checkout session for subscription
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan = 'monthly' } = req.body;

    if (!['monthly', 'weekly'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be monthly or weekly.'
      });
    }

    const result = await paymentService.createCheckoutSession(userId, plan);

    res.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
};

// Create payment intent for consumable
const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, metadata = {} } = req.body;

    if (!['boost', 'streak_insurance', 'instant_finish'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase type.'
      });
    }

    const result = await paymentService.createPaymentIntent(userId, type, metadata);

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// Get subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await paymentService.getUserSubscriptionStatus(userId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await paymentService.cancelSubscription(userId);

    res.json({
      success: true,
      canceledAt: result.canceledAt
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
};

// Handle Stripe webhook
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(payload, signature);

    // Handle the event
    await paymentService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook handling failed'
    });
  }
};

// Get subscription analytics
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const analytics = await subscriptionService.getSubscriptionAnalytics(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    logger.error('Error getting subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription analytics'
    });
  }
};

// Get purchase analytics
const getPurchaseAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const analytics = await paymentService.getPurchaseAnalytics(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    logger.error('Error getting purchase analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase analytics'
    });
  }
};

// Get subscription metrics
const getSubscriptionMetrics = async (req, res) => {
  try {
    const metrics = await subscriptionService.getSubscriptionMetrics();

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Error getting subscription metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription metrics'
    });
  }
};

// Get user subscription history
const getUserSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await subscriptionService.getUserSubscriptionHistory(userId);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Error getting user subscription history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription history'
    });
  }
};

// Create trial subscription
const createTrialSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.body;

    if (days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        message: 'Trial days must be between 1 and 30'
      });
    }

    const trialSubscription = await subscriptionService.createTrialSubscription(userId, days);

    res.json({
      success: true,
      subscription: {
        id: trialSubscription._id,
        status: trialSubscription.status,
        expiresAt: trialSubscription.expiresAt,
        isTrial: true
      }
    });
  } catch (error) {
    logger.error('Error creating trial subscription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create trial subscription'
    });
  }
};

// Get subscription conversion rate
const getSubscriptionConversionRate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const conversionRate = await subscriptionService.getSubscriptionConversionRate(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      conversionRate
    });
  } catch (error) {
    logger.error('Error getting subscription conversion rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription conversion rate'
    });
  }
};

// Get subscription churn rate
const getSubscriptionChurnRate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const churnRate = await subscriptionService.getSubscriptionChurnRate(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      churnRate
    });
  } catch (error) {
    logger.error('Error getting subscription churn rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription churn rate'
    });
  }
};

module.exports = {
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
};
