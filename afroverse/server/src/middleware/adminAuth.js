const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const AuditLog = require('../models/AuditLog');
const { logger } = require('../utils/logger');

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
    
    const adminUser = await AdminUser.findById(decoded.id);
    
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin user not found.'
      });
    }
    
    if (adminUser.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      });
    }
    
    req.admin = adminUser;
    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    const userRole = req.admin.role;
    
    if (!roles.includes(userRole)) {
      logger.warn(`Access denied for role ${userRole} to ${req.path}`);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Permission-based access control middleware
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    const hasPermission = req.admin.hasPermission(resource, action);
    
    if (!hasPermission) {
      logger.warn(`Permission denied for ${req.admin.role} to ${action} ${resource}`);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }
    
    next();
  };
};

// 2FA required middleware
const requireTwoFA = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.admin.twoFA.enabled) {
    return res.status(403).json({
      success: false,
      message: '2FA is required for this action.'
    });
  }
  
  // Check if 2FA was verified in this session
  const twoFAVerified = req.header('X-2FA-Verified');
  
  if (!twoFAVerified) {
    return res.status(403).json({
      success: false,
      message: '2FA verification required.'
    });
  }
  
  next();
};

// Admin action logging middleware
const logAdminAction = (action, category = 'system', severity = 'medium') => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          if (req.admin && res.statusCode < 400) {
            await AuditLog.createAuditLog(
              { type: 'admin', id: req.admin._id, email: req.admin.email },
              action,
              { type: 'system', id: req.path },
              `Admin action: ${action}`,
              null,
              { 
                method: req.method,
                path: req.path,
                query: req.query,
                body: req.body,
                ip: req.ip,
                userAgent: req.headers['user-agent']
              },
              severity,
              category,
              [action, 'admin']
            );
          }
        } catch (error) {
          logger.error('Error logging admin action:', error);
        }
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Rate limiting middleware for admin
const adminRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const adminId = req.admin?._id?.toString();
    
    if (!adminId) {
      return next();
    }
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Get or create request record
    let requestRecord = requests.get(adminId);
    if (!requestRecord) {
      requestRecord = {
        count: 0,
        timestamp: now
      };
      requests.set(adminId, requestRecord);
    }
    
    // Check if within window
    if (requestRecord.timestamp >= windowStart) {
      requestRecord.count++;
      
      if (requestRecord.count > max) {
        logger.warn(`Rate limit exceeded for admin ${adminId}: ${requestRecord.count} requests`);
        
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
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

// IP whitelist middleware for admin
const adminIPWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(ip)) {
      logger.warn(`IP ${ip} not in admin whitelist`);
      
      return res.status(403).json({
        success: false,
        message: 'IP address not allowed.'
      });
    }
    
    next();
  };
};

// Admin session validation middleware
const validateAdminSession = async (req, res, next) => {
  try {
    if (!req.admin) {
      return next();
    }
    
    // Check if admin user is still active
    const adminUser = await AdminUser.findById(req.admin._id);
    
    if (!adminUser || adminUser.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin session is no longer valid.'
      });
    }
    
    // Update last activity
    adminUser.lastLoginAt = new Date();
    await adminUser.save();
    
    next();
  } catch (error) {
    logger.error('Admin session validation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during session validation.'
    });
  }
};

// Admin action validation middleware
const validateAdminAction = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

// Admin response formatting middleware
const formatAdminResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (parsedData && typeof parsedData === 'object') {
        // Add admin context to response
        parsedData.adminContext = {
          adminId: req.admin?._id,
          adminRole: req.admin?.role,
          timestamp: new Date().toISOString()
        };
      }
      
      originalSend.call(this, JSON.stringify(parsedData));
    } catch (error) {
      originalSend.call(this, data);
    }
  };
  
  next();
};

// Admin error handling middleware
const handleAdminError = (error, req, res, next) => {
  logger.error('Admin error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

// Admin request logging middleware
const logAdminRequest = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info(`Admin request: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`, {
      adminId: req.admin?._id,
      adminRole: req.admin?.role,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  authenticateAdmin,
  requireAuth: authenticateAdmin, // Alias for backwards compatibility
  requireRole,
  requirePermission,
  requireTwoFA,
  logAdminAction,
  adminRateLimit,
  adminIPWhitelist,
  validateAdminSession,
  validateAdminAction,
  formatAdminResponse,
  handleAdminError,
  logAdminRequest
};
