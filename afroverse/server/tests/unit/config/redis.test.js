const redisConfig = require('../../../src/config/redis');
const redis = require('redis');
const { logger } = require('../../../src/utils/logger');

jest.mock('redis');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Redis Config', () => {
  let mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn()
    };

    redis.createClient.mockReturnValue(mockRedisClient);
  });

  afterEach(async () => {
    try {
      await redisConfig.disconnectRedis();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('connectRedis', () => {
    it('should successfully connect to Redis', async () => {
      const client = await redisConfig.connectRedis();

      expect(redis.createClient).toHaveBeenCalled();
      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('end', expect.any(Function));
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it('should use default Redis URL if not provided', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      expect(redis.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'redis://localhost:6379'
        })
      );
    });

    it('should use custom Redis URL from environment', async () => {
      process.env.REDIS_URL = 'redis://custom-host:6380';
      await redisConfig.connectRedis();

      expect(redis.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'redis://custom-host:6380'
        })
      );
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockRedisClient.connect.mockRejectedValueOnce(error);

      await expect(redisConfig.connectRedis()).rejects.toThrow('Connection failed');
      expect(logger.error).toHaveBeenCalledWith('Redis connection failed:', error);
    });

    it('should handle error events', async () => {
      await redisConfig.connectRedis();
     
      // Get the error handler
      const errorHandler = mockRedisClient.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];
     
      const error = new Error('Redis error');
      errorHandler(error);
     
      expect(logger.error).toHaveBeenCalledWith('Redis Client Error:', error);
    });
  });

  describe('getRedisClient', () => {
    it('should return Redis client after connection', async () => {
      await redisConfig.connectRedis();
      const client = redisConfig.getRedisClient();

      expect(client).toBe(mockRedisClient);
    });

    it('should throw error if client not initialized', () => {
      expect(() => redisConfig.getRedisClient()).toThrow('Redis client not initialized');
    });
  });

  describe('disconnectRedis', () => {
    it('should disconnect Redis client', async () => {
      await redisConfig.connectRedis();
      await redisConfig.disconnectRedis();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should handle disconnect when client is null', async () => {
      await expect(redisConfig.disconnectRedis()).resolves.not.toThrow();
    });
  });
});
