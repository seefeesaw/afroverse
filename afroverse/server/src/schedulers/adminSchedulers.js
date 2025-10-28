const cron = require('node-cron');
const adminModerationService = require('../services/adminModerationService');
const adminFraudService = require('../services/adminFraudService');
const adminUserService = require('../services/adminUserService');
const adminTribeService = require('../services/adminTribeService');
const adminAuditService = require('../services/adminAuditService');
const { logger } = require('../utils/logger');

// Admin moderation schedulers
const moderationEscalationScheduler = cron.schedule('*/15 * * * *', async () => {
  try {
    logger.info('Running admin moderation escalation check...');
    
    // Check for jobs that need escalation
    const jobsToEscalate = await adminModerationService.getJobsNeedingEscalation();
    
    for (const job of jobsToEscalate) {
      await adminModerationService.escalateModerationJob(job._id, null, 'Auto-escalation: Job pending too long', 'high');
      logger.info(`Auto-escalated moderation job ${job._id}`);
    }
    
    logger.info(`Admin moderation escalation check completed. ${jobsToEscalate.length} jobs escalated.`);
  } catch (error) {
    logger.error('Admin moderation escalation scheduler error:', error);
  }
});

const moderationAssignmentScheduler = cron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Running admin moderation assignment check...');
    
    // Check for unassigned jobs and assign them
    const unassignedJobs = await adminModerationService.getUnassignedJobs();
    
    for (const job of unassignedJobs) {
      const availableAdmin = await adminModerationService.getAvailableAdmin();
      if (availableAdmin) {
        await adminModerationService.assignModerationJob(job._id, availableAdmin._id);
        logger.info(`Auto-assigned moderation job ${job._id} to admin ${availableAdmin._id}`);
      }
    }
    
    logger.info(`Admin moderation assignment check completed. ${unassignedJobs.length} jobs processed.`);
  } catch (error) {
    logger.error('Admin moderation assignment scheduler error:', error);
  }
});

// Admin fraud schedulers
const fraudReviewScheduler = cron.schedule('*/30 * * * *', async () => {
  try {
    logger.info('Running admin fraud review check...');
    
    // Check for fraud detections that need review
    const fraudDetectionsToReview = await adminFraudService.getFraudDetectionsNeedingReview();
    
    for (const detection of fraudDetectionsToReview) {
      // Auto-review based on severity and evidence
      const action = await adminFraudService.autoReviewFraudDetection(detection);
      if (action) {
        await adminFraudService.reviewFraudDetection(detection._id, null, action, 'Auto-review based on evidence');
        logger.info(`Auto-reviewed fraud detection ${detection._id} with action ${action}`);
      }
    }
    
    logger.info(`Admin fraud review check completed. ${fraudDetectionsToReview.length} detections processed.`);
  } catch (error) {
    logger.error('Admin fraud review scheduler error:', error);
  }
});

const fraudCleanupScheduler = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Running admin fraud cleanup...');
    
    // Clean up old resolved fraud detections
    const cleanedCount = await adminFraudService.cleanupOldFraudDetections();
    
    logger.info(`Admin fraud cleanup completed. ${cleanedCount} old detections cleaned up.`);
  } catch (error) {
    logger.error('Admin fraud cleanup scheduler error:', error);
  }
});

// Admin user schedulers
const userEnforcementScheduler = cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Running admin user enforcement check...');
    
    // Check for expired enforcements
    const expiredEnforcements = await adminUserService.getExpiredEnforcements();
    
    for (const enforcement of expiredEnforcements) {
      await adminUserService.expireEnforcement(enforcement._id);
      logger.info(`Expired enforcement ${enforcement._id} for user ${enforcement.userId}`);
    }
    
    logger.info(`Admin user enforcement check completed. ${expiredEnforcements.length} enforcements expired.`);
  } catch (error) {
    logger.error('Admin user enforcement scheduler error:', error);
  }
});

const userBanScheduler = cron.schedule('0 1 * * *', async () => {
  try {
    logger.info('Running admin user ban check...');
    
    // Check for expired bans
    const expiredBans = await adminUserService.getExpiredBans();
    
    for (const ban of expiredBans) {
      await adminUserService.expireBan(ban._id);
      logger.info(`Expired ban ${ban._id} for user ${ban.userId}`);
    }
    
    logger.info(`Admin user ban check completed. ${expiredBans.length} bans expired.`);
  } catch (error) {
    logger.error('Admin user ban scheduler error:', error);
  }
});

