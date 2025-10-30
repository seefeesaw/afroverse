const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../../../src/middleware/auth');
const { logger } = require('../../../src/utils/logger');

jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      userId: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'access'
      });

      await authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(req.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required'
      });
    });

    it('should reject invalid token type', async () => {
      req.headers.authorization = 'Bearer token';
      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'refresh'
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token type'
      });
    });

    it('should handle JsonWebTokenError', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle TokenExpiredError', async () => {
      req.headers.authorization = 'Bearer expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
    });

    it('should handle other errors', async () => {
      req.headers.authorization = 'Bearer token';
      const error = new Error('Unknown error');
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token verification failed'
      });
    });
  });

  describe('optionalAuth', () => {
    it('should set userId when valid token provided', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'access'
      });

      await optionalAuth(req, res, next);

      expect(req.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should continue without authentication when no token', async () => {
      await optionalAuth(req, res, next);

      expect(req.userId).toBeNull();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication on invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should not set userId for non-access tokens', async () => {
      req.headers.authorization = 'Bearer token';
      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'refresh'
      });

      await optionalAuth(req, res, next);

      expect(req.userId).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
});

