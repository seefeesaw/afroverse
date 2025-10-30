const { logger } = require('../utils/logger');

/**
 * Role-Based Access Control for admin routes
 */

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if admin exists in request
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if admin has required role
      const hasRole = Array.isArray(roles) 
        ? roles.includes(req.admin.role)
        : req.admin.role === roles;

      if (!hasRole) {
        logger.warn(`Access denied: User ${req.admin._id} lacks required role`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      logger.info(`RBAC check passed: User ${req.admin._id} has role ${req.admin.role}`);
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Check if admin exists in request
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if admin has permission
      const hasPermission = req.admin.hasPermission 
        ? req.admin.hasPermission(resource, action)
        : req.admin.permissions?.includes(`${action}:${resource}`);

      if (!hasPermission) {
        logger.warn(`Permission denied: User ${req.admin._id} lacks ${action}:${resource}`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission
};


