const socketService = require('../../sockets/socketService');
const { logger } = require('../../utils/logger');

class InAppProvider {
  constructor() {
    this.bannerQueue = new Map(); // userId -> banner queue
    this.activeBanners = new Map(); // userId -> active banners
  }

  // Send in-app notification
  async send(notification, payload) {
    try {
      // Build in-app message
      const message = this.buildInAppMessage(notification, payload);
      
      // Send via socket
      const result = await this.sendViaSocket(notification.userId, message);
      
      if (result.success) {
        logger.info(`In-app notification sent to user ${notification.userId}`);
        
        // Queue banner if needed
        if (message.type === 'banner') {
          await this.queueBanner(notification.userId, message);
        }
        
        return {
          success: true,
          providerId: `inapp_${Date.now()}`
        };
      } else {
        throw new Error('Failed to send via socket');
      }

    } catch (error) {
      logger.error('In-app send error:', error);
      
      return {
        success: false,
        error: error.message,
        shouldRetry: true
      };
    }
  }

  // Build in-app message
  buildInAppMessage(notification, payload) {
    const message = {
      id: notification._id.toString(),
      type: this.getMessageType(notification.campaignId),
      title: notification.message.title,
      body: notification.message.body,
      icon: this.getIcon(notification.campaignId),
      color: this.getColor(notification.campaignId),
      deeplink: payload.deeplink || null,
      campaignId: notification.campaignId,
      templateId: notification.templateId,
      priority: this.getPriority(notification.campaignId),
      duration: this.getDuration(notification.campaignId),
      actions: this.getActions(notification.campaignId, payload),
      metadata: {
        ...notification.message.meta,
        ...payload
      }
    };

    return message;
  }

  // Get message type
  getMessageType(campaignId) {
    const typeMap = {
      'streak_at_risk': 'banner',
      'battle_live': 'banner',
      'battle_2h_left': 'banner',
      'transform_ready': 'toast',
      'tribe_hour': 'banner',
      'leaderboard_climb': 'toast'
    };
    
    return typeMap[campaignId] || 'toast';
  }

  // Get icon
  getIcon(campaignId) {
    const iconMap = {
      'streak_at_risk': '🔥',
      'battle_live': '⚔️',
      'battle_2h_left': '🕒',
      'transform_ready': '✨',
      'tribe_hour': '⚡',
      'leaderboard_climb': '📈'
    };
    
    return iconMap[campaignId] || '🔔';
  }

  // Get color
  getColor(campaignId) {
    const colorMap = {
      'streak_at_risk': '#FF6B35',
      'battle_live': '#E74C3C',
      'battle_2h_left': '#F39C12',
      'transform_ready': '#9B59B6',
      'tribe_hour': '#3498DB',
      'leaderboard_climb': '#2ECC71'
    };
    
    return colorMap[campaignId] || '#34495E';
  }

  // Get priority
  getPriority(campaignId) {
    const priorityMap = {
      'streak_at_risk': 'high',
      'battle_live': 'high',
      'battle_2h_left': 'medium',
      'transform_ready': 'low',
      'tribe_hour': 'medium',
      'leaderboard_climb': 'low'
    };
    
    return priorityMap[campaignId] || 'low';
  }

  // Get duration
  getDuration(campaignId) {
    const durationMap = {
      'streak_at_risk': 10000, // 10 seconds
      'battle_live': 8000,     // 8 seconds
      'battle_2h_left': 6000,  // 6 seconds
      'transform_ready': 5000, // 5 seconds
      'tribe_hour': 8000,      // 8 seconds
      'leaderboard_climb': 4000 // 4 seconds
    };
    
    return durationMap[campaignId] || 5000;
  }

