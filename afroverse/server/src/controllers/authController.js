const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWhatsAppOTP } = require('../services/whatsappService');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Start authentication process
const startAuth = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with 5-minute TTL
    const otpKey = `otp:${phone}`;
    await redisClient.setEx(otpKey, 300, JSON.stringify({
      code: otp,
      attempts: 0,
      createdAt: Date.now()
    }));
    
    // Send OTP via WhatsApp
    try {
      await sendWhatsAppOTP(phone, otp);
      logger.info(`OTP sent to ${phone}`);
    } catch (whatsappError) {
      logger.error('WhatsApp OTP failed:', whatsappError);
      // Continue anyway - OTP is stored in Redis
    }
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
  } catch (error) {
    logger.error('Start auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP and authenticate user
const verifyAuth = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Get OTP from Redis
    const otpKey = `otp:${phone}`;
    const otpData = await redisClient.get(otpKey);
    
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid'
      });
    }
    
    const { code, attempts } = JSON.parse(otpData);
    
    // Check brute force protection
    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again in 10 minutes.'
      });
    }
    
    // Verify OTP
    if (code !== otp) {
      // Increment attempts
      await redisClient.setEx(otpKey, 300, JSON.stringify({
        code,
        attempts: attempts + 1,
        createdAt: Date.now()
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code'
      });
    }
    
    // OTP is correct - delete from Redis
    await redisClient.del(otpKey);
    
    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user with auto-generated username
      const username = await User.generateUsername();
      user = new User({
        phone,
        username,
        lastLoginAt: new Date()
      });
      await user.save();
      logger.info(`New user created: ${username} (${phone})`);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user data and access token
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        phone: user.phone,
        username: user.username,
        avatar: user.avatar,
        tribe: user.tribe,
        subscription: user.subscription,
        limits: user.limits,
        createdAt: user.createdAt
      },
      accessToken
    });
    
  } catch (error) {
    logger.error('Verify auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Generate new access token
    const { accessToken } = generateTokens(user._id);
    
    res.json({
      success: true,
      accessToken
    });
    
  } catch (error) {
    logger.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check and reset daily limits if needed
    await user.checkDailyLimits();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        username: user.username,
        avatar: user.avatar,
        tribe: user.tribe,
        subscription: user.subscription,
        limits: user.limits,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
    
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  startAuth,
  verifyAuth,
  refreshToken,
  getMe,
  logout
};
