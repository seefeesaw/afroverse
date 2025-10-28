import api from './api';

const moderationService = {
  /**
   * Submit a report
   * @param {object} reportData - Report data
   * @returns {Promise<object>} Report result
   */
  async submitReport(reportData) {
    try {
      const response = await api.post('/moderation/report', reportData);
      return response.data;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  /**
   * Get report reasons
   * @returns {Promise<Array>} Report reasons
   */
  async getReportReasons() {
    try {
      const response = await api.get('/moderation/reasons');
      return response.data.reasons;
    } catch (error) {
      console.error('Error getting report reasons:', error);
      throw error;
    }
  },

  /**
   * Block a user
   * @param {string} blockedUserId - User ID to block
   * @param {string} reason - Block reason
   * @param {string} description - Block description
   * @returns {Promise<object>} Block result
   */
  async blockUser(blockedUserId, reason, description) {
    try {
      const response = await api.post('/moderation/block', {
        blockedUserId,
        reason,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   * @param {string} blockedUserId - User ID to unblock
   * @returns {Promise<object>} Unblock result
   */
  async unblockUser(blockedUserId) {
    try {
      const response = await api.delete('/moderation/block', {
        data: { blockedUserId }
      });
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  /**
   * Get blocked users
   * @returns {Promise<Array>} Blocked users
   */
  async getBlockedUsers() {
    try {
      const response = await api.get('/moderation/blocked-users');
      return response.data.blockedUsers;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  },

  /**
   * Get users who blocked this user
   * @returns {Promise<Array>} Blockers
   */
  async getBlockers() {
    try {
      const response = await api.get('/moderation/blockers');
      return response.data.blockers;
    } catch (error) {
      console.error('Error getting blockers:', error);
      throw error;
    }
  },

  /**
   * Get moderation history
   * @param {object} params - Query parameters
   * @returns {Promise<object>} Moderation history
   */
  async getModerationHistory(params = {}) {
    try {
      const response = await api.get('/moderation/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting moderation history:', error);
      throw error;
    }
  },

  /**
   * Get user reports (as reporter)
   * @param {object} params - Query parameters
   * @returns {Promise<object>} User reports
   */
  async getUserReports(params = {}) {
    try {
      const response = await api.get('/moderation/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user reports:', error);
      throw error;
    }
  },

  /**
   * Get reports against user
   * @param {object} params - Query parameters
   * @returns {Promise<object>} Reports against user
   */
  async getReportsAgainst(params = {}) {
    try {
      const response = await api.get('/moderation/reports-against', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting reports against user:', error);
      throw error;
    }
  },

  /**
   * Moderate text content
   * @param {string} text - Text to moderate
   * @param {string} contentType - Type of content
   * @param {object} options - Moderation options
   * @returns {Promise<object>} Moderation result
   */
  async moderateText(text, contentType = 'text', options = {}) {
    try {
      const response = await api.post('/moderation/moderate-text', {
        text,
        contentType,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error moderating text:', error);
      throw error;
    }
  },

  /**
   * Check if user is blocked
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>} Is blocked
   */
  async checkUserBlock(userId) {
    try {
      const response = await api.get(`/moderation/check-block/${userId}`);
      return response.data.isBlocked;
    } catch (error) {
      console.error('Error checking user block:', error);
      throw error;
    }
  },

  /**
   * Get moderation statistics
   * @param {string} timeframe - Timeframe for stats
   * @returns {Promise<object>} Moderation stats
   */
  async getModerationStats(timeframe = '7d') {
    try {
      const response = await api.get('/moderation/stats', {
        params: { timeframe }
      });
      return response.data.stats;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw error;
    }
  },

  /**
   * Get moderation service status
   * @returns {Promise<object>} Service status
   */
  async getModerationStatus() {
    try {
      const response = await api.get('/moderation/status');
      return response.data.status;
    } catch (error) {
      console.error('Error getting moderation status:', error);
      throw error;
    }
  },

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {Promise<object>} Validation result
   */
  async validateUsername(username) {
    try {
      const result = await this.moderateText(username, 'username');
      return {
        valid: result.allowed,
        violations: result.violations,
        sanitized: result.sanitized
      };
    } catch (error) {
      console.error('Error validating username:', error);
      return {
        valid: false,
        violations: ['Username validation failed'],
        sanitized: username
      };
    }
  },

  /**
   * Validate tribe name
   * @param {string} tribeName - Tribe name to validate
   * @returns {Promise<object>} Validation result
   */
  async validateTribeName(tribeName) {
    try {
      const result = await this.moderateText(tribeName, 'tribe_name');
      return {
        valid: result.allowed,
        violations: result.violations,
        sanitized: result.sanitized
      };
    } catch (error) {
      console.error('Error validating tribe name:', error);
      return {
        valid: false,
        violations: ['Tribe name validation failed'],
        sanitized: tribeName
      };
    }
  },

  /**
   * Report content
   * @param {string} targetUserId - Target user ID
   * @param {string} targetType - Type of target
   * @param {string} targetId - Target ID
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {Promise<object>} Report result
   */
  async reportContent(targetUserId, targetType, targetId, reason, description) {
    try {
      return await this.submitReport({
        targetUserId,
        targetType,
        targetId,
        reason,
        description
      });
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  },

  /**
   * Report user
   * @param {string} userId - User ID to report
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {Promise<object>} Report result
   */
  async reportUser(userId, reason, description) {
    try {
      return await this.reportContent(userId, 'profile', userId, reason, description);
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  },

  /**
   * Report image
   * @param {string} userId - User ID who posted the image
   * @param {string} imageId - Image ID
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {Promise<object>} Report result
   */
  async reportImage(userId, imageId, reason, description) {
    try {
      return await this.reportContent(userId, 'image', imageId, reason, description);
    } catch (error) {
      console.error('Error reporting image:', error);
      throw error;
    }
  },

  /**
   * Report battle
   * @param {string} userId - User ID who created the battle
   * @param {string} battleId - Battle ID
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {Promise<object>} Report result
   */
  async reportBattle(userId, battleId, reason, description) {
    try {
      return await this.reportContent(userId, 'battle', battleId, reason, description);
    } catch (error) {
      console.error('Error reporting battle:', error);
      throw error;
    }
  },

  /**
   * Get block reasons
   * @returns {Array} Block reasons
   */
  getBlockReasons() {
    return [
      {
        value: 'harassment',
        label: 'Harassment',
        description: 'Bullying, threats, or unwanted behavior'
      },
      {
        value: 'spam',
        label: 'Spam',
        description: 'Repetitive or unwanted content'
      },
      {
        value: 'inappropriate_content',
        label: 'Inappropriate Content',
        description: 'Content that violates community guidelines'
      },
      {
        value: 'unwanted_contact',
        label: 'Unwanted Contact',
        description: 'Persistent unwanted communication'
      },
      {
        value: 'fake_profile',
        label: 'Fake Profile',
        description: 'Impersonation or fake account'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Other reason not listed above'
      }
    ];
  },

  /**
   * Check if content is safe
   * @param {string} text - Text to check
   * @param {string} contentType - Type of content
   * @returns {Promise<boolean>} Is safe
   */
  async isContentSafe(text, contentType = 'text') {
    try {
      const result = await this.moderateText(text, contentType);
      return result.allowed;
    } catch (error) {
      console.error('Error checking content safety:', error);
      return false; // Default to unsafe on error
    }
  },

  /**
   * Sanitize text content
   * @param {string} text - Text to sanitize
   * @param {string} contentType - Type of content
   * @returns {Promise<string>} Sanitized text
   */
  async sanitizeContent(text, contentType = 'text') {
    try {
      const result = await this.moderateText(text, contentType);
      return result.sanitized || text;
    } catch (error) {
      console.error('Error sanitizing content:', error);
      return text; // Return original text on error
    }
  }
};

export default moderationService;