import api from './api';

const achievementService = {
  /**
   * Get all achievements
   * @param {string} category - Filter by category (optional)
   * @param {string} rarity - Filter by rarity (optional)
   * @returns {Promise<object>}
   */
  getAllAchievements: async (category = null, rarity = null) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (rarity) params.append('rarity', rarity);
    
    return api.get(`/achievements?${params}`);
  },

  /**
   * Get user's achievements and progress
   * @returns {Promise<object>}
   */
  getUserAchievements: async () => {
    return api.get('/achievements/me');
  },

  /**
   * Claim achievement reward
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<object>}
   */
  claimReward: async (achievementId) => {
    return api.post(`/achievements/claim/${achievementId}`);
  },

  /**
   * Get achievement leaderboard
   * @param {number} limit - Number of users to fetch
   * @returns {Promise<object>}
   */
  getLeaderboard: async (limit = 10) => {
    return api.get(`/achievements/leaderboard?limit=${limit}`);
  },

  /**
   * Get achievement statistics
   * @returns {Promise<object>}
   */
  getStats: async () => {
    return api.get('/achievements/stats');
  },

  /**
   * Get specific achievement details
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<object>}
   */
  getAchievement: async (achievementId) => {
    return api.get(`/achievements/${achievementId}`);
  },

  /**
   * Get achievement categories
   * @returns {Promise<object>}
   */
  getCategories: async () => {
    return api.get('/achievements/categories');
  },

  /**
   * Get achievement rarities
   * @returns {Promise<object>}
   */
  getRarities: async () => {
    return api.get('/achievements/rarities');
  },

  /**
   * Initialize achievements (admin only)
   * @returns {Promise<object>}
   */
  initializeAchievements: async () => {
    return api.post('/achievements/initialize');
  },

  /**
   * Reset user achievements (admin only)
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  resetUserAchievements: async (userId) => {
    return api.post(`/achievements/reset/${userId}`);
  },

  /**
   * Update achievement progress (internal use)
   * @param {string} userId - User ID
   * @param {string} metric - Metric name
   * @param {number} value - Value to add
   * @returns {Promise<object>}
   */
  updateProgress: async (userId, metric, value) => {
    return api.post('/achievements/progress', { userId, metric, value });
  },
};

export default achievementService;
