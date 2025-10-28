const { logger } = require('../utils/logger');

class NotificationDispatcher {
  constructor() {
    this.dispatchers = new Map();
    this.fallbackChain = ['push', 'inapp', 'whatsapp', 'email'];
  }

  /**
   * Register a dispatcher for a specific channel
   * @param {string} channel - Channel name
   * @param {object} dispatcher - Dispatcher instance
   */
  registerDispatcher(channel, dispatcher) {
    this.dispatchers.set(channel, dispatcher);
    logger.info(`Registered dispatcher for channel: ${channel}`);
  }

  /**
   * Send notification through specified channel
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   */
  async send(notification, userSettings) {
    try {
      const dispatcher = this.dispatchers.get(notification.channel);
      if (!dispatcher) {
        throw new Error(`No dispatcher found for channel: ${notification.channel}`);
      }

      const result = await dispatcher.send(notification, userSettings);
      
      if (result.success) {
        logger.info(`Notification sent successfully via ${notification.channel}: ${notification._id}`);
      } else {
        logger.error(`Failed to send notification via ${notification.channel}: ${result.error}`);
      }

      return result;

    } catch (error) {
      logger.error(`Error sending notification via ${notification.channel}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification with fallback chain
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   * @param {Array} fallbackChannels - Optional custom fallback chain
   */
  async sendWithFallback(notification, userSettings, fallbackChannels = null) {
    const channels = fallbackChannels || this.fallbackChain;
    
    for (const channel of channels) {
      try {
        // Skip if user doesn't want this channel
        if (!userSettings.canReceiveNotification(notification.type, channel)) {
          continue;
        }

        // Create channel-specific notification
        const channelNotification = {
          ...notification,
          channel
        };

        const result = await this.send(channelNotification, userSettings);
        
        if (result.success) {
          return result;
        }

        logger.warn(`Failed to send via ${channel}, trying next channel: ${result.error}`);

      } catch (error) {
        logger.error(`Error sending via ${channel}:`, error);
        continue;
      }
    }

    return { success: false, error: 'All channels failed' };
  }

  /**
   * Send notification to multiple channels
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   * @param {Array} channels - Channels to send to
   */
  async sendToMultipleChannels(notification, userSettings, channels) {
    const results = [];

    for (const channel of channels) {
      try {
        if (!userSettings.canReceiveNotification(notification.type, channel)) {
          results.push({ channel, success: false, error: 'User disabled this channel' });
          continue;
        }

        const channelNotification = {
          ...notification,
          channel
        };

        const result = await this.send(channelNotification, userSettings);
        results.push({ channel, ...result });

      } catch (error) {
        logger.error(`Error sending to ${channel}:`, error);
        results.push({ channel, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send bulk notifications
   * @param {Array} notifications - Array of notification objects
   * @param {Array} userSettings - Array of user settings objects
   */
  async sendBulk(notifications, userSettings) {
    const results = [];

    // Group notifications by channel for efficient bulk sending
    const channelGroups = new Map();
    
    notifications.forEach((notification, index) => {
      const channel = notification.channel;
      if (!channelGroups.has(channel)) {
        channelGroups.set(channel, { notifications: [], userSettings: [] });
      }
      
      channelGroups.get(channel).notifications.push(notification);
      channelGroups.get(channel).userSettings.push(userSettings[index]);
    });

    // Send each channel group
    for (const [channel, group] of channelGroups) {
      try {
        const dispatcher = this.dispatchers.get(channel);
        if (!dispatcher) {
          logger.error(`No dispatcher found for channel: ${channel}`);
          continue;
        }

        if (dispatcher.sendBulk) {
          const result = await dispatcher.sendBulk(group.notifications, group.userSettings);
          results.push({ channel, ...result });
        } else {
          // Fallback to individual sends
          const individualResults = [];
          for (let i = 0; i < group.notifications.length; i++) {
            const result = await this.send(group.notifications[i], group.userSettings[i]);
            individualResults.push(result);
          }
          results.push({ channel, results: individualResults });
        }

      } catch (error) {
        logger.error(`Error sending bulk notifications via ${channel}:`, error);
        results.push({ channel, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get available channels
   */
  getAvailableChannels() {
    return Array.from(this.dispatchers.keys());
  }

  /**
   * Check if channel is available
   * @param {string} channel - Channel name
   */
  isChannelAvailable(channel) {
    return this.dispatchers.has(channel);
  }

  /**
   * Get dispatcher for channel
   * @param {string} channel - Channel name
   */
  getDispatcher(channel) {
    return this.dispatchers.get(channel);
  }

  /**
   * Set fallback chain
   * @param {Array} channels - Array of channel names in priority order
   */
  setFallbackChain(channels) {
    this.fallbackChain = channels;
    logger.info(`Updated fallback chain: ${channels.join(' -> ')}`);
  }

  /**
   * Get dispatcher statistics
   */
  getStats() {
    const stats = {
      totalDispatchers: this.dispatchers.size,
      availableChannels: this.getAvailableChannels(),
      fallbackChain: this.fallbackChain
    };

    // Add dispatcher-specific stats
    for (const [channel, dispatcher] of this.dispatchers) {
      if (dispatcher.getStats) {
        stats[channel] = dispatcher.getStats();
      }
    }

    return stats;
  }
}

module.exports = new NotificationDispatcher();
