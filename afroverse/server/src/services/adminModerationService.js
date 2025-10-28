const ModerationJob = require('../models/ModerationJob');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { logger } = require('../utils/logger');

class AdminModerationService {
  constructor() {
    this.statuses = {
      pending: 'pending',
      passed: 'passed',
      blocked: 'blocked',
      flagged: 'flagged',
      quarantined: 'quarantined',
      needs_review: 'needs_review',
      appealed: 'appealed',
      resolved: 'resolved'
    };
    
    this.decisions = {
      allow: 'allow',
      block: 'block',
      blur: 'blur',
      age_gate: 'age_gate',
      hold_publish: 'hold_publish',
      escalate: 'escalate'
    };
    
    this.priorities = {
      normal: 'normal',
      high: 'high',
      urgent: 'urgent'
    };
  }

  // Get moderation queue
  async getModerationQueue(filters = {}, limit = 100, skip = 0) {
    try {
      const query = { isActive: true };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.subjectType) {
        query['subject.type'] = filters.subjectType;
      }
      
      if (filters.assignedTo) {
        query.assignedTo = filters.assignedTo;
      }
      
      if (filters.priority) {
        query['escalation.priority'] = filters.priority;
      }
      
      if (filters.appealed) {
        query['appeal.open'] = filters.appealed;
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
      
      const moderationJobs = await ModerationJob.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('subject.userId', 'username phone')
        .populate('assignedTo', 'email name role')
        .populate('reviewedBy', 'email name role')
        .populate('escalation.escalatedBy', 'email name role')
        .populate('appeal.resolvedBy', 'email name role');
      
      const total = await ModerationJob.countDocuments(query);
      
      return {
        success: true,
        moderationJobs: moderationJobs.map(job => job.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting moderation queue:', error);
      throw error;
    }
  }

  // Get moderation job by ID
  async getModerationJob(jobId) {
    try {
      const moderationJob = await ModerationJob.findById(jobId)
        .populate('subject.userId', 'username phone')
        .populate('assignedTo', 'email name role')
        .populate('reviewedBy', 'email name role')
        .populate('escalation.escalatedBy', 'email name role')
        .populate('appeal.resolvedBy', 'email name role');
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      return {
        success: true,
        moderationJob: moderationJob.getDetails()
      };
    } catch (error) {
      logger.error('Error getting moderation job:', error);
      throw error;
    }
  }

  // Assign moderation job
  async assignModerationJob(jobId, adminUserId) {
    try {
      const moderationJob = await ModerationJob.findById(jobId);
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      if (moderationJob.assignedTo) {
        throw new Error('Job is already assigned');
      }
      
      await moderationJob.assignTo(adminUserId);
      
      // Log assignment
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'moderation_decision',
        { type: 'moderation', id: jobId },
        'Moderation job assigned',
        null,
        { assignedTo: adminUserId },
        'medium',
        'moderation',
        ['assignment', 'moderation']
      );
      
      logger.info(`Moderation job ${jobId} assigned to admin ${adminUserId}`);
      
      return {
        success: true,
        moderationJob: moderationJob.getSummary(),
        message: 'Job assigned successfully'
      };
    } catch (error) {
      logger.error('Error assigning moderation job:', error);
      throw error;
    }
  }

  // Make moderation decision
  async makeModerationDecision(jobId, adminUserId, decision, reason, notes = null) {
    try {
      const moderationJob = await ModerationJob.findById(jobId);
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      if (moderationJob.status === 'resolved') {
        throw new Error('Job is already resolved');
      }
      
      await moderationJob.makeDecision(adminUserId, decision, reason, notes);
      
      // Log decision
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'moderation_decision',
        { type: 'moderation', id: jobId },
        `Moderation decision: ${decision}`,
        { decision: moderationJob.decision, reason: moderationJob.decisionReason },
        { decision, reason, notes },
        'high',
        'moderation',
        ['decision', 'moderation', decision]
      );
      
      // Notify user if required
      if (moderationJob.notifyUser) {
        await this.notifyUser(moderationJob.subject.userId, decision, reason);
      }
      
      logger.info(`Moderation decision made for job ${jobId}: ${decision}`);
      
      return {
        success: true,
        moderationJob: moderationJob.getSummary(),
        message: 'Decision made successfully'
      };
    } catch (error) {
      logger.error('Error making moderation decision:', error);
      throw error;
    }
  }

