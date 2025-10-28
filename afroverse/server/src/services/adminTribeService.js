const Tribe = require('../models/Tribe');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { logger } = require('../utils/logger');

class AdminTribeService {
  constructor() {
    this.tribeStatuses = {
      active: 'active',
      inactive: 'inactive',
      suspended: 'suspended'
    };
  }

  // Get tribes
  async getTribes(filters = {}, limit = 100, skip = 0) {
    try {
      const query = {};
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { motto: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }
      
      const tribes = await Tribe.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('captain', 'username')
        .populate('members', 'username');
      
      const total = await Tribe.countDocuments(query);
      
      return {
        success: true,
        tribes: tribes.map(tribe => tribe.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting tribes:', error);
      throw error;
    }
  }

  // Get tribe by ID
  async getTribe(tribeId) {
    try {
      const tribe = await Tribe.findById(tribeId)
        .populate('captain', 'username')
        .populate('members', 'username');
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      return {
        success: true,
        tribe: tribe.getSummary()
      };
    } catch (error) {
      logger.error('Error getting tribe:', error);
      throw error;
    }
  }

  // Get tribe details
  async getTribeDetails(tribeId) {
    try {
      const tribe = await Tribe.findById(tribeId)
        .populate('captain', 'username')
        .populate('members', 'username');
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      // Get tribe statistics
      const statistics = await this.getTribeStatistics(tribeId);
      
      // Get recent activity
      const recentActivity = await this.getTribeRecentActivity(tribeId);
      
      return {
        success: true,
        tribe: tribe.getSummary(),
        statistics,
        recentActivity
      };
    } catch (error) {
      logger.error('Error getting tribe details:', error);
      throw error;
    }
  }

  // Get tribe statistics
  async getTribeStatistics(tribeId) {
    try {
      const tribe = await Tribe.findById(tribeId);
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      // Get member count
      const memberCount = await User.countDocuments({ tribe: tribeId });
      
      // Get weekly points
      const weeklyPoints = tribe.weeklyPoints || 0;
      
      // Get all-time points
      const allTimePoints = tribe.allTimePoints || 0;
      
      // Get rank
      const rank = await this.getTribeRank(tribeId);
      
      return {
        memberCount,
        weeklyPoints,
        allTimePoints,
        rank,
        createdAt: tribe.createdAt,
        lastActive: tribe.updatedAt
      };
    } catch (error) {
      logger.error('Error getting tribe statistics:', error);
      throw error;
    }
  }

  // Get tribe rank
  async getTribeRank(tribeId) {
    try {
      const tribes = await Tribe.find({ status: 'active' })
        .sort({ weeklyPoints: -1 })
        .select('_id weeklyPoints');
      
      const rank = tribes.findIndex(tribe => tribe._id.toString() === tribeId.toString()) + 1;
      
      return rank || 0;
    } catch (error) {
      logger.error('Error getting tribe rank:', error);
      throw error;
    }
  }

  // Get tribe recent activity
  async getTribeRecentActivity(tribeId, limit = 20) {
    try {
      // This would query various collections for tribe activity
      // For now, we'll return a mock response
      return {
        battles: [],
        transformations: [],
        memberJoins: [],
        memberLeaves: []
      };
    } catch (error) {
      logger.error('Error getting tribe recent activity:', error);
      throw error;
    }
  }

  // Update tribe
  async updateTribe(tribeId, adminUserId, updates) {
    try {
      const tribe = await Tribe.findById(tribeId);
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      const allowedUpdates = ['name', 'motto', 'emblem', 'status', 'captain', 'memberCap', 'perks'];
      const updateData = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }
      
      const before = tribe.getSummary();
      Object.assign(tribe, updateData);
      await tribe.save();
      const after = tribe.getSummary();
      
      // Log tribe update
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'tribe_edit',
        { type: 'tribe', id: tribeId },
        `Tribe updated: ${Object.keys(updateData).join(', ')}`,
        before,
        after,
        'medium',
        'tribe_management',
        ['tribe_update', 'tribe_management']
      );
      
      logger.info(`Tribe ${tribeId} updated by admin ${adminUserId}`);
      
      return {
        success: true,
        tribe: tribe.getSummary(),
        message: 'Tribe updated successfully'
      };
    } catch (error) {
      logger.error('Error updating tribe:', error);
      throw error;
    }
  }

