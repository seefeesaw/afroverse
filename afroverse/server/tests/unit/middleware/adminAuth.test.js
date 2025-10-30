const jwt = require('jsonwebtoken');
const AdminUser = require('../../../src/models/AdminUser');
const {
  authenticateAdmin,
  requireRole,
  requirePermission,
  requireTwoFA,
  adminRateLimit,
  validateAdminSession
} = require('../../../src/middleware/adminAuth');
const { logger } = require('../../../src/utils/logger');

jest.mock('jsonwebtoken');
jest.mock('../../../src/models/AdminUser');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('Admin Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      admin: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.ADMIN_JWT_SECRET = 'admin-secret';
  });

  describe('authenticateAdmin', () => {
    it('should authenticate valid admin token', async () => {
      const mockAdmin = {
        _id: 'admin123',
        status: 'active'
      };

      req.header.mockReturnValue('Bearer valid-token');
      jwt.verify.mockReturnValue({ id: 'admin123' });
      AdminUser.findById.mockResolvedValue(mockAdmin);

      await authenticateAdmin(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'admin-secret');
      expect(req.admin).toBe(mockAdmin);
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      req.header.mockReturnValue(undefined);

      await authenticateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
    });

    it('should reject when admin not found', async () => {
      req.header.mockReturnValue('Bearer token');
      jwt.verify.mockReturnValue({ id: 'admin123' });
      AdminUser.findById.mockResolvedValue(null);

      await authenticateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token. Admin user not found.'
      });
    });

    it('should reject inactive admin', async () => {
      const mockAdmin = {
        _id: 'admin123',
        status: 'inactive'
      };

      req.header.mockReturnValue('Bearer token');
      jwt.verify.mockReturnValue({ id: 'admin123' });
      AdminUser.findById.mockResolvedValue(mockAdmin);

      await authenticateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is not active.'
      });
    });
  });

  describe('requireRole', () => {
    it('should allow access for authorized role', () => {
      req.admin = { role: 'super_admin' };
      const middleware = requireRole(['super_admin', 'admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject unauthorized role', () => {
      req.admin = { role: 'moderator' };
      const middleware = requireRole(['super_admin', 'admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should reject when no admin in request', () => {
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('adminRateLimit', () => {
    it('should allow requests within limit', () => {
      req.admin = { _id: 'admin123' };
      const middleware = adminRateLimit(1000, 5);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject requests exceeding limit', () => {
      req.admin = { _id: 'admin123' };
      const middleware = adminRateLimit(1000, 1);

      // First request
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Reset next mock
      next.mockClear();

      // Second request should be blocked
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });
});

