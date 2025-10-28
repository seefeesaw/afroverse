import api from './api';

const feedService = {
  /**
   * Get feed for specific tab
   * @param {string} tab - Feed tab (foryou, following, tribe, battles)
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of videos to fetch
   * @param {string} region - User region
   * @returns {Promise<object>}
   */
  getFeed: async (tab, cursor = null, limit = 10, region = 'ZA') => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    params.append('region', region);
    
    return api.get(`/feed/${tab}?${params}`);
  },

  /**
   * Like/unlike a video
   * @param {string} videoId - Video ID
   * @param {boolean} on - Like status
   * @returns {Promise<object>}
   */
  likeVideo: async (videoId, on) => {
    return api.post(`/feed/video/${videoId}/like`, { on });
  },

  /**
   * Share a video
   * @param {string} videoId - Video ID
   * @param {string} channel - Share channel (wa, ig, tt, copy)
   * @returns {Promise<object>}
   */
  shareVideo: async (videoId, channel) => {
    return api.post(`/feed/video/${videoId}/share`, { channel });
  },

  /**
   * Track video view
   * @param {string} videoId - Video ID
   * @param {object} viewData - View tracking data
   * @returns {Promise<object>}
   */
  trackView: async (videoId, viewData) => {
    return api.post(`/feed/video/${videoId}/view`, viewData);
  },

  /**
   * Report a video
   * @param {string} videoId - Video ID
   * @param {string} reason - Report reason
   * @returns {Promise<object>}
   */
  reportVideo: async (videoId, reason) => {
    return api.post(`/feed/video/${videoId}/report`, { reason });
  },

  /**
   * Follow creator after viewing video
   * @param {string} videoId - Video ID
   * @returns {Promise<object>}
   */
  followCreator: async (videoId) => {
    return api.post(`/feed/video/${videoId}/follow`);
  },

  /**
   * Start challenge from video
   * @param {string} videoId - Video ID
   * @param {string} opponentId - Opponent user ID
   * @returns {Promise<object>}
   */
  startChallenge: async (videoId, opponentId) => {
    return api.post(`/feed/video/${videoId}/challenge`, { opponentId });
  },

  /**
   * Vote on a battle video
   * @param {string} battleId - Battle ID
   * @param {string} side - Vote side (challenger, defender)
   * @returns {Promise<object>}
   */
  voteOnBattle: async (battleId, side) => {
    return api.post(`/feed/battles/${battleId}/vote`, { side });
  },

  /**
   * Get feed analytics
   * @param {string} tab - Feed tab (optional)
   * @param {number} days - Number of days (optional)
   * @returns {Promise<object>}
   */
  getFeedAnalytics: async (tab = null, days = 7) => {
    const params = new URLSearchParams();
    if (tab) params.append('tab', tab);
    params.append('days', days.toString());
    
    return api.get(`/feed/analytics?${params}`);
  },

  /**
   * Get video details
   * @param {string} videoId - Video ID
   * @returns {Promise<object>}
   */
  getVideo: async (videoId) => {
    return api.get(`/feed/video/${videoId}`);
  },

  /**
   * Get public video (no auth required)
   * @param {string} videoId - Video ID
   * @returns {Promise<object>}
   */
  getPublicVideo: async (videoId) => {
    return api.get(`/feed/public/${videoId}`);
  },

  /**
   * Share video to external platforms
   * @param {string} videoId - Video ID
   * @param {string} channel - Share channel
   * @param {string} username - Username for referral
   * @returns {Promise<void>}
   */
  shareToExternal: async (videoId, channel, username) => {
    const shareUrl = `${window.location.origin}/v/${videoId}?ref=${username}`;
    
    switch (channel) {
      case 'wa':
        // WhatsApp Web
        if (navigator.share) {
          await navigator.share({
            title: 'Check out this Afroverse video!',
            text: 'Check out this amazing transformation on Afroverse! 🎭',
            url: shareUrl,
          });
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this amazing transformation on Afroverse! 🎭 ${shareUrl}`)}`);
        }
        break;
        
      case 'ig':
        // Instagram (copy to clipboard)
        navigator.clipboard.writeText(shareUrl);
        break;
        
      case 'tt':
        // TikTok (copy to clipboard)
        navigator.clipboard.writeText(shareUrl);
        break;
        
      case 'copy':
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        break;
        
      default:
        throw new Error(`Unsupported share channel: ${channel}`);
    }
  },

  /**
   * Generate session ID for tracking
   * @returns {string}
   */
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  /**
   * Detect device type from user agent
   * @returns {string}
   */
  detectDeviceType: () => {
    const userAgent = navigator.userAgent;
    if (/iPad|Android/i.test(userAgent)) return 'tablet';
    if (/Mobile|Android/i.test(userAgent)) return 'mobile';
    return 'desktop';
  },

  /**
   * Detect connection type (simplified)
   * @returns {string}
   */
  detectConnectionType: () => {
    // This is a simplified detection - in production you'd use more sophisticated methods
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === '4g') return '4g';
      if (connection.effectiveType === '3g') return '3g';
      if (connection.effectiveType === '2g') return '2g';
    }
    return '4g'; // Default assumption
  },
};

export default feedService;