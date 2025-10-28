import api from './api';

const commentService = {
  /**
   * Get comments for a video
   * @param {string} videoId - Video ID
   * @param {string} sort - Sort type (top, newest)
   * @param {number} limit - Number of comments to fetch
   * @param {number} skip - Number of comments to skip
   * @returns {Promise<object>}
   */
  getComments: async (videoId, sort = 'top', limit = 20, skip = 0) => {
    const params = new URLSearchParams();
    params.append('sort', sort);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());
    
    return api.get(`/comments/${videoId}?${params}`);
  },

  /**
   * Get replies for a comment
   * @param {string} commentId - Comment ID
   * @param {number} limit - Number of replies to fetch
   * @returns {Promise<object>}
   */
  getReplies: async (commentId, limit = 10) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    return api.get(`/comments/${commentId}/replies?${params}`);
  },

  /**
   * Create a new comment
   * @param {string} videoId - Video ID
   * @param {string} text - Comment text
   * @param {string} parentId - Parent comment ID (optional)
   * @returns {Promise<object>}
   */
  createComment: async (videoId, text, parentId = null) => {
    return api.post('/comments', { videoId, text, parentId });
  },

  /**
   * Like/unlike a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<object>}
   */
  toggleLike: async (commentId) => {
    return api.post(`/comments/${commentId}/like`);
  },

  /**
   * Report a comment
   * @param {string} commentId - Comment ID
   * @param {string} reason - Report reason
   * @returns {Promise<object>}
   */
  reportComment: async (commentId, reason) => {
    return api.post(`/comments/${commentId}/report`, { reason });
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<object>}
   */
  deleteComment: async (commentId) => {
    return api.delete(`/comments/${commentId}`);
  },

  /**
   * Pin a comment (for creators/admins)
   * @param {string} commentId - Comment ID
   * @returns {Promise<object>}
   */
  pinComment: async (commentId) => {
    return api.post(`/comments/${commentId}/pin`);
  },

  /**
   * Unpin a comment (for creators/admins)
   * @param {string} commentId - Comment ID
   * @returns {Promise<object>}
   */
  unpinComment: async (commentId) => {
    return api.post(`/comments/${commentId}/unpin`);
  },
};

export default commentService;
