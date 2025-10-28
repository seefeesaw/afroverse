const User = require('../../models/User');
const UserNotificationSettings = require('../../models/UserNotificationSettings');
const { logger } = require('../utils/logger');

class TargetingEngine {
  constructor() {
    this.rules = {
      streakNotSafe: this.streakNotSafe,
      timeToMidnightLE: this.timeToMidnightLE,
      inBattle: this.inBattle,
      battleTimeLeftLE: this.battleTimeLeftLE,
      transformCompleted: this.transformCompleted,
      tribeHourActive: this.tribeHourActive,
      leaderboardClimb: this.leaderboardClimb,
      dailyLoginNotAwarded: this.dailyLoginNotAwarded,
      voteCountLT: this.voteCountLT
    };
  }

  // Get users based on targeting rules
  async getUsers(targetingRules, audienceCriteria) {
    try {
      let users = [];
      
      // Get base audience
      switch (audienceCriteria.audience) {
        case 'all':
          users = await this.getAllUsers();
          break;
        case 'active':
          users = await this.getActiveUsers();
          break;
        case 'inactive':
          users = await this.getInactiveUsers();
          break;
        case 'tribe':
          users = await this.getTribeUsers(audienceCriteria.customAudience);
          break;
        case 'custom':
          users = await this.getCustomAudience(audienceCriteria.customAudience);
          break;
        default:
          users = await this.getAllUsers();
      }
      
      // Apply targeting rules
      const filteredUsers = [];
      for (const user of users) {
        if (await this.evaluateRules(user, targetingRules)) {
          filteredUsers.push(user);
        }
      }
      
      logger.info(`Targeting found ${filteredUsers.length} users from ${users.length} base audience`);
      return filteredUsers;
      
    } catch (error) {
      logger.error('Error getting users for targeting:', error);
      throw error;
    }
  }

  // Evaluate targeting rules for a user
  async evaluateRules(user, rules) {
    try {
      for (const [ruleName, ruleValue] of Object.entries(rules)) {
        const ruleFunction = this.rules[ruleName];
        if (!ruleFunction) {
          logger.warn(`Unknown targeting rule: ${ruleName}`);
          continue;
        }
        
        const result = await ruleFunction(user, ruleValue);
        if (!result) {
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      logger.error('Error evaluating targeting rules:', error);
      return false;
    }
  }

  // Targeting Rules
  
  // Check if user's streak is not safe
  async streakNotSafe(user, value) {
    try {
      if (!value) return true;
      
      const now = new Date();
      const tz = user.streak?.timezone || 'Africa/Johannesburg';
      const todayLocal = this.toLocalDateString(now, tz);
      
      return user.streak?.lastCheckedDateLocal !== todayLocal;
      
    } catch (error) {
      logger.error('Error checking streak not safe:', error);
      return false;
    }
  }

  // Check if time to midnight is less than or equal to minutes
  async timeToMidnightLE(user, minutes) {
    try {
      const now = new Date();
      const tz = user.streak?.timezone || 'Africa/Johannesburg';
      
      // Get next midnight in user's timezone
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      // Convert to user's timezone
      const userMidnight = new Date(tomorrow.toLocaleString('en-US', { timeZone: tz }));
      const timeToMidnight = Math.floor((userMidnight - now) / 1000 / 60); // minutes
      
      return timeToMidnight <= minutes;
      
    } catch (error) {
      logger.error('Error checking time to midnight:', error);
      return false;
    }
  }

  // Check if user is in a battle
  async inBattle(user, value) {
    try {
      if (!value) return true;
      
      // This would need to be implemented based on your battle system
      // For now, return false as we don't have active battle tracking
      return false;
      
    } catch (error) {
      logger.error('Error checking in battle:', error);
      return false;
    }
  }

  // Check if battle time left is less than or equal to minutes
  async battleTimeLeftLE(user, minutes) {
    try {
      // This would need to be implemented based on your battle system
      // For now, return false as we don't have active battle tracking
      return false;
      
    } catch (error) {
      logger.error('Error checking battle time left:', error);
      return false;
    }
  }

  // Check if user has completed a transformation
  async transformCompleted(user, value) {
    try {
      if (!value) return true;
      
      // This would need to be implemented based on your transform system
      // For now, return false as we don't have transform completion tracking
      return false;
      
    } catch (error) {
      logger.error('Error checking transform completed:', error);
      return false;
    }
  }

  // Check if tribe hour is active
  async tribeHourActive(user, value) {
    try {
      if (!value) return true;
      
      // This would need to be implemented based on your tribe system
      // For now, return false as we don't have tribe hour tracking
      return false;
      
    } catch (error) {
      logger.error('Error checking tribe hour active:', error);
      return false;
    }
  }

  // Check if user has climbed leaderboard
  async leaderboardClimb(user, value) {
    try {
      if (!value) return true;
      
      // This would need to be implemented based on your leaderboard system
      // For now, return false as we don't have leaderboard climb tracking
      return false;
      
    } catch (error) {
      logger.error('Error checking leaderboard climb:', error);
      return false;
    }
  }

  // Check if daily login bonus not awarded
  async dailyLoginNotAwarded(user, value) {
    try {
      if (!value) return true;
      
      const now = new Date();
      const tz = user.streak?.timezone || 'Africa/Johannesburg';
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const currentHour = localTime.getHours();
      
      // Check if it's after 18:00 local time and login bonus not awarded
      return currentHour >= 18 && !user.daily?.loginChecked;
      
    } catch (error) {
      logger.error('Error checking daily login not awarded:', error);
      return false;
    }
  }

  // Check if vote count is less than threshold
  async voteCountLT(user, threshold) {
    try {
      if (!threshold) return true;
      
      return (user.daily?.voteCount || 0) < threshold;
      
    } catch (error) {
      logger.error('Error checking vote count:', error);
      return false;
    }
  }

  // Audience Methods
  
  // Get all users
  async getAllUsers() {
    try {
      return await User.find({ isActive: true })
        .select('_id phone username streak daily tribe')
        .lean();
    } catch (error) {
      logger.error('Error getting all users:', error);
      return [];
    }
  }

  // Get active users (logged in within last 7 days)
  async getActiveUsers() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      return await User.find({
        isActive: true,
        lastLoginAt: { $gte: sevenDaysAgo }
      })
        .select('_id phone username streak daily tribe lastLoginAt')
        .lean();
    } catch (error) {
      logger.error('Error getting active users:', error);
      return [];
    }
  }

  // Get inactive users (not logged in for 7+ days)
  async getInactiveUsers() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      return await User.find({
        isActive: true,
        $or: [
          { lastLoginAt: { $lt: sevenDaysAgo } },
          { lastLoginAt: { $exists: false } }
        ]
      })
        .select('_id phone username streak daily tribe lastLoginAt')
        .lean();
    } catch (error) {
      logger.error('Error getting inactive users:', error);
      return [];
    }
  }

  // Get tribe users
  async getTribeUsers(tribeId) {
    try {
      if (!tribeId) return [];
      
      return await User.find({
        isActive: true,
        'tribe.id': tribeId
      })
        .select('_id phone username streak daily tribe')
        .lean();
    } catch (error) {
      logger.error('Error getting tribe users:', error);
      return [];
    }
  }

  // Get custom audience
  async getCustomAudience(criteria) {
    try {
      if (!criteria) return [];
      
      const query = { isActive: true };
      
      // Add custom criteria
      if (criteria.userIds) {
        query._id = { $in: criteria.userIds };
      }
      
      if (criteria.tribes) {
        query['tribe.id'] = { $in: criteria.tribes };
      }
      
      if (criteria.subscription) {
        query['subscription.status'] = criteria.subscription;
      }
      
      return await User.find(query)
        .select('_id phone username streak daily tribe subscription')
        .lean();
    } catch (error) {
      logger.error('Error getting custom audience:', error);
      return [];
    }
  }

  // Utility Methods
  
  // Convert UTC date to local date string
  toLocalDateString(date, timezone) {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
      .toISOString()
      .split('T')[0];
  }

  // Add new targeting rule
  addRule(name, ruleFunction) {
    this.rules[name] = ruleFunction;
  }

  // Get available rules
  getAvailableRules() {
    return Object.keys(this.rules);
  }

  // Validate targeting rules
  validateRules(rules) {
    const availableRules = this.getAvailableRules();
    const invalidRules = [];
    
    for (const ruleName of Object.keys(rules)) {
      if (!availableRules.includes(ruleName)) {
        invalidRules.push(ruleName);
      }
    }
    
    return {
      valid: invalidRules.length === 0,
      invalidRules
    };
  }
}

module.exports = new TargetingEngine();
