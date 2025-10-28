import api from './api';

const creatorService = {
  /**
   * Get creator profile by username
   * @param {string} username - Username to get profile for
   * @returns {Promise<object>}
   */
  getCreatorProfile: async (username) => {
    return api.get(`/creator/profile/${username}`);
  },

  /**
   * Get creator's content feed
   * @param {string} username - Creator's username
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<object>}
   */
  getCreatorFeed: async (username, cursor = null, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/creator/profile/${username}/feed?${params}`);
  },

  /**
   * Follow a creator
   * @param {string} userId - Creator's user ID
   * @returns {Promise<object>}
   */
  followCreator: async (userId) => {
    return api.post(`/creator/follow/${userId}`);
  },

  /**
   * Unfollow a creator
   * @param {string} userId - Creator's user ID
   * @returns {Promise<object>}
   */
  unfollowCreator: async (userId) => {
    return api.delete(`/creator/follow/${userId}`);
  },

  /**
   * Get list of followers for a creator
   * @param {string} userId - Creator's user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of followers to fetch
   * @returns {Promise<object>}
   */
  getFollowers: async (userId, cursor = null, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/creator/followers/${userId}?${params}`);
  },

  /**
   * Get list of users that a creator is following
   * @param {string} userId - Creator's user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of following to fetch
   * @returns {Promise<object>}
   */
  getFollowing: async (userId, cursor = null, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/creator/following/${userId}?${params}`);
  },

  /**
   * Update creator profile
   * @param {object} updates - Profile updates
   * @returns {Promise<object>}
   */
  updateCreatorProfile: async (updates) => {
    return api.put('/creator/profile', updates);
  },

  /**
   * Get top creators for discovery
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of creators to fetch
   * @param {string} tribeId - Filter by tribe (optional)
   * @returns {Promise<object>}
   */
  getTopCreators: async (cursor = null, limit = 20, tribeId = null) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    if (tribeId) params.append('tribeId', tribeId);
    
    return api.get(`/creator/creators/top?${params}`);
  },

  /**
   * Get creator stats
   * @param {string} username - Creator's username
   * @returns {Promise<object>}
   */
  getCreatorStats: async (username) => {
    return api.get(`/creator/profile/${username}/stats`);
  },

  /**
   * Get public share page (no authentication required)
   * @param {string} username - Creator's username
   * @returns {Promise<object>}
   */
  getPublicSharePage: async (username) => {
    return api.get(`/creator/public/profile/${username}`);
  },

  /**
   * Check if current user follows a creator
   * @param {string} username - Creator's username
   * @returns {Promise<object>}
   */
  getFollowStatus: async (username) => {
    return api.get(`/creator/profile/${username}/follow-status`);
  },
};

export default creatorService;
