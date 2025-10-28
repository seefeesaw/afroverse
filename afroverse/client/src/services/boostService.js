import api from './api';

const boostService = {
  /**
   * Boost a video
   * @param {string} videoId - Video ID
   * @param {string} tier - Boost tier (bronze, silver, gold)
   * @returns {Promise<object>}
   */
  boostVideo: async (videoId, tier) => {
    return api.post('/boost/video', { videoId, tier });
  },

  /**
   * Boost a tribe
   * @param {string} tribeId - Tribe ID
   * @param {string} tier - Boost tier (rally, warDrums, fullWar)
   * @returns {Promise<object>}
   */
  boostTribe: async (tribeId, tier) => {
    return api.post('/boost/tribe', { tribeId, tier });
  },

  /**
   * Get boost info for a video
   * @param {string} videoId - Video ID
   * @returns {Promise<object>}
   */
  getVideoBoost: async (videoId) => {
    return api.get(`/boost/video/${videoId}`);
  },

  /**
   * Get boost info for a tribe
   * @param {string} tribeId - Tribe ID
   * @returns {Promise<object>}
   */
  getTribeBoost: async (tribeId) => {
    return api.get(`/boost/tribe/${tribeId}`);
  },

  /**
   * Get available boost tiers
   * @returns {Promise<object>}
   */
  getBoostTiers: async () => {
    return api.get('/boost/tiers');
  },
};

export default boostService;
