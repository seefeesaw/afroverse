const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const http = require('http');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');
const socketService = require('./sockets/socketService');
const { initializeSchedules: initializeLeaderboardSchedules } = require('./queues/leaderboardQueue');
const { initializeSchedules: initializeProgressionSchedules } = require('./queues/progressionQueue');
const { initializeSchedules: initializeNotificationSchedules } = require('./queues/notificationQueue');
const { initializeSchedules: initializePaymentSchedules } = require('./queues/paymentQueue');
const { initializeQueue: initializeVideoQueue } = require('./workers/videoWorker');
const { initializeQueue: initializeReferralQueue } = require('./workers/referralWorker');
const { initializeQueue: initializeChallengeQueue } = require('./workers/challengeWorker');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afroverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize services
const initializeServices = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    // Initialize Socket.IO
    socketService.initialize(server);
    
    // Initialize queue schedules
    initializeLeaderboardSchedules();
    initializeProgressionSchedules();
    initializeNotificationSchedules();
    initializePaymentSchedules();
    initializeVideoQueue();
    initializeReferralQueue();
    initializeChallengeQueue();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { app, server, initializeServices };
