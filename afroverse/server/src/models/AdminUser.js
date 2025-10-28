const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['viewer', 'moderator', 'tands', 'operator', 'admin'],
    required: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  twoFA: {
    enabled: {
      type: Boolean,
      default: false,
      index: true
    },
    secret: {
      type: String,
      default: null
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      },
      usedAt: Date
    }]
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'execute']
    }]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastLoginIP: {
    type: String,
    default: null
  },
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date,
      default: null
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      queueAlerts: {
        type: Boolean,
        default: true
      },
      fraudAlerts: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['moderation', 'fraud', 'users', 'tribes'],
        default: 'moderation'
      },
      itemsPerPage: {
        type: Number,
        default: 50
      }
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ role: 1, status: 1 });
adminUserSchema.index({ 'twoFA.enabled': 1 });
adminUserSchema.index({ lastLoginAt: -1 });

// Virtual for account lock status
adminUserSchema.virtual('isLocked').get(function() {
  return !!(this.loginAttempts.lockUntil && this.loginAttempts.lockUntil > Date.now());
});

// Virtual for full name
adminUserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to hash password
adminUserSchema.methods.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Method to compare password
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate 2FA secret
adminUserSchema.methods.generateTwoFASecret = function() {
  const secret = speakeasy.generateSecret({
    name: `Afroverse Admin (${this.email})`,
    issuer: 'Afroverse'
  });
  
  this.twoFA.secret = secret.base32;
  return secret;
};

// Method to verify 2FA token
adminUserSchema.methods.verifyTwoFA = function(token) {
  if (!this.twoFA.enabled || !this.twoFA.secret) {
    return false;
  }
  
  return speakeasy.totp.verify({
    secret: this.twoFA.secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Method to generate backup codes
adminUserSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push({
      code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      used: false
    });
  }
  
  this.twoFA.backupCodes = codes;
  return codes;
};

// Method to verify backup code
adminUserSchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.twoFA.backupCodes.find(bc => bc.code === code && !bc.used);
  
  if (backupCode) {
    backupCode.used = true;
    backupCode.usedAt = new Date();
    return true;
  }
  
  return false;
};

// Method to increment login attempts
adminUserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.loginAttempts.lockUntil && this.loginAttempts.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'loginAttempts.lockUntil': 1 },
      $set: { 'loginAttempts.count': 1 },
      $set: { 'loginAttempts.lastAttempt': new Date() }
    });
  }
  
  const updates = {
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': new Date() }
  };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts.count + 1 >= 5 && !this.isLocked) {
    updates.$set['loginAttempts.lockUntil'] = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'loginAttempts.lockUntil': 1 },
    $set: { 'loginAttempts.count': 0 }
  });
};

