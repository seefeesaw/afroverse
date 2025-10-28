import api from './api';

const chatService = {
  /**
   * Send a message to tribe chat
   * @param {string} tribeId - Tribe ID
   * @param {string} text - Message text
   * @param {string} replyTo - Message ID to reply to (optional)
   * @param {string} type - Message type (message, announcement)
   * @returns {Promise<object>}
   */
  sendTribeMessage: async (tribeId, text, replyTo = null, type = 'message') => {
    return api.post(`/chat/tribe/${tribeId}/send`, { text, replyTo, type });
  },

  /**
   * Get tribe chat messages
   * @param {string} tribeId - Tribe ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<object>}
   */
  getTribeMessages: async (tribeId, cursor = null, limit = 50) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/chat/tribe/${tribeId}/messages?${params}`);
  },

  /**
   * Send a direct message
   * @param {string} userId - Receiver user ID
   * @param {string} text - Message text
   * @returns {Promise<object>}
   */
  sendDirectMessage: async (userId, text) => {
    return api.post(`/chat/dm/${userId}/send`, { text });
  },

  /**
   * Get direct message conversation
   * @param {string} userId - Other user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<object>}
   */
  getDirectMessages: async (userId, cursor = null, limit = 50) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/chat/dm/${userId}/messages?${params}`);
  },

  /**
   * Toggle reaction on a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Reaction emoji
   * @returns {Promise<object>}
   */
  toggleReaction: async (messageId, emoji) => {
    return api.post('/chat/react', { messageId, emoji });
  },

  /**
   * Mark direct messages as read
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<object>}
   */
  markMessagesAsRead: async (conversationId) => {
    return api.post(`/chat/dm/${conversationId}/read`);
  },

  /**
   * Mute a user in tribe chat
   * @param {string} tribeId - Tribe ID
   * @param {string} userId - User ID to mute
   * @param {number} durationHours - Mute duration in hours
   * @param {string} reason - Mute reason
   * @returns {Promise<object>}
   */
  muteUser: async (tribeId, userId, durationHours = 24, reason = 'Violation of chat rules') => {
    return api.post(`/chat/tribe/${tribeId}/mute/${userId}`, { durationHours, reason });
  },

  /**
   * Block a user
   * @param {string} userId - User ID to block
   * @returns {Promise<object>}
   */
  blockUser: async (userId) => {
    return api.post(`/chat/block/${userId}`);
  },

  /**
   * Get user's chat settings
   * @param {string} tribeId - Tribe ID
   * @returns {Promise<object>}
   */
  getChatSettings: async (tribeId) => {
    return api.get(`/chat/settings?tribeId=${tribeId}`);
  },

  /**
   * Update user's chat settings
   * @param {string} tribeId - Tribe ID
   * @param {object} notificationSettings - Notification settings
   * @returns {Promise<object>}
   */
  updateChatSettings: async (tribeId, notificationSettings) => {
    return api.put('/chat/settings', { tribeId, notificationSettings });
  },

  /**
   * Get user's DM conversations
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of conversations to fetch
   * @returns {Promise<object>}
   */
  getConversations: async (cursor = null, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return api.get(`/chat/conversations?${params}`);
  },
};

export default chatService;
