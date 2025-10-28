const { logger } = require('../utils/logger');

class ModerationRulesEngine {
  constructor() {
    this.rules = new Map();
    this.userStrikes = new Map();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default moderation rules
   */
  initializeDefaultRules() {
    // Image moderation rules
    this.addRule('image_upload', {
      faceRequired: true,
      maxFaces: 1,
      minFaceConfidence: 0.7,
      nsfwThreshold: 0.7,
      violenceThreshold: 0.8,
      weaponsThreshold: 0.8,
      minImageSize: 100,
      maxImageSize: 4000,
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp']
    });

    // Text moderation rules
    this.addRule('text_content', {
      maxLength: 1000,
      toxicityThreshold: 0.7,
      spamThreshold: 0.6,
      hateSpeechThreshold: 0.8,
      harassmentThreshold: 0.7,
      allowUrls: false,
      maxCapsRatio: 0.7,
      maxPunctuationRatio: 0.3
    });

    // Username rules
    this.addRule('username', {
      minLength: 3,
      maxLength: 20,
      allowedChars: /^[a-zA-Z0-9_-]+$/,
      reservedWords: ['admin', 'moderator', 'support', 'api', 'system'],
      toxicityThreshold: 0.5,
      bannedWordsThreshold: 0.3
    });

    // Tribe name rules
    this.addRule('tribe_name', {
      minLength: 3,
      maxLength: 30,
      toxicityThreshold: 0.6,
      bannedWordsThreshold: 0.4,
      spamThreshold: 0.5
    });

    // User behavior rules
    this.addRule('user_behavior', {
      maxReportsPerDay: 5,
      maxBlocksPerDay: 10,
      strikeThresholds: {
        1: 'warning',
        2: 'soft_block', // 24-hour mute
        3: 'hard_ban',   // 7-day suspension
        4: 'user_banned' // permanent ban
      },
      cooldownPeriods: {
        warning: 0,
        soft_block: 24 * 60 * 60 * 1000, // 24 hours
        hard_ban: 7 * 24 * 60 * 60 * 1000, // 7 days
        user_banned: Infinity
      }
    });

    logger.info('Default moderation rules initialized');
  }

  /**
   * Add a moderation rule
   * @param {string} type - Rule type
   * @param {object} rule - Rule configuration
   */
  addRule(type, rule) {
    this.rules.set(type, rule);
    logger.info(`Added moderation rule for type: ${type}`);
  }

  /**
   * Get rule for type
   * @param {string} type - Rule type
   * @returns {object} Rule configuration
   */
  getRule(type) {
    return this.rules.get(type);
  }

  /**
   * Evaluate image against rules
   * @param {object} imageData - Image analysis data
   * @param {object} options - Evaluation options
   * @returns {object} Evaluation result
   */
  evaluateImage(imageData, options = {}) {
    try {
      const rule = this.getRule('image_upload');
      if (!rule) {
        throw new Error('No image upload rule found');
      }

      const violations = [];
      const warnings = [];

      // Check face requirements
      if (rule.faceRequired && imageData.faceCount === 0) {
        violations.push('No face detected in image');
      }

      if (imageData.faceCount > rule.maxFaces) {
        violations.push(`Too many faces detected. Maximum allowed: ${rule.maxFaces}`);
      }

      // Check face confidence
      if (imageData.faces && imageData.faces.length > 0) {
        const lowConfidenceFaces = imageData.faces.filter(
          face => face.confidence < rule.minFaceConfidence
        );
        if (lowConfidenceFaces.length > 0) {
          violations.push('Low confidence face detection');
        }
      }

      // Check NSFW content
      if (imageData.nsfwConfidence >= rule.nsfwThreshold) {
        violations.push('NSFW content detected');
      }

      // Check violence
      if (imageData.violenceConfidence >= rule.violenceThreshold) {
        violations.push('Violent content detected');
      }

      // Check weapons
      if (imageData.weaponsConfidence >= rule.weaponsThreshold) {
        violations.push('Weapons detected');
      }

      // Check image size
      if (imageData.width < rule.minImageSize || imageData.height < rule.minImageSize) {
        violations.push('Image too small');
      }

      if (imageData.width > rule.maxImageSize || imageData.height > rule.maxImageSize) {
        warnings.push('Image very large, processing may be slow');
      }

      // Check format
      if (!rule.allowedFormats.includes(imageData.format)) {
        violations.push(`Unsupported image format: ${imageData.format}`);
      }

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        action: violations.length > 0 ? 'block' : 'allow'
      };

    } catch (error) {
      logger.error('Error evaluating image:', error);
      return {
        allowed: false,
        violations: ['Image evaluation failed'],
        warnings: [],
        action: 'block'
      };
    }
  }

