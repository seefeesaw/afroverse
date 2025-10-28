const notificationService = require('../services/notificationService');
const UserSettings = require('../models/UserSettings');
const { logger } = require('../utils/logger');

const notificationController = {
  /**
   * GET /api/notifications - Get user notifications
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const {
        limit = 20,
        skip = 0,
        type = null,
        status = null,
        channel = null
      } = req.query;

      const notifications = await notificationService.getUserNotifications(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        type,
        status,
        channel
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: notifications.length === parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  },

  /**
   * GET /api/notifications/unread-count - Get unread count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        unreadCount: count
      });

    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  },

  /**
   * POST /api/notifications/:id/read - Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        notification
      });

    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark notification as read'
      });
    }
  },

  /**
   * POST /api/notifications/read-all - Mark all notifications as read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        modifiedCount: result.modifiedCount
      });

    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
      });
    }
  },

  /**
   * GET /api/notifications/settings - Get user notification settings
   */
  async getSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await UserSettings.getOrCreate(userId);

      res.status(200).json({
        success: true,
        settings: {
          notifications: settings.notifications,
          timing: settings.timing,
          frequency: settings.frequency,
          deviceTokens: settings.deviceTokens.map(dt => ({
            platform: dt.platform,
            lastUsed: dt.lastUsed,
            createdAt: dt.createdAt
          })),
          whatsappPhone: settings.whatsappPhone,
          stats: settings.stats
        }
      });

    } catch (error) {
      logger.error('Error getting notification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification settings'
      });
    }
  },

  /**
   * PUT /api/notifications/settings - Update user notification settings
   */
  async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const { notifications, timing, frequency } = req.body;

      const settings = await UserSettings.getOrCreate(userId);

      if (notifications) {
        settings.notifications = { ...settings.notifications, ...notifications };
      }

      if (timing) {
        settings.timing = { ...settings.timing, ...timing };
      }

      if (frequency) {
        settings.frequency = { ...settings.frequency, ...frequency };
      }

      settings.updatedAt = new Date();
      await settings.save();

      res.status(200).json({
        success: true,
        settings: {
          notifications: settings.notifications,
          timing: settings.timing,
          frequency: settings.frequency
        }
      });

    } catch (error) {
      logger.error('Error updating notification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification settings'
      });
    }
  },

  /**
   * POST /api/notifications/device-token - Register device token for push notifications
   */
  async registerDeviceToken(req, res) {
    try {
      const userId = req.user.id;
      const { token, platform } = req.body;

      if (!token || !platform) {
        return res.status(400).json({
          success: false,
          message: 'Token and platform are required'
        });
      }

      if (!['ios', 'android', 'web'].includes(platform)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid platform'
        });
      }

      const settings = await UserSettings.getOrCreate(userId);
      await settings.addDeviceToken(token, platform);

      res.status(200).json({
        success: true,
        message: 'Device token registered successfully'
      });

    } catch (error) {
      logger.error('Error registering device token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register device token'
      });
    }
  },

  /**
   * DELETE /api/notifications/device-token - Remove device token
   */
  async removeDeviceToken(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const settings = await UserSettings.getOrCreate(userId);
      await settings.removeDeviceToken(token);

      res.status(200).json({
        success: true,
        message: 'Device token removed successfully'
      });

    } catch (error) {
      logger.error('Error removing device token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove device token'
      });
    }
  },

  /**
   * POST /api/notifications/whatsapp-phone - Register WhatsApp phone number
   */
  async registerWhatsAppPhone(req, res) {
    try {
      const userId = req.user.id;
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      const settings = await UserSettings.getOrCreate(userId);
      settings.whatsappPhone = phoneNumber;
      await settings.save();

      res.status(200).json({
        success: true,
        message: 'WhatsApp phone number registered successfully'
      });

    } catch (error) {
      logger.error('Error registering WhatsApp phone:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register WhatsApp phone number'
      });
    }
  },

  /**
   * DELETE /api/notifications/whatsapp-phone - Remove WhatsApp phone number
   */
  async removeWhatsAppPhone(req, res) {
    try {
      const userId = req.user.id;
      const settings = await UserSettings.getOrCreate(userId);
      
      settings.whatsappPhone = undefined;
      await settings.save();

      res.status(200).json({
        success: true,
        message: 'WhatsApp phone number removed successfully'
      });

    } catch (error) {
      logger.error('Error removing WhatsApp phone:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove WhatsApp phone number'
      });
    }
  },

  /**
   * POST /api/notifications/test - Send test notification (admin only)
   */
  async sendTestNotification(req, res) {
    try {
      const userId = req.user.id;
      const { type, channel, message } = req.body;

      if (!type || !channel) {
        return res.status(400).json({
          success: false,
          message: 'Type and channel are required'
        });
      }

      const result = await notificationService.sendNotification(
        userId,
        type,
        channel,
        { testMessage: message || 'This is a test notification' },
        { priority: 'normal' }
      );

      if (result) {
        res.status(200).json({
          success: true,
          message: 'Test notification sent successfully',
          notification: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send test notification'
        });
      }

    } catch (error) {
      logger.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification'
      });
    }
  },

  /**
   * GET /api/notifications/stats - Get notification statistics
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id;
      const settings = await UserSettings.getOrCreate(userId);

      const stats = {
        totalReceived: settings.stats.totalReceived,
        totalRead: settings.stats.totalRead,
        readRate: settings.stats.totalReceived > 0 ? 
          (settings.stats.totalRead / settings.stats.totalReceived * 100).toFixed(2) : 0,
        avgReadTime: settings.stats.avgReadTime,
        lastReadAt: settings.stats.lastReadAt,
        deviceTokens: settings.deviceTokens.length,
        whatsappEnabled: !!settings.whatsappPhone
      };

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics'
      });
    }
  }
};

module.exports = notificationController;