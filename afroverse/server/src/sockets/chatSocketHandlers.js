const { logger } = require('../utils/logger');
const chatService = require('../services/chatService');
const User = require('../models/User');
const Tribe = require('../models/Tribe');

// Store active connections
const activeConnections = new Map(); // userId -> socketId
const tribeRooms = new Map(); // tribeId -> Set of userIds

const chatSocketHandlers = {
  /**
   * Handle new socket connection
   * @param {Object} socket - Socket.IO socket instance
   */
  handleConnection(socket) {
    logger.info(`New socket connection: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', async (data) => {
      try {
        const { userId, token } = data;
        
        // Verify token (you might want to use JWT verification here)
        const user = await User.findById(userId).select('username displayName avatar tribe');
        if (!user) {
          socket.emit('auth_error', { message: 'Invalid user' });
          return;
        }

        // Store connection
        activeConnections.set(userId, socket.id);
        socket.userId = userId;
        socket.user = user;

        // Join user to their tribe room if they have one
        if (user.tribe) {
          await this.joinTribeRoom(socket, user.tribe.toString());
        }

        socket.emit('authenticated', {
          userId: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          tribe: user.tribe,
        });

        logger.info(`User ${user.username} authenticated on socket ${socket.id}`);

      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Tribe chat events
    socket.on('join_tribe', async (data) => {
      try {
        const { tribeId } = data;
        await this.joinTribeRoom(socket, tribeId);
      } catch (error) {
        logger.error('Error joining tribe room:', error);
        socket.emit('error', { message: 'Failed to join tribe chat' });
      }
    });

    socket.on('leave_tribe', async (data) => {
      try {
        const { tribeId } = data;
        await this.leaveTribeRoom(socket, tribeId);
      } catch (error) {
        logger.error('Error leaving tribe room:', error);
      }
    });

    socket.on('send_tribe_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { tribeId, text, replyTo, type } = data;
        
        // Validate input
        if (!text || text.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (text.length > 280) {
          socket.emit('error', { message: 'Message too long (max 280 characters)' });
          return;
        }

        const message = await chatService.sendTribeMessage(
          tribeId,
          socket.userId,
          text.trim(),
          replyTo,
          type || 'message'
        );

        socket.emit('message_sent', { messageId: message._id });

      } catch (error) {
        logger.error('Error sending tribe message:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('react_to_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { messageId, emoji } = data;
        
        if (!['❤️', '🔥', '😂', '👍'].includes(emoji)) {
          socket.emit('error', { message: 'Invalid emoji' });
          return;
        }

        await chatService.toggleReaction(messageId, socket.userId, emoji);

      } catch (error) {
        logger.error('Error reacting to message:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Direct message events
    socket.on('join_dm', async (data) => {
      try {
        const { otherUserId } = data;
        const roomName = this.getDmRoomName(socket.userId, otherUserId);
        socket.join(roomName);
        
        logger.info(`User ${socket.userId} joined DM room: ${roomName}`);
      } catch (error) {
        logger.error('Error joining DM room:', error);
        socket.emit('error', { message: 'Failed to join DM' });
      }
    });

    socket.on('leave_dm', async (data) => {
      try {
        const { otherUserId } = data;
        const roomName = this.getDmRoomName(socket.userId, otherUserId);
        socket.leave(roomName);
        
        logger.info(`User ${socket.userId} left DM room: ${roomName}`);
      } catch (error) {
        logger.error('Error leaving DM room:', error);
      }
    });

    socket.on('send_dm', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { receiverId, text } = data;
        
        // Validate input
        if (!text || text.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (text.length > 280) {
          socket.emit('error', { message: 'Message too long (max 280 characters)' });
          return;
        }

        const message = await chatService.sendDirectMessage(
          socket.userId,
          receiverId,
          text.trim()
        );

        socket.emit('dm_sent', { messageId: message._id });

      } catch (error) {
        logger.error('Error sending DM:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('mark_dm_read', async (data) => {
      try {
        const { conversationId } = data;
        await chatService.markMessagesAsRead(conversationId, socket.userId);
      } catch (error) {
        logger.error('Error marking DM as read:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      try {
        const { tribeId, type } = data; // type: 'tribe' or 'dm'
        
        if (type === 'tribe' && tribeId) {
          socket.to(`tribe-${tribeId}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            type: 'start',
          });
        } else if (type === 'dm' && data.otherUserId) {
          const roomName = this.getDmRoomName(socket.userId, data.otherUserId);
          socket.to(roomName).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            type: 'start',
          });
        }
      } catch (error) {
        logger.error('Error handling typing start:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { tribeId, type } = data;
        
        if (type === 'tribe' && tribeId) {
          socket.to(`tribe-${tribeId}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            type: 'stop',
          });
        } else if (type === 'dm' && data.otherUserId) {
          const roomName = this.getDmRoomName(socket.userId, data.otherUserId);
          socket.to(roomName).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            type: 'stop',
          });
        }
      } catch (error) {
        logger.error('Error handling typing stop:', error);
      }
    });

    // Online status
    socket.on('update_online_status', async (data) => {
      try {
        const { isOnline } = data;
        
        if (socket.userId) {
          // Update user's online status
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline,
            lastSeen: new Date(),
          });

          // Broadcast status change to tribe members
          if (socket.user.tribe) {
            socket.to(`tribe-${socket.user.tribe}`).emit('user_status_change', {
              userId: socket.userId,
              isOnline,
              lastSeen: new Date(),
            });
          }
        }
      } catch (error) {
        logger.error('Error updating online status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          // Remove from active connections
          activeConnections.delete(socket.userId);
          
          // Update user's online status
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline: false,
            lastSeen: new Date(),
          });

          // Broadcast offline status to tribe members
          if (socket.user && socket.user.tribe) {
            socket.to(`tribe-${socket.user.tribe}`).emit('user_status_change', {
              userId: socket.userId,
              isOnline: false,
              lastSeen: new Date(),
            });
          }

          logger.info(`User ${socket.userId} disconnected from socket ${socket.id}`);
        }
      } catch (error) {
        logger.error('Error handling disconnect:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  },

  /**
   * Join tribe room
   * @param {Object} socket - Socket instance
   * @param {string} tribeId - Tribe ID
   */
  async joinTribeRoom(socket, tribeId) {
    try {
      // Verify user is member of tribe
      const user = await User.findById(socket.userId).populate('tribe');
      if (!user || !user.tribe || user.tribe._id.toString() !== tribeId) {
        socket.emit('error', { message: 'Not a member of this tribe' });
        return;
      }

      // Join socket room
      socket.join(`tribe-${tribeId}`);
      
      // Update tribe room tracking
      if (!tribeRooms.has(tribeId)) {
        tribeRooms.set(tribeId, new Set());
      }
      tribeRooms.get(tribeId).add(socket.userId);

      // Broadcast user joined
      socket.to(`tribe-${tribeId}`).emit('user_joined_chat', {
        userId: socket.userId,
        username: socket.user.username,
        displayName: socket.user.displayName,
        avatar: socket.user.avatar,
      });

      logger.info(`User ${socket.userId} joined tribe room: tribe-${tribeId}`);

    } catch (error) {
      logger.error('Error joining tribe room:', error);
      throw error;
    }
  },

  /**
   * Leave tribe room
   * @param {Object} socket - Socket instance
   * @param {string} tribeId - Tribe ID
   */
  async leaveTribeRoom(socket, tribeId) {
    try {
      socket.leave(`tribe-${tribeId}`);
      
      // Update tribe room tracking
      if (tribeRooms.has(tribeId)) {
        tribeRooms.get(tribeId).delete(socket.userId);
        if (tribeRooms.get(tribeId).size === 0) {
          tribeRooms.delete(tribeId);
        }
      }

      // Broadcast user left
      socket.to(`tribe-${tribeId}`).emit('user_left_chat', {
        userId: socket.userId,
        username: socket.user.username,
      });

      logger.info(`User ${socket.userId} left tribe room: tribe-${tribeId}`);

    } catch (error) {
      logger.error('Error leaving tribe room:', error);
      throw error;
    }
  },

  /**
   * Get DM room name for two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Room name
   */
  getDmRoomName(userId1, userId2) {
    // Sort IDs to ensure consistent room naming
    const sortedIds = [userId1, userId2].sort();
    return `dm-${sortedIds[0]}-${sortedIds[1]}`;
  },

  /**
   * Get online count for tribe
   * @param {string} tribeId - Tribe ID
   * @returns {number} Online count
   */
  getTribeOnlineCount(tribeId) {
    return tribeRooms.has(tribeId) ? tribeRooms.get(tribeId).size : 0;
  },

  /**
   * Get all active connections
   * @returns {Map} Active connections map
   */
  getActiveConnections() {
    return activeConnections;
  },

  /**
   * Get tribe rooms
   * @returns {Map} Tribe rooms map
   */
  getTribeRooms() {
    return tribeRooms;
  },

  /**
   * Send message to specific user
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  sendToUser(userId, event, data) {
    const socketId = activeConnections.get(userId);
    if (socketId) {
      const io = require('./socketService').io;
      io.to(socketId).emit(event, data);
    }
  },

  /**
   * Send message to tribe
   * @param {string} tribeId - Tribe ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  sendToTribe(tribeId, event, data) {
    const io = require('./socketService').io;
    io.to(`tribe-${tribeId}`).emit(event, data);
  },

  /**
   * Broadcast to all connected users
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcastToAll(event, data) {
    const io = require('./socketService').io;
    io.emit(event, data);
  },
};

module.exports = chatSocketHandlers;
