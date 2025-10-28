const FraudDetection = require('../models/FraudDetection');
const TrustScore = require('../models/TrustScore');
const ModerationLog = require('../models/ModerationLog');
const DeviceFingerprint = require('../models/DeviceFingerprint');
const { logger } = require('../utils/logger');

class FraudDetectionService {
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

  // Detect vote fraud
  async detectVoteFraud(userId, battleId, deviceId, ipAddress, geoData = {}) {
    try {
      // Check if user already voted on this battle
      const existingVote = await this.checkExistingVote(userId, battleId);
      if (existingVote) {
        await this.createFraudDetection(
          userId,
          'vote_fraud',
          'high',
          'User attempted to vote multiple times on same battle',
          { battleId, deviceId, ipAddress },
          { deviceId, ipAddress, geoLocation: geoData }
        );
        return { isFraud: true, reason: 'Multiple votes on same battle' };
      }
      
      // Check device fingerprint for suspicious activity
      const deviceFraud = await this.checkDeviceFraud(deviceId, userId);
      if (deviceFraud.isFraud) {
        await this.createFraudDetection(
          userId,
          'vote_fraud',
          deviceFraud.severity,
          deviceFraud.reason,
          { battleId, deviceId, ipAddress },
          { deviceId, ipAddress, geoLocation: geoData }
        );
        return { isFraud: true, reason: deviceFraud.reason };
      }
      
      // Check IP address for suspicious activity
      const ipFraud = await this.checkIPFraud(ipAddress, userId);
      if (ipFraud.isFraud) {
        await this.createFraudDetection(
          userId,
          'vote_fraud',
          ipFraud.severity,
          ipFraud.reason,
          { battleId, deviceId, ipAddress },
          { deviceId, ipAddress, geoLocation: geoData }
        );
        return { isFraud: true, reason: ipFraud.reason };
      }
      
      // Check user trust score
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      if (trustScore && trustScore.flags.canVote === false) {
        return { isFraud: true, reason: 'User is shadowbanned' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting vote fraud:', error);
      throw error;
    }
  }

  // Detect multi-account abuse
  async detectMultiAccount(userId, deviceId, ipAddress, geoData = {}) {
    try {
      // Check device fingerprint
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(deviceId);
      
      if (deviceFingerprint) {
        // Check if device has multiple users
        if (deviceFingerprint.userIds.length > 1) {
          await this.createFraudDetection(
            userId,
            'multi_account',
            'high',
            'Device used by multiple accounts',
            { deviceId, ipAddress, otherUsers: deviceFingerprint.userIds },
            { deviceId, ipAddress, geoLocation: geoData }
          );
          
          // Update trust scores for all users
          for (const otherUserId of deviceFingerprint.userIds) {
            if (otherUserId.toString() !== userId.toString()) {
              await this.updateTrustScore(otherUserId, -20, 'Multi-account device detected', 'multi_account');
            }
          }
          
          return { isFraud: true, reason: 'Device used by multiple accounts' };
        }
      }
      
      // Check IP address for multiple accounts
      const ipAccounts = await this.getAccountsByIP(ipAddress);
      if (ipAccounts.length > 5) {
        await this.createFraudDetection(
          userId,
          'multi_account',
          'medium',
          'IP address used by multiple accounts',
          { deviceId, ipAddress, accountCount: ipAccounts.length },
          { deviceId, ipAddress, geoLocation: geoData }
        );
        
        return { isFraud: true, reason: 'IP address used by multiple accounts' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting multi-account abuse:', error);
      throw error;
    }
  }

  // Detect NSFW content
  async detectNSFWContent(userId, imageUrl, contentType, contentId) {
    try {
      // This would integrate with AI moderation service
      const nsfwResult = await this.checkNSFWContent(imageUrl);
      
      if (nsfwResult.isNSFW) {
        await this.createFraudDetection(
          userId,
          'nsfw_content',
          nsfwResult.severity,
          `NSFW content detected: ${nsfwResult.description}`,
          { imageUrl, contentType, contentId, confidence: nsfwResult.confidence },
          { detectionMethod: 'ai_automatic' }
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -70, 'NSFW content detected', 'nsfw_content');
        
        return { isFraud: true, reason: 'NSFW content detected' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting NSFW content:', error);
      throw error;
    }
  }

  // Detect spam battles
  async detectSpamBattle(userId, battleData) {
    try {
      // Check if user has created too many battles recently
      const recentBattles = await this.getRecentBattlesByUser(userId, 24); // 24 hours
      if (recentBattles.length > 5) {
        await this.createFraudDetection(
          userId,
          'spam_battle',
          'medium',
          'User created too many battles in short time',
          { battleCount: recentBattles.length, battleData },
          { detectionMethod: 'ai_automatic' }
        );
        
        return { isFraud: true, reason: 'Too many battles created recently' };
      }
      
      // Check for self-battle
      if (battleData.challengerId === battleData.defenderId) {
        await this.createFraudDetection(
          userId,
          'spam_battle',
          'high',
          'User attempted to create self-battle',
          { battleData },
          { detectionMethod: 'ai_automatic' }
        );
        
        return { isFraud: true, reason: 'Self-battle not allowed' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting spam battle:', error);
      throw error;
    }
  }

  // Detect AI abuse
  async detectAIAbuse(userId, prompt, style, imageUrl) {
    try {
      // Check for harmful prompts
      const harmfulPrompt = await this.checkHarmfulPrompt(prompt);
      if (harmfulPrompt.isHarmful) {
        await this.createFraudDetection(
          userId,
          'ai_abuse',
          harmfulPrompt.severity,
          `Harmful prompt detected: ${harmfulPrompt.description}`,
          { prompt, style, imageUrl },
          { detectionMethod: 'ai_automatic' }
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -50, 'Harmful AI prompt detected', 'ai_abuse');
        
        return { isFraud: true, reason: 'Harmful prompt detected' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting AI abuse:', error);
      throw error;
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(userId, activityType, metadata = {}) {
    try {
      // Check for rapid-fire actions
      const rapidActions = await this.checkRapidActions(userId, activityType);
      if (rapidActions.isSuspicious) {
        await this.createFraudDetection(
          userId,
          'suspicious_activity',
          rapidActions.severity,
          `Rapid ${activityType} actions detected`,
          { activityType, metadata, actionCount: rapidActions.count },
          { detectionMethod: 'ai_automatic' }
        );
        
        return { isFraud: true, reason: 'Rapid actions detected' };
      }
      
      // Check for unusual patterns
      const unusualPattern = await this.checkUnusualPatterns(userId, activityType);
      if (unusualPattern.isSuspicious) {
        await this.createFraudDetection(
          userId,
          'suspicious_activity',
          unusualPattern.severity,
          `Unusual ${activityType} pattern detected`,
          { activityType, metadata, pattern: unusualPattern.description },
          { detectionMethod: 'ai_automatic' }
        );
        
        return { isFraud: true, reason: 'Unusual activity pattern detected' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error detecting suspicious activity:', error);
      throw error;
    }
  }

  // Create fraud detection record
  async createFraudDetection(userId, type, severity, description, evidence = {}, metadata = {}) {
    try {
      const fraudDetection = await FraudDetection.createFraudDetection(
        userId, type, severity, description, evidence, metadata
      );
      
      logger.info(`Fraud detection created for user ${userId}: ${type} - ${severity}`);
      
      return {
        success: true,
        fraudDetection
      };
    } catch (error) {
      logger.error('Error creating fraud detection:', error);
      throw error;
    }
  }

  // Update trust score
  async updateTrustScore(userId, points, reason, action) {
    try {
      let trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      if (!trustScore) {
        trustScore = await TrustScore.createTrustScore(userId);
      }
      
      if (points > 0) {
        await trustScore.addPoints(points, reason, action);
      } else {
        await trustScore.subtractPoints(Math.abs(points), reason, action);
      }
      
      logger.info(`Trust score updated for user ${userId}: ${points} points`);
      
      return {
        success: true,
        trustScore: trustScore.getSummary()
      };
    } catch (error) {
      logger.error('Error updating trust score:', error);
      throw error;
    }
  }

  // Check existing vote
  async checkExistingVote(userId, battleId) {
    try {
      // This would check the votes collection
      // For now, we'll return false
      return false;
    } catch (error) {
      logger.error('Error checking existing vote:', error);
      throw error;
    }
  }

  // Check device fraud
  async checkDeviceFraud(deviceId, userId) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(deviceId);
      
      if (deviceFingerprint) {
        if (deviceFingerprint.flags.isBlocked) {
          return { isFraud: true, severity: 'critical', reason: 'Device is blocked' };
        }
        
        if (deviceFingerprint.flags.isBot) {
          return { isFraud: true, severity: 'high', reason: 'Device identified as bot' };
        }
        
        if (deviceFingerprint.flags.isSuspicious) {
          return { isFraud: true, severity: 'medium', reason: 'Device shows suspicious behavior' };
        }
        
        if (deviceFingerprint.riskScore > 70) {
          return { isFraud: true, severity: 'medium', reason: 'Device has high risk score' };
        }
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error checking device fraud:', error);
      throw error;
    }
  }

  // Check IP fraud
  async checkIPFraud(ipAddress, userId) {
    try {
      // Check for multiple accounts from same IP
      const accountsByIP = await this.getAccountsByIP(ipAddress);
      
      if (accountsByIP.length > 10) {
        return { isFraud: true, severity: 'high', reason: 'IP address used by too many accounts' };
      }
      
      // Check for rapid requests from same IP
      const rapidRequests = await this.checkRapidRequests(ipAddress);
      if (rapidRequests.isSuspicious) {
        return { isFraud: true, severity: 'medium', reason: 'Rapid requests from IP address' };
      }
      
      return { isFraud: false };
    } catch (error) {
      logger.error('Error checking IP fraud:', error);
      throw error;
    }
  }

  // Check NSFW content
  async checkNSFWContent(imageUrl) {
    try {
      // This would integrate with AI moderation service
      // For now, we'll return a mock result
      return {
        isNSFW: false,
        confidence: 0,
        description: 'No NSFW content detected'
      };
    } catch (error) {
      logger.error('Error checking NSFW content:', error);
      throw error;
    }
  }

  // Check harmful prompt
  async checkHarmfulPrompt(prompt) {
    try {
      const harmfulKeywords = [
        'nude', 'naked', 'sex', 'porn', 'explicit',
        'violence', 'blood', 'gore', 'death',
        'hate', 'racist', 'discrimination'
      ];
      
      const lowerPrompt = prompt.toLowerCase();
      const foundKeywords = harmfulKeywords.filter(keyword => lowerPrompt.includes(keyword));
      
      if (foundKeywords.length > 0) {
        return {
          isHarmful: true,
          severity: 'high',
          description: `Harmful keywords detected: ${foundKeywords.join(', ')}`
        };
      }
      
      return { isHarmful: false };
    } catch (error) {
      logger.error('Error checking harmful prompt:', error);
      throw error;
    }
  }

  // Check rapid actions
  async checkRapidActions(userId, activityType) {
    try {
      // This would check recent activity
      // For now, we'll return false
      return { isSuspicious: false };
    } catch (error) {
      logger.error('Error checking rapid actions:', error);
      throw error;
    }
  }

  // Check unusual patterns
  async checkUnusualPatterns(userId, activityType) {
    try {
      // This would check for unusual patterns
      // For now, we'll return false
      return { isSuspicious: false };
    } catch (error) {
      logger.error('Error checking unusual patterns:', error);
      throw error;
    }
  }

  // Get accounts by IP
  async getAccountsByIP(ipAddress) {
    try {
      // This would query the database for accounts using the same IP
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      logger.error('Error getting accounts by IP:', error);
      throw error;
    }
  }

  // Check rapid requests
  async checkRapidRequests(ipAddress) {
    try {
      // This would check for rapid requests from the same IP
      // For now, we'll return false
      return { isSuspicious: false };
    } catch (error) {
      logger.error('Error checking rapid requests:', error);
      throw error;
    }
  }

  // Get recent battles by user
  async getRecentBattlesByUser(userId, hours) {
    try {
      // This would query the database for recent battles
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      logger.error('Error getting recent battles by user:', error);
      throw error;
    }
  }

  // Get fraud detections by user
  async getFraudDetectionsByUser(userId, limit = 50) {
    try {
      const fraudDetections = await FraudDetection.getFraudDetectionsByUser(userId, limit);
      
      return {
        success: true,
        fraudDetections: fraudDetections.map(fd => fd.getSummary())
      };
    } catch (error) {
      logger.error('Error getting fraud detections by user:', error);
      throw error;
    }
  }

  // Get pending fraud detections
  async getPendingFraudDetections(limit = 100) {
    try {
      const fraudDetections = await FraudDetection.getPendingFraudDetections(limit);
      
      return {
        success: true,
        fraudDetections: fraudDetections.map(fd => fd.getSummary())
      };
    } catch (error) {
      logger.error('Error getting pending fraud detections:', error);
      throw error;
    }
  }

  // Get fraud detection statistics
  async getFraudDetectionStatistics(startDate, endDate) {
    try {
      const statistics = await FraudDetection.getFraudDetectionStatistics(startDate, endDate);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting fraud detection statistics:', error);
      throw error;
    }
  }

  // Get fraud detection trends
  async getFraudDetectionTrends(days = 30) {
    try {
      const trends = await FraudDetection.getFraudDetectionTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting fraud detection trends:', error);
      throw error;
    }
  }

  // Get fraud detection performance
  async getFraudDetectionPerformance(startDate, endDate) {
    try {
      const performance = await FraudDetection.getFraudDetectionPerformance(startDate, endDate);
      
      return {
        success: true,
        performance
      };
    } catch (error) {
      logger.error('Error getting fraud detection performance:', error);
      throw error;
    }
  }

  // Get fraud detection types
  getFraudDetectionTypes() {
    return Object.keys(this.fraudTypes).map(key => ({
      key,
      name: this.fraudTypes[key]
    }));
  }

  // Get fraud detection severities
  getFraudDetectionSeverities() {
    return Object.keys(this.severities).map(key => ({
      key,
      name: this.severities[key]
    }));
  }

  // Get fraud detection actions
  getFraudDetectionActions() {
    return Object.keys(this.actions).map(key => ({
      key,
      name: this.actions[key]
    }));
  }

  // Validate fraud detection data
  validateFraudDetectionData(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.type || !this.fraudTypes[data.type]) {
      errors.push('Valid fraud type is required');
    }
    
    if (!data.severity || !this.severities[data.severity]) {
      errors.push('Valid severity is required');
    }
    
    if (!data.description) {
      errors.push('Description is required');
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
      'UNAUTHORIZED': 'Unauthorized access',
      'INVALID_FRAUD_TYPE': 'Invalid fraud type',
      'INVALID_SEVERITY': 'Invalid severity',
      'INVALID_ACTION': 'Invalid action',
      'TRUST_SCORE_NOT_FOUND': 'Trust score not found',
      'DEVICE_FINGERPRINT_NOT_FOUND': 'Device fingerprint not found',
      'MODERATION_LOG_NOT_FOUND': 'Moderation log not found'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'fraud_detection_created': 'Fraud detection created successfully',
      'fraud_detection_updated': 'Fraud detection updated successfully',
      'fraud_detection_reviewed': 'Fraud detection reviewed successfully',
      'trust_score_updated': 'Trust score updated successfully',
      'device_fingerprint_created': 'Device fingerprint created successfully',
      'moderation_log_created': 'Moderation log created successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const fraudDetectionService = new FraudDetectionService();

module.exports = fraudDetectionService;
