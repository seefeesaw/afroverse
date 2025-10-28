import api from './api';

const notificationService = {
  /**
   * Get user notifications with pagination
   * @param {object} params - Query parameters
   * @returns {Promise<object>} Notifications and pagination info
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data.notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<object>} Result with modified count
   */
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Get notification settings
   * @returns {Promise<object>} User notification settings
   */
  async getSettings() {
    try {
      const response = await api.get('/notifications/settings');
      return response.data.settings;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  /**
   * Update notification settings
   * @param {object} settings - Settings to update
   * @returns {Promise<object>} Updated settings
   */
  async updateSettings(settings) {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data.settings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  /**
   * Register device token for push notifications
   * @param {string} token - Device token
   * @param {string} platform - Platform (ios, android, web)
   * @returns {Promise<object>} Registration result
   */
  async registerDeviceToken(token, platform) {
    try {
      const response = await api.post('/notifications/device-token', {
        token,
        platform
      });
      return response.data;
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  },

  /**
   * Remove device token
   * @param {string} token - Device token to remove
   * @returns {Promise<object>} Removal result
   */
  async removeDeviceToken(token) {
    try {
      const response = await api.delete('/notifications/device-token', {
        data: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing device token:', error);
      throw error;
    }
  },

  /**
   * Register WhatsApp phone number
   * @param {string} phoneNumber - WhatsApp phone number
   * @returns {Promise<object>} Registration result
   */
  async registerWhatsAppPhone(phoneNumber) {
    try {
      const response = await api.post('/notifications/whatsapp-phone', {
        phoneNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error registering WhatsApp phone:', error);
      throw error;
    }
  },

  /**
   * Remove WhatsApp phone number
   * @returns {Promise<object>} Removal result
   */
  async removeWhatsAppPhone() {
    try {
      const response = await api.delete('/notifications/whatsapp-phone');
      return response.data;
    } catch (error) {
      console.error('Error removing WhatsApp phone:', error);
      throw error;
    }
  },

  /**
   * Send test notification
   * @param {string} type - Notification type
   * @param {string} channel - Channel (push, inapp, whatsapp)
   * @param {string} message - Test message
   * @returns {Promise<object>} Test result
   */
  async sendTestNotification(type, channel, message) {
    try {
      const response = await api.post('/notifications/test', {
        type,
        channel,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  /**
   * Get notification statistics
   * @returns {Promise<object>} Notification stats
   */
  async getStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  /**
   * Request push notification permission
   * @returns {Promise<boolean>} Permission granted
   */
  async requestPushPermission() {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied');
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';

    } catch (error) {
      console.error('Error requesting push permission:', error);
      throw error;
    }
  },

  /**
   * Get push notification subscription
   * @returns {Promise<PushSubscription|null>} Push subscription
   */
  async getPushSubscription() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return subscription;

    } catch (error) {
      console.error('Error getting push subscription:', error);
      throw error;
    }
  },

  /**
   * Subscribe to push notifications
   * @param {string} vapidPublicKey - VAPID public key
   * @returns {Promise<PushSubscription>} Push subscription
   */
  async subscribeToPush(vapidPublicKey) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return subscription;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<boolean>} Success status
   */
  async unsubscribeFromPush() {
    try {
      const subscription = await this.getPushSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  },

  /**
   * Convert VAPID key to Uint8Array
   * @param {string} base64String - Base64 encoded string
   * @returns {Uint8Array} Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /**
   * Handle notification click
   * @param {object} notification - Notification object
   */
  handleNotificationClick(notification) {
    try {
      // Mark as read
      this.markAsRead(notification.id);

      // Navigate to action URL if available
      if (notification.actionUrl) {
        // Use your app's routing system here
        // For example, with React Router:
        // history.push(notification.actionUrl);
        
        // Or open in new tab:
        window.open(notification.actionUrl, '_blank');
      }

      // Close the notification
      if (notification.close) {
        notification.close();
      }

    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  },

  /**
   * Show local notification
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   * @returns {Notification} Notification object
   */
  showLocalNotification(title, options = {}) {
    try {
      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const notification = new Notification(title, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;

    } catch (error) {
      console.error('Error showing local notification:', error);
      throw error;
    }
  }
};

export default notificationService;