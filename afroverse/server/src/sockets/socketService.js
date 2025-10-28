const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transformation = require('../models/Transformation');
const chatSocketHandlers = require('./chatSocketHandlers');
const { logger } = require('../utils/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  // Initialize Socket.IO
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.IO initialized');
  }

  // Setup authentication middleware
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'access') {
          return next(new Error('Authentication error: Invalid token type'));
        }

        // Verify user exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
          return next(new Error('Authentication error: User not found or inactive'));
        }

        socket.userId = decoded.userId;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  // Setup event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      const username = socket.user.username;
      
      logger.info(`User connected: ${username} (${userId})`);
      
      // Store connected user
      this.connectedUsers.set(userId, {
        socketId: socket.id,
        username,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user:${userId}`);

      // Join user to their tribe room if they have one
      if (socket.user && socket.user.tribe && socket.user.tribe.id) {
        socket.join(`tribe:${socket.user.tribe.id.toString()}`);
        logger.info(`User ${username} joined tribe room: ${socket.user.tribe.id}`);
      }

      // Initialize chat handlers
      chatSocketHandlers.handleConnection(socket);

      // Handle watching transformation
      socket.on('watch-transform', (jobId) => {
        logger.info(`User ${username} watching transformation: ${jobId}`);
        socket.join(`transform:${jobId}`);
      });

      // Handle unwatching transformation
      socket.on('unwatch-transform', (jobId) => {
        logger.info(`User ${username} unwatching transformation: ${jobId}`);
        socket.leave(`transform:${jobId}`);
      });

      // Handle joining battle room
      socket.on('join-battle', (battleId) => {
        logger.info(`User ${username} joining battle: ${battleId}`);
        socket.join(`battle:${battleId}`);
      });

      // Handle leaving battle room
      socket.on('leave-battle', (battleId) => {
        logger.info(`User ${username} leaving battle: ${battleId}`);
        socket.leave(`battle:${battleId}`);
      });

      // Handle joining leaderboard room
      socket.on('join-leaderboard', (data) => {
        const { scope, period, country } = data;
        logger.info(`User ${username} joining leaderboard: ${scope}-${period}${country ? `-${country}` : ''}`);
        
        if (scope === 'tribes') {
          socket.join(`lb:tribes:${period}`);
        } else if (scope === 'users') {
          if (country) {
            socket.join(`lb:users:${period}:country:${country}`);
          } else {
            socket.join(`lb:users:${period}`);
          }
        }
      });

      // Handle leaving leaderboard room
      socket.on('leave-leaderboard', (data) => {
        const { scope, period, country } = data;
        logger.info(`User ${username} leaving leaderboard: ${scope}-${period}${country ? `-${country}` : ''}`);
        
        if (scope === 'tribes') {
          socket.leave(`lb:tribes:${period}`);
        } else if (scope === 'users') {
          if (country) {
            socket.leave(`lb:users:${period}:country:${country}`);
          } else {
            socket.leave(`lb:users:${period}`);
          }
        }
      });

      // Handle joining tribe room
      socket.on('join-tribe', (tribeId) => {
        logger.info(`User ${username} joining tribe: ${tribeId}`);
        socket.join(`tribe:${tribeId}`);
      });

      // Handle leaving tribe room
      socket.on('leave-tribe', (tribeId) => {
        logger.info(`User ${username} leaving tribe: ${tribeId}`);
        socket.leave(`tribe:${tribeId}`);
      });

      // Handle progression events
      socket.on('join-progression', () => {
        logger.info(`User ${username} joining progression room`);
        socket.join(`progression:${userId}`);
      });

      socket.on('leave-progression', () => {
        logger.info(`User ${username} leaving progression room`);
        socket.leave(`progression:${userId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${username} (${userId})`);
        this.connectedUsers.delete(userId);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Afroverse',
        userId,
        username
      });
    });
  }

  // Emit transformation completion
  emitTransformationComplete(jobId, transformationData) {
    if (!this.io) return;

    this.io.to(`transform:${jobId}`).emit('transform-complete', {
      jobId,
      ...transformationData
    });

    logger.info(`Transformation complete event sent for job: ${jobId}`);
  }

  // Emit transformation progress
  emitTransformationProgress(jobId, progress) {
    if (!this.io) return;

    this.io.to(`transform:${jobId}`).emit('transform-progress', {
      jobId,
      progress
    });
  }

  // Emit transformation error
  emitTransformationError(jobId, error) {
    if (!this.io) return;

    this.io.to(`transform:${jobId}`).emit('transform-error', {
      jobId,
      error
    });

    logger.error(`Transformation error event sent for job: ${jobId}`, error);
  }

  // Emit battle update
  emitBattleUpdate(battleId, updateData) {
    if (!this.io) return;

    this.io.to(`battle:${battleId}`).emit('battle-update', {
      battleId,
      ...updateData
    });

    logger.info(`Battle update event sent for battle: ${battleId}`);
  }

  // Emit notification to user
  emitUserNotification(userId, notification) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('notification', notification);
    
    logger.info(`Notification sent to user: ${userId}`);
  }

  // Emit leaderboard update
  emitLeaderboardUpdate(scope, period, updateData) {
    if (!this.io) return;

    const room = scope === 'tribes' ? `lb:tribes:${period}` : `lb:users:${period}`;
    
    this.io.to(room).emit('lb_delta', {
      scope,
      period,
      changes: [updateData]
    });

    logger.info(`Leaderboard update sent to ${room}`);
  }

  // Emit leaderboard reset
  emitLeaderboardReset(resetData) {
    if (!this.io) return;

    this.io.emit('lb_reset', resetData);
    logger.info('Leaderboard reset event sent');
  }

  // Emit progression update
  emitProgressionUpdate(userId, updateData) {
    if (!this.io) return;

    this.io.to(`progression:${userId}`).emit('progression_update', updateData);
    logger.info(`Progression update sent to user: ${userId}`);
  }

  // Emit streak update
  emitStreakUpdate(userId, updateData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('streak_update', updateData);
    logger.info(`Streak update sent to user: ${userId}`);
  }

  // Emit XP gain
  emitXpGain(userId, updateData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('xp_gain', updateData);
    logger.info(`XP gain sent to user: ${userId}`);
  }

  // Emit level up
  emitLevelUp(userId, updateData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('level_up', updateData);
    logger.info(`Level up sent to user: ${userId}`);
  }

  // Emit reward granted
  emitRewardGranted(userId, updateData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('reward_granted', updateData);
    logger.info(`Reward granted sent to user: ${userId}`);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (!this.io) return;

    this.io.emit(event, data);
    logger.info(`Broadcast event sent: ${event}`);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get user's socket
  getUserSocket(userId) {
    const userData = this.connectedUsers.get(userId);
    if (!userData) return null;
    
    return this.io.sockets.sockets.get(userData.socketId);
  }

  // Emit tribe update
  emitTribeUpdate(tribeId, updateData) {
    if (!this.io) return;

    this.io.to(`tribe:${tribeId}`).emit('tribe_update', {
      tribeId,
      ...updateData
    });

    logger.info(`Tribe update event sent for tribe: ${tribeId}`);
  }

  // Emit weekly reset for all tribes
  emitWeeklyReset(resetData) {
    if (!this.io) return;

    this.io.emit('tribe_weekly_reset', resetData);
    logger.info('Tribe weekly reset event sent');
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
