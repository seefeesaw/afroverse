import api from './api';

const referralService = {
  /**
   * Get user's referral code and link
   * @returns {Promise<Object>} - Referral code and link
   */
  async getReferralCode() {
    try {
      const response = await api.get('/referral/code');
      return response.data;
    } catch (error) {
      console.error('Error getting referral code:', error);
      throw error;
    }
  },

  /**
   * Redeem a referral code during signup
   * @param {string} inviterCode - Referral code to redeem
   * @returns {Promise<Object>} - Redemption result
   */
  async redeemReferralCode(inviterCode) {
    try {
      const response = await api.post('/referral/redeem', { inviterCode });
      return response.data;
    } catch (error) {
      console.error('Error redeeming referral code:', error);
      throw error;
    }
  },

  /**
   * Get user's referral progress and statistics
   * @returns {Promise<Object>} - Referral progress data
   */
  async getReferralProgress() {
    try {
      const response = await api.get('/referral/progress');
      return response.data;
    } catch (error) {
      console.error('Error getting referral progress:', error);
      throw error;
    }
  },

  /**
   * Get user's referral rewards
   * @returns {Promise<Object>} - Referral rewards data
   */
  async getReferralRewards() {
    try {
      const response = await api.get('/referral/rewards');
      return response.data;
    } catch (error) {
      console.error('Error getting referral rewards:', error);
      throw error;
    }
  },

  /**
   * Claim a specific referral reward
   * @param {string} rewardType - Type of reward to claim
   * @returns {Promise<Object>} - Claim result
   */
  async claimReferralReward(rewardType) {
    try {
      const response = await api.post('/referral/claim', { rewardType });
      return response.data;
    } catch (error) {
      console.error('Error claiming referral reward:', error);
      throw error;
    }
  },

  /**
   * Share referral link via platform
   * @param {string} platform - Platform to share to
   * @param {string} message - Custom message
   * @returns {Promise<Object>} - Share result
   */
  async shareReferralLink(platform, message) {
    try {
      const response = await api.post('/referral/share', { platform, message });
      return response.data;
    } catch (error) {
      console.error('Error sharing referral link:', error);
      throw error;
    }
  },

  /**
   * Send WhatsApp invitation
   * @param {string} phoneNumber - Phone number to send to
   * @param {string} message - Custom message
   * @returns {Promise<Object>} - Invitation result
   */
  async inviteViaWhatsApp(phoneNumber, message) {
    try {
      const response = await api.post('/referral/invite-whatsapp', { phoneNumber, message });
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp invitation:', error);
      throw error;
    }
  },

  /**
   * Validate a referral code
   * @param {string} code - Referral code to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateReferralCode(code) {
    try {
      const response = await api.get(`/referral/validate/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      throw error;
    }
  },

  /**
   * Get referral statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Referral statistics
   */
  async getReferralStatistics(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await api.get(`/referral/statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting referral statistics:', error);
      throw error;
    }
  },

  /**
   * Get referral leaderboard
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Referral leaderboard
   */
  async getReferralLeaderboard(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.timeframe) params.append('timeframe', options.timeframe);

      const response = await api.get(`/referral/leaderboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting referral leaderboard:', error);
      throw error;
    }
  },

  /**
   * Send tribe referral pressure message
   * @param {string} tribeId - Tribe ID
   * @returns {Promise<Object>} - Pressure message result
   */
  async sendTribePressure(tribeId) {
    try {
      const response = await api.post('/referral/tribe-pressure', { tribeId });
      return response.data;
    } catch (error) {
      console.error('Error sending tribe pressure:', error);
      throw error;
    }
  },

  /**
   * Generate referral link with custom parameters
   * @param {Object} params - Link parameters
   * @returns {Promise<Object>} - Generated link
   */
  async generateReferralLink(params = {}) {
    try {
      const response = await api.post('/referral/generate-link', params);
      return response.data;
    } catch (error) {
      console.error('Error generating referral link:', error);
      throw error;
    }
  },

  /**
   * Track referral link click
   * @param {string} code - Referral code
   * @param {Object} metadata - Click metadata
   * @returns {Promise<Object>} - Tracking result
   */
  async trackReferralClick(code, metadata = {}) {
    try {
      const response = await api.post('/referral/track-click', { code, metadata });
      return response.data;
    } catch (error) {
      console.error('Error tracking referral click:', error);
      throw error;
    }
  },

  /**
   * Get referral analytics for user
   * @param {string} userId - User ID
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} - User referral analytics
   */
  async getUserReferralAnalytics(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.metric) params.append('metric', options.metric);

      const response = await api.get(`/referral/analytics/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user referral analytics:', error);
      throw error;
    }
  },

  /**
   * Get referral campaign performance
   * @param {Object} filters - Campaign filters
   * @returns {Promise<Object>} - Campaign performance data
   */
  async getReferralCampaignPerformance(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/referral/campaign-performance?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting referral campaign performance:', error);
      throw error;
    }
  },

  /**
   * Update referral settings
   * @param {Object} settings - Referral settings
   * @returns {Promise<Object>} - Update result
   */
  async updateReferralSettings(settings) {
    try {
      const response = await api.put('/referral/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating referral settings:', error);
      throw error;
    }
  },

  /**
   * Get referral rewards catalog
   * @returns {Promise<Object>} - Rewards catalog
   */
  async getReferralRewardsCatalog() {
    try {
      const response = await api.get('/referral/rewards-catalog');
      return response.data;
    } catch (error) {
      console.error('Error getting referral rewards catalog:', error);
      throw error;
    }
  },

  /**
   * Check referral eligibility
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Eligibility check result
   */
  async checkReferralEligibility(userId) {
    try {
      const response = await api.get(`/referral/eligibility/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking referral eligibility:', error);
      throw error;
    }
  },
};

export default referralService;