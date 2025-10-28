const Bull = require('bull');
const adminModerationService = require('../services/adminModerationService');
const adminFraudService = require('../services/adminFraudService');
const adminUserService = require('../services/adminUserService');
const adminTribeService = require('../services/adminTribeService');
const adminAuditService = require('../services/adminAuditService');
const { logger } = require('../utils/logger');

// Create queues
const adminModerationQueue = new Bull('admin moderation', process.env.REDIS_URL);
const adminFraudQueue = new Bull('admin fraud', process.env.REDIS_URL);
const adminUserQueue = new Bull('admin user', process.env.REDIS_URL);
const adminTribeQueue = new Bull('admin tribe', process.env.REDIS_URL);
const adminAuditQueue = new Bull('admin audit', process.env.REDIS_URL);

// Admin moderation queue workers
adminModerationQueue.process('escalate-job', async (job) => {
  try {
    const { jobId, reason, priority } = job.data;
    
    await adminModerationService.escalateModerationJob(jobId, null, reason, priority);
    
    logger.info(`Admin moderation job ${jobId} escalated successfully`);
  } catch (error) {
    logger.error('Admin moderation escalation error:', error);
    throw error;
  }
});

adminModerationQueue.process('auto-assign', async (job) => {
  try {
    const { jobId, adminId } = job.data;
    
    await adminModerationService.assignModerationJob(jobId, adminId);
    
    logger.info(`Admin moderation job ${jobId} auto-assigned to admin ${adminId}`);
  } catch (error) {
    logger.error('Admin moderation auto-assignment error:', error);
    throw error;
  }
});

adminModerationQueue.process('notify-escalation', async (job) => {
  try {
    const { jobId, reason, priority } = job.data;
    
    // Notify higher-level admins about escalation
    await adminModerationService.notifyEscalation(jobId, reason, priority);
    
    logger.info(`Admin escalation notification sent for job ${jobId}`);
  } catch (error) {
    logger.error('Admin escalation notification error:', error);
    throw error;
  }
});

