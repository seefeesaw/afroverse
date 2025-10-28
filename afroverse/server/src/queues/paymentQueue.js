const Bull = require('bull');
const subscriptionService = require('../services/subscriptionService');
const { logger } = require('../utils/logger');

// Create payment queue
const paymentQueue = new Bull('payment queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Process subscription expiry checker
paymentQueue.process('subscription-expiry-checker', async (job) => {
  try {
    logger.info('Running subscription expiry checker');
    
    const result = await subscriptionService.checkExpiredSubscriptions();
    
    logger.info(`Subscription expiry checker completed: ${result.expired}/${result.checked} expired`);
    
    return result;
  } catch (error) {
    logger.error('Subscription expiry checker job failed:', error);
    throw error;
  }
});

// Process renewal reminder sender
paymentQueue.process('send-renewal-reminder', async (job) => {
  try {
    logger.info('Running renewal reminder sender');
    
    const result = await subscriptionService.sendRenewalReminders();
    
    logger.info(`Renewal reminder sender completed: ${result.sent} reminders sent`);
    
    return result;
  } catch (error) {
    logger.error('Renewal reminder sender job failed:', error);
    throw error;
  }
});

// Process subscription metrics update
paymentQueue.process('update-subscription-metrics', async (job) => {
  try {
    logger.info('Updating subscription metrics');
    
    const metrics = await subscriptionService.getSubscriptionMetrics();
    
    // Store metrics in Redis for quick access
    const { getRedisClient } = require('../config/redis');
    const redis = getRedisClient();
    await redis.setEx('subscription_metrics', 3600, JSON.stringify(metrics));
    
    logger.info('Subscription metrics updated');
    
    return metrics;
  } catch (error) {
    logger.error('Update subscription metrics job failed:', error);
    throw error;
  }
});

// Process subscription analytics update
paymentQueue.process('update-subscription-analytics', async (job) => {
  try {
    logger.info('Updating subscription analytics');
    
    const { startDate, endDate } = job.data;
    
    const analytics = await subscriptionService.getSubscriptionAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    
    // Store analytics in Redis for quick access
    const { redisClient } = require('../config/redis');
    const key = `subscription_analytics_${startDate}_${endDate}`;
    await redisClient.setEx(key, 3600, JSON.stringify(analytics));
    
    logger.info('Subscription analytics updated');
    
    return analytics;
  } catch (error) {
    logger.error('Update subscription analytics job failed:', error);
    throw error;
  }
});

// Process subscription conversion rate update
paymentQueue.process('update-conversion-rate', async (job) => {
  try {
    logger.info('Updating subscription conversion rate');
    
    const { startDate, endDate } = job.data;
    
    const conversionRate = await subscriptionService.getSubscriptionConversionRate(
      new Date(startDate),
      new Date(endDate)
    );
    
    // Store conversion rate in Redis for quick access
    const { redisClient } = require('../config/redis');
    const key = `conversion_rate_${startDate}_${endDate}`;
    await redisClient.setEx(key, 3600, JSON.stringify(conversionRate));
    
    logger.info('Subscription conversion rate updated');
    
    return conversionRate;
  } catch (error) {
    logger.error('Update conversion rate job failed:', error);
    throw error;
  }
});

// Process subscription churn rate update
paymentQueue.process('update-churn-rate', async (job) => {
  try {
    logger.info('Updating subscription churn rate');
    
    const { startDate, endDate } = job.data;
    
    const churnRate = await subscriptionService.getSubscriptionChurnRate(
      new Date(startDate),
      new Date(endDate)
    );
    
    // Store churn rate in Redis for quick access
    const { redisClient } = require('../config/redis');
    const key = `churn_rate_${startDate}_${endDate}`;
    await redisClient.setEx(key, 3600, JSON.stringify(churnRate));
    
    logger.info('Subscription churn rate updated');
    
    return churnRate;
  } catch (error) {
    logger.error('Update churn rate job failed:', error);
    throw error;
  }
});

// Process trial conversion reminder
paymentQueue.process('trial-conversion-reminder', async (job) => {
  try {
    const { userId, trialDays } = job.data;
    
    logger.info(`Sending trial conversion reminder to user ${userId}`);
    
    // This would integrate with notification service
    // For now, just log the reminder
    logger.info(`Trial conversion reminder sent to user ${userId} (${trialDays} days)`);
    
    return { success: true };
  } catch (error) {
    logger.error('Trial conversion reminder job failed:', error);
    throw error;
  }
});

// Process subscription renewal notification
paymentQueue.process('subscription-renewal-notification', async (job) => {
  try {
    const { userId, subscriptionId } = job.data;
    
    logger.info(`Sending subscription renewal notification to user ${userId}`);
    
    // This would integrate with notification service
    // For now, just log the notification
    logger.info(`Subscription renewal notification sent to user ${userId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Subscription renewal notification job failed:', error);
    throw error;
  }
});

// Process subscription cancellation notification
paymentQueue.process('subscription-cancellation-notification', async (job) => {
  try {
    const { userId, subscriptionId } = job.data;
    
    logger.info(`Sending subscription cancellation notification to user ${userId}`);
    
    // This would integrate with notification service
    // For now, just log the notification
    logger.info(`Subscription cancellation notification sent to user ${userId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Subscription cancellation notification job failed:', error);
    throw error;
  }
});

// Job event handlers
paymentQueue.on('completed', (job, result) => {
  logger.info(`Payment job ${job.name} completed`, result);
});

paymentQueue.on('failed', (job, err) => {
  logger.error(`Payment job ${job.name} failed:`, err);
});

paymentQueue.on('stalled', (job) => {
  logger.warn(`Payment job ${job.name} stalled`);
});

// Schedule recurring jobs
const scheduleRecurringJobs = () => {
  // Check expired subscriptions every hour
  paymentQueue.add('subscription-expiry-checker', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Send renewal reminders every 6 hours
  paymentQueue.add('send-renewal-reminder', {}, {
    repeat: { cron: '0 */6 * * *' }, // Every 6 hours
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Update subscription metrics every hour
  paymentQueue.add('update-subscription-metrics', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Update subscription analytics every day at midnight
  paymentQueue.add('update-subscription-analytics', {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  }, {
    repeat: { cron: '0 0 * * *' }, // Every day at midnight
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Update conversion rate every day at 1 AM
  paymentQueue.add('update-conversion-rate', {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  }, {
    repeat: { cron: '0 1 * * *' }, // Every day at 1 AM
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Update churn rate every day at 2 AM
  paymentQueue.add('update-churn-rate', {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  }, {
    repeat: { cron: '0 2 * * *' }, // Every day at 2 AM
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  logger.info('Payment recurring jobs scheduled');
};

// Initialize schedules
const initializeSchedules = () => {
  scheduleRecurringJobs();
};

// Add payment job
const addPaymentJob = (type, data, options = {}) => {
  return paymentQueue.add(type, data, {
    removeOnComplete: 10,
    removeOnFail: 5,
    ...options
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down payment queue...');
  await paymentQueue.close();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down payment queue...');
  await paymentQueue.close();
});

module.exports = {
  paymentQueue,
  initializeSchedules,
  addPaymentJob
};