// Admin tribe schedulers
const tribeCaptainScheduler = cron.schedule('0 0 * * 1', async () => {
  try {
    logger.info('Running admin tribe captain check...');
    
    // Check for inactive tribe captains
    const inactiveCaptains = await adminTribeService.getInactiveCaptains();
    
    for (const captain of inactiveCaptains) {
      const newCaptain = await adminTribeService.findNewCaptain(captain.tribeId);
      if (newCaptain) {
        await adminTribeService.changeTribeCaptain(captain.tribeId, null, newCaptain._id, 'Auto-change: Captain inactive');
        logger.info(`Auto-changed captain for tribe ${captain.tribeId} to user ${newCaptain._id}`);
      }
    }
    
    logger.info(`Admin tribe captain check completed. ${inactiveCaptains.length} captains checked.`);
  } catch (error) {
    logger.error('Admin tribe captain scheduler error:', error);
  }
});

const tribeCleanupScheduler = cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('Running admin tribe cleanup...');
    
    // Clean up inactive tribes
    const cleanedCount = await adminTribeService.cleanupInactiveTribes();
    
    logger.info(`Admin tribe cleanup completed. ${cleanedCount} inactive tribes cleaned up.`);
  } catch (error) {
    logger.error('Admin tribe cleanup scheduler error:', error);
  }
});

// Admin audit schedulers
const auditLogScheduler = cron.schedule('0 4 * * *', async () => {
  try {
    logger.info('Running admin audit log cleanup...');
    
    // Clean up old audit logs
    const cleanedCount = await adminAuditService.cleanupOldAuditLogs();
    
    logger.info(`Admin audit log cleanup completed. ${cleanedCount} old logs cleaned up.`);
  } catch (error) {
    logger.error('Admin audit log cleanup scheduler error:', error);
  }
});

const auditReportScheduler = cron.schedule('0 9 * * 1', async () => {
  try {
    logger.info('Running admin audit report generation...');
    
    // Generate weekly audit report
    const report = await adminAuditService.generateWeeklyReport();
    
    // Send report to admins
    await adminAuditService.sendAuditReport(report);
    
    logger.info('Admin audit report generated and sent');
  } catch (error) {
    logger.error('Admin audit report scheduler error:', error);
  }
});

// Admin system health check scheduler
const systemHealthScheduler = cron.schedule('*/10 * * * *', async () => {
  try {
    logger.info('Running admin system health check...');
    
    // Check system health
    const healthStatus = await adminAuditService.checkSystemHealth();
    
    if (!healthStatus.healthy) {
      logger.warn('Admin system health check failed:', healthStatus);
      // Notify admins about system issues
      await adminAuditService.notifySystemHealthIssue(healthStatus);
    }
    
    logger.info('Admin system health check completed');
  } catch (error) {
    logger.error('Admin system health scheduler error:', error);
  }
});

// Start all schedulers
const startAdminSchedulers = () => {
  logger.info('Starting admin schedulers...');
  
  moderationEscalationScheduler.start();
  moderationAssignmentScheduler.start();
  fraudReviewScheduler.start();
  fraudCleanupScheduler.start();
  userEnforcementScheduler.start();
  userBanScheduler.start();
  tribeCaptainScheduler.start();
  tribeCleanupScheduler.start();
  auditLogScheduler.start();
  auditReportScheduler.start();
  systemHealthScheduler.start();
  
  logger.info('Admin schedulers started successfully');
};

// Stop all schedulers
const stopAdminSchedulers = () => {
  logger.info('Stopping admin schedulers...');
  
  moderationEscalationScheduler.stop();
  moderationAssignmentScheduler.stop();
  fraudReviewScheduler.stop();
  fraudCleanupScheduler.stop();
  userEnforcementScheduler.stop();
  userBanScheduler.stop();
  tribeCaptainScheduler.stop();
  tribeCleanupScheduler.stop();
  auditLogScheduler.stop();
  auditReportScheduler.stop();
  systemHealthScheduler.stop();
  
  logger.info('Admin schedulers stopped successfully');
};

module.exports = {
  startAdminSchedulers,
  stopAdminSchedulers,
  
  // Individual schedulers for testing
  moderationEscalationScheduler,
  moderationAssignmentScheduler,
  fraudReviewScheduler,
  fraudCleanupScheduler,
  userEnforcementScheduler,
  userBanScheduler,
  tribeCaptainScheduler,
  tribeCleanupScheduler,
  auditLogScheduler,
  auditReportScheduler,
  systemHealthScheduler
};
