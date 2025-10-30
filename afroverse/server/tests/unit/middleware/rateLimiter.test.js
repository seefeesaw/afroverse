const rateLimiter = require('../../../src/middleware/rateLimiter');
const { getRedisClient } = require('../../../src/config/redis');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/config/redis');
jest.mock('express-rate-limit', () => jest.fn(() => jest.fn()));
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Rate Limiter Middleware', () => {
  let req, res, next;
  let mockRedis;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true)
    };

    getRedisClient.mockReturnValue(mockRedis);
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRedisRateLimit', () => {
    it('should skip rate limiting in development mode', async () => {
      process.env.NODE_ENV = 'development';
     
      // Get a rate limiter function
      const limiter = rateLimiter.generalLimiter;
     
      await limiter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should allow request within rate limit', async () => {
      mockRedis.get.mockResolvedValue('1');
     
      const limiter = rateLimiter.generalLimiter;
      await limiter(req, res, next);

      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.incr).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block request exceeding rate limit', async () => {
      const maxRequests = 100;
      mockRedis.get.mockResolvedValue(maxRequests.toString());

      const limiter = rateLimiter.generalLimiter;
      await limiter(req, res, next);

      expect(mockRedis.get).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Too many requests, please try again later'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const limiter = rateLimiter.generalLimiter;
      await limiter(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled(); // Should allow request on error
    });
  });

  describe('authStartLimiter', () => {
    it('should be a function', () => {
      expect(typeof rateLimiter.authStartLimiter).toBe('function');
    });
  });

  describe('authVerifyLimiter', () => {
    it('should be a function', () => {
      expect(typeof rateLimiter.authVerifyLimiter).toBe('function');
    });
  });

  describe('generalLimiter', () => {
    it('should be a function', () => {
      expect(typeof rateLimiter.generalLimiter).toBe('function');
    });
  });

  describe('expressRateLimit', () => {
    it('should be defined', () => {
      expect(rateLimiter.expressRateLimit).toBeDefined();
    });
  });
});

