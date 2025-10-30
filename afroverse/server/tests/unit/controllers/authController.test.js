const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');
const { sendWhatsAppOTP } = require('../../../src/services/whatsappService');
const { redisClient } = require('../../../src/config/redis');
const jwt = require('jsonwebtoken');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/User');
jest.mock('../../../src/services/whatsappService');
jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }
}));
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    req = {
      body: {},
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };

    redisClient.setEx = jest.fn().mockResolvedValue('OK');
    redisClient.get = jest.fn();
    redisClient.del = jest.fn().mockResolvedValue(1);
  });

  describe('startAuth', () => {
    it('should send OTP for valid phone number', async () => {
      req.body.phone = '+1234567890';
      sendWhatsAppOTP.mockResolvedValue(true);

      await authController.startAuth(req, res);

      expect(redisClient.setEx).toHaveBeenCalled();
      expect(sendWhatsAppOTP).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'OTP sent successfully'
        })
      );
    });

    it('should reject invalid phone format', async () => {
      req.body.phone = '1234567890'; // Missing + prefix

      await authController.startAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid phone number format'
      });
      expect(sendWhatsAppOTP).not.toHaveBeenCalled();
    });

    it('should continue even if WhatsApp fails', async () => {
      req.body.phone = '+1234567890';
      sendWhatsAppOTP.mockRejectedValue(new Error('WhatsApp error'));

      await authController.startAuth(req, res);

      expect(redisClient.setEx).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });

  describe('verifyAuth', () => {
    it('should authenticate user with valid OTP', async () => {
      req.body.phone = '+1234567890';
      req.body.otp = '123456';

      const mockUser = {
        _id: 'user123',
        phone: '+1234567890',
        save: jest.fn().mockResolvedValue(true)
      };

      redisClient.get.mockResolvedValue(JSON.stringify({
        code: '123456',
        attempts: 0,
        createdAt: Date.now()
      }));

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      await authController.verifyAuth(req, res);

      expect(redisClient.get).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
          tokens: expect.any(Object)
        })
      );
    });

    it('should reject expired OTP', async () => {
      req.body.phone = '+1234567890';
      req.body.otp = '123456';

      redisClient.get.mockResolvedValue(null);

      await authController.verifyAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'OTP expired or invalid'
      });
    });

    it('should reject after max attempts', async () => {
      req.body.phone = '+1234567890';
      req.body.otp = 'wrong';

      redisClient.get.mockResolvedValue(JSON.stringify({
        code: '123456',
        attempts: 5,
        createdAt: Date.now()
      }));

      await authController.verifyAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many attempts. Please try again in 10 minutes.'
      });
    });

    it('should increment attempts on wrong OTP', async () => {
      req.body.phone = '+1234567890';
      req.body.otp = 'wrong';

      redisClient.get.mockResolvedValue(JSON.stringify({
        code: '123456',
        attempts: 0,
        createdAt: Date.now()
      }));

      redisClient.setEx.mockResolvedValue('OK');

      await authController.verifyAuth(req, res);

      expect(redisClient.setEx).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jwt.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const tokens = authController.generateTokens('user123');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });
});

