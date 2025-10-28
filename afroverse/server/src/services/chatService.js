const Message = require('../models/Message');
const DmMessage = require('../models/DmMessage');
const Conversation = require('../models/Conversation');
const ChatSettings = require('../models/ChatSettings');
const User = require('../models/User');
const Tribe = require('../models/Tribe');
const { logger } = require('../utils/logger');
const { io } = require('../sockets/socketService');
const notificationService = require('./notificationService');

// Rate limiting for spam protection
const messageRateLimit = new Map(); // userId -> { count, resetTime }
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 5;

// Hate word filter (basic implementation)
const HATE_WORDS = [
  'hate', 'stupid', 'idiot', 'moron', 'dumb', 'ugly', 'fat', 'skinny',
  'kill', 'die', 'suicide', 'murder', 'violence', 'attack'
];

// Profanity filter
const PROFANITY_WORDS = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap'
];

const chatService = {
  /**
   * Send a message to tribe chat
   * @param {string} tribeId - Tribe ID
   * @param {string} senderId - User ID
   * @param {string} text - Message text
   * @param {string} replyTo - Message ID to reply to (optional)
   * @param {string} type - Message type (message, announcement)
   * @returns {Promise<Object>} Created message
   */
  async sendTribeMessage(tribeId, senderId, text, replyTo = null, type = 'message') {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(senderId)) {
        throw new Error('Rate limit exceeded. Please wait before sending another message.');
      }

      // Check if user can send messages
      const chatSettings = await ChatSettings.findOne({ userId: senderId, tribeId });
      if (chatSettings && !chatSettings.canSendMessage()) {
        throw new Error('You are muted and cannot send messages.');
      }

      // Content moderation
      const moderatedText = this.moderateContent(text);
      if (moderatedText !== text) {
        // Record violation if content was modified
        if (chatSettings) {
          await chatSettings.recordViolation();
        }
      }

      // Extract mentions
      const mentions = this.extractMentions(text);

      // Create message
      const message = await Message.create({
        tribeId,
        senderId,
        text: moderatedText,
        replyTo,
        type,
        mentions,
      });

      // Populate sender info
      await message.populate('senderId', 'username displayName avatar tribe');

      // Update chat settings
      await this.updateChatSettings(senderId, tribeId);

      // Broadcast to tribe members
      const tribeMembers = await User.find({ tribe: tribeId }).select('_id');
      const memberIds = tribeMembers.map(m => m._id.toString());
      
      io.to(`tribe-${tribeId}`).emit('tribe_message', {
        message: {
          _id: message._id,
          text: message.text,
          senderId: message.senderId,
          type: message.type,
          replyTo: message.replyTo,
          mentions: message.mentions,
          reactions: message.reactions,
          createdAt: message.createdAt,
        },
        sender: {
          _id: message.senderId._id,
          username: message.senderId.username,
          displayName: message.senderId.displayName,
          avatar: message.senderId.avatar,
        }
      });

      // Send notifications for mentions
      if (mentions.length > 0) {
        await this.sendMentionNotifications(mentions, message, tribeId);
      }

      // Send push notifications for announcements
      if (type === 'announcement') {
        await this.sendAnnouncementNotifications(tribeId, message);
      }

      logger.info(`Tribe message sent: ${message._id} by ${senderId} in tribe ${tribeId}`);
      return message;

    } catch (error) {
      logger.error('Error sending tribe message:', error);
      throw error;
    }
  },

  /**
   * Send a direct message
   * @param {string} senderId - Sender user ID
   * @param {string} receiverId - Receiver user ID
   * @param {string} text - Message text
   * @returns {Promise<Object>} Created message
   */
  async sendDirectMessage(senderId, receiverId, text) {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(senderId)) {
        throw new Error('Rate limit exceeded. Please wait before sending another message.');
      }

      // Check if receiver has blocked sender
      const receiverSettings = await ChatSettings.findOne({ userId: receiverId });
      if (receiverSettings && receiverSettings.blockedUsers && receiverSettings.blockedUsers.includes(senderId)) {
        throw new Error('You cannot send messages to this user.');
      }

      // Content moderation
      const moderatedText = this.moderateContent(text);

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
        isActive: true
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          unreadCount: new Map([[receiverId, 0]])
        });
      }

      // Create message
      const message = await DmMessage.create({
        conversationId: conversation._id,
        senderId,
        receiverId,
        text: moderatedText,
      });

      // Update conversation
      await conversation.updateLastMessage(moderatedText, senderId);
      await conversation.incrementUnreadCount(receiverId);

      // Populate sender info
      await message.populate('senderId', 'username displayName avatar');

      // Broadcast to both users
      const roomName = `dm-${senderId}-${receiverId}`;
      io.to(roomName).emit('dm_message', {
        message: {
          _id: message._id,
          text: message.text,
          senderId: message.senderId,
          receiverId: message.receiverId,
          isRead: message.isRead,
          createdAt: message.createdAt,
        },
        sender: {
          _id: message.senderId._id,
          username: message.senderId.username,
          displayName: message.senderId.displayName,
          avatar: message.senderId.avatar,
        },
        conversationId: conversation._id,
      });

      // Send push notification if receiver is offline
      if (receiverSettings && receiverSettings.notificationSettings && receiverSettings.notificationSettings.dms) {
        await notificationService.createNotification(receiverId, {
          type: 'dm_received',
          title: `New message from ${message.senderId.displayName}`,
          message: moderatedText.length > 50 ? moderatedText.substring(0, 50) + '...' : moderatedText,
          deeplink: `/app/dm/${senderId}`,
        });
      }

      logger.info(`DM sent: ${message._id} from ${senderId} to ${receiverId}`);
      return message;

    } catch (error) {
      logger.error('Error sending direct message:', error);
      throw error;
    }
  },

  /**
   * Get tribe chat messages with pagination
   * @param {string} tribeId - Tribe ID
   * @param {string} cursor - Last message ID for pagination
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Array>} Messages array
   */
  async getTribeMessages(tribeId, cursor = null, limit = 50) {
    try {
      const query = { tribeId, isDeleted: false };
      
      if (cursor) {
        const lastMessage = await Message.findById(cursor);
        if (lastMessage) {
          query.createdAt = { $lt: lastMessage.createdAt };
        }
      }

      const messages = await Message.find(query)
        .populate('senderId', 'username displayName avatar')
        .populate('replyTo', 'text senderId')
        .populate('replyTo.senderId', 'username displayName')
        .sort({ createdAt: -1 })
        .limit(limit);

      return messages.reverse(); // Return in chronological order

    } catch (error) {
      logger.error('Error fetching tribe messages:', error);
      throw error;
    }
  },

  /**
   * Get direct message conversation
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {string} cursor - Last message ID for pagination
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Array>} Messages array
   */
  async getDirectMessages(userId1, userId2, cursor = null, limit = 50) {
    try {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId1, userId2] },
        isActive: true
      });

      if (!conversation) {
        return [];
      }

      const query = { conversationId: conversation._id, isDeleted: false };
      
      if (cursor) {
        const lastMessage = await DmMessage.findById(cursor);
        if (lastMessage) {
          query.createdAt = { $lt: lastMessage.createdAt };
        }
      }

      const messages = await DmMessage.find(query)
        .populate('senderId', 'username displayName avatar')
        .sort({ createdAt: -1 })
        .limit(limit);

      return messages.reverse(); // Return in chronological order

    } catch (error) {
      logger.error('Error fetching direct messages:', error);
      throw error;
    }
  },

  /**
   * Add or remove reaction to a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @param {string} emoji - Reaction emoji
   * @returns {Promise<Object>} Updated message
   */
  async toggleReaction(messageId, userId, emoji) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const hasReacted = message.hasUserReacted(userId, emoji);
      
      if (hasReacted) {
        await message.removeReaction(emoji, userId);
      } else {
        await message.addReaction(emoji, userId);
      }

      // Broadcast reaction update
      io.to(`tribe-${message.tribeId}`).emit('message_reaction', {
        messageId: message._id,
        emoji,
        userId,
        action: hasReacted ? 'remove' : 'add',
        reactionCounts: message.reactionCounts,
      });

      return message;

    } catch (error) {
      logger.error('Error toggling reaction:', error);
      throw error;
    }
  },

  /**
   * Mark direct messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated conversation
   */
  async markMessagesAsRead(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Mark all unread messages as read
      await DmMessage.updateMany(
        { conversationId, receiverId: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Reset unread count
      await conversation.resetUnreadCount(userId);

      // Broadcast read status
      const otherParticipant = conversation.getOtherParticipant(userId);
      io.to(`dm-${userId}-${otherParticipant}`).emit('messages_read', {
        conversationId,
        userId,
        readAt: new Date(),
      });

      return conversation;

    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Mute a user in tribe chat
   * @param {string} tribeId - Tribe ID
   * @param {string} userId - User ID to mute
   * @param {string} mutedBy - User ID who is muting
   * @param {number} durationHours - Mute duration in hours
   * @param {string} reason - Mute reason
   * @returns {Promise<Object>} Updated chat settings
   */
  async muteUser(tribeId, userId, mutedBy, durationHours = 24, reason = 'Violation of chat rules') {
    try {
      let chatSettings = await ChatSettings.findOne({ userId, tribeId });
      
      if (!chatSettings) {
        chatSettings = await ChatSettings.create({ userId, tribeId });
      }

      await chatSettings.muteUser(durationHours, mutedBy, reason);

      // Broadcast mute status
      io.to(`tribe-${tribeId}`).emit('user_muted', {
        userId,
        mutedBy,
        mutedUntil: chatSettings.mutedUntil,
        reason,
      });

      logger.info(`User ${userId} muted in tribe ${tribeId} by ${mutedBy}`);
      return chatSettings;

    } catch (error) {
      logger.error('Error muting user:', error);
      throw error;
    }
  },

  /**
   * Block a user
   * @param {string} userId - User ID blocking
   * @param {string} blockedUserId - User ID to block
   * @returns {Promise<Object>} Updated conversation
   */
  async blockUser(userId, blockedUserId) {
    try {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, blockedUserId] },
        isActive: true
      });

      if (conversation) {
        await conversation.blockUser(userId);
      }

      // Update chat settings
      let chatSettings = await ChatSettings.findOne({ userId });
      if (!chatSettings) {
        chatSettings = await ChatSettings.create({ userId, tribeId: null });
      }
      
      if (!chatSettings.blockedUsers.includes(blockedUserId)) {
        chatSettings.blockedUsers.push(blockedUserId);
        await chatSettings.save();
      }

      logger.info(`User ${userId} blocked ${blockedUserId}`);
      return conversation;

    } catch (error) {
      logger.error('Error blocking user:', error);
      throw error;
    }
  },

  /**
   * Get user's chat settings
   * @param {string} userId - User ID
   * @param {string} tribeId - Tribe ID
   * @returns {Promise<Object>} Chat settings
   */
  async getChatSettings(userId, tribeId) {
    try {
      let chatSettings = await ChatSettings.findOne({ userId, tribeId });
      
      if (!chatSettings) {
        chatSettings = await ChatSettings.create({ userId, tribeId });
      }

      return chatSettings;

    } catch (error) {
      logger.error('Error getting chat settings:', error);
      throw error;
    }
  },

  /**
   * Update chat settings
   * @param {string} userId - User ID
   * @param {string} tribeId - Tribe ID
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} Updated chat settings
   */
  async updateChatSettings(userId, tribeId, settings = {}) {
    try {
      let chatSettings = await ChatSettings.findOne({ userId, tribeId });
      
      if (!chatSettings) {
        chatSettings = await ChatSettings.create({ userId, tribeId });
      }

      // Update last message time and increment count
      chatSettings.lastMessageAt = new Date();
      chatSettings.messageCount += 1;

      // Update other settings if provided
      if (settings.notificationSettings) {
        chatSettings.notificationSettings = {
          ...chatSettings.notificationSettings,
          ...settings.notificationSettings,
        };
      }

      await chatSettings.save();
      return chatSettings;

    } catch (error) {
      logger.error('Error updating chat settings:', error);
      throw error;
    }
  },

  /**
   * Check rate limit for user
   * @param {string} userId - User ID
   * @returns {boolean} Whether user can send message
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = messageRateLimit.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      messageRateLimit.set(userId, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      });
      return true;
    }

    if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
      return false;
    }

    userLimit.count += 1;
    return true;
  },

  /**
   * Moderate content for inappropriate language
   * @param {string} text - Text to moderate
   * @returns {string} Moderated text
   */
  moderateContent(text) {
    let moderatedText = text;

    // Replace hate words
    HATE_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      moderatedText = moderatedText.replace(regex, '*'.repeat(word.length));
    });

    // Replace profanity
    PROFANITY_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      moderatedText = moderatedText.replace(regex, '*'.repeat(word.length));
    });

    return moderatedText;
  },

  /**
   * Extract mentions from text
   * @param {string} text - Text to parse
   * @returns {Array} Array of user IDs mentioned
   */
  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // This would need to be resolved to actual user IDs
    }

    return mentions;
  },

  /**
   * Send mention notifications
   * @param {Array} mentions - Array of mentioned usernames
   * @param {Object} message - Message object
   * @param {string} tribeId - Tribe ID
   */
  async sendMentionNotifications(mentions, message, tribeId) {
    try {
      for (const username of mentions) {
        const user = await User.findOne({ username });
        if (user) {
          const chatSettings = await ChatSettings.findOne({ userId: user._id });
          if (chatSettings && chatSettings.notificationSettings.mentions) {
            await notificationService.createNotification(user._id, {
              type: 'mention',
              title: `You were mentioned by ${message.senderId.displayName}`,
              message: message.text,
              deeplink: `/app/tribe/${tribeId}`,
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error sending mention notifications:', error);
    }
  },

  /**
   * Send announcement notifications
   * @param {string} tribeId - Tribe ID
   * @param {Object} message - Message object
   */
  async sendAnnouncementNotifications(tribeId, message) {
    try {
      const tribeMembers = await User.find({ tribe: tribeId }).select('_id');
      
      for (const member of tribeMembers) {
        const chatSettings = await ChatSettings.findOne({ userId: member._id });
        if (chatSettings && chatSettings.notificationSettings.announcements) {
          await notificationService.createNotification(member._id, {
            type: 'announcement',
            title: `Tribe Announcement from ${message.senderId.displayName}`,
            message: message.text,
            deeplink: `/app/tribe/${tribeId}`,
          });
        }
      }
    } catch (error) {
      logger.error('Error sending announcement notifications:', error);
    }
  },
};

module.exports = chatService;