// Method to check permission
adminUserSchema.methods.hasPermission = function(resource, action) {
  // Admin has all permissions
  if (this.role === 'admin') {
    return true;
  }
  
  // Check specific permissions
  const permission = this.permissions.find(p => p.resource === resource);
  if (permission && permission.actions.includes(action)) {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = this.getRolePermissions();
  const rolePermission = rolePermissions.find(p => p.resource === resource);
  
  return rolePermission && rolePermission.actions.includes(action);
};

// Method to get role permissions
adminUserSchema.methods.getRolePermissions = function() {
  const rolePermissions = {
    viewer: [
      { resource: 'moderation', actions: ['read'] },
      { resource: 'fraud', actions: ['read'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'tribes', actions: ['read'] },
      { resource: 'audit', actions: ['read'] }
    ],
    moderator: [
      { resource: 'moderation', actions: ['read', 'write'] },
      { resource: 'fraud', actions: ['read'] },
      { resource: 'users', actions: ['read', 'write'] },
      { resource: 'tribes', actions: ['read'] },
      { resource: 'audit', actions: ['read'] }
    ],
    tands: [
      { resource: 'moderation', actions: ['read', 'write', 'delete'] },
      { resource: 'fraud', actions: ['read', 'write', 'delete'] },
      { resource: 'users', actions: ['read', 'write', 'delete'] },
      { resource: 'tribes', actions: ['read'] },
      { resource: 'audit', actions: ['read'] }
    ],
    operator: [
      { resource: 'moderation', actions: ['read'] },
      { resource: 'fraud', actions: ['read'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'tribes', actions: ['read', 'write', 'delete'] },
      { resource: 'leaderboards', actions: ['read', 'write', 'delete'] },
      { resource: 'payments', actions: ['read', 'write'] },
      { resource: 'audit', actions: ['read'] }
    ],
    admin: [
      { resource: '*', actions: ['read', 'write', 'delete', 'execute'] }
    ]
  };
  
  return rolePermissions[this.role] || [];
};

// Method to get admin summary
adminUserSchema.methods.getSummary = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    status: this.status,
    twoFAEnabled: this.twoFA.enabled,
    lastLoginAt: this.lastLoginAt,
    lastLoginIP: this.lastLoginIP,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get admin profile
adminUserSchema.methods.getProfile = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    status: this.status,
    twoFAEnabled: this.twoFA.enabled,
    permissions: this.permissions,
    preferences: this.preferences,
    lastLoginAt: this.lastLoginAt,
    lastLoginIP: this.lastLoginIP,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create admin user
adminUserSchema.statics.createAdminUser = async function(email, name, role, password) {
  const adminUser = new this({
    email,
    name,
    role,
    password: await bcrypt.hash(password, 12)
  });
  
  return await adminUser.save();
};

// Static method to get admin user by email
adminUserSchema.statics.getAdminUserByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get admin users by role
adminUserSchema.statics.getAdminUsersByRole = function(role, limit = 100) {
  return this.find({ role, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get active admin users
adminUserSchema.statics.getActiveAdminUsers = function(limit = 100) {
  return this.find({ status: 'active' })
    .sort({ lastLoginAt: -1 })
    .limit(limit);
};

// Static method to get admin user statistics
adminUserSchema.statics.getAdminUserStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          role: '$role',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.role',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get admin user roles
adminUserSchema.statics.getAdminUserRoles = function() {
  return [
    { key: 'viewer', name: 'Viewer', description: 'Read-only access to queues and metrics' },
    { key: 'moderator', name: 'Moderator', description: 'Review and decide on content and appeals' },
    { key: 'tands', name: 'Trust & Safety', description: 'Moderator + fraud tools + bulk actions' },
    { key: 'operator', name: 'Operator', description: 'Manage tribes, styles, leaderboards, payments' },
    { key: 'admin', name: 'Admin', description: 'Full access including role management and config' }
  ];
};

// Static method to get admin user statuses
adminUserSchema.statics.getAdminUserStatuses = function() {
  return [
    { key: 'active', name: 'Active', description: 'Active admin user' },
    { key: 'inactive', name: 'Inactive', description: 'Inactive admin user' },
    { key: 'suspended', name: 'Suspended', description: 'Suspended admin user' }
  ];
};

// Static method to get admin user permissions
adminUserSchema.statics.getAdminUserPermissions = function() {
  return [
    { key: 'read', name: 'Read', description: 'Read access' },
    { key: 'write', name: 'Write', description: 'Write access' },
    { key: 'delete', name: 'Delete', description: 'Delete access' },
    { key: 'execute', name: 'Execute', description: 'Execute access' }
  ];
};

// Static method to get admin user resources
adminUserSchema.statics.getAdminUserResources = function() {
  return [
    { key: 'moderation', name: 'Moderation', description: 'Content moderation' },
    { key: 'fraud', name: 'Fraud', description: 'Fraud detection and prevention' },
    { key: 'users', name: 'Users', description: 'User management' },
    { key: 'tribes', name: 'Tribes', description: 'Tribe management' },
    { key: 'leaderboards', name: 'Leaderboards', description: 'Leaderboard management' },
    { key: 'payments', name: 'Payments', description: 'Payment management' },
    { key: 'audit', name: 'Audit', description: 'Audit logs' },
    { key: 'config', name: 'Config', description: 'System configuration' }
  ];
};

// Static method to get admin user summary
adminUserSchema.statics.getAdminUserSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
          }
        },
        suspended: {
          $sum: {
            $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0]
          }
        },
        twoFAEnabled: {
          $sum: {
            $cond: [{ $eq: ['$twoFA.enabled', true] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        active: 1,
        inactive: 1,
        suspended: 1,
        twoFAEnabled: 1,
        twoFAEnabledPercentage: {
          $multiply: [{ $divide: ['$twoFAEnabled', '$total'] }, 100]
        }
      }
    }
  ]);
};

// Pre-save middleware to hash password
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await this.hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
