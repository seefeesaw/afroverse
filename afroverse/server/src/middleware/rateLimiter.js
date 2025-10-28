const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

// Redis-based rate limiter
const createRedisRateLimit = (windowMs, maxRequests, keyGenerator) => {
  return async (req, res, next) => {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const redisKey = `rate_limit:${key}:${window}`;

      const redis = getRedisClient();
      const current = await redis.get(redisKey);
      const count = current ? parseInt(current) : 0;

      if (count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      await redis.incr(redisKey);
      await redis.expire(redisKey, Math.ceil(windowMs / 1000));

      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      // If Redis fails, allow the request to proceed
      next();
    }
  };
};

// Auth start rate limiter (5 requests per hour per IP)
const authStartLimiter = createRedisRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // max 5 requests
  (req) => `auth_start:${req.ip}`
);

// Auth verify rate limiter (10 requests per hour per IP)
const authVerifyLimiter = createRedisRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // max 10 requests
  (req) => `auth_verify:${req.ip}`
);

// General API rate limiter (100 requests per 15 minutes per IP)
const generalLimiter = createRedisRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests
  (req) => `general:${req.ip}`
);

// Express rate limiter fallback
const expressRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authStartLimiter,
  authVerifyLimiter,
  generalLimiter,
  expressRateLimit
};
