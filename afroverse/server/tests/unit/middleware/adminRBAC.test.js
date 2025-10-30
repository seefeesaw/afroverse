const { requireRole, requirePermission } = require('../../../src/middleware/adminRBAC');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('Admin RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      admin: {
        _id: 'admin123',
        role: 'admin',
        permissions: ['read:users', 'write:users']
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  describe('requireRole', () => {
    it('should allow access for authorized role', async () => {
      const middleware = requireRole(['admin', 'moderator']);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject unauthorized role', async () => {
      req.admin.role = 'user';
      const middleware = requireRole(['admin', 'moderator']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when no admin in request', async () => {
      req.admin = null;
      const middleware = requireRole(['admin']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requirePermission', () => {
    it('should allow access when user has permission', async () => {
      req.admin.hasPermission = jest.fn().mockReturnValue(true);
      const middleware = requirePermission('users', 'read');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.admin.hasPermission).toHaveBeenCalledWith('users', 'read');
    });

    it('should reject when user lacks permission', async () => {
      req.admin.hasPermission = jest.fn().mockReturnValue(false);
      const middleware = requirePermission('users', 'write');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});

