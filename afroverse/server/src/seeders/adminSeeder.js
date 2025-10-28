const AdminUser = require('../models/AdminUser');
const { logger } = require('../utils/logger');

const DEFAULT_ADMIN_ROLES = [
  {
    email: 'admin@afroverse.com',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'moderator@afroverse.com',
    password: 'Moderator123!',
    name: 'Content Moderator',
    role: 'moderator'
  },
  {
    email: 'tands@afroverse.com',
    password: 'Tands123!',
    name: 'Trust & Safety',
    role: 'tands'
  },
  {
    email: 'operator@afroverse.com',
    password: 'Operator123!',
    name: 'System Operator',
    role: 'operator'
  },
  {
    email: 'viewer@afroverse.com',
    password: 'Viewer123!',
    name: 'System Viewer',
    role: 'viewer'
  }
];

const seedAdminUsers = async () => {
  try {
    logger.info('Starting admin user seeding...');
    
    for (const adminData of DEFAULT_ADMIN_ROLES) {
      const existingAdmin = await AdminUser.findOne({ email: adminData.email });
      
      if (!existingAdmin) {
        const admin = new AdminUser(adminData);
        await admin.save();
        logger.info(`Created admin user: ${adminData.email} with role: ${adminData.role}`);
      } else {
        logger.info(`Admin user already exists: ${adminData.email}`);
      }
    }
    
    logger.info('Admin user seeding completed successfully');
  } catch (error) {
    logger.error('Admin user seeding error:', error);
    throw error;
  }
};

const createAdminUser = async (email, password, name, role) => {
  try {
    const existingAdmin = await AdminUser.findOne({ email });
    
    if (existingAdmin) {
      throw new Error('Admin user already exists');
    }
    
    const admin = new AdminUser({
      email,
      password,
      name,
      role
    });
    
    await admin.save();
    logger.info(`Created admin user: ${email} with role: ${role}`);
    
    return admin;
  } catch (error) {
    logger.error('Create admin user error:', error);
    throw error;
  }
};

const updateAdminUserRole = async (email, newRole) => {
  try {
    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.role = newRole;
    await admin.save();
    
    logger.info(`Updated admin user role: ${email} to ${newRole}`);
    return admin;
  } catch (error) {
    logger.error('Update admin user role error:', error);
    throw error;
  }
};

const deleteAdminUser = async (email) => {
  try {
    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    await AdminUser.deleteOne({ email });
    
    logger.info(`Deleted admin user: ${email}`);
    return true;
  } catch (error) {
    logger.error('Delete admin user error:', error);
    throw error;
  }
};

const getAdminUsers = async () => {
  try {
    const admins = await AdminUser.find({}).select('-password');
    return admins;
  } catch (error) {
    logger.error('Get admin users error:', error);
    throw error;
  }
};

const getAdminUserByEmail = async (email) => {
  try {
    const admin = await AdminUser.findOne({ email });
    return admin;
  } catch (error) {
    logger.error('Get admin user by email error:', error);
    throw error;
  }
};

const getAdminUserById = async (id) => {
  try {
    const admin = await AdminUser.findById(id);
    return admin;
  } catch (error) {
    logger.error('Get admin user by ID error:', error);
    throw error;
  }
};

const resetAdminPassword = async (email, newPassword) => {
  try {
    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.password = newPassword;
    await admin.save();
    
    logger.info(`Reset password for admin user: ${email}`);
    return admin;
  } catch (error) {
    logger.error('Reset admin password error:', error);
    throw error;
  }
};

const enableTwoFA = async (email, secret) => {
  try {
    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.twoFA.enabled = true;
    admin.twoFA.secret = secret;
    await admin.save();
    
    logger.info(`Enabled 2FA for admin user: ${email}`);
    return admin;
  } catch (error) {
    logger.error('Enable 2FA error:', error);
    throw error;
  }
};

const disableTwoFA = async (email) => {
  try {
    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    admin.twoFA.enabled = false;
    admin.twoFA.secret = null;
    await admin.save();
    
    logger.info(`Disabled 2FA for admin user: ${email}`);
    return admin;
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    throw error;
  }
};

const getAdminUserStats = async () => {
  try {
    const stats = await AdminUser.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalAdmins = await AdminUser.countDocuments();
    const activeAdmins = await AdminUser.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    return {
      totalAdmins,
      activeAdmins,
      roleDistribution: stats
    };
  } catch (error) {
    logger.error('Get admin user stats error:', error);
    throw error;
  }
};

module.exports = {
  seedAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminUsers,
  getAdminUserByEmail,
  getAdminUserById,
  resetAdminPassword,
  enableTwoFA,
  disableTwoFA,
  getAdminUserStats,
  DEFAULT_ADMIN_ROLES
};
