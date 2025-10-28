const { logger } = require('../utils/logger');

class NotificationRulesEngine {
  constructor() {
    this.rules = new Map();
    this.cooldowns = new Map();
    this.userActivity = new Map();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default notification rules
   */
  initializeDefaultRules() {
    // Battle notification rules
    this.addRule('battle_challenge', {
      cooldown: 30 * 60 * 1000, // 30 minutes
      maxPerDay: 5,
      timeRestrictions: {
        start: '08:00',
        end: '23:00'
      },
      conditions: {
        minLevel: 1,
        requireActive: true
      }
    });

    // Streak notification rules
    this.addRule('streak_reminder', {
      cooldown: 60 * 60 * 1000, // 1 hour
      maxPerDay: 3,
      timeRestrictions: {
        start: '20:00',
        end: '23:59'
      },
      conditions: {
        requireStreak: true,
        minStreakDays: 1
      }
    });

    // Tribe notification rules
    this.addRule('tribe_alert', {
      cooldown: 2 * 60 * 60 * 1000, // 2 hours
      maxPerDay: 3,
      timeRestrictions: {
        start: '09:00',
        end: '22:00'
      },
      conditions: {
        requireTribe: true,
        minLevel: 2
      }
    });

    // Daily challenge rules
    this.addRule('daily_challenge', {
      cooldown: 24 * 60 * 60 * 1000, // 24 hours
      maxPerDay: 1,
      timeRestrictions: {
        start: '07:00',
        end: '09:00'
      },
      conditions: {
        requireActive: true
      }
    });

    // Coin notification rules
    this.addRule('coin_earned', {
      cooldown: 5 * 60 * 1000, // 5 minutes
      maxPerDay: 20,
      timeRestrictions: {
        start: '00:00',
        end: '23:59'
      },
      conditions: {
        requireActive: true
      }
    });

    logger.info('Default notification rules initialized');
  }

  /**
   * Add a notification rule
   * @param {string} type - Notification type
   * @param {object} rule - Rule configuration
   */
  addRule(type, rule) {
    this.rules.set(type, {
      cooldown: rule.cooldown || 0,
      maxPerDay: rule.maxPerDay || 10,
      timeRestrictions: rule.timeRestrictions || null,
      conditions: rule.conditions || {},
      customCheck: rule.customCheck || null
    });
    logger.info(`Added notification rule for type: ${type}`);
  }

  /**
   * Remove a notification rule
   * @param {string} type - Notification type
   */
  removeRule(type) {
    this.rules.delete(type);
    logger.info(`Removed notification rule for type: ${type}`);
  }

  /**
   * Check if notification should be sent
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   */
  async shouldSendNotification(notification, userSettings) {
    try {
      const rule = this.rules.get(notification.type);
      if (!rule) {
        logger.warn(`No rule found for notification type: ${notification.type}`);
        return true; // Allow by default if no rule
      }

      const userId = notification.userId.toString();
      const now = new Date();

      // Check cooldown
      if (!this.checkCooldown(userId, notification.type, rule.cooldown)) {
        logger.info(`Notification blocked by cooldown for user ${userId}, type ${notification.type}`);
        return false;
      }

      // Check daily limit
      if (!this.checkDailyLimit(userId, notification.type, rule.maxPerDay)) {
        logger.info(`Notification blocked by daily limit for user ${userId}, type ${notification.type}`);
        return false;
      }

      // Check time restrictions
      if (!this.checkTimeRestrictions(rule.timeRestrictions, userSettings.timing.timezone)) {
        logger.info(`Notification blocked by time restrictions for type ${notification.type}`);
        return false;
      }

      // Check conditions
      if (!await this.checkConditions(rule.conditions, userSettings, notification)) {
        logger.info(`Notification blocked by conditions for user ${userId}, type ${notification.type}`);
        return false;
      }

      // Custom check
      if (rule.customCheck && !await rule.customCheck(notification, userSettings)) {
        logger.info(`Notification blocked by custom check for user ${userId}, type ${notification.type}`);
        return false;
      }

      // Update cooldown and daily count
      this.updateCooldown(userId, notification.type);
      this.updateDailyCount(userId, notification.type);

      return true;

    } catch (error) {
      logger.error('Error checking notification rules:', error);
      return false; // Block on error for safety
    }
  }

  /**
   * Check cooldown for user and notification type
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   * @param {number} cooldownMs - Cooldown in milliseconds
   */
  checkCooldown(userId, type, cooldownMs) {
    const key = `${userId}_${type}`;
    const lastSent = this.cooldowns.get(key);
    
    if (!lastSent) return true;
    
    return (Date.now() - lastSent) >= cooldownMs;
  }

  /**
   * Check daily limit for user and notification type
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   * @param {number} maxPerDay - Maximum notifications per day
   */
  checkDailyLimit(userId, type, maxPerDay) {
    const key = `${userId}_${type}_${this.getTodayKey()}`;
    const count = this.userActivity.get(key) || 0;
    
    return count < maxPerDay;
  }

  /**
   * Check time restrictions
   * @param {object} timeRestrictions - Time restrictions object
   * @param {string} timezone - User timezone
   */
  checkTimeRestrictions(timeRestrictions, timezone) {
    if (!timeRestrictions) return true;

    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes();

    const startTime = this.parseTime(timeRestrictions.start);
    const endTime = this.parseTime(timeRestrictions.end);

    if (startTime <= endTime) {
      // Same day time window
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight time window
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check notification conditions
   * @param {object} conditions - Conditions object
   * @param {object} userSettings - User settings object
   * @param {object} notification - Notification object
   */
  async checkConditions(conditions, userSettings, notification) {
    try {
      // Check minimum level
      if (conditions.minLevel && userSettings.userId.level < conditions.minLevel) {
        return false;
      }

      // Check if user is active
      if (conditions.requireActive) {
        const isActive = await this.isUserActive(userSettings.userId._id);
        if (!isActive) return false;
      }

      // Check if user has streak
      if (conditions.requireStreak) {
        const hasStreak = await this.userHasStreak(userSettings.userId._id);
        if (!hasStreak) return false;
      }

      // Check minimum streak days
      if (conditions.minStreakDays) {
        const streakDays = await this.getUserStreakDays(userSettings.userId._id);
        if (streakDays < conditions.minStreakDays) return false;
      }

      // Check if user has tribe
      if (conditions.requireTribe) {
        if (!userSettings.userId.tribeId) return false;
      }

      return true;

    } catch (error) {
      logger.error('Error checking notification conditions:', error);
      return false;
    }
  }

  /**
   * Update cooldown for user and notification type
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   */
  updateCooldown(userId, type) {
    const key = `${userId}_${type}`;
    this.cooldowns.set(key, Date.now());
  }

  /**
   * Update daily count for user and notification type
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   */
  updateDailyCount(userId, type) {
    const key = `${userId}_${type}_${this.getTodayKey()}`;
    const count = this.userActivity.get(key) || 0;
    this.userActivity.set(key, count + 1);
  }

  /**
   * Parse time string to minutes
   * @param {string} timeString - Time string (HH:MM)
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get today's key for daily counting
   */
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if user is active (has activity in last 24 hours)
   * @param {string} userId - User ID
   */
  async isUserActive(userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (!user) return false;

      const lastActivity = user.lastActiveAt || user.updatedAt;
      const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceActivity < 24;
    } catch (error) {
      logger.error('Error checking user activity:', error);
      return false;
    }
  }

  /**
   * Check if user has an active streak
   * @param {string} userId - User ID
   */
  async userHasStreak(userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (!user || !user.streak) return false;

      return user.streak.current > 0;
    } catch (error) {
      logger.error('Error checking user streak:', error);
      return false;
    }
  }

  /**
   * Get user's current streak days
   * @param {string} userId - User ID
   */
  async getUserStreakDays(userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (!user || !user.streak) return 0;

      return user.streak.current || 0;
    } catch (error) {
      logger.error('Error getting user streak days:', error);
      return 0;
    }
  }

  /**
   * Clean up old cooldown and activity data
   */
  cleanup() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Clean up old cooldowns
    for (const [key, timestamp] of this.cooldowns.entries()) {
      if (now - timestamp > oneDayMs) {
        this.cooldowns.delete(key);
      }
    }

    // Clean up old daily counts
    const todayKey = this.getTodayKey();
    for (const key of this.userActivity.keys()) {
      if (!key.endsWith(todayKey)) {
        this.userActivity.delete(key);
      }
    }

    logger.info('Notification rules engine cleanup completed');
  }

  /**
   * Get rule statistics
   */
  getStats() {
    return {
      totalRules: this.rules.size,
      activeCooldowns: this.cooldowns.size,
      dailyActivities: this.userActivity.size,
      rules: Array.from(this.rules.keys())
    };
  }
}

module.exports = new NotificationRulesEngine();