  // Change tribe captain
  async changeTribeCaptain(tribeId, adminUserId, newCaptainId, reason) {
    try {
      const tribe = await Tribe.findById(tribeId);
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      const newCaptain = await User.findById(newCaptainId);
      
      if (!newCaptain) {
        throw new Error('New captain not found');
      }
      
      if (!tribe.members.includes(newCaptainId)) {
        throw new Error('New captain must be a member of the tribe');
      }
      
      const oldCaptain = tribe.captain;
      tribe.captain = newCaptainId;
      await tribe.save();
      
      // Log captain change
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'tribe_edit',
        { type: 'tribe', id: tribeId },
        `Tribe captain changed: ${reason}`,
        { captain: oldCaptain },
        { captain: newCaptainId, reason },
        'high',
        'tribe_management',
        ['captain_change', 'tribe_management']
      );
      
      logger.info(`Tribe ${tribeId} captain changed to ${newCaptainId}: ${reason}`);
      
      return {
        success: true,
        tribe: tribe.getSummary(),
        message: 'Tribe captain changed successfully'
      };
    } catch (error) {
      logger.error('Error changing tribe captain:', error);
      throw error;
    }
  }

  // Suspend tribe
  async suspendTribe(tribeId, adminUserId, reason) {
    try {
      const tribe = await Tribe.findById(tribeId);
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      if (tribe.status === 'suspended') {
        throw new Error('Tribe is already suspended');
      }
      
      const before = tribe.getSummary();
      tribe.status = 'suspended';
      tribe.suspendedAt = new Date();
      tribe.suspendedBy = adminUserId;
      tribe.suspendReason = reason;
      await tribe.save();
      const after = tribe.getSummary();
      
      // Log tribe suspension
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'tribe_edit',
        { type: 'tribe', id: tribeId },
        `Tribe suspended: ${reason}`,
        before,
        after,
        'high',
        'tribe_management',
        ['tribe_suspension', 'tribe_management']
      );
      
      logger.info(`Tribe ${tribeId} suspended: ${reason}`);
      
      return {
        success: true,
        tribe: tribe.getSummary(),
        message: 'Tribe suspended successfully'
      };
    } catch (error) {
      logger.error('Error suspending tribe:', error);
      throw error;
    }
  }

  // Unsuspend tribe
  async unsuspendTribe(tribeId, adminUserId, reason) {
    try {
      const tribe = await Tribe.findById(tribeId);
      
      if (!tribe) {
        throw new Error('Tribe not found');
      }
      
      if (tribe.status !== 'suspended') {
        throw new Error('Tribe is not suspended');
      }
      
      const before = tribe.getSummary();
      tribe.status = 'active';
      tribe.unsuspendedAt = new Date();
      tribe.unsuspendedBy = adminUserId;
      tribe.unsuspendReason = reason;
      await tribe.save();
      const after = tribe.getSummary();
      
      // Log tribe unsuspension
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'tribe_edit',
        { type: 'tribe', id: tribeId },
        `Tribe unsuspended: ${reason}`,
        before,
        after,
        'high',
        'tribe_management',
        ['tribe_unsuspension', 'tribe_management']
      );
      
      logger.info(`Tribe ${tribeId} unsuspended: ${reason}`);
      
      return {
        success: true,
        tribe: tribe.getSummary(),
        message: 'Tribe unsuspended successfully'
      };
    } catch (error) {
      logger.error('Error unsuspending tribe:', error);
      throw error;
    }
  }

  // Get tribe statistics
  async getTribeStatistics(startDate, endDate) {
    try {
      const statistics = await Tribe.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              status: '$status'
            },
            count: { $sum: 1 },
            totalMembers: { $sum: { $size: '$members' } },
            avgPoints: { $avg: '$weeklyPoints' }
          }
        }
      ]);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting tribe statistics:', error);
      throw error;
    }
  }

  // Get tribe trends
  async getTribeTrends(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const trends = await Tribe.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalTribes: { $sum: 1 },
            activeTribes: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            suspendedTribes: {
              $sum: {
                $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting tribe trends:', error);
      throw error;
    }
  }

  // Get tribe summary
  async getTribeSummary() {
    try {
      const summary = await Tribe.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            suspended: {
              $sum: {
                $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0]
              }
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
              }
            },
            totalMembers: { $sum: { $size: '$members' } },
            avgPoints: { $avg: '$weeklyPoints' }
          }
        },
        {
          $project: {
            total: 1,
            active: 1,
            suspended: 1,
            inactive: 1,
            totalMembers: 1,
            avgPoints: { $round: ['$avgPoints', 2] },
            activePercentage: {
              $multiply: [{ $divide: ['$active', '$total'] }, 100]
            }
          }
        }
      ]);
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          active: 0,
          suspended: 0,
          inactive: 0,
          totalMembers: 0,
          avgPoints: 0
        }
      };
    } catch (error) {
      logger.error('Error getting tribe summary:', error);
      throw error;
    }
  }

  // Get tribe statuses
  getTribeStatuses() {
    return Object.keys(this.tribeStatuses).map(key => ({
      key,
      name: this.tribeStatuses[key]
    }));
  }

  // Validate tribe data
  validateTribeData(data) {
    const errors = [];
    
    if (!data.tribeId) {
      errors.push('Tribe ID is required');
    }
    
    if (data.name && data.name.length < 3) {
      errors.push('Tribe name must be at least 3 characters');
    }
    
    if (data.motto && data.motto.length > 100) {
      errors.push('Tribe motto must be less than 100 characters');
    }
    
    if (data.status && !this.tribeStatuses[data.status]) {
      errors.push('Valid tribe status is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'TRIBE_NOT_FOUND': 'Tribe not found',
      'TRIBE_ALREADY_SUSPENDED': 'Tribe is already suspended',
      'TRIBE_NOT_SUSPENDED': 'Tribe is not suspended',
      'CAPTAIN_NOT_FOUND': 'Captain not found',
      'CAPTAIN_NOT_MEMBER': 'Captain must be a member of the tribe',
      'INVALID_TRIBE_STATUS': 'Invalid tribe status',
      'INVALID_TRIBE_NAME': 'Invalid tribe name',
      'INVALID_TRIBE_MOTTO': 'Invalid tribe motto'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'tribe_updated': 'Tribe updated successfully',
      'captain_changed': 'Tribe captain changed successfully',
      'tribe_suspended': 'Tribe suspended successfully',
      'tribe_unsuspended': 'Tribe unsuspended successfully',
      'tribe_created': 'Tribe created successfully',
      'tribe_deleted': 'Tribe deleted successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminTribeService = new AdminTribeService();

module.exports = adminTribeService;