  /**
   * Evaluate text against rules
   * @param {object} textData - Text analysis data
   * @param {object} options - Evaluation options
   * @returns {object} Evaluation result
   */
  evaluateText(textData, options = {}) {
    try {
      const rule = this.getRule('text_content');
      if (!rule) {
        throw new Error('No text content rule found');
      }

      const violations = [];
      const warnings = [];

      // Check length
      if (textData.length > rule.maxLength) {
        violations.push(`Text too long. Maximum allowed: ${rule.maxLength} characters`);
      }

      // Check toxicity
      if (textData.toxicityConfidence >= rule.toxicityThreshold) {
        violations.push('Toxic content detected');
      }

      // Check spam
      if (textData.spamConfidence >= rule.spamThreshold) {
        violations.push('Spam content detected');
      }

      // Check hate speech
      if (textData.hateSpeechConfidence >= rule.hateSpeechThreshold) {
        violations.push('Hate speech detected');
      }

      // Check harassment
      if (textData.harassmentConfidence >= rule.harassmentThreshold) {
        violations.push('Harassment detected');
      }

      // Check URLs
      if (!rule.allowUrls && textData.hasUrls) {
        violations.push('URLs not allowed');
      }

      // Check caps ratio
      if (textData.capsRatio > rule.maxCapsRatio) {
        violations.push('Excessive use of capital letters');
      }

      // Check punctuation ratio
      if (textData.punctuationRatio > rule.maxPunctuationRatio) {
        violations.push('Excessive punctuation');
      }

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        action: violations.length > 0 ? 'block' : 'allow'
      };

    } catch (error) {
      logger.error('Error evaluating text:', error);
      return {
        allowed: false,
        violations: ['Text evaluation failed'],
        warnings: [],
        action: 'block'
      };
    }
  }

  /**
   * Evaluate username against rules
   * @param {string} username - Username to evaluate
   * @param {object} textData - Text analysis data
   * @returns {object} Evaluation result
   */
  evaluateUsername(username, textData) {
    try {
      const rule = this.getRule('username');
      if (!rule) {
        throw new Error('No username rule found');
      }

      const violations = [];
      const warnings = [];

      // Check length
      if (username.length < rule.minLength) {
        violations.push(`Username too short. Minimum: ${rule.minLength} characters`);
      }

      if (username.length > rule.maxLength) {
        violations.push(`Username too long. Maximum: ${rule.maxLength} characters`);
      }

      // Check allowed characters
      if (!rule.allowedChars.test(username)) {
        violations.push('Username contains invalid characters');
      }

      // Check reserved words
      if (rule.reservedWords.includes(username.toLowerCase())) {
        violations.push('Username is reserved');
      }

      // Check toxicity
      if (textData.toxicityConfidence >= rule.toxicityThreshold) {
        violations.push('Username contains inappropriate content');
      }

      // Check banned words
      if (textData.bannedWordsConfidence >= rule.bannedWordsThreshold) {
        violations.push('Username contains banned words');
      }

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        action: violations.length > 0 ? 'block' : 'allow'
      };

    } catch (error) {
      logger.error('Error evaluating username:', error);
      return {
        allowed: false,
        violations: ['Username evaluation failed'],
        warnings: [],
        action: 'block'
      };
    }
  }

  /**
   * Evaluate tribe name against rules
   * @param {string} tribeName - Tribe name to evaluate
   * @param {object} textData - Text analysis data
   * @returns {object} Evaluation result
   */
  evaluateTribeName(tribeName, textData) {
    try {
      const rule = this.getRule('tribe_name');
      if (!rule) {
        throw new Error('No tribe name rule found');
      }

      const violations = [];
      const warnings = [];

      // Check length
      if (tribeName.length < rule.minLength) {
        violations.push(`Tribe name too short. Minimum: ${rule.minLength} characters`);
      }

      if (tribeName.length > rule.maxLength) {
        violations.push(`Tribe name too long. Maximum: ${rule.maxLength} characters`);
      }

      // Check toxicity
      if (textData.toxicityConfidence >= rule.toxicityThreshold) {
        violations.push('Tribe name contains inappropriate content');
      }

      // Check banned words
      if (textData.bannedWordsConfidence >= rule.bannedWordsThreshold) {
        violations.push('Tribe name contains banned words');
      }

      // Check spam
      if (textData.spamConfidence >= rule.spamThreshold) {
        violations.push('Tribe name appears to be spam');
      }

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        action: violations.length > 0 ? 'block' : 'allow'
      };

    } catch (error) {
      logger.error('Error evaluating tribe name:', error);
      return {
        allowed: false,
        violations: ['Tribe name evaluation failed'],
        warnings: [],
        action: 'block'
      };
    }
  }

  /**
   * Determine user strike action
   * @param {string} userId - User ID
   * @param {string} violationType - Type of violation
   * @param {object} options - Options
   * @returns {Promise<object>} Strike action
   */
  async determineStrikeAction(userId, violationType, options = {}) {
    try {
      const rule = this.getRule('user_behavior');
      if (!rule) {
        throw new Error('No user behavior rule found');
      }

      // Get current strike count for user
      const currentStrikes = await this.getUserStrikeCount(userId);
      const newStrikeCount = currentStrikes + 1;

      // Determine action based on strike count
      const action = rule.strikeThresholds[newStrikeCount] || 'warning';
      const cooldownPeriod = rule.cooldownPeriods[action] || 0;

      return {
        action,
        strikeCount: newStrikeCount,
        cooldownPeriod,
        severity: this.getSeverityLevel(action),
        reason: `Strike ${newStrikeCount}: ${violationType}`
      };

    } catch (error) {
      logger.error('Error determining strike action:', error);
      return {
        action: 'warning',
        strikeCount: 1,
        cooldownPeriod: 0,
        severity: 'low',
        reason: 'Default action due to error'
      };
    }
  }

  /**
   * Get user strike count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Strike count
   */
  async getUserStrikeCount(userId) {
    try {
      const ModerationLog = require('../models/ModerationLog');
      return await ModerationLog.getUserStrikeCount(userId);
    } catch (error) {
      logger.error('Error getting user strike count:', error);
      return 0;
    }
  }

  /**
   * Get severity level for action
   * @param {string} action - Action type
   * @returns {string} Severity level
   */
  getSeverityLevel(action) {
    const severityMap = {
      'warning': 'low',
      'soft_block': 'medium',
      'hard_ban': 'high',
      'user_banned': 'critical'
    };

    return severityMap[action] || 'low';
  }

  /**
   * Check if user can perform action
   * @param {string} userId - User ID
   * @param {string} action - Action to check
   * @returns {Promise<boolean>} Can perform action
   */
  async canUserPerformAction(userId, action) {
    try {
      const ModerationLog = require('../models/ModerationLog');
      const activeActions = await ModerationLog.getActiveModerationActions(userId);

      // Check if user has active restrictions
      for (const log of activeActions) {
        const cooldownPeriod = this.getRule('user_behavior').cooldownPeriods[log.action] || 0;
        const timeSinceAction = Date.now() - log.createdAt.getTime();

        if (timeSinceAction < cooldownPeriod) {
          return false; // User is still under restriction
        }
      }

      return true;

    } catch (error) {
      logger.error('Error checking user action permission:', error);
      return false; // Default to restricted on error
    }
  }

  /**
   * Get rule statistics
   * @returns {object} Rule statistics
   */
  getStats() {
    return {
      totalRules: this.rules.size,
      ruleTypes: Array.from(this.rules.keys()),
      userStrikes: this.userStrikes.size
    };
  }
}

module.exports = new ModerationRulesEngine();