// Admin fraud queue workers
adminFraudQueue.process('review-fraud', async (job) => {
  try {
    const { fraudDetectionId, adminId, action, notes } = job.data;
    
    await adminFraudService.reviewFraudDetection(fraudDetectionId, adminId, action, notes);
    
    logger.info(`Admin fraud detection ${fraudDetectionId} reviewed by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin fraud review error:', error);
    throw error;
  }
});

adminFraudQueue.process('shadowban-user', async (job) => {
  try {
    const { userId, adminId, reason } = job.data;
    
    await adminFraudService.shadowbanUser(userId, adminId, reason);
    
    logger.info(`Admin shadowban applied to user ${userId} by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin shadowban error:', error);
    throw error;
  }
});

adminFraudQueue.process('lift-shadowban', async (job) => {
  try {
    const { userId, adminId, reason } = job.data;
    
    await adminFraudService.liftShadowban(userId, adminId, reason);
    
    logger.info(`Admin shadowban lifted for user ${userId} by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin lift shadowban error:', error);
    throw error;
  }
});

adminFraudQueue.process('notify-fraud-review', async (job) => {
  try {
    const { fraudDetectionId, action } = job.data;
    
    // Notify relevant admins about fraud review
    await adminFraudService.notifyFraudReview(fraudDetectionId, action);
    
    logger.info(`Admin fraud review notification sent for detection ${fraudDetectionId}`);
  } catch (error) {
    logger.error('Admin fraud review notification error:', error);
    throw error;
  }
});

// Admin user queue workers
adminUserQueue.process('apply-enforcement', async (job) => {
  try {
    const { userId, adminId, type, scope, reason, expiresAt } = job.data;
    
    await adminUserService.applyEnforcement(userId, adminId, type, scope, reason, expiresAt);
    
    logger.info(`Admin enforcement applied to user ${userId} by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin enforcement error:', error);
    throw error;
  }
});

adminUserQueue.process('ban-user', async (job) => {
  try {
    const { userId, adminId, reason, duration } = job.data;
    
    await adminUserService.banUser(userId, adminId, reason, duration);
    
    logger.info(`Admin ban applied to user ${userId} by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin ban error:', error);
    throw error;
  }
});

adminUserQueue.process('unban-user', async (job) => {
  try {
    const { userId, adminId, reason } = job.data;
    
    await adminUserService.unbanUser(userId, adminId, reason);
    
    logger.info(`Admin unban applied to user ${userId} by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin unban error:', error);
    throw error;
  }
});

adminUserQueue.process('notify-user-action', async (job) => {
  try {
    const { userId, action, reason } = job.data;
    
    // Notify user about admin action
    await adminUserService.notifyUserAction(userId, action, reason);
    
    logger.info(`Admin user action notification sent to user ${userId}`);
  } catch (error) {
    logger.error('Admin user action notification error:', error);
    throw error;
  }
});

// Admin tribe queue workers
adminTribeQueue.process('update-tribe', async (job) => {
  try {
    const { tribeId, adminId, updates } = job.data;
    
    await adminTribeService.updateTribe(tribeId, adminId, updates);
    
    logger.info(`Admin tribe ${tribeId} updated by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin tribe update error:', error);
    throw error;
  }
});

adminTribeQueue.process('change-captain', async (job) => {
  try {
    const { tribeId, adminId, newCaptainId, reason } = job.data;
    
    await adminTribeService.changeTribeCaptain(tribeId, adminId, newCaptainId, reason);
    
    logger.info(`Admin tribe ${tribeId} captain changed by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin tribe captain change error:', error);
    throw error;
  }
});

adminTribeQueue.process('notify-tribe-action', async (job) => {
  try {
    const { tribeId, action, reason } = job.data;
    
    // Notify tribe members about admin action
    await adminTribeService.notifyTribeAction(tribeId, action, reason);
    
    logger.info(`Admin tribe action notification sent to tribe ${tribeId}`);
  } catch (error) {
    logger.error('Admin tribe action notification error:', error);
    throw error;
  }
});

// Admin audit queue workers
adminAuditQueue.process('log-action', async (job) => {
  try {
    const { actor, action, target, before, after, reason, ip, userAgent } = job.data;
    
    await adminAuditService.logAction(actor, action, target, before, after, reason, ip, userAgent);
    
    logger.info(`Admin audit log created for action ${action}`);
  } catch (error) {
    logger.error('Admin audit log error:', error);
    throw error;
  }
});

adminAuditQueue.process('reverse-action', async (job) => {
  try {
    const { auditLogId, adminId, reason } = job.data;
    
    await adminAuditService.reverseAuditLog(auditLogId, adminId, reason);
    
    logger.info(`Admin audit log ${auditLogId} reversed by admin ${adminId}`);
  } catch (error) {
    logger.error('Admin audit reversal error:', error);
    throw error;
  }
});

adminAuditQueue.process('notify-audit-action', async (job) => {
  try {
    const { auditLogId, action } = job.data;
    
    // Notify relevant admins about audit action
    await adminAuditService.notifyAuditAction(auditLogId, action);
    
    logger.info(`Admin audit action notification sent for log ${auditLogId}`);
  } catch (error) {
    logger.error('Admin audit action notification error:', error);
    throw error;
  }
});

// Error handling for all queues
[adminModerationQueue, adminFraudQueue, adminUserQueue, adminTribeQueue, adminAuditQueue].forEach(queue => {
  queue.on('error', (error) => {
    logger.error(`Admin queue error: ${error.message}`, { error });
  });
  
  queue.on('failed', (job, error) => {
    logger.error(`Admin queue job failed: ${job.id}`, { error });
  });
  
  queue.on('stalled', (job) => {
    logger.warn(`Admin queue job stalled: ${job.id}`);
  });
});

module.exports = {
  adminModerationQueue,
  adminFraudQueue,
  adminUserQueue,
  adminTribeQueue,
  adminAuditQueue
};
