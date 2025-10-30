const admin = require('firebase-admin');
const { logger } = require('../../utils/logger');

class PushProvider {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  // Initialize Firebase Admin SDK
  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      
      this.initialized = true;
      logger.info('Firebase Admin SDK initialized');
      
    } catch (error) {
      logger.error('Firebase initialization error:', error);
      this.initialized = false;
    }
  }

  // Send push notification
  async send(notification, payload) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      // Get user's push tokens
      const tokens = await this.getUserPushTokens(notification.userId);
      if (!tokens || tokens.length === 0) {
        throw new Error('No push tokens found for user');
      }

      // Build message
      const message = this.buildPushMessage(notification, payload);
      
      // Send to all tokens
      const results = await this.sendToTokens(tokens, message);
      
      // Check results
      const successCount = results.responses.filter(r => r.success).length;
      const failureCount = results.responses.filter(r => !r.success).length;
      
      if (successCount > 0) {
        logger.info(`Push notification sent to ${successCount}/${tokens.length} tokens`);
        
        // Clean up invalid tokens
        await this.cleanupInvalidTokens(notification.userId, results.responses);
        
        return {
          success: true,
          providerId: `push_${Date.now()}`,
          successCount,
          failureCount
        };
      } else {
        throw new Error('All push notifications failed');
      }

    } catch (error) {
      logger.error('Push send error:', error);
      
      return {
        success: false,
        error: error.message,
        shouldRetry: true
      };
    }
  }

  // Build push message
  buildPushMessage(notification, payload) {
    const message = {
      notification: {
        title: notification.message.title,
        body: notification.message.body
      },
      data: {
        deeplink: payload.deeplink || '',
        campaignId: notification.campaignId,
        templateId: notification.templateId,
        notificationId: notification._id.toString()
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#FF6B35',
          sound: 'default',
          channelId: 'afroverse_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Open',
              icon: '/icons/open-icon.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/icons/dismiss-icon.png'
            }
          ]
        }
      }
    };

    return message;
  }

  // Send to tokens
  async sendToTokens(tokens, message) {
    try {
      const results = await admin.messaging().sendMulticast({
        tokens: tokens.map(t => t.token),
        ...message
      });

      return results;

    } catch (error) {
      logger.error('Error sending multicast message:', error);
      throw error;
    }
  }

  // Get user push tokens
  async getUserPushTokens(userId) {
    try {
      const UserNotificationSettings = require('../../models/UserNotificationSettings');
      
      const settings = await UserNotificationSettings.findById(userId).lean();
      if (!settings || !settings.channels.push.enabled) {
        return [];
      }

      return settings.channels.push.tokens || [];

    } catch (error) {
      logger.error('Error getting user push tokens:', error);
      return [];
    }
  }

  // Clean up invalid tokens
  async cleanupInvalidTokens(userId, responses) {
    try {
      const UserNotificationSettings = require('../../models/UserNotificationSettings');
      
      const settings = await UserNotificationSettings.findById(userId);
      if (!settings) return;

      const invalidTokens = [];
      
      responses.forEach((response, index) => {
        if (!response.success && response.error) {
          const errorCode = response.error.code;
          
          // Check for invalid token errors
          if (errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered') {
            invalidTokens.push(settings.channels.push.tokens[index].token);
          }
        }
      });

      // Remove invalid tokens
      if (invalidTokens.length > 0) {
        settings.channels.push.tokens = settings.channels.push.tokens.filter(
          token => !invalidTokens.includes(token.token)
        );
        
        await settings.save();
        logger.info(`Removed ${invalidTokens.length} invalid push tokens for user ${userId}`);
      }

    } catch (error) {
      logger.error('Error cleaning up invalid tokens:', error);
    }
  }

  // Add push token
  async addPushToken(userId, token, platform = 'web') {
    try {
      const UserNotificationSettings = require('../../models/UserNotificationSettings');
      
      const settings = await UserNotificationSettings.getOrCreate(userId);
      await settings.addPushToken(token, platform);
      
      logger.info(`Added push token for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Error adding push token:', error);
      return false;
    }
  }

  // Remove push token
  async removePushToken(userId, token) {
    try {
      const UserNotificationSettings = require('../../models/UserNotificationSettings');
      
      const settings = await UserNotificationSettings.findById(userId);
      if (!settings) return false;

      await settings.removePushToken(token);
      
      logger.info(`Removed push token for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Error removing push token:', error);
      return false;
    }
  }

  // Send test notification
  async sendTestNotification(userId, title, body) {
    try {
      const tokens = await this.getUserPushTokens(userId);
      if (!tokens || tokens.length === 0) {
        throw new Error('No push tokens found for user');
      }

      const message = {
        notification: {
          title: title || 'Test Notification',
          body: body || 'This is a test notification from Afroverse'
        },
        data: {
          test: 'true'
        }
      };

      const results = await this.sendToTokens(tokens, message);
      
      const successCount = results.responses.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        successCount,
        totalTokens: tokens.length
      };

    } catch (error) {
      logger.error('Error sending test notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate token
  async validateToken(token) {
    try {
      // Send a test message to validate the token
      const message = {
        token,
        notification: {
          title: 'Validation',
          body: 'Token validation'
        },
        data: {
          validation: 'true'
        }
      };

      await admin.messaging().send(message);
      return true;

    } catch (error) {
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        return false;
      }
      
      logger.error('Error validating push token:', error);
      return false;
    }
  }

  // Get delivery stats
  async getDeliveryStats(startDate, endDate) {
    try {
      const Notification = require('../../models/Notification');
      
      const stats = await Notification.aggregate([
        {
          $match: {
            channel: 'push',
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats;

    } catch (error) {
      logger.error('Error getting push delivery stats:', error);
      throw error;
    }
  }
}

module.exports = new PushProvider();