  // Get actions
  getActions(campaignId, payload) {
    const actionMap = {
      'streak_at_risk': [
        { id: 'vote', label: 'Vote 5', action: 'navigate', target: '/feed?vote=quick5' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'battle_live': [
        { id: 'view', label: 'View Battle', action: 'navigate', target: payload.deeplink },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'battle_2h_left': [
        { id: 'view', label: 'Hold Lead', action: 'navigate', target: payload.deeplink },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'transform_ready': [
        { id: 'view', label: 'View Result', action: 'navigate', target: payload.deeplink },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'tribe_hour': [
        { id: 'participate', label: 'Join Now', action: 'navigate', target: '/feed' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'leaderboard_climb': [
        { id: 'view', label: 'View Rank', action: 'navigate', target: '/leaderboard' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ]
    };
    
    return actionMap[campaignId] || [
      { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
    ];
  }

  // Send via socket
  async sendViaSocket(userId, message) {
    try {
      socketService.emitUserNotification(userId, {
        type: 'inapp_notification',
        ...message
      });
      
      return { success: true };

    } catch (error) {
      logger.error('Error sending via socket:', error);
      return { success: false, error: error.message };
    }
  }

  // Queue banner
  async queueBanner(userId, message) {
    try {
      if (!this.bannerQueue.has(userId)) {
        this.bannerQueue.set(userId, []);
      }
      
      const queue = this.bannerQueue.get(userId);
      queue.push(message);
      
      // Process queue
      await this.processBannerQueue(userId);

    } catch (error) {
      logger.error('Error queuing banner:', error);
    }
  }

  // Process banner queue
  async processBannerQueue(userId) {
    try {
      const queue = this.bannerQueue.get(userId) || [];
      const activeBanners = this.activeBanners.get(userId) || [];
      
      // Only show one banner at a time
      if (activeBanners.length === 0 && queue.length > 0) {
        const banner = queue.shift();
        activeBanners.push(banner);
        
        // Send banner
        await this.sendViaSocket(userId, {
          ...banner,
          type: 'banner_show'
        });
        
        // Auto-dismiss after duration
        setTimeout(() => {
          this.dismissBanner(userId, banner.id);
        }, banner.duration);
      }

    } catch (error) {
      logger.error('Error processing banner queue:', error);
    }
  }

  // Dismiss banner
  async dismissBanner(userId, bannerId) {
    try {
      const activeBanners = this.activeBanners.get(userId) || [];
      const bannerIndex = activeBanners.findIndex(b => b.id === bannerId);
      
      if (bannerIndex !== -1) {
        activeBanners.splice(bannerIndex, 1);
        
        // Send dismiss event
        await this.sendViaSocket(userId, {
          type: 'banner_dismiss',
          id: bannerId
        });
        
        // Process next banner in queue
        await this.processBannerQueue(userId);
      }

    } catch (error) {
      logger.error('Error dismissing banner:', error);
    }
  }

  // Handle banner action
  async handleBannerAction(userId, bannerId, actionId) {
    try {
      const activeBanners = this.activeBanners.get(userId) || [];
      const banner = activeBanners.find(b => b.id === bannerId);
      
      if (!banner) {
        logger.warn(`Banner ${bannerId} not found for user ${userId}`);
        return;
      }
      
      const action = banner.actions.find(a => a.id === actionId);
      if (!action) {
        logger.warn(`Action ${actionId} not found for banner ${bannerId}`);
        return;
      }
      
      // Handle action
      switch (action.action) {
        case 'navigate':
          await this.sendViaSocket(userId, {
            type: 'banner_action',
            id: bannerId,
            action: 'navigate',
            target: action.target
          });
          break;
        case 'dismiss':
          await this.dismissBanner(userId, bannerId);
          break;
        default:
          logger.warn(`Unknown action: ${action.action}`);
      }
      
      // Track action
      await this.trackBannerAction(userId, bannerId, actionId);

    } catch (error) {
      logger.error('Error handling banner action:', error);
    }
  }

  // Track banner action
  async trackBannerAction(userId, bannerId, actionId) {
    try {
      const Notification = require('../../models/Notification');
      
      await Notification.findByIdAndUpdate(bannerId, {
        $set: {
          status: 'clicked',
          clickedAt: new Date()
        }
      });
      
      logger.info(`Banner action tracked: ${bannerId} - ${actionId}`);

    } catch (error) {
      logger.error('Error tracking banner action:', error);
    }
  }

  // Get active banners
  getActiveBanners(userId) {
    return this.activeBanners.get(userId) || [];
  }

  // Clear all banners
  async clearAllBanners(userId) {
    try {
      const activeBanners = this.activeBanners.get(userId) || [];
      
      for (const banner of activeBanners) {
        await this.dismissBanner(userId, banner.id);
      }
      
      // Clear queue
      this.bannerQueue.set(userId, []);
      
      logger.info(`Cleared all banners for user ${userId}`);

    } catch (error) {
      logger.error('Error clearing all banners:', error);
    }
  }

  // Get banner stats
  getBannerStats() {
    const stats = {
      totalQueued: 0,
      totalActive: 0,
      usersWithBanners: 0
    };
    
    for (const [userId, queue] of this.bannerQueue) {
      stats.totalQueued += queue.length;
    }
    
    for (const [userId, banners] of this.activeBanners) {
      stats.totalActive += banners.length;
      if (banners.length > 0) {
        stats.usersWithBanners++;
      }
    }
    
    return stats;
  }
}

module.exports = new InAppProvider();
