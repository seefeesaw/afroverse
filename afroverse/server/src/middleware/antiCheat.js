const fraudDetectionService = require('../services/fraudDetectionService');
const trustScoreService = require('../services/trustScoreService');
const deviceFingerprintService = require('../services/deviceFingerprintService');
const { logger } = require('../utils/logger');

// Anti-cheat middleware for voting
const antiCheatVote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { battleId } = req.body;
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get geo data from headers or IP
    const geoData = {
      country: req.headers['x-country'] || null,
      region: req.headers['x-region'] || null,
      city: req.headers['x-city'] || null,
      coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null
    };
    
    // Check for vote fraud
    const fraudResult = await fraudDetectionService.detectVoteFraud(userId, battleId, deviceId, ipAddress, geoData);
    
    if (fraudResult.isFraud) {
      logger.warn(`Vote fraud detected for user ${userId}: ${fraudResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Vote not allowed',
        reason: fraudResult.reason
      });
    }
    
    // Check user permissions
    const permissions = await trustScoreService.checkUserPermissions(userId, 'vote');
    if (!permissions.allowed) {
      logger.warn(`User ${userId} not allowed to vote: ${permissions.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Vote not allowed',
        reason: permissions.reason
      });
    }
    
    // Add fraud detection data to request
    req.fraudDetection = {
      deviceId,
      ipAddress,
      geoData,
      fraudChecked: true
    };
    
    next();
  } catch (error) {
    logger.error('Error in anti-cheat vote middleware:', error);
    
    // Allow request to proceed if fraud detection fails
    next();
  }
};

// Anti-cheat middleware for battle creation
const antiCheatBattle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { challengerId, defenderId } = req.body;
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get geo data from headers or IP
    const geoData = {
      country: req.headers['x-country'] || null,
      region: req.headers['x-region'] || null,
      city: req.headers['x-city'] || null,
      coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null
    };
    
    // Check for spam battle
    const spamResult = await fraudDetectionService.detectSpamBattle(userId, req.body);
    
    if (spamResult.isFraud) {
      logger.warn(`Spam battle detected for user ${userId}: ${spamResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Battle not allowed',
        reason: spamResult.reason
      });
    }
    
    // Check for multi-account abuse
    const multiAccountResult = await fraudDetectionService.detectMultiAccount(userId, deviceId, ipAddress, geoData);
    
    if (multiAccountResult.isFraud) {
      logger.warn(`Multi-account abuse detected for user ${userId}: ${multiAccountResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Battle not allowed',
        reason: multiAccountResult.reason
      });
    }
    
    // Check user permissions
    const permissions = await trustScoreService.checkUserPermissions(userId, 'create_battle');
    if (!permissions.allowed) {
      logger.warn(`User ${userId} not allowed to create battles: ${permissions.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Battle not allowed',
        reason: permissions.reason
      });
    }
    
    // Add fraud detection data to request
    req.fraudDetection = {
      deviceId,
      ipAddress,
      geoData,
      fraudChecked: true
    };
    
    next();
  } catch (error) {
    logger.error('Error in anti-cheat battle middleware:', error);
    
    // Allow request to proceed if fraud detection fails
    next();
  }
};

// Anti-cheat middleware for transformation creation
const antiCheatTransform = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { prompt, style } = req.body;
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get geo data from headers or IP
    const geoData = {
      country: req.headers['x-country'] || null,
      region: req.headers['x-region'] || null,
      city: req.headers['x-city'] || null,
      coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null
    };
    
    // Check for AI abuse
    const aiAbuseResult = await fraudDetectionService.detectAIAbuse(userId, prompt, style, req.file?.path);
    
    if (aiAbuseResult.isFraud) {
      logger.warn(`AI abuse detected for user ${userId}: ${aiAbuseResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Transformation not allowed',
        reason: aiAbuseResult.reason
      });
    }
    
    // Check for multi-account abuse
    const multiAccountResult = await fraudDetectionService.detectMultiAccount(userId, deviceId, ipAddress, geoData);
    
    if (multiAccountResult.isFraud) {
      logger.warn(`Multi-account abuse detected for user ${userId}: ${multiAccountResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Transformation not allowed',
        reason: multiAccountResult.reason
      });
    }
    
    // Check user permissions
    const permissions = await trustScoreService.checkUserPermissions(userId, 'transform');
    if (!permissions.allowed) {
      logger.warn(`User ${userId} not allowed to create transformations: ${permissions.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Transformation not allowed',
        reason: permissions.reason
      });
    }
    
    // Add fraud detection data to request
    req.fraudDetection = {
      deviceId,
      ipAddress,
      geoData,
      fraudChecked: true
    };
    
    next();
  } catch (error) {
    logger.error('Error in anti-cheat transform middleware:', error);
    
    // Allow request to proceed if fraud detection fails
    next();
  }
};

