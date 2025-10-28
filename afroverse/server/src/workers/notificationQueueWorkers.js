const Queue = require('bull');
const notificationService = require('../services/notificationService');
const notificationDispatcher = require('../services/notificationDispatcher');
const { logger } = require('../utils/logger');

// Create notification queues
const notificationQueue = new Queue('notification processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

const bulkNotificationQueue = new Queue('bulk notification processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

const retryQueue = new Queue('notification retry', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Process individual notifications
notificationQueue.process('send-notification', async (job) => {
  try {
    const { notificationId, userId, type, channel, variables, options } = job.data;
    
    logger.info(`Processing notification job: ${notificationId}`);

    const result = await notificationService.sendNotification(
      userId,
      type,
      channel,
      variables,
      options
    );

    if (result) {
      logger.info(`Notification job completed successfully: ${notificationId}`);
      return { success: true, notification: result };
    } else {
      logger.warn(`Notification job failed: ${notificationId}`);
      throw new Error('Failed to send notification');
    }

  } catch (error) {
    logger.error(`Error processing notification job:`, error);
    throw error;
  }
});

// Process bulk notifications
bulkNotificationQueue.process('send-bulk-notifications', async (job) => {
  try {
    const { notifications, userSettings } = job.data;
    
    logger.info(`Processing bulk notification job: ${notifications.length} notifications`);

    const results = await notificationDispatcher.sendBulk(notifications, userSettings);
    
    logger.info(`Bulk notification job completed: ${results.length} results`);
    return { success: true, results };

  } catch (error) {
    logger.error(`Error processing bulk notification job:`, error);
    throw error;
  }
});

// Process retry notifications
retryQueue.process('retry-notification', async (job) => {
  try {
    const { notificationId, maxRetries = 3 } = job.data;
    
    logger.info(`Processing retry job for notification: ${notificationId}`);

    const results = await notificationService.retryFailedNotifications(maxRetries);
    
    logger.info(`Retry job completed: ${results.length} notifications processed`);
    return { success: true, results };

  } catch (error) {
    logger.error(`Error processing retry job:`, error);
    throw error;
  }
});

// Add job event listeners
notificationQueue.on('completed', (job, result) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job.id} failed:`, err);
  
  // Retry failed jobs with exponential backoff
  if (job.attemptsMade < 3) {
    const delay = Math.pow(2, job.attemptsMade) * 1000; // 1s, 2s, 4s
    job.retry({ delay });
  }
});

bulkNotificationQueue.on('completed', (job, result) => {
  logger.info(`Bulk notification job ${job.id} completed successfully`);
});

bulkNotificationQueue.on('failed', (job, err) => {
  logger.error(`Bulk notification job ${job.id} failed:`, err);
});

retryQueue.on('completed', (job, result) => {
  logger.info(`Retry job ${job.id} completed successfully`);
});

retryQueue.on('failed', (job, err) => {
  logger.error(`Retry job ${job.id} failed:`, err);
});

// Queue management functions
const notificationQueueManager = {
  /**
   * Add notification to queue
   * @param {object} notificationData - Notification data
   * @param {object} options - Queue options
   */
  async addNotification(notificationData, options = {}) {
    try {
      const job = await notificationQueue.add('send-notification', notificationData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 10,
        removeOnFail: 5,
        ...options
      });

      logger.info(`Added notification job to queue: ${job.id}`);
      return job;

    } catch (error) {
      logger.error('Error adding notification to queue:', error);
      throw error;
    }
  },

  /**
   * Add bulk notifications to queue
   * @param {object} bulkData - Bulk notification data
   * @param {object} options - Queue options
   */
  async addBulkNotifications(bulkData, options = {}) {
    try {
      const job = await bulkNotificationQueue.add('send-bulk-notifications', bulkData, {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 5,
        removeOnFail: 3,
        ...options
      });

      logger.info(`Added bulk notification job to queue: ${job.id}`);
      return job;

    } catch (error) {
      logger.error('Error adding bulk notifications to queue:', error);
      throw error;
    }
  },

  /**
   * Add retry job to queue
   * @param {object} retryData - Retry data
   * @param {object} options - Queue options
   */
  async addRetryJob(retryData, options = {}) {
    try {
      const job = await retryQueue.add('retry-notification', retryData, {
        attempts: 1,
        delay: 30000, // 30 seconds delay
        removeOnComplete: 10,
        removeOnFail: 5,
        ...options
      });

      logger.info(`Added retry job to queue: ${job.id}`);
      return job;

    } catch (error) {
      logger.error('Error adding retry job to queue:', error);
      throw error;
    }
  },

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const [notificationStats, bulkStats, retryStats] = await Promise.all([
        notificationQueue.getJobCounts(),
        bulkNotificationQueue.getJobCounts(),
        retryQueue.getJobCounts()
      ]);

      return {
        notification: notificationStats,
        bulk: bulkStats,
        retry: retryStats
      };

    } catch (error) {
      logger.error('Error getting queue stats:', error);
      throw error;
    }
  },

  /**
   * Pause all queues
   */
  async pauseAll() {
    try {
      await Promise.all([
        notificationQueue.pause(),
        bulkNotificationQueue.pause(),
        retryQueue.pause()
      ]);

      logger.info('All notification queues paused');

    } catch (error) {
      logger.error('Error pausing queues:', error);
      throw error;
    }
  },

  /**
   * Resume all queues
   */
  async resumeAll() {
    try {
      await Promise.all([
        notificationQueue.resume(),
        bulkNotificationQueue.resume(),
        retryQueue.resume()
      ]);

      logger.info('All notification queues resumed');

    } catch (error) {
      logger.error('Error resuming queues:', error);
      throw error;
    }
  },

  /**
   * Clean up completed jobs
   */
  async cleanup() {
    try {
      await Promise.all([
        notificationQueue.clean(5000, 'completed'),
        notificationQueue.clean(5000, 'failed'),
        bulkNotificationQueue.clean(5000, 'completed'),
        bulkNotificationQueue.clean(5000, 'failed'),
        retryQueue.clean(5000, 'completed'),
        retryQueue.clean(5000, 'failed')
      ]);

      logger.info('Notification queues cleaned up');

    } catch (error) {
      logger.error('Error cleaning up queues:', error);
      throw error;
    }
  }
};

module.exports = {
  notificationQueue,
  bulkNotificationQueue,
  retryQueue,
  notificationQueueManager
};
