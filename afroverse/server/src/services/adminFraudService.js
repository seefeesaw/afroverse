const FraudDetection = require('../models/FraudDetection');
const TrustScore = require('../models/TrustScore');
const DeviceFingerprint = require('../models/DeviceFingerprint');
const AuditLog = require('../models/AuditLog');
const { logger } = require('../utils/logger');

class AdminFraudService {
  constructor() {
    this.fraudTypes = {
      vote_fraud: 'vote_fraud',
      multi_account: 'multi_account',
      nsfw_content: 'nsfw_content',
      spam_battle: 'spam_battle',
      ai_abuse: 'ai_abuse',
      suspicious_activity: 'suspicious_activity'
    };
    
    this.severities = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };
    
    this.actions = {
      none: 'none',
      warning: 'warning',
      shadowban: 'shadowban',
      temporary_ban: 'temporary_ban',
      permanent_ban: 'permanent_ban',
      content_removal: 'content_removal'
    };
  }

  // Get fraud detections
  async getFraudDetections(filters = {}, limit = 100, skip = 0) {
    try {
      const query = { isActive: true };
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.userId) {
        query.userId = filters.userId;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }
      
      const fraudDetections = await FraudDetection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username phone')
        .populate('reviewedBy', 'email name role');
      
      const total = await FraudDetection.countDocuments(query);
      
      return {
        success: true,
        fraudDetections: fraudDetections.map(fd => fd.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting fraud detections:', error);
      throw error;
    }
  }

  // Get fraud detection by ID
  async getFraudDetection(fraudDetectionId) {
    try {
      const fraudDetection = await FraudDetection.findById(fraudDetectionId)
        .populate('userId', 'username phone')
        .populate('reviewedBy', 'email name role');
      
      if (!fraudDetection) {
        throw new Error('Fraud detection not found');
      }
      
      return {
        success: true,
        fraudDetection: fraudDetection.getSummary()
      };
    } catch (error) {
      logger.error('Error getting fraud detection:', error);
      throw error;
    }
  }

  // Review fraud detection
  async reviewFraudDetection(fraudDetectionId, adminUserId, action, notes = null) {
    try {
      const fraudDetection = await FraudDetection.findById(fraudDetectionId);
      
      if (!fraudDetection) {
        throw new Error('Fraud detection not found');
      }
      
      if (fraudDetection.status !== 'pending') {
        throw new Error('Fraud detection is already reviewed');
      }
      
      await fraudDetection.markAsReviewed(adminUserId, action, notes);
      
      // Log review
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'fraud_action',
        { type: 'fraud', id: fraudDetectionId },
        `Fraud detection reviewed: ${action}`,
        null,
        { action, notes },
        'high',
        'fraud',
        ['review', 'fraud', action]
      );
      
      logger.info(`Fraud detection ${fraudDetectionId} reviewed: ${action}`);
      
      return {
        success: true,
        fraudDetection: fraudDetection.getSummary(),
        message: 'Fraud detection reviewed successfully'
      };
    } catch (error) {
      logger.error('Error reviewing fraud detection:', error);
      throw error;
    }
  }

  // Confirm fraud detection
  async confirmFraudDetection(fraudDetectionId, adminUserId, action, notes = null) {
    try {
      const fraudDetection = await FraudDetection.findById(fraudDetectionId);
      
      if (!fraudDetection) {
        throw new Error('Fraud detection not found');
      }
      
      await fraudDetection.markAsConfirmed(adminUserId, action, notes);
      
      // Log confirmation
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'fraud_action',
        { type: 'fraud', id: fraudDetectionId },
        `Fraud detection confirmed: ${action}`,
        null,
        { action, notes },
        'high',
        'fraud',
        ['confirmation', 'fraud', action]
      );
      
      logger.info(`Fraud detection ${fraudDetectionId} confirmed: ${action}`);
      
      return {
        success: true,
        fraudDetection: fraudDetection.getSummary(),
        message: 'Fraud detection confirmed successfully'
      };
    } catch (error) {
      logger.error('Error confirming fraud detection:', error);
      throw error;
    }
  }

  // Mark as false positive
  async markAsFalsePositive(fraudDetectionId, adminUserId, notes = null) {
    try {
      const fraudDetection = await FraudDetection.findById(fraudDetectionId);
      
      if (!fraudDetection) {
        throw new Error('Fraud detection not found');
      }
      
      await fraudDetection.markAsFalsePositive(adminUserId, notes);
      
      // Log false positive
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'fraud_action',
        { type: 'fraud', id: fraudDetectionId },
        'Fraud detection marked as false positive',
        null,
        { notes },
        'medium',
        'fraud',
        ['false_positive', 'fraud']
      );
      
      logger.info(`Fraud detection ${fraudDetectionId} marked as false positive`);
      
      return {
        success: true,
        fraudDetection: fraudDetection.getSummary(),
        message: 'Fraud detection marked as false positive'
      };
    } catch (error) {
      logger.error('Error marking fraud detection as false positive:', error);
      throw error;
    }
  }

  // Get fraud statistics
  async getFraudStatistics(startDate, endDate) {
    try {
      const statistics = await FraudDetection.getFraudDetectionStatistics(startDate, endDate);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting fraud statistics:', error);
      throw error;
    }
  }

  // Get fraud trends
  async getFraudTrends(days = 30) {
    try {
      const trends = await FraudDetection.getFraudDetectionTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting fraud trends:', error);
      throw error;
    }
  }

  // Get fraud performance
  async getFraudPerformance(startDate, endDate) {
    try {
      const performance = await FraudDetection.getFraudDetectionPerformance(startDate, endDate);
      
      return {
        success: true,
        performance
      };
    } catch (error) {
      logger.error('Error getting fraud performance:', error);
      throw error;
    }
  }

  // Get fraud summary
  async getFraudSummary() {
    try {
      const summary = await FraudDetection.getFraudDetectionSummary();
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          pending: 0,
          confirmed: 0,
          falsePositives: 0,
          active: 0
        }
      };
    } catch (error) {
      logger.error('Error getting fraud summary:', error);
      throw error;
    }
  }

  // Get trust scores
  async getTrustScores(filters = {}, limit = 100, skip = 0) {
    try {
      const query = {};
      
      if (filters.level) {
        query.level = filters.level;
      }
      
      if (filters.minScore) {
        query.score = { $gte: filters.minScore };
      }
      
      if (filters.maxScore) {
        query.score = { ...query.score, $lte: filters.maxScore };
      }
      
      if (filters.shadowbanned) {
        query['flags.isShadowBanned'] = filters.shadowbanned;
      }
      
      const trustScores = await TrustScore.find(query)
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username phone');
      
      const total = await TrustScore.countDocuments(query);
      
      return {
        success: true,
        trustScores: trustScores.map(ts => ts.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting trust scores:', error);
      throw error;
    }
  }

  // Get trust score by user
  async getTrustScoreByUser(userId) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
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
  async updateTrustScore(userId, adminUserId, points, reason, action) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
      }
      
      if (points > 0) {
        await trustScore.addPoints(points, reason, action);
      } else {
        await trustScore.subtractPoints(Math.abs(points), reason, action);
      }
      
      // Log trust score update
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'enforcement',
        { type: 'user', id: userId },
        `Trust score updated: ${points} points`,
        { score: trustScore.score - points },
        { score: trustScore.score, points, reason, action },
        'high',
        'user_management',
        ['trust_score', 'update']
      );
      
      logger.info(`Trust score updated for user ${userId}: ${points} points`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary(),
        message: 'Trust score updated successfully'
      };
    } catch (error) {
      logger.error('Error updating trust score:', error);
      throw error;
    }
  }

  // Shadowban user
  async shadowbanUser(userId, adminUserId, reason) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
      }
      
      await trustScore.shadowban(reason);
      
      // Log shadowban
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'enforcement',
        { type: 'user', id: userId },
        `User shadowbanned: ${reason}`,
        { shadowbanned: false },
        { shadowbanned: true, reason },
        'high',
        'user_management',
        ['shadowban', 'enforcement']
      );
      
      logger.info(`User ${userId} shadowbanned: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary(),
        message: 'User shadowbanned successfully'
      };
    } catch (error) {
      logger.error('Error shadowbanning user:', error);
      throw error;
    }
  }

  // Lift shadowban
  async liftShadowban(userId, adminUserId, reason) {
    try {
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        throw new Error('Trust score not found');
      }
      
      await trustScore.liftShadowban(reason);
      
      // Log shadowban lift
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'enforcement',
        { type: 'user', id: userId },
        `Shadowban lifted: ${reason}`,
        { shadowbanned: true },
        { shadowbanned: false, reason },
        'high',
        'user_management',
        ['shadowban_lift', 'enforcement']
      );
      
      logger.info(`Shadowban lifted for user ${userId}: ${reason}`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary(),
        message: 'Shadowban lifted successfully'
      };
    } catch (error) {
      logger.error('Error lifting shadowban:', error);
      throw error;
    }
  }

  // Get device fingerprints
  async getDeviceFingerprints(filters = {}, limit = 100, skip = 0) {
    try {
      const query = {};
      
      if (filters.suspicious) {
        query['flags.isSuspicious'] = filters.suspicious;
      }
      
      if (filters.blocked) {
        query['flags.isBlocked'] = filters.blocked;
      }
      
      if (filters.multiAccount) {
        query['flags.isMultiAccount'] = filters.multiAccount;
      }
      
      if (filters.bot) {
        query['flags.isBot'] = filters.bot;
      }
      
      if (filters.minRiskScore) {
        query.riskScore = { $gte: filters.minRiskScore };
      }
      
      const deviceFingerprints = await DeviceFingerprint.find(query)
        .sort({ riskScore: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userIds', 'username phone');
      
      const total = await DeviceFingerprint.countDocuments(query);
      
      return {
        success: true,
        deviceFingerprints: deviceFingerprints.map(df => df.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting device fingerprints:', error);
      throw error;
    }
  }

  // Get device fingerprint by ID
  async getDeviceFingerprint(deviceFingerprintId) {
    try {
      const deviceFingerprint = await DeviceFingerprint.findById(deviceFingerprintId)
        .populate('userIds', 'username phone');
      
      if (!deviceFingerprint) {
        throw new Error('Device fingerprint not found');
      }
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error getting device fingerprint:', error);
      throw error;
    }
  }

  // Mark device as suspicious
  async markDeviceAsSuspicious(deviceFingerprintId, adminUserId, reason) {
    try {
      const deviceFingerprint = await DeviceFingerprint.findById(deviceFingerprintId);
      
      if (!deviceFingerprint) {
        throw new Error('Device fingerprint not found');
      }
      
      await deviceFingerprint.markAsSuspicious(reason);
      
      // Log device marking
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'fraud_action',
        { type: 'device', id: deviceFingerprintId },
        `Device marked as suspicious: ${reason}`,
        { suspicious: false },
        { suspicious: true, reason },
        'high',
        'fraud',
        ['device_suspicious', 'fraud']
      );
      
      logger.info(`Device ${deviceFingerprintId} marked as suspicious: ${reason}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary(),
        message: 'Device marked as suspicious successfully'
      };
    } catch (error) {
      logger.error('Error marking device as suspicious:', error);
      throw error;
    }
  }

  // Mark device as blocked
  async markDeviceAsBlocked(deviceFingerprintId, adminUserId, reason) {
    try {
      const deviceFingerprint = await DeviceFingerprint.findById(deviceFingerprintId);
      
      if (!deviceFingerprint) {
        throw new Error('Device fingerprint not found');
      }
      
      await deviceFingerprint.markAsBlocked(reason);
      
      // Log device blocking
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'fraud_action',
        { type: 'device', id: deviceFingerprintId },
        `Device blocked: ${reason}`,
        { blocked: false },
        { blocked: true, reason },
        'high',
        'fraud',
        ['device_blocked', 'fraud']
      );
      
      logger.info(`Device ${deviceFingerprintId} blocked: ${reason}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary(),
        message: 'Device blocked successfully'
      };
    } catch (error) {
      logger.error('Error blocking device:', error);
      throw error;
    }
  }

  // Get fraud types
  getFraudTypes() {
    return Object.keys(this.fraudTypes).map(key => ({
      key,
      name: this.fraudTypes[key]
    }));
  }

  // Get fraud severities
  getFraudSeverities() {
    return Object.keys(this.severities).map(key => ({
      key,
      name: this.severities[key]
    }));
  }

  // Get fraud actions
  getFraudActions() {
    return Object.keys(this.actions).map(key => ({
      key,
      name: this.actions[key]
    }));
  }

  // Validate fraud data
  validateFraudData(data) {
    const errors = [];
    
    if (!data.fraudDetectionId) {
      errors.push('Fraud detection ID is required');
    }
    
    if (!data.action) {
      errors.push('Action is required');
    } else if (!this.actions[data.action]) {
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
      'FRAUD_DETECTION_NOT_FOUND': 'Fraud detection not found',
      'FRAUD_DETECTION_ALREADY_REVIEWED': 'Fraud detection is already reviewed',
      'TRUST_SCORE_NOT_FOUND': 'Trust score not found',
      'DEVICE_FINGERPRINT_NOT_FOUND': 'Device fingerprint not found',
      'INVALID_ACTION': 'Invalid action',
      'INVALID_POINTS': 'Invalid points value',
      'USER_NOT_FOUND': 'User not found'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'fraud_reviewed': 'Fraud detection reviewed successfully',
      'fraud_confirmed': 'Fraud detection confirmed successfully',
      'fraud_false_positive': 'Fraud detection marked as false positive',
      'trust_score_updated': 'Trust score updated successfully',
      'user_shadowbanned': 'User shadowbanned successfully',
      'shadowban_lifted': 'Shadowban lifted successfully',
      'device_suspicious': 'Device marked as suspicious successfully',
      'device_blocked': 'Device blocked successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminFraudService = new AdminFraudService();

module.exports = adminFraudService;
