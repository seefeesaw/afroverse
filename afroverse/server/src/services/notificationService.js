const Notification = require('../models/Notification');
const UserSettings = require('../models/UserSettings');
const NotificationTemplate = require('../models/NotificationTemplate');
const { logger } = require('../utils/logger');

class NotificationService {
  constructor() {
    this.dispatchers = new Map();
    this.rulesEngine = null;
  }

  /**
   * Register a notification dispatcher for a specific channel
   * @param {string} channel - Channel name (push, whatsapp, email, etc.)
   * @param {object} dispatcher - Dispatcher instance
   */
  registerDispatcher(channel, dispatcher) {
    this.dispatchers.set(channel, dispatcher);
    logger.info(`Registered notification dispatcher for channel: ${channel}`);
  }

  /**
   * Set the rules engine for notification filtering
   * @param {object} rulesEngine - Rules engine instance
   */
  setRulesEngine(rulesEngine) {
    this.rulesEngine = rulesEngine;
    logger.info('Notification rules engine set');
  }

  /**
   * Send a notification to a user
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   * @param {string} channel - Channel to send through
   * @param {object} variables - Template variables
   * @param {object} options - Additional options
   */
  async sendNotification(userId, type, channel, variables = {}, options = {}) {
    try {
      // Get user settings
      const userSettings = await UserSettings.getOrCreate(userId);
      
      // Check if user can receive this notification
      if (!userSettings.canReceiveNotification(type, channel)) {
        logger.info(`User ${userId} cannot receive ${type} notification on ${channel}`);
        return null;
      }

      // Get template
      const template = await NotificationTemplate.getTemplate(type, channel);
      if (!template) {
        logger.warn(`No template found for ${type} on ${channel}`);
        return null;
      }

      // Validate variables
      const validationErrors = template.validateVariables(variables);
      if (validationErrors.length > 0) {
        logger.error(`Template validation failed for ${type}:`, validationErrors);
        return null;
      }

      // Render template
      const rendered = template.render(variables);

      // Create notification record
      const notification = new Notification({
        userId,
        type,
        channel,
        title: rendered.title,
        message: rendered.message,
        actionUrl: rendered.actionUrl,
        priority: options.priority || template.priority,
        metadata: {
          templateName: template.name,
          variables,
          ...options.metadata
        },
        expiresAt: options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await notification.save();

      // Send through dispatcher
      const dispatcher = this.dispatchers.get(channel);
      if (!dispatcher) {
        logger.error(`No dispatcher found for channel: ${channel}`);
        notification.markAsFailed('No dispatcher available');
        return notification;
      }

      // Apply rules engine if available
      if (this.rulesEngine) {
        const shouldSend = await this.rulesEngine.shouldSendNotification(notification, userSettings);
        if (!shouldSend) {
          logger.info(`Rules engine blocked notification ${notification._id}`);
          notification.status = 'failed';
          notification.failureReason = 'Blocked by rules engine';
          await notification.save();
          return notification;
        }
      }

      // Dispatch notification
      const dispatchResult = await dispatcher.send(notification, userSettings);
      
      if (dispatchResult.success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();
        
        // Update user stats
        await userSettings.updateNotificationStats();
        
        // Increment template usage
        await template.incrementUsage();
        
        logger.info(`Notification sent successfully: ${notification._id}`);
      } else {
        notification.markAsFailed(dispatchResult.error);
        logger.error(`Failed to send notification ${notification._id}:`, dispatchResult.error);
      }

      return notification;

    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {string} type - Notification type
   * @param {string} channel - Channel to send through
   * @param {object} variables - Template variables
   * @param {object} options - Additional options
   */
  async sendBulkNotification(userIds, type, channel, variables = {}, options = {}) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(userId, type, channel, variables, options);
        results.push({ userId, success: !!result, notification: result });
      } catch (error) {
        logger.error(`Failed to send notification to user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Send notification to users matching criteria
   * @param {object} criteria - User selection criteria
   * @param {string} type - Notification type
   * @param {string} channel - Channel to send through
   * @param {object} variables - Template variables
   * @param {object} options - Additional options
   */
  async sendTargetedNotification(criteria, type, channel, variables = {}, options = {}) {
    try {
      const users = await UserSettings.getUsersForNotification(type, channel);
      
      // Apply additional criteria filtering
      let filteredUsers = users;
      
      if (criteria.tribes && criteria.tribes.length > 0) {
        filteredUsers = filteredUsers.filter(user => 
          criteria.tribes.includes(user.userId.tribeId)
        );
      }
      
      if (criteria.countries && criteria.countries.length > 0) {
        filteredUsers = filteredUsers.filter(user => 
          criteria.countries.includes(user.userId.country)
        );
      }
      
      if (criteria.minLevel) {
        filteredUsers = filteredUsers.filter(user => 
          user.userId.level >= criteria.minLevel
        );
      }
      
      const userIds = filteredUsers.map(user => user.userId._id);
      
      return await this.sendBulkNotification(userIds, type, channel, variables, options);
      
    } catch (error) {
      logger.error('Error sending targeted notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {object} options - Query options
   */
  async getUserNotifications(userId, options = {}) {
    try {
      return await Notification.getUserNotifications(userId, options);
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await notification.markAsRead();
      
      // Update user settings stats
      const userSettings = await UserSettings.getOrCreate(userId);
      const readTime = notification.readAt ? 
        (notification.readAt.getTime() - notification.sentAt.getTime()) / 1000 : 0;
      await userSettings.updateNotificationStats(readTime);
      
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.markAllAsRead(userId);
      
      // Update user settings stats
      const userSettings = await UserSettings.getOrCreate(userId);
      await userSettings.updateNotificationStats();
      
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired notifications
   */
  async cleanupExpired() {
    try {
      const result = await Notification.cleanupExpired();
      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  /**
   * Retry failed notifications
   * @param {number} maxRetries - Maximum number of retries
   */
  async retryFailedNotifications(maxRetries = 3) {
    try {
      const failedNotifications = await Notification.find({
        status: 'failed',
        retryCount: { $lt: maxRetries }
      }).limit(100);

      const results = [];
      
      for (const notification of failedNotifications) {
        try {
          const userSettings = await UserSettings.getOrCreate(notification.userId);
          const dispatcher = this.dispatchers.get(notification.channel);
          
          if (!dispatcher) {
            continue;
          }

          const dispatchResult = await dispatcher.send(notification, userSettings);
          
          if (dispatchResult.success) {
            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();
            results.push({ notificationId: notification._id, success: true });
          } else {
            await notification.markAsFailed(dispatchResult.error);
            results.push({ notificationId: notification._id, success: false, error: dispatchResult.error });
          }
        } catch (error) {
          logger.error(`Failed to retry notification ${notification._id}:`, error);
          results.push({ notificationId: notification._id, success: false, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error retrying failed notifications:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications
   * This method processes notifications that are scheduled to be sent at a specific time
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      // Find notifications that are scheduled to be sent now or in the past
      const scheduledNotifications = await Notification.find({
        status: 'scheduled',
        scheduledFor: { $lte: now }
      }).limit(100);

      const results = [];
      
      for (const notification of scheduledNotifications) {
        try {
          const userSettings = await UserSettings.getOrCreate(notification.userId);
          const dispatcher = this.dispatchers.get(notification.channel);
          
          if (!dispatcher) {
            logger.warn(`No dispatcher found for channel: ${notification.channel}`);
            notification.markAsFailed('No dispatcher available');
            results.push({ notificationId: notification._id, success: false, error: 'No dispatcher available' });
            continue;
          }

          const dispatchResult = await dispatcher.send(notification, userSettings);
          
          if (dispatchResult.success) {
            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();
            results.push({ notificationId: notification._id, success: true });
            logger.info(`Scheduled notification sent: ${notification._id}`);
          } else {
            await notification.markAsFailed(dispatchResult.error);
            results.push({ notificationId: notification._id, success: false, error: dispatchResult.error });
          }
        } catch (error) {
          logger.error(`Failed to process scheduled notification ${notification._id}:`, error);
          await notification.markAsFailed(error.message);
          results.push({ notificationId: notification._id, success: false, error: error.message });
        }
      }
      
      return {
        processed: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();