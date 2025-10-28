const { logger } = require('../utils/logger');

class TextModerationService {
  constructor() {
    this.initialized = false;
    this.toxicityModel = null;
    this.bannedWords = new Set();
    this.init();
  }

  async init() {
    try {
      // Initialize banned words list
      await this.loadBannedWords();
      
      // For production, integrate with:
      // - HuggingFace toxicity models
      // - Google Perspective API
      // - Azure Content Moderator
      // - AWS Comprehend
      
      this.initialized = true;
      logger.info('Text moderation service initialized');
    } catch (error) {
      logger.error('Failed to initialize text moderation service:', error);
      this.initialized = false;
    }
  }

  /**
   * Load banned words from database or file
   */
  async loadBannedWords() {
    try {
      // In production, load from database
      const defaultBannedWords = [
        // Hate speech
        'hate', 'racist', 'sexist', 'homophobic',
        // Profanity
        'fuck', 'shit', 'bitch', 'asshole',
        // Threats
        'kill', 'murder', 'suicide', 'bomb',
        // Spam
        'scam', 'fake', 'bot', 'spam'
      ];

      this.bannedWords = new Set(defaultBannedWords);
      logger.info(`Loaded ${this.bannedWords.size} banned words`);
    } catch (error) {
      logger.error('Error loading banned words:', error);
      this.bannedWords = new Set();
    }
  }

  /**
   * Moderate text content
   * @param {string} text - Text to moderate
   * @param {object} options - Moderation options
   * @returns {Promise<object>} Moderation result
   */
  async moderateText(text, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Text moderation service not initialized');
      }

      const {
        strictMode = true,
        checkToxicity = true,
        checkBannedWords = true,
        checkSpam = true,
        minConfidence = 0.7
      } = options;

      const moderationResult = {
        safe: true,
        confidence: 1.0,
        violations: [],
        categories: [],
        action: 'allow'
      };

      // Check banned words
      if (checkBannedWords) {
        const bannedWordsResult = this.checkBannedWords(text);
        if (!bannedWordsResult.safe) {
          moderationResult.violations.push(...bannedWordsResult.violations);
          moderationResult.categories.push('banned_words');
        }
      }

      // Check toxicity
      if (checkToxicity) {
        const toxicityResult = await this.checkToxicity(text, minConfidence);
        if (!toxicityResult.safe) {
          moderationResult.violations.push(...toxicityResult.violations);
          moderationResult.categories.push(...toxicityResult.categories);
          moderationResult.confidence = Math.min(moderationResult.confidence, toxicityResult.confidence);
        }
      }

      // Check for spam
      if (checkSpam) {
        const spamResult = this.checkSpam(text);
        if (!spamResult.safe) {
          moderationResult.violations.push(...spamResult.violations);
          moderationResult.categories.push('spam');
        }
      }

      // Determine overall safety
      moderationResult.safe = moderationResult.violations.length === 0;
      
      // Determine action based on violations
      if (!moderationResult.safe) {
        moderationResult.action = this.determineAction(moderationResult, strictMode);
      }

