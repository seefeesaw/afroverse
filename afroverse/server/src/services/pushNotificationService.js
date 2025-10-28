const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

class PushNotificationService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      
      this.initialized = true;
      logger.info('Firebase Admin SDK initialized for push notifications');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.initialized = false;
    }
  }

  /**
   * Send push notification to a single device
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   */
  async send(notification, userSettings) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const deviceTokens = userSettings.deviceTokens
        .filter(dt => dt.platform === 'ios' || dt.platform === 'android')
        .map(dt => dt.token);

      if (deviceTokens.length === 0) {
        return { success: false, error: 'No device tokens found' };
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          notificationId: notification._id.toString(),
          actionUrl: notification.actionUrl || '',
          priority: notification.priority || 'normal',
          ...notification.metadata
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#FFD700',
            sound: 'default',
            channelId: 'afroverse_notifications',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              sound: 'default',
              badge: await this.getBadgeCount(userSettings.userId),
              category: notification.type
            }
          }
        },
        tokens: deviceTokens
      };

      const response = await admin.messaging().sendMulticast(message);
      
      // Update device tokens based on results
      await this.updateDeviceTokens(userSettings, deviceTokens, response.responses);
      
      const successCount = response.successCount;
      const failureCount = response.failureCount;
      
      if (successCount > 0) {
        logger.info(`Push notification sent successfully to ${successCount} devices`);
        return { success: true, successCount, failureCount };
      } else {
        logger.error(`Failed to send push notification to all devices: ${failureCount} failures`);
        return { success: false, error: 'All devices failed', failureCount };
      }

    } catch (error) {
      logger.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple users
   * @param {Array} notifications - Array of notification objects
   * @param {Array} userSettings - Array of user settings objects
   */
  async sendBulk(notifications, userSettings) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const messages = [];
      const userIdToTokens = new Map();

      // Group device tokens by user
      userSettings.forEach(settings => {
        const tokens = settings.deviceTokens
          .filter(dt => dt.platform === 'ios' || dt.platform === 'android')
          .map(dt => dt.token);
        
        if (tokens.length > 0) {
          userIdToTokens.set(settings.userId.toString(), tokens);
        }
      });

      // Create messages for each notification
      notifications.forEach(notification => {
        const tokens = userIdToTokens.get(notification.userId.toString());
        if (tokens && tokens.length > 0) {
          const message = {
            notification: {
              title: notification.title,
              body: notification.message
            },
            data: {
              type: notification.type,
              notificationId: notification._id.toString(),
              actionUrl: notification.actionUrl || '',
              priority: notification.priority || 'normal',
              ...notification.metadata
            },
            android: {
              priority: 'high',
              notification: {
                icon: 'ic_notification',
                color: '#FFD700',
                sound: 'default',
                channelId: 'afroverse_notifications'
              }
            },
            apns: {
              payload: {
                aps: {
                  alert: {
                    title: notification.title,
                    body: notification.message
                  },
                  sound: 'default',
                  category: notification.type
                }
              }
            },
            tokens: tokens
          };
          messages.push(message);
        }
      });

      if (messages.length === 0) {
        return { success: false, error: 'No valid messages to send' };
      }

      const results = [];
      for (const message of messages) {
        try {
          const response = await admin.messaging().sendMulticast(message);
          results.push({
            success: response.successCount > 0,
            successCount: response.successCount,
            failureCount: response.failureCount
          });
        } catch (error) {
          logger.error('Error sending bulk push notification:', error);
          results.push({ success: false, error: error.message });
        }
      }

      return { success: true, results };

    } catch (error) {
      logger.error('Error sending bulk push notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update device tokens based on send results
   * @param {object} userSettings - User settings object
   * @param {Array} deviceTokens - Array of device tokens
   * @param {Array} responses - Array of send responses
   */
  async updateDeviceTokens(userSettings, deviceTokens, responses) {
    try {
      const tokensToRemove = [];
      
      responses.forEach((response, index) => {
        if (!response.success) {
          const error = response.error;
          if (error && (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          )) {
            tokensToRemove.push(deviceTokens[index]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        userSettings.deviceTokens = userSettings.deviceTokens.filter(
          dt => !tokensToRemove.includes(dt.token)
        );
        await userSettings.save();
        logger.info(`Removed ${tokensToRemove.length} invalid device tokens`);
      }
    } catch (error) {
      logger.error('Error updating device tokens:', error);
    }
  }

  /**
   * Get badge count for iOS notifications
   * @param {string} userId - User ID
   */
  async getBadgeCount(userId) {
    try {
      const Notification = require('../models/Notification');
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      logger.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Subscribe user to topic
   * @param {Array} tokens - Device tokens
   * @param {string} topic - Topic name
   */
  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      logger.info(`Subscribed ${response.successCount} devices to topic: ${topic}`);
      return response;
    } catch (error) {
      logger.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   * @param {Array} tokens - Device tokens
   * @param {string} topic - Topic name
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      logger.info(`Unsubscribed ${response.successCount} devices from topic: ${topic}`);
      return response;
    } catch (error) {
      logger.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Send notification to topic
   * @param {string} topic - Topic name
   * @param {object} notification - Notification object
   */
  async sendToTopic(topic, notification) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          notificationId: notification._id.toString(),
          actionUrl: notification.actionUrl || '',
          priority: notification.priority || 'normal',
          ...notification.metadata
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#FFD700',
            sound: 'default',
            channelId: 'afroverse_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              sound: 'default',
              category: notification.type
            }
          }
        },
        topic: topic
      };

      const response = await admin.messaging().send(message);
      logger.info(`Sent notification to topic ${topic}: ${response}`);
      return { success: true, messageId: response };

    } catch (error) {
      logger.error('Error sending notification to topic:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PushNotificationService();