const TrustScore = require('../models/TrustScore');
const FraudDetection = require('../models/FraudDetection');
const { logger } = require('../utils/logger');

class TrustScoreService {
  constructor() {
    this.levels = {
      trusted: 'trusted',
      normal: 'normal',
      suspicious: 'suspicious',
      banned: 'banned'
    };
    
    this.actions = {
      daily_activity: 'daily_activity',
      challenge_accepted: 'challenge_accepted',
      transformation_created: 'transformation_created',
      battle_won: 'battle_won',
      tribe_joined: 'tribe_joined',
      referral_successful: 'referral_successful',
      violation_nsfw: 'violation_nsfw',
      violation_vote_fraud: 'violation_vote_fraud',
      violation_multi_account: 'violation_multi_account',
      violation_spam: 'violation_spam'
    };
  }

  // Create trust score for user
  async createTrustScore(userId, initialScore = 50) {
    try {
      const trustScore = await TrustScore.createTrustScore(userId, initialScore);
      
      logger.info(`Trust score created for user ${userId}: ${initialScore}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error creating trust score:', error);
      throw error;
    }
  }

  // Get trust score by user
  async getTrustScoreByUser(userId) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        // Create default trust score if none exists
        return await this.createTrustScore(userId);
      }
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error getting trust score by user:', error);
      throw error;
    }
  }

  // Update trust score
  async updateTrustScore(userId, points, reason, action, metadata = {}) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      if (points > 0) {
        await trustScore.addPoints(points, reason, action, metadata);
      } else {
        await trustScore.subtractPoints(Math.abs(points), reason, action, metadata);
      }
      
      logger.info(`Trust score updated for user ${userId}: ${points} points (${reason})`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error updating trust score:', error);
      throw error;
    }
  }

  // Add violation
  async addViolation(userId, type, severity, description, points) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      await trustScore.addViolation(type, severity, description, points);
      
      logger.info(`Violation added for user ${userId}: ${type} - ${severity}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error adding violation:', error);
      throw error;
    }
  }

  // Shadowban user
  async shadowbanUser(userId, reason) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      await trustScore.shadowban(reason);
      
      logger.info(`User ${userId} shadowbanned: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error shadowbanning user:', error);
      throw error;
    }
  }

  // Lift shadowban
  async liftShadowban(userId, reason) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
      }
      
      await trustScore.liftShadowban(reason);
      
      logger.info(`Shadowban lifted for user ${userId}: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error lifting shadowban:', error);
      throw error;
    }
  }

  // Temporarily ban user
  async temporaryBanUser(userId, duration, reason) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      await trustScore.temporaryBan(duration, reason);
      
      logger.info(`User ${userId} temporarily banned for ${duration}ms: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error temporarily banning user:', error);
      throw error;
    }
  }

  // Lift temporary ban
  async liftTemporaryBan(userId, reason) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
      }
      
      await trustScore.liftTemporaryBan(reason);
      
      logger.info(`Temporary ban lifted for user ${userId}: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error lifting temporary ban:', error);
      throw error;
    }
  }

  // Permanently ban user
  async permanentBanUser(userId, reason) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      await trustScore.permanentBan(reason);
      
      logger.info(`User ${userId} permanently banned: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error permanently banning user:', error);
      throw error;
    }
  }

  // Apply daily decay
  async applyDailyDecay(userId) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        return { success: true, message: 'No trust score found' };
      }
      
      await trustScore.applyDailyDecay();
      
      logger.info(`Daily decay applied for user ${userId}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error applying daily decay:', error);
      throw error;
    }
  }

  // Get low trust users
  async getLowTrustUsers(threshold = 30, limit = 100) {
    try {
      const users = await TrustScore.getLowTrustUsers(threshold, limit);
      
      return {
        success: true,
        users: users.map(user => user.getSummary())
      };
    } catch (error) {
      logger.error('Error getting low trust users:', error);
      throw error;
    }
  }

  // Get shadowbanned users
  async getShadowbannedUsers(limit = 100) {
    try {
      const users = await TrustScore.getShadowbannedUsers(limit);
      
      return {
        success: true,
        users: users.map(user => user.getSummary())
      };
    } catch (error) {
      logger.error('Error getting shadowbanned users:', error);
      throw error;
    }
  }

  // Get trust score statistics
  async getTrustScoreStatistics() {
    try {
      const statistics = await TrustScore.getTrustScoreStatistics();
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting trust score statistics:', error);
      throw error;
    }
  }

  // Get trust score trends
  async getTrustScoreTrends(days = 30) {
    try {
      const trends = await TrustScore.getTrustScoreTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting trust score trends:', error);
      throw error;
    }
  }

  // Get trust score summary
  async getTrustScoreSummary() {
    try {
      const summary = await TrustScore.getTrustScoreSummary();
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          trusted: 0,
          normal: 0,
          suspicious: 0,
          banned: 0,
          shadowbanned: 0,
          avgScore: 0
        }
      };
    } catch (error) {
      logger.error('Error getting trust score summary:', error);
      throw error;
    }
  }

  // Check user permissions
  async checkUserPermissions(userId, permission) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        return { allowed: true, reason: 'No trust score found' };
      }
      
      const flags = trustScore.flags;
      
      switch (permission) {
        case 'vote':
          return { allowed: flags.canVote, reason: flags.canVote ? 'Allowed' : 'User is shadowbanned' };
        case 'create_battle':
          return { allowed: flags.canCreateBattles, reason: flags.canCreateBattles ? 'Allowed' : 'User cannot create battles' };
        case 'transform':
          return { allowed: flags.canTransform, reason: flags.canTransform ? 'Allowed' : 'User cannot create transformations' };
        case 'join_tribe':
          return { allowed: flags.canJoinTribe, reason: flags.canJoinTribe ? 'Allowed' : 'User cannot join tribes' };
        default:
          return { allowed: true, reason: 'Unknown permission' };
      }
    } catch (error) {
      logger.error('Error checking user permissions:', error);
      throw error;
    }
  }

  // Get user trust level
  async getUserTrustLevel(userId) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        return { level: 'normal', score: 50 };
      }
      
      return {
        level: trustScore.level,
        score: trustScore.score
      };
    } catch (error) {
      logger.error('Error getting user trust level:', error);
      throw error;
    }
  }

  // Get recent history
  async getRecentHistory(userId, limit = 10) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        return { success: true, history: [] };
      }
      
      const history = trustScore.getRecentHistory(limit);
      
      return {
        success: true,
        history
      };
    } catch (error) {
      logger.error('Error getting recent history:', error);
      throw error;
    }
  }

  // Get recent violations
  async getRecentViolations(userId, limit = 10) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        return { success: true, violations: [] };
      }
      
      const violations = trustScore.getRecentViolations(limit);
      
      return {
        success: true,
        violations
      };
    } catch (error) {
      logger.error('Error getting recent violations:', error);
      throw error;
    }
  }

  // Get trust score levels
  getTrustScoreLevels() {
    return Object.keys(this.levels).map(key => ({
      key,
      name: this.levels[key]
    }));
  }

  // Get trust score actions
  getTrustScoreActions() {
    return Object.keys(this.actions).map(key => ({
      key,
      name: this.actions[key]
    }));
  }

  // Get trust score thresholds
  getTrustScoreThresholds() {
    return {
      trusted: { min: 80, max: 100 },
      normal: { min: 50, max: 79 },
      suspicious: { min: 20, max: 49 },
      banned: { min: 0, max: 19 }
    };
  }

  // Validate trust score data
  validateTrustScoreData(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (data.points !== undefined && (typeof data.points !== 'number' || data.points < -100 || data.points > 100)) {
      errors.push('Points must be a number between -100 and 100');
    }
    
    if (!data.reason) {
      errors.push('Reason is required');
    }
    
    if (!data.action || !this.actions[data.action]) {
      errors.push('Valid action is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'TRUST_SCORE_NOT_FOUND': 'Trust score not found',
      'UNAUTHORIZED': 'Unauthorized access',
      'INVALID_POINTS': 'Invalid points value',
      'INVALID_ACTION': 'Invalid action',
      'INVALID_REASON': 'Invalid reason',
      'USER_ALREADY_BANNED': 'User is already banned',
      'USER_NOT_BANNED': 'User is not banned',
      'INVALID_DURATION': 'Invalid ban duration'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'trust_score_created': 'Trust score created successfully',
      'trust_score_updated': 'Trust score updated successfully',
      'violation_added': 'Violation added successfully',
      'user_shadowbanned': 'User shadowbanned successfully',
      'shadowban_lifted': 'Shadowban lifted successfully',
      'user_temporarily_banned': 'User temporarily banned successfully',
      'temporary_ban_lifted': 'Temporary ban lifted successfully',
      'user_permanently_banned': 'User permanently banned successfully',
      'daily_decay_applied': 'Daily decay applied successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const trustScoreService = new TrustScoreService();

module.exports = trustScoreService;