      return moderationResult;

    } catch (error) {
      logger.error('Error moderating text:', error);
      return {
        safe: false,
        confidence: 0,
        violations: ['Text moderation failed'],
        categories: ['error'],
        action: 'block'
      };
    }
  }

  /**
   * Check for banned words
   * @param {string} text - Text to check
   * @returns {object} Banned words result
   */
  checkBannedWords(text) {
    const violations = [];
    const lowerText = text.toLowerCase();

    for (const bannedWord of this.bannedWords) {
      if (lowerText.includes(bannedWord.toLowerCase())) {
        violations.push(`Contains banned word: ${bannedWord}`);
      }
    }

    return {
      safe: violations.length === 0,
      violations,
      categories: violations.length > 0 ? ['banned_words'] : []
    };
  }

  /**
   * Check text toxicity (placeholder for production AI)
   * @param {string} text - Text to check
   * @param {number} minConfidence - Minimum confidence threshold
   * @returns {Promise<object>} Toxicity result
   */
  async checkToxicity(text, minConfidence) {
    try {
      // For MVP, implement basic pattern matching
      // In production, integrate with:
      // - HuggingFace toxicity models
      // - Google Perspective API
      // - Azure Content Moderator

      const toxicityPatterns = {
        hate_speech: [
          /you are (?:a )?(?:stupid|dumb|idiot|moron)/i,
          /(?:kill|murder|destroy) (?:yourself|you)/i,
          /(?:hate|despise) (?:you|your)/i
        ],
        harassment: [
          /(?:fuck|shit) (?:you|off)/i,
          /(?:bitch|asshole|dickhead)/i,
          /(?:shut up|shut the fuck up)/i
        ],
        threats: [
          /(?:i will|i'll) (?:kill|hurt|harm) (?:you|your)/i,
          /(?:threaten|threat) (?:you|your)/i,
          /(?:beat|fight) (?:you|your)/i
        ],
        spam: [
          /(?:buy|sell|purchase) (?:now|today)/i,
          /(?:click here|visit|link)/i,
          /(?:free|discount|offer)/i
        ]
      };

      const violations = [];
      const categories = [];

      for (const [category, patterns] of Object.entries(toxicityPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(text)) {
            violations.push(`Detected ${category}: ${pattern.source}`);
            categories.push(category);
          }
        }
      }

      // Calculate confidence based on violations
      const confidence = violations.length > 0 ? 0.8 : 1.0;

      return {
        safe: violations.length === 0,
        violations,
        categories,
        confidence
      };

    } catch (error) {
      logger.error('Error checking toxicity:', error);
      return {
        safe: false,
        violations: ['Toxicity check failed'],
        categories: ['error'],
        confidence: 0
      };
    }
  }

  /**
   * Check for spam patterns
   * @param {string} text - Text to check
   * @returns {object} Spam result
   */
  checkSpam(text) {
    const violations = [];
    
    // Check for excessive repetition
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Check for repeated words
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count > 3 && word.length > 2) {
        violations.push(`Excessive repetition of word: ${word}`);
      }
    }

    // Check for excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.7 && text.length > 10) {
      violations.push('Excessive use of capital letters');
    }

    // Check for excessive punctuation
    const punctuationRatio = (text.match(/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/g) || []).length / text.length;
    if (punctuationRatio > 0.3) {
      violations.push('Excessive punctuation');
    }

    // Check for URLs
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    if (urlPattern.test(text)) {
      violations.push('Contains URLs');
    }

    return {
      safe: violations.length === 0,
      violations,
      categories: violations.length > 0 ? ['spam'] : []
    };
  }

  /**
   * Determine moderation action based on violations
   * @param {object} moderationResult - Moderation result
   * @param {boolean} strictMode - Whether to use strict mode
   * @returns {string} Action to take
   */
  determineAction(moderationResult, strictMode) {
    const { violations, categories } = moderationResult;

    // High-risk categories
    const highRiskCategories = ['hate_speech', 'threats', 'harassment'];
    const hasHighRisk = categories.some(cat => highRiskCategories.includes(cat));

    if (hasHighRisk) {
      return 'block';
    }

    // Multiple violations
    if (violations.length > 2) {
      return 'block';
    }

    // Spam violations
    if (categories.includes('spam')) {
      return strictMode ? 'block' : 'warn';
    }

    // Default action
    return strictMode ? 'block' : 'warn';
  }

  /**
   * Sanitize text by removing or replacing inappropriate content
   * @param {string} text - Text to sanitize
   * @param {object} options - Sanitization options
   * @returns {string} Sanitized text
   */
  sanitizeText(text, options = {}) {
    const {
      replaceWith = '*',
      removeUrls = true,
      removeExcessiveCaps = true,
      removeExcessivePunctuation = true
    } = options;

    let sanitized = text;

    // Replace banned words
    for (const bannedWord of this.bannedWords) {
      const regex = new RegExp(`\\b${bannedWord}\\b`, 'gi');
      sanitized = sanitized.replace(regex, replaceWith.repeat(bannedWord.length));
    }

    // Remove URLs
    if (removeUrls) {
      sanitized = sanitized.replace(/(https?:\/\/[^\s]+)/gi, '[URL REMOVED]');
    }

    // Fix excessive caps
    if (removeExcessiveCaps) {
      sanitized = sanitized.replace(/([A-Z]{3,})/g, (match) => {
        return match.charAt(0) + match.slice(1).toLowerCase();
      });
    }

    // Fix excessive punctuation
    if (removeExcessivePunctuation) {
      sanitized = sanitized.replace(/([!@#$%^&*()_+={}[\]|\\:";'<>?,./]){3,}/g, '$1$1');
    }

    return sanitized;
  }

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {object} Validation result
   */
  async validateUsername(username) {
    try {
      const moderationResult = await this.moderateText(username, {
        strictMode: true,
        checkToxicity: true,
        checkBannedWords: true,
        checkSpam: true
      });

      // Additional username-specific checks
      const violations = [...moderationResult.violations];

      // Check length
      if (username.length < 3) {
        violations.push('Username too short');
      }
      if (username.length > 20) {
        violations.push('Username too long');
      }

      // Check for special characters
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        violations.push('Username contains invalid characters');
      }

      // Check for reserved words
      const reservedWords = ['admin', 'moderator', 'support', 'api', 'system'];
      if (reservedWords.includes(username.toLowerCase())) {
        violations.push('Username is reserved');
      }

      return {
        valid: violations.length === 0,
        violations,
        sanitized: violations.length > 0 ? this.sanitizeText(username) : username
      };

    } catch (error) {
      logger.error('Error validating username:', error);
      return {
        valid: false,
        violations: ['Username validation failed'],
        sanitized: username
      };
    }
  }

  /**
   * Validate tribe name
   * @param {string} tribeName - Tribe name to validate
   * @returns {object} Validation result
   */
  async validateTribeName(tribeName) {
    try {
      const moderationResult = await this.moderateText(tribeName, {
        strictMode: true,
        checkToxicity: true,
        checkBannedWords: true,
        checkSpam: true
      });

      // Additional tribe name-specific checks
      const violations = [...moderationResult.violations];

      // Check length
      if (tribeName.length < 3) {
        violations.push('Tribe name too short');
      }
      if (tribeName.length > 30) {
        violations.push('Tribe name too long');
      }

      return {
        valid: violations.length === 0,
        violations,
        sanitized: violations.length > 0 ? this.sanitizeText(tribeName) : tribeName
      };

    } catch (error) {
      logger.error('Error validating tribe name:', error);
      return {
        valid: false,
        violations: ['Tribe name validation failed'],
        sanitized: tribeName
      };
    }
  }

  /**
   * Get service status
   * @returns {object} Service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      service: 'text-moderation',
      version: '1.0.0',
      bannedWordsCount: this.bannedWords.size
    };
  }
}

module.exports = new TextModerationService();
