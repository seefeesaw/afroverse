const ModerationLog = require('../models/ModerationLog');
const TrustScore = require('../models/TrustScore');
const { logger } = require('../utils/logger');

class AIModerationService {
  constructor() {
    this.violationTypes = {
      NSFW: 'NSFW',
      HATE: 'HATE',
      VIOLENCE: 'VIOLENCE',
      NO_FACE: 'NO_FACE',
      SPAM: 'SPAM',
      COPYRIGHT: 'COPYRIGHT',
      HARASSMENT: 'HARASSMENT',
      IMPERSONATION: 'IMPERSONATION',
      OTHER: 'OTHER'
    };
    
    this.severities = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };
    
    this.detectionMethods = {
      ai_automatic: 'ai_automatic',
      human_review: 'human_review',
      user_report: 'user_report',
      admin_review: 'admin_review'
    };
    
    this.actions = {
      none: 'none',
      warning: 'warning',
      content_removal: 'content_removal',
      user_warning: 'user_warning',
      temporary_ban: 'temporary_ban',
      permanent_ban: 'permanent_ban'
    };
  }

  // Moderate image content
  async moderateImage(userId, imageUrl, contentType, contentId) {
    try {
      // Check for face detection
      const faceResult = await this.checkFaceDetection(imageUrl);
      if (!faceResult.hasFace) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'NO_FACE',
          'medium',
          'No face detected in image',
          'ai_automatic',
          faceResult.confidence
        );
        
        return { isViolation: true, reason: 'No face detected in image' };
      }
      
      // Check for NSFW content
      const nsfwResult = await this.checkNSFWContent(imageUrl);
      if (nsfwResult.isNSFW) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'NSFW',
          nsfwResult.severity,
          `NSFW content detected: ${nsfwResult.description}`,
          'ai_automatic',
          nsfwResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -70, 'NSFW content detected', 'violation_nsfw');
        
        return { isViolation: true, reason: 'NSFW content detected' };
      }
      
      // Check for violence
      const violenceResult = await this.checkViolenceContent(imageUrl);
      if (violenceResult.isViolent) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'VIOLENCE',
          violenceResult.severity,
          `Violent content detected: ${violenceResult.description}`,
          'ai_automatic',
          violenceResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -60, 'Violent content detected', 'violation_violence');
        
        return { isViolation: true, reason: 'Violent content detected' };
      }
      
      // Check for hate symbols
      const hateResult = await this.checkHateContent(imageUrl);
      if (hateResult.isHateful) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'HATE',
          hateResult.severity,
          `Hate content detected: ${hateResult.description}`,
          'ai_automatic',
          hateResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -80, 'Hate content detected', 'violation_hate');
        
        return { isViolation: true, reason: 'Hate content detected' };
      }
      
      return { isViolation: false };
    } catch (error) {
      logger.error('Error moderating image:', error);
      throw error;
    }
  }

  // Moderate text content
  async moderateText(userId, text, contentType, contentId) {
    try {
      // Check for hate speech
      const hateResult = await this.checkHateSpeech(text);
      if (hateResult.isHateful) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'HATE',
          hateResult.severity,
          `Hate speech detected: ${hateResult.description}`,
          'ai_automatic',
          hateResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -50, 'Hate speech detected', 'violation_hate');
        
        return { isViolation: true, reason: 'Hate speech detected' };
      }
      
      // Check for harassment
      const harassmentResult = await this.checkHarassment(text);
      if (harassmentResult.isHarassment) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'HARASSMENT',
          harassmentResult.severity,
          `Harassment detected: ${harassmentResult.description}`,
          'ai_automatic',
          harassmentResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -40, 'Harassment detected', 'violation_harassment');
        
        return { isViolation: true, reason: 'Harassment detected' };
      }
      
      // Check for spam
      const spamResult = await this.checkSpam(text);
      if (spamResult.isSpam) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'SPAM',
          spamResult.severity,
          `Spam detected: ${spamResult.description}`,
          'ai_automatic',
          spamResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -30, 'Spam detected', 'violation_spam');
        
        return { isViolation: true, reason: 'Spam detected' };
      }
      
      return { isViolation: false };
    } catch (error) {
      logger.error('Error moderating text:', error);
      throw error;
    }
  }

  // Moderate transformation prompt
  async moderatePrompt(userId, prompt, contentType, contentId) {
    try {
      // Check for harmful prompts
      const harmfulResult = await this.checkHarmfulPrompt(prompt);
      if (harmfulResult.isHarmful) {
        await this.createModerationLog(
          userId,
          contentType,
          contentId,
          'OTHER',
          harmfulResult.severity,
          `Harmful prompt detected: ${harmfulResult.description}`,
          'ai_automatic',
          harmfulResult.confidence
        );
        
        // Update trust score
        await this.updateTrustScore(userId, -50, 'Harmful prompt detected', 'violation_ai_abuse');
        
        return { isViolation: true, reason: 'Harmful prompt detected' };
      }
      
      return { isViolation: false };
    } catch (error) {
      logger.error('Error moderating prompt:', error);
      throw error;
    }
  }

  // Check face detection
  async checkFaceDetection(imageUrl) {
    try {
      // This would integrate with face detection API
      // For now, we'll return a mock result
      return {
        hasFace: true,
        confidence: 95,
        faceCount: 1
      };
    } catch (error) {
      logger.error('Error checking face detection:', error);
      throw error;
    }
  }

  // Check NSFW content
  async checkNSFWContent(imageUrl) {
    try {
      // This would integrate with NSFW detection API
      // For now, we'll return a mock result
      return {
        isNSFW: false,
        confidence: 0,
        description: 'No NSFW content detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking NSFW content:', error);
      throw error;
    }
  }

  // Check violence content
  async checkViolenceContent(imageUrl) {
    try {
      // This would integrate with violence detection API
      // For now, we'll return a mock result
      return {
        isViolent: false,
        confidence: 0,
        description: 'No violent content detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking violence content:', error);
      throw error;
    }
  }

  // Check hate content
  async checkHateContent(imageUrl) {
    try {
      // This would integrate with hate symbol detection API
      // For now, we'll return a mock result
      return {
        isHateful: false,
        confidence: 0,
        description: 'No hate content detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking hate content:', error);
      throw error;
    }
  }

  // Check hate speech
  async checkHateSpeech(text) {
    try {
      const hateKeywords = [
        'hate', 'racist', 'discrimination', 'prejudice',
        'bigot', 'intolerant', 'offensive', 'derogatory'
      ];
      
      const lowerText = text.toLowerCase();
      const foundKeywords = hateKeywords.filter(keyword => lowerText.includes(keyword));
      
      if (foundKeywords.length > 0) {
        return {
          isHateful: true,
          confidence: 80,
          description: `Hate keywords detected: ${foundKeywords.join(', ')}`,
          severity: 'high'
        };
      }
      
      return {
        isHateful: false,
        confidence: 0,
        description: 'No hate speech detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking hate speech:', error);
      throw error;
    }
  }

  // Check harassment
  async checkHarassment(text) {
    try {
      const harassmentKeywords = [
        'harass', 'bully', 'threaten', 'intimidate',
        'stalk', 'abuse', 'torment', 'persecute'
      ];
      
      const lowerText = text.toLowerCase();
      const foundKeywords = harassmentKeywords.filter(keyword => lowerText.includes(keyword));
      
      if (foundKeywords.length > 0) {
        return {
          isHarassment: true,
          confidence: 75,
          description: `Harassment keywords detected: ${foundKeywords.join(', ')}`,
          severity: 'medium'
        };
      }
      
      return {
        isHarassment: false,
        confidence: 0,
        description: 'No harassment detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking harassment:', error);
      throw error;
    }
  }

  // Check spam
  async checkSpam(text) {
    try {
      const spamKeywords = [
        'spam', 'scam', 'fake', 'click here',
        'free money', 'win now', 'urgent'
      ];
      
      const lowerText = text.toLowerCase();
      const foundKeywords = spamKeywords.filter(keyword => lowerText.includes(keyword));
      
      if (foundKeywords.length > 0) {
        return {
          isSpam: true,
          confidence: 70,
          description: `Spam keywords detected: ${foundKeywords.join(', ')}`,
          severity: 'medium'
        };
      }
      
      return {
        isSpam: false,
        confidence: 0,
        description: 'No spam detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking spam:', error);
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
          confidence: 85,
          description: `Harmful keywords detected: ${foundKeywords.join(', ')}`,
          severity: 'high'
        };
      }
      
      return {
        isHarmful: false,
        confidence: 0,
        description: 'No harmful content detected',
        severity: 'low'
      };
    } catch (error) {
      logger.error('Error checking harmful prompt:', error);
      throw error;
    }
  }

  // Create moderation log
  async createModerationLog(userId, contentType, contentId, violationType, severity, description, detectionMethod, confidence = null, metadata = {}) {
    try {
      const moderationLog = await ModerationLog.createModerationLog(
        userId, contentType, contentId, violationType, severity, description, detectionMethod, confidence, metadata
      );
      
      logger.info(`Moderation log created for user ${userId}: ${violationType} - ${severity}`);
      
      return {
        success: true,
        moderationLog
      };
    } catch (error) {
      logger.error('Error creating moderation log:', error);
      throw error;
    }
  }

  // Update trust score
  async updateTrustScore(userId, points, reason, action) {
    try {
      const TrustScoreService = require('./trustScoreService');
      const trustScoreService = new TrustScoreService();
      
      return await trustScoreService.updateTrustScore(userId, points, reason, action);
    } catch (error) {
      logger.error('Error updating trust score:', error);
      throw error;
    }
  }

  // Get moderation logs by user
  async getModerationLogsByUser(userId, limit = 50) {
    try {
      const moderationLogs = await ModerationLog.getModerationLogsByUser(userId, limit);
      
      return {
        success: true,
        moderationLogs: moderationLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting moderation logs by user:', error);
      throw error;
    }
  }

  // Get pending moderation logs
  async getPendingModerationLogs(limit = 100) {
    try {
      const moderationLogs = await ModerationLog.getPendingModerationLogs(limit);
      
      return {
        success: true,
        moderationLogs: moderationLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting pending moderation logs:', error);
      throw error;
    }
  }

  // Get moderation statistics
  async getModerationStatistics(startDate, endDate) {
    try {
      const statistics = await ModerationLog.getModerationStatistics(startDate, endDate);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting moderation statistics:', error);
      throw error;
    }
  }

  // Get moderation trends
  async getModerationTrends(days = 30) {
    try {
      const trends = await ModerationLog.getModerationTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting moderation trends:', error);
      throw error;
    }
  }

  // Get moderation performance
  async getModerationPerformance(startDate, endDate) {
    try {
      const performance = await ModerationLog.getModerationPerformance(startDate, endDate);
      
      return {
        success: true,
        performance
      };
    } catch (error) {
      logger.error('Error getting moderation performance:', error);
      throw error;
    }
  }

  // Get violation types
  getViolationTypes() {
    return Object.keys(this.violationTypes).map(key => ({
      key,
      name: this.violationTypes[key]
    }));
  }

  // Get severities
  getSeverities() {
    return Object.keys(this.severities).map(key => ({
      key,
      name: this.severities[key]
    }));
  }

  // Get detection methods
  getDetectionMethods() {
    return Object.keys(this.detectionMethods).map(key => ({
      key,
      name: this.detectionMethods[key]
    }));
  }

  // Get actions
  getActions() {
    return Object.keys(this.actions).map(key => ({
      key,
      name: this.actions[key]
    }));
  }

  // Validate moderation data
  validateModerationData(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.contentType || !['image', 'transformation', 'battle', 'profile', 'comment', 'message'].includes(data.contentType)) {
      errors.push('Valid content type is required');
    }
    
    if (!data.contentId) {
      errors.push('Content ID is required');
    }
    
    if (!data.violationType || !this.violationTypes[data.violationType]) {
      errors.push('Valid violation type is required');
    }
    
    if (!data.severity || !this.severities[data.severity]) {
      errors.push('Valid severity is required');
    }
    
    if (!data.description) {
      errors.push('Description is required');
    }
    
    if (!data.detectionMethod || !this.detectionMethods[data.detectionMethod]) {
      errors.push('Valid detection method is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'MODERATION_LOG_NOT_FOUND': 'Moderation log not found',
      'UNAUTHORIZED': 'Unauthorized access',
      'INVALID_VIOLATION_TYPE': 'Invalid violation type',
      'INVALID_SEVERITY': 'Invalid severity',
      'INVALID_DETECTION_METHOD': 'Invalid detection method',
      'INVALID_CONTENT_TYPE': 'Invalid content type',
      'TRUST_SCORE_NOT_FOUND': 'Trust score not found'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'moderation_log_created': 'Moderation log created successfully',
      'moderation_log_updated': 'Moderation log updated successfully',
      'moderation_log_reviewed': 'Moderation log reviewed successfully',
      'content_moderated': 'Content moderated successfully',
      'trust_score_updated': 'Trust score updated successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const aiModerationService = new AIModerationService();

module.exports = aiModerationService;
