import api from './api';

const videoService = {
  /**
   * Create a new video
   * @param {Object} videoData - Video creation data
   * @returns {Promise<Object>} - Video creation result
   */
  async createVideo(videoData) {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(videoData).forEach(key => {
        if (videoData[key] !== null && videoData[key] !== undefined) {
          formData.append(key, videoData[key]);
        }
      });

      const response = await api.post('/video/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  /**
   * Get video processing status
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Video status
   */
  async getVideoStatus(videoId) {
    try {
      const response = await api.get(`/video/status/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video status:', error);
      throw error;
    }
  },

  /**
   * Get user's video history
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Video history
   */
  async getVideoHistory(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.variant) params.append('variant', options.variant);

      const response = await api.get(`/video/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video history:', error);
      throw error;
    }
  },

  /**
   * Delete a video
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteVideo(videoId) {
    try {
      const response = await api.delete(`/video/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  /**
   * Share a video
   * @param {string} videoId - Video ID
   * @param {string} platform - Platform to share to
   * @returns {Promise<Object>} - Share result
   */
  async shareVideo(videoId, platform) {
    try {
      const response = await api.post(`/video/${videoId}/share`, { platform });
      return response.data;
    } catch (error) {
      console.error('Error sharing video:', error);
      throw error;
    }
  },

  /**
   * Track video view
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - View tracking result
   */
  async viewVideo(videoId) {
    try {
      const response = await api.post(`/video/${videoId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error tracking video view:', error);
      throw error;
    }
  },

  /**
   * Like a video
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Like result
   */
  async likeVideo(videoId) {
    try {
      const response = await api.post(`/video/${videoId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  },

  /**
   * Get available audio tracks
   * @returns {Promise<Array>} - Audio tracks
   */
  async getAudioTracks() {
    try {
      const response = await api.get('/video/audio-tracks');
      return response.data.tracks;
    } catch (error) {
      console.error('Error getting audio tracks:', error);
      throw error;
    }
  },

  /**
   * Get available video styles
   * @returns {Promise<Array>} - Video styles
   */
  async getVideoStyles() {
    try {
      const response = await api.get('/video/styles');
      return response.data.styles;
    } catch (error) {
      console.error('Error getting video styles:', error);
      throw error;
    }
  },

  /**
   * Get public video info
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Public video info
   */
  async getPublicVideo(videoId) {
    try {
      const response = await api.get(`/video/${videoId}/public`);
      return response.data.video;
    } catch (error) {
      console.error('Error getting public video:', error);
      throw error;
    }
  },

  /**
   * Upload video file (for selfie videos)
   * @param {File} file - Video file
   * @param {Object} metadata - File metadata
   * @returns {Promise<Object>} - Upload result
   */
  async uploadVideoFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await api.post('/video/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading video file:', error);
      throw error;
    }
  },

  /**
   * Get video analytics
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Video analytics
   */
  async getVideoAnalytics(videoId) {
    try {
      const response = await api.get(`/video/${videoId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error getting video analytics:', error);
      throw error;
    }
  },

  /**
   * Get trending videos
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Trending videos
   */
  async getTrendingVideos(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.timeframe) params.append('timeframe', options.timeframe);

      const response = await api.get(`/video/trending?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting trending videos:', error);
      throw error;
    }
  },

  /**
   * Search videos
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async searchVideos(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.style) params.append('style', options.style);
      if (options.variant) params.append('variant', options.variant);

      const response = await api.get(`/video/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  },

  /**
   * Get video recommendations
   * @param {string} userId - User ID
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} - Video recommendations
   */
  async getVideoRecommendations(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.style) params.append('style', options.style);

      const response = await api.get(`/video/recommendations/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video recommendations:', error);
      throw error;
    }
  },

  /**
   * Report a video
   * @param {string} videoId - Video ID
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {Promise<Object>} - Report result
   */
  async reportVideo(videoId, reason, description = '') {
    try {
      const response = await api.post(`/video/${videoId}/report`, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting video:', error);
      throw error;
    }
  },

  /**
   * Get video comments
   * @param {string} videoId - Video ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Video comments
   */
  async getVideoComments(videoId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);

      const response = await api.get(`/video/${videoId}/comments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video comments:', error);
      throw error;
    }
  },

  /**
   * Add comment to video
   * @param {string} videoId - Video ID
   * @param {string} text - Comment text
   * @returns {Promise<Object>} - Comment result
   */
  async addVideoComment(videoId, text) {
    try {
      const response = await api.post(`/video/${videoId}/comments`, { text });
      return response.data;
    } catch (error) {
      console.error('Error adding video comment:', error);
      throw error;
    }
  },
};

export default videoService;
