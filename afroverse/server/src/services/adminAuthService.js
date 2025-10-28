const AdminUser = require('../models/AdminUser');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

class AdminAuthService {
  constructor() {
    this.jwtSecret = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';
    this.jwtExpiry = process.env.ADMIN_JWT_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.ADMIN_REFRESH_TOKEN_EXPIRY || '7d';
    this.maxLoginAttempts = 5;
    this.lockTime = 2 * 60 * 60 * 1000; // 2 hours
  }

  // Generate JWT token
  generateToken(adminUser) {
    const payload = {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions
    };
    
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
  }

  // Generate refresh token
  generateRefreshToken(adminUser) {
    const payload = {
      id: adminUser._id,
      type: 'refresh'
    };
    
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTokenExpiry });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Generate magic link
  generateMagicLink(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store token in database or cache
    // For now, we'll return the token
    return {
      token,
      expiresAt,
      url: `${process.env.ADMIN_BASE_URL}/auth/magic-link?token=${token}`
    };
  }

  // Verify magic link
  verifyMagicLink(token) {
    // In a real implementation, you'd check the token against stored tokens
    // For now, we'll return true
    return true;
  }

  // Login with email and password
  async login(email, password, ipAddress, userAgent) {
    try {
      const adminUser = await AdminUser.getAdminUserByEmail(email);
      
      if (!adminUser) {
        throw new Error('Invalid credentials');
      }
      
      if (adminUser.status !== 'active') {
        throw new Error('Account is not active');
      }
      
      if (adminUser.isLocked) {
        throw new Error('Account is locked due to too many failed attempts');
      }
      
      const isPasswordValid = await adminUser.comparePassword(password);
      
      if (!isPasswordValid) {
        await adminUser.incLoginAttempts();
        throw new Error('Invalid credentials');
      }
      
      // Reset login attempts on successful login
      await adminUser.resetLoginAttempts();
      
      // Update last login
      adminUser.lastLoginAt = new Date();
      adminUser.lastLoginIP = ipAddress;
      await adminUser.save();
      
      // Generate tokens
      const accessToken = this.generateToken(adminUser);
      const refreshToken = this.generateRefreshToken(adminUser);
      
      // Log login
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'admin_login',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user logged in',
        null,
        { ip: ipAddress, userAgent },
        'medium',
        'security',
        ['login', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} logged in from ${ipAddress}`);
      
      return {
        success: true,
        adminUser: adminUser.getSummary(),
        accessToken,
        refreshToken,
        requiresTwoFA: adminUser.twoFA.enabled
      };
    } catch (error) {
      logger.error('Admin login error:', error);
      throw error;
    }
  }

  // Login with magic link
  async loginWithMagicLink(token, ipAddress, userAgent) {
    try {
      const isValid = this.verifyMagicLink(token);
      
      if (!isValid) {
        throw new Error('Invalid or expired magic link');
      }
      
      // Extract email from token (in real implementation)
      const email = 'admin@afroverse.app'; // This would be extracted from the token
      const adminUser = await AdminUser.getAdminUserByEmail(email);
      
      if (!adminUser) {
        throw new Error('Invalid magic link');
      }
      
      if (adminUser.status !== 'active') {
        throw new Error('Account is not active');
      }
      
      // Update last login
      adminUser.lastLoginAt = new Date();
      adminUser.lastLoginIP = ipAddress;
      await adminUser.save();
      
      // Generate tokens
      const accessToken = this.generateToken(adminUser);
      const refreshToken = this.generateRefreshToken(adminUser);
      
      // Log login
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'admin_login',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user logged in with magic link',
        null,
        { ip: ipAddress, userAgent },
        'medium',
        'security',
        ['login', 'magic_link', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} logged in with magic link from ${ipAddress}`);
      
      return {
        success: true,
        adminUser: adminUser.getSummary(),
        accessToken,
        refreshToken,
        requiresTwoFA: adminUser.twoFA.enabled
      };
    } catch (error) {
      logger.error('Admin magic link login error:', error);
      throw error;
    }
  }

  // Verify 2FA token
  async verifyTwoFA(adminUserId, token) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      if (!adminUser.twoFA.enabled) {
        throw new Error('2FA is not enabled');
      }
      
      const isValid = adminUser.verifyTwoFA(token);
      
      if (!isValid) {
        throw new Error('Invalid 2FA token');
      }
      
      logger.info(`2FA verified for admin user ${adminUser.email}`);
      
      return {
        success: true,
        message: '2FA verified successfully'
      };
    } catch (error) {
      logger.error('2FA verification error:', error);
      throw error;
    }
  }

  // Verify backup code
  async verifyBackupCode(adminUserId, code) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      if (!adminUser.twoFA.enabled) {
        throw new Error('2FA is not enabled');
      }
      
      const isValid = adminUser.verifyBackupCode(code);
      
      if (!isValid) {
        throw new Error('Invalid backup code');
      }
      
      logger.info(`Backup code used for admin user ${adminUser.email}`);
      
      return {
        success: true,
        message: 'Backup code verified successfully'
      };
    } catch (error) {
      logger.error('Backup code verification error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      
      const adminUser = await AdminUser.findById(decoded.id);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      if (adminUser.status !== 'active') {
        throw new Error('Account is not active');
      }
      
      // Generate new tokens
      const accessToken = this.generateToken(adminUser);
      const newRefreshToken = this.generateRefreshToken(adminUser);
      
      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout
  async logout(adminUserId, ipAddress, userAgent) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      // Log logout
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'admin_logout',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user logged out',
        null,
        { ip: ipAddress, userAgent },
        'low',
        'security',
        ['logout', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} logged out from ${ipAddress}`);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Admin logout error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(adminUserId, currentPassword, newPassword) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      const isCurrentPasswordValid = await adminUser.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      adminUser.password = newPassword;
      await adminUser.save();
      
      // Log password change
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'config_update',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user changed password',
        null,
        { field: 'password' },
        'high',
        'security',
        ['password_change', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} changed password`);
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  // Enable 2FA
  async enableTwoFA(adminUserId) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      if (adminUser.twoFA.enabled) {
        throw new Error('2FA is already enabled');
      }
      
      const secret = adminUser.generateTwoFASecret();
      const backupCodes = adminUser.generateBackupCodes();
      
      await adminUser.save();
      
      // Log 2FA enable
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'config_update',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user enabled 2FA',
        null,
        { field: 'twoFA' },
        'high',
        'security',
        ['2fa_enable', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} enabled 2FA`);
      
      return {
        success: true,
        secret: secret.base32,
        qrCode: secret.otpauth_url,
        backupCodes: backupCodes.map(bc => bc.code),
        message: '2FA enabled successfully'
      };
    } catch (error) {
      logger.error('2FA enable error:', error);
      throw error;
    }
  }

  // Disable 2FA
  async disableTwoFA(adminUserId, password) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      if (!adminUser.twoFA.enabled) {
        throw new Error('2FA is not enabled');
      }
      
      const isPasswordValid = await adminUser.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Password is incorrect');
      }
      
      adminUser.twoFA.enabled = false;
      adminUser.twoFA.secret = null;
      adminUser.twoFA.backupCodes = [];
      
      await adminUser.save();
      
      // Log 2FA disable
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'config_update',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user disabled 2FA',
        null,
        { field: 'twoFA' },
        'high',
        'security',
        ['2fa_disable', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} disabled 2FA`);
      
      return {
        success: true,
        message: '2FA disabled successfully'
      };
    } catch (error) {
      logger.error('2FA disable error:', error);
      throw error;
    }
  }

  // Get admin user profile
  async getProfile(adminUserId) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      return {
        success: true,
        profile: adminUser.getProfile()
      };
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  // Update admin user profile
  async updateProfile(adminUserId, updates) {
    try {
      const adminUser = await AdminUser.findById(adminUserId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }
      
      const allowedUpdates = ['name', 'preferences'];
      const updateData = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }
      
      Object.assign(adminUser, updateData);
      await adminUser.save();
      
      // Log profile update
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUser._id, email: adminUser.email },
        'config_update',
        { type: 'admin', id: adminUser._id.toString(), name: adminUser.name },
        'Admin user updated profile',
        null,
        { fields: Object.keys(updateData) },
        'medium',
        'system',
        ['profile_update', 'admin']
      );
      
      logger.info(`Admin user ${adminUser.email} updated profile`);
      
      return {
        success: true,
        profile: adminUser.getProfile(),
        message: 'Profile updated successfully'
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  // Validate admin data
  validateAdminData(data) {
    const errors = [];
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.name) {
      errors.push('Name is required');
    }
    
    if (!data.role) {
      errors.push('Role is required');
    } else if (!['viewer', 'moderator', 'tands', 'operator', 'admin'].includes(data.role)) {
      errors.push('Valid role is required');
    }
    
    if (data.password && data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'ADMIN_USER_NOT_FOUND': 'Admin user not found',
      'INVALID_CREDENTIALS': 'Invalid credentials',
      'ACCOUNT_LOCKED': 'Account is locked',
      'ACCOUNT_INACTIVE': 'Account is not active',
      'INVALID_TOKEN': 'Invalid token',
      'TOKEN_EXPIRED': 'Token has expired',
      'INVALID_2FA_TOKEN': 'Invalid 2FA token',
      'INVALID_BACKUP_CODE': 'Invalid backup code',
      '2FA_NOT_ENABLED': '2FA is not enabled',
      '2FA_ALREADY_ENABLED': '2FA is already enabled',
      'INVALID_MAGIC_LINK': 'Invalid or expired magic link',
      'PASSWORD_TOO_WEAK': 'Password is too weak',
      'CURRENT_PASSWORD_INCORRECT': 'Current password is incorrect'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'login_successful': 'Login successful',
      'logout_successful': 'Logout successful',
      'password_changed': 'Password changed successfully',
      '2fa_enabled': '2FA enabled successfully',
      '2fa_disabled': '2FA disabled successfully',
      'profile_updated': 'Profile updated successfully',
      'token_refreshed': 'Token refreshed successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminAuthService = new AdminAuthService();

module.exports = adminAuthService;