  // Escalate moderation job
  async escalateModerationJob(jobId, adminUserId, reason, priority = 'high') {
    try {
      const moderationJob = await ModerationJob.findById(jobId);
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      await moderationJob.escalate(adminUserId, reason, priority);
      
      // Log escalation
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'moderation_decision',
        { type: 'moderation', id: jobId },
        `Moderation job escalated: ${reason}`,
        null,
        { reason, priority },
        'high',
        'moderation',
        ['escalation', 'moderation']
      );
      
      logger.info(`Moderation job ${jobId} escalated: ${reason}`);
      
      return {
        success: true,
        moderationJob: moderationJob.getSummary(),
        message: 'Job escalated successfully'
      };
    } catch (error) {
      logger.error('Error escalating moderation job:', error);
      throw error;
    }
  }

  // Open appeal
  async openAppeal(jobId, userId, message) {
    try {
      const moderationJob = await ModerationJob.findById(jobId);
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      if (moderationJob.appeal.open) {
        throw new Error('Appeal is already open');
      }
      
      await moderationJob.openAppeal(message);
      
      // Log appeal
      await AuditLog.createAuditLog(
        { type: 'user', id: userId },
        'appeal_resolution',
        { type: 'moderation', id: jobId },
        'User opened appeal',
        null,
        { message },
        'medium',
        'moderation',
        ['appeal', 'moderation']
      );
      
      logger.info(`Appeal opened for moderation job ${jobId}`);
      
      return {
        success: true,
        moderationJob: moderationJob.getSummary(),
        message: 'Appeal opened successfully'
      };
    } catch (error) {
      logger.error('Error opening appeal:', error);
      throw error;
    }
  }

  // Resolve appeal
  async resolveAppeal(jobId, adminUserId, resolution, reason) {
    try {
      const moderationJob = await ModerationJob.findById(jobId);
      
      if (!moderationJob) {
        throw new Error('Moderation job not found');
      }
      
      if (!moderationJob.appeal.open) {
        throw new Error('No open appeal found');
      }
      
      await moderationJob.resolveAppeal(adminUserId, resolution, reason);
      
      // Log appeal resolution
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'appeal_resolution',
        { type: 'moderation', id: jobId },
        `Appeal resolved: ${resolution}`,
        null,
        { resolution, reason },
        'high',
        'moderation',
        ['appeal_resolution', 'moderation', resolution]
      );
      
      // Notify user
      await this.notifyUser(moderationJob.subject.userId, 'appeal_resolved', reason);
      
      logger.info(`Appeal resolved for moderation job ${jobId}: ${resolution}`);
      
      return {
        success: true,
        moderationJob: moderationJob.getSummary(),
        message: 'Appeal resolved successfully'
      };
    } catch (error) {
      logger.error('Error resolving appeal:', error);
      throw error;
    }
  }

  // Get moderation statistics
  async getModerationStatistics(startDate, endDate) {
    try {
      const statistics = await ModerationJob.getModerationJobStatistics(startDate, endDate);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting moderation statistics:', error);
      throw error;
    }
  }

  // Get moderation trends
  async getModerationTrends(days = 30) {
    try {
      const trends = await ModerationJob.getModerationJobTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting moderation trends:', error);
      throw error;
    }
  }

  // Get moderation performance
  async getModerationPerformance(startDate, endDate) {
    try {
      const performance = await ModerationJob.getModerationJobPerformance(startDate, endDate);
      
      return {
        success: true,
        performance
      };
    } catch (error) {
      logger.error('Error getting moderation performance:', error);
      throw error;
    }
  }

  // Get pending jobs count
  async getPendingJobsCount() {
    try {
      const counts = await ModerationJob.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const result = {
        pending: 0,
        needsReview: 0,
        appealed: 0,
        escalated: 0
      };
      
      counts.forEach(count => {
        if (count._id === 'pending') result.pending = count.count;
        if (count._id === 'needs_review') result.needsReview = count.count;
        if (count._id === 'appealed') result.appealed = count.count;
      });
      
      // Get escalated jobs count
      const escalatedCount = await ModerationJob.countDocuments({
        'escalation.priority': { $in: ['high', 'urgent'] },
        status: 'needs_review',
        isActive: true
      });
      
      result.escalated = escalatedCount;
      
      return {
        success: true,
        counts: result
      };
    } catch (error) {
      logger.error('Error getting pending jobs count:', error);
      throw error;
    }
  }

  // Get moderation job summary
  async getModerationJobSummary() {
    try {
      const summary = await ModerationJob.getModerationJobSummary();
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          pending: 0,
          passed: 0,
          blocked: 0,
          quarantined: 0,
          needsReview: 0,
          appealed: 0,
          resolved: 0
        }
      };
    } catch (error) {
      logger.error('Error getting moderation job summary:', error);
      throw error;
    }
  }

  // Notify user
  async notifyUser(userId, action, reason) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        logger.warn(`User ${userId} not found for notification`);
        return;
      }
      
      // This would integrate with notification service
      // For now, we'll just log it
      logger.info(`Notification sent to user ${userId}: ${action} - ${reason}`);
      
      return {
        success: true,
        message: 'User notified successfully'
      };
    } catch (error) {
      logger.error('Error notifying user:', error);
      throw error;
    }
  }

  // Get moderation job statuses
  getModerationJobStatuses() {
    return Object.keys(this.statuses).map(key => ({
      key,
      name: this.statuses[key]
    }));
  }

  // Get moderation job decisions
  getModerationJobDecisions() {
    return Object.keys(this.decisions).map(key => ({
      key,
      name: this.decisions[key]
    }));
  }

  // Get moderation job priorities
  getModerationJobPriorities() {
    return Object.keys(this.priorities).map(key => ({
      key,
      name: this.priorities[key]
    }));
  }

  // Validate moderation data
  validateModerationData(data) {
    const errors = [];
    
    if (!data.jobId) {
      errors.push('Job ID is required');
    }
    
    if (!data.decision) {
      errors.push('Decision is required');
    } else if (!this.decisions[data.decision]) {
      errors.push('Valid decision is required');
    }
    
    if (!data.reason) {
      errors.push('Reason is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'MODERATION_JOB_NOT_FOUND': 'Moderation job not found',
      'JOB_ALREADY_ASSIGNED': 'Job is already assigned',
      'JOB_ALREADY_RESOLVED': 'Job is already resolved',
      'APPEAL_ALREADY_OPEN': 'Appeal is already open',
      'NO_OPEN_APPEAL': 'No open appeal found',
      'INVALID_DECISION': 'Invalid decision',
      'INVALID_PRIORITY': 'Invalid priority',
      'USER_NOT_FOUND': 'User not found'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'job_assigned': 'Job assigned successfully',
      'decision_made': 'Decision made successfully',
      'job_escalated': 'Job escalated successfully',
      'appeal_opened': 'Appeal opened successfully',
      'appeal_resolved': 'Appeal resolved successfully',
      'user_notified': 'User notified successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminModerationService = new AdminModerationService();

module.exports = adminModerationService;
