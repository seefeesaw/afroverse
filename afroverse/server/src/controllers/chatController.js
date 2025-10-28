const chatService = require('../services/chatService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const chatController = {
  /**
   * POST /api/chat/tribe/:tribeId/send
   * Send a message to tribe chat
   */
  async sendTribeMessage(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { tribeId } = req.params;
      const { text, replyTo, type } = req.body;
      const senderId = req.user.id;

      const message = await chatService.sendTribeMessage(
        tribeId,
        senderId,
        text,
        replyTo,
        type || 'message'
      );

      res.status(201).json({
        success: true,
        message: {
          _id: message._id,
          text: message.text,
          senderId: message.senderId,
          type: message.type,
          replyTo: message.replyTo,
          mentions: message.mentions,
          reactions: message.reactions,
          createdAt: message.createdAt,
        }
      });

    } catch (error) {
      logger.error('Error sending tribe message:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to send message' 
      });
    }
  },

  /**
   * GET /api/chat/tribe/:tribeId/messages
   * Get tribe chat messages with pagination
   */
  async getTribeMessages(req, res) {
    try {
      const { tribeId } = req.params;
      const { cursor, limit = 50 } = req.query;

      const messages = await chatService.getTribeMessages(tribeId, cursor, parseInt(limit));

      res.status(200).json({
        success: true,
        messages: messages.map(msg => ({
          _id: msg._id,
          text: msg.text,
          senderId: msg.senderId,
          type: msg.type,
          replyTo: msg.replyTo,
          mentions: msg.mentions,
          reactions: msg.reactions,
          reactionCounts: msg.reactionCounts,
          createdAt: msg.createdAt,
        })),
        hasMore: messages.length === parseInt(limit),
        nextCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
      });

    } catch (error) {
      logger.error('Error fetching tribe messages:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch messages' 
      });
    }
  },

  /**
   * POST /api/chat/dm/:userId/send
   * Send a direct message
   */
  async sendDirectMessage(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId: receiverId } = req.params;
      const { text } = req.body;
      const senderId = req.user.id;

      if (senderId === receiverId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot send message to yourself' 
        });
      }

      const message = await chatService.sendDirectMessage(senderId, receiverId, text);

      res.status(201).json({
        success: true,
        message: {
          _id: message._id,
          text: message.text,
          senderId: message.senderId,
          receiverId: message.receiverId,
          isRead: message.isRead,
          createdAt: message.createdAt,
        }
      });

    } catch (error) {
      logger.error('Error sending direct message:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to send message' 
      });
    }
  },

  /**
   * GET /api/chat/dm/:userId/messages
   * Get direct message conversation
   */
  async getDirectMessages(req, res) {
    try {
      const { userId: otherUserId } = req.params;
      const { cursor, limit = 50 } = req.query;
      const currentUserId = req.user.id;

      const messages = await chatService.getDirectMessages(
        currentUserId, 
        otherUserId, 
        cursor, 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        messages: messages.map(msg => ({
          _id: msg._id,
          text: msg.text,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        })),
        hasMore: messages.length === parseInt(limit),
        nextCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
      });

    } catch (error) {
      logger.error('Error fetching direct messages:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch messages' 
      });
    }
  },

  /**
   * POST /api/chat/react
   * Add or remove reaction to a message
   */
  async toggleReaction(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { messageId, emoji } = req.body;
      const userId = req.user.id;

      const message = await chatService.toggleReaction(messageId, userId, emoji);

      res.status(200).json({
        success: true,
        message: {
          _id: message._id,
          reactions: message.reactions,
          reactionCounts: message.reactionCounts,
        }
      });

    } catch (error) {
      logger.error('Error toggling reaction:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to toggle reaction' 
      });
    }
  },

  /**
   * POST /api/chat/dm/:conversationId/read
   * Mark direct messages as read
   */
  async markMessagesAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const conversation = await chatService.markMessagesAsRead(conversationId, userId);

      res.status(200).json({
        success: true,
        conversation: {
          _id: conversation._id,
          unreadCount: conversation.unreadCount.get(userId.toString()) || 0,
        }
      });

    } catch (error) {
      logger.error('Error marking messages as read:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to mark messages as read' 
      });
    }
  },

  /**
   * POST /api/chat/tribe/:tribeId/mute/:userId
   * Mute a user in tribe chat (Captain only)
   */
  async muteUser(req, res) {
    try {
      const { tribeId, userId } = req.params;
      const { durationHours = 24, reason } = req.body;
      const mutedBy = req.user.id;

      // Check if user is captain of the tribe
      const Tribe = require('../models/Tribe');
      const tribe = await Tribe.findById(tribeId);
      if (!tribe || tribe.captain.toString() !== mutedBy.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only tribe captains can mute members' 
        });
      }

      const chatSettings = await chatService.muteUser(
        tribeId, 
        userId, 
        mutedBy, 
        durationHours, 
        reason
      );

      res.status(200).json({
        success: true,
        message: 'User muted successfully',
        mutedUntil: chatSettings.mutedUntil,
      });

    } catch (error) {
      logger.error('Error muting user:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to mute user' 
      });
    }
  },

  /**
   * POST /api/chat/block/:userId
   * Block a user
   */
  async blockUser(req, res) {
    try {
      const { userId: blockedUserId } = req.params;
      const currentUserId = req.user.id;

      if (currentUserId === blockedUserId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot block yourself' 
        });
      }

      await chatService.blockUser(currentUserId, blockedUserId);

      res.status(200).json({
        success: true,
        message: 'User blocked successfully',
      });

    } catch (error) {
      logger.error('Error blocking user:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to block user' 
      });
    }
  },

  /**
   * GET /api/chat/settings
   * Get user's chat settings
   */
  async getChatSettings(req, res) {
    try {
      const userId = req.user.id;
      const { tribeId } = req.query;

      if (!tribeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tribe ID is required' 
        });
      }

      const chatSettings = await chatService.getChatSettings(userId, tribeId);

      res.status(200).json({
        success: true,
        settings: {
          isMuted: chatSettings.isMuted,
          mutedUntil: chatSettings.mutedUntil,
          muteReason: chatSettings.muteReason,
          isShadowbanned: chatSettings.isShadowbanned,
          shadowbanUntil: chatSettings.shadowbanUntil,
          shadowbanReason: chatSettings.shadowbanReason,
          notificationSettings: chatSettings.notificationSettings,
          blockedUsers: chatSettings.blockedUsers,
        }
      });

    } catch (error) {
      logger.error('Error getting chat settings:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get chat settings' 
      });
    }
  },

  /**
   * PUT /api/chat/settings
   * Update user's chat settings
   */
  async updateChatSettings(req, res) {
    try {
      const userId = req.user.id;
      const { tribeId, notificationSettings } = req.body;

      if (!tribeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tribe ID is required' 
        });
      }

      const chatSettings = await chatService.updateChatSettings(
        userId, 
        tribeId, 
        { notificationSettings }
      );

      res.status(200).json({
        success: true,
        settings: {
          notificationSettings: chatSettings.notificationSettings,
        }
      });

    } catch (error) {
      logger.error('Error updating chat settings:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to update chat settings' 
      });
    }
  },

  /**
   * GET /api/chat/conversations
   * Get user's DM conversations
   */
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, cursor } = req.query;

      const Conversation = require('../models/Conversation');
      const User = require('../models/User');

      const query = { 
        participants: userId, 
        isActive: true 
      };

      if (cursor) {
        const lastConversation = await Conversation.findById(cursor);
        if (lastConversation) {
          query.lastMessageAt = { $lt: lastConversation.lastMessageAt };
        }
      }

      const conversations = await Conversation.find(query)
        .populate('participants', 'username displayName avatar')
        .populate('lastMessage.senderId', 'username displayName')
        .sort({ lastMessageAt: -1 })
        .limit(parseInt(limit));

      const formattedConversations = conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
        return {
          _id: conv._id,
          otherParticipant: {
            _id: otherParticipant._id,
            username: otherParticipant.username,
            displayName: otherParticipant.displayName,
            avatar: otherParticipant.avatar,
          },
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount.get(userId.toString()) || 0,
        };
      });

      res.status(200).json({
        success: true,
        conversations: formattedConversations,
        hasMore: conversations.length === parseInt(limit),
        nextCursor: conversations.length > 0 ? conversations[conversations.length - 1]._id : null,
      });

    } catch (error) {
      logger.error('Error fetching conversations:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch conversations' 
      });
    }
  },
};

module.exports = chatController;