// Anti-cheat middleware for general activity
const antiCheatActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activityType = req.route.path.split('/').pop(); // Get activity type from route
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get geo data from headers or IP
    const geoData = {
      country: req.headers['x-country'] || null,
      region: req.headers['x-region'] || null,
      city: req.headers['x-city'] || null,
      coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null
    };
    
    // Check for suspicious activity
    const suspiciousResult = await fraudDetectionService.detectSuspiciousActivity(userId, activityType, req.body);
    
    if (suspiciousResult.isFraud) {
      logger.warn(`Suspicious activity detected for user ${userId}: ${suspiciousResult.reason}`);
      
      return res.status(403).json({
        success: false,
        message: 'Activity not allowed',
        reason: suspiciousResult.reason
      });
    }
    
    // Add fraud detection data to request
    req.fraudDetection = {
      deviceId,
      ipAddress,
      geoData,
      fraudChecked: true
    };
    
    next();
  } catch (error) {
    logger.error('Error in anti-cheat activity middleware:', error);
    
    // Allow request to proceed if fraud detection fails
    next();
  }
};

// Device fingerprint middleware
const deviceFingerprint = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (deviceId) {
      // Get geo data from headers or IP
      const geoData = {
        country: req.headers['x-country'] || null,
        region: req.headers['x-region'] || null,
        city: req.headers['x-city'] || null,
        coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null,
        isp: req.headers['x-isp'] || null
      };
      
      // Get device info from headers
      const deviceInfo = {
        userAgent: req.headers['user-agent'] || null,
        platform: req.headers['x-platform'] || 'web',
        screenResolution: req.headers['x-screen-resolution'] || null,
        timezone: req.headers['x-timezone'] || null,
        language: req.headers['x-language'] || null,
        browser: req.headers['x-browser'] || null,
        os: req.headers['x-os'] || null
      };
      
      // Update device fingerprint
      await deviceFingerprintService.updateDeviceFingerprint(deviceId, userId, deviceInfo, ipAddress, geoData);
    }
    
    next();
  } catch (error) {
    logger.error('Error in device fingerprint middleware:', error);
    
    // Allow request to proceed if device fingerprint fails
    next();
  }
};

// Trust score middleware
const trustScoreCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user trust score
    const trustScore = await trustScoreService.getTrustScoreByUser(userId);
    
    if (trustScore.success) {
      req.userTrustScore = trustScore.trustScore;
      
      // Check if user is shadowbanned
      if (trustScore.trustScore.flags.isShadowBanned) {
        logger.info(`User ${userId} is shadowbanned`);
      }
      
      // Check if user is temporarily banned
      if (trustScore.trustScore.flags.isTemporarilyBanned) {
        logger.info(`User ${userId} is temporarily banned`);
      }
      
      // Check if user is permanently banned
      if (trustScore.trustScore.flags.isPermanentlyBanned) {
        logger.info(`User ${userId} is permanently banned`);
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error in trust score middleware:', error);
    
    // Allow request to proceed if trust score check fails
    next();
  }
};

// Rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Get or create request record
    let requestRecord = requests.get(ip);
    if (!requestRecord) {
      requestRecord = {
        count: 0,
        timestamp: now
      };
      requests.set(ip, requestRecord);
    }
    
    // Check if within window
    if (requestRecord.timestamp >= windowStart) {
      requestRecord.count++;
      
      if (requestRecord.count > max) {
        logger.warn(`Rate limit exceeded for IP ${ip}: ${requestRecord.count} requests`);
        
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil((requestRecord.timestamp + windowMs - now) / 1000)
        });
      }
    } else {
      // Reset count for new window
      requestRecord.count = 1;
      requestRecord.timestamp = now;
    }
    
    next();
  };
};

// IP whitelist middleware
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(ip)) {
      logger.warn(`IP ${ip} not in whitelist`);
      
      return res.status(403).json({
        success: false,
        message: 'IP address not allowed'
      });
    }
    
    next();
  };
};

// Geo-blocking middleware
const geoBlock = (blockedCountries = []) => {
  return (req, res, next) => {
    const country = req.headers['x-country'];
    
    if (country && blockedCountries.includes(country)) {
      logger.warn(`Request blocked from country ${country}`);
      
      return res.status(403).json({
        success: false,
        message: 'Access not allowed from this location'
      });
    }
    
    next();
  };
};

// Bot detection middleware
const botDetection = async (req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['x-device-id'] || req.headers['x-fingerprint'];
    
    // Check for common bot user agents
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];
    
    if (userAgent && botPatterns.some(pattern => pattern.test(userAgent))) {
      logger.warn(`Bot detected: ${userAgent}`);
      
      return res.status(403).json({
        success: false,
        message: 'Bot access not allowed'
      });
    }
    
    // Check device fingerprint for bot behavior
    if (deviceId) {
      const deviceFingerprint = await deviceFingerprintService.getDeviceFingerprintByFingerprint(deviceId);
      
      if (deviceFingerprint && deviceFingerprint.flags.isBot) {
        logger.warn(`Bot device detected: ${deviceId}`);
        
        return res.status(403).json({
          success: false,
          message: 'Bot access not allowed'
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error in bot detection middleware:', error);
    
    // Allow request to proceed if bot detection fails
    next();
  }
};

module.exports = {
  antiCheatVote,
  antiCheatBattle,
  antiCheatTransform,
  antiCheatActivity,
  deviceFingerprint,
  trustScoreCheck,
  rateLimit,
  ipWhitelist,
  geoBlock,
  botDetection
};
