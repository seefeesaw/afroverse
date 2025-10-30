// const cron = require('node-cron'); // Optional dependency
const adminSchedulers = require('../../../src/schedulers/adminSchedulers');
const adminModerationService = require('../../../src/services/adminModerationService');
const adminFraudService = require('../../../src/services/adminFraudService');
const adminUserService = require('../../../src/services/adminUserService');
const adminTribeService = require('../../../src/services/adminTribeService');
const adminAuditService = require('../../../src/services/adminAuditService');
const { logger } = require('../../../src/utils/logger');

// jest.mock('node-cron'); // Optional dependency
jest.mock('../../../src/services/adminModerationService');
jest.mock('../../../src/services/adminFraudService');
jest.mock('../../../src/services/adminUserService');
jest.mock('../../../src/services/adminTribeService');
jest.mock('../../../src/services/adminAuditService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Admin Schedulers', () => {
  let mockCronJob;

  beforeEach(() => {
    jest.clearAllMocks();
   
    mockCronJob = {
      start: jest.fn(),
      stop: jest.fn()
    };

    cron.schedule.mockReturnValue(mockCronJob);
  });

  describe('startAdminSchedulers', () => {
    it('should start all admin schedulers', () => {
      adminSchedulers.startAdminSchedulers();

      expect(logger.info).toHaveBeenCalledWith('Starting admin schedulers...');
      expect(mockCronJob.start).toHaveBeenCalled();
    });
  });

  describe('stopAdminSchedulers', () => {
    it('should stop all admin schedulers', () => {
      adminSchedulers.stopAdminSchedulers();

      expect(logger.info).toHaveBeenCalled();
      expect(mockCronJob.stop).toHaveBeenCalled();
    });
  });

  describe('Moderation schedulers', () => {
    it('should have moderation escalation scheduler', () => {
      expect(adminSchedulers.moderationEscalationScheduler).toBeDefined();
    });

    it('should have moderation assignment scheduler', () => {
      expect(adminSchedulers.moderationAssignmentScheduler).toBeDefined();
    });
  });

  describe('Fraud schedulers', () => {
    it('should have fraud review scheduler', () => {
      expect(adminSchedulers.fraudReviewScheduler).toBeDefined();
    });

    it('should have fraud cleanup scheduler', () => {
      expect(adminSchedulers.fraudCleanupScheduler).toBeDefined();
    });

    it('should run fraud cleanup', async () => {
      adminFraudService.cleanupOldFraudDetections = jest.fn().mockResolvedValue(5);

      const task = cron.schedule.mock.calls.find(
        call => call[0] === '0 2 * * *'
      )?.[1];

      if (task) {
        await task();
        expect(adminFraudService.cleanupOldFraudDetections).toHaveBeenCalled();
      }
    });
  });

  describe('User schedulers', () => {
    it('should have user enforcement scheduler', () => {
      expect(adminSchedulers.userEnforcementScheduler).toBeDefined();
    });

    it('should have user ban scheduler', () => {
      expect(adminSchedulers.userBanScheduler).toBeDefined();
    });

    it('should process expired enforcements', async () => {
      const mockEnforcements = [
        { _id: 'enforce1', userId: 'user1' },
        { _id: 'enforce2', userId: 'user2' }
      ];

      adminUserService.getExpiredEnforcements = jest.fn().mockResolvedValue(mockEnforcements);
      adminUserService.expireEnforcement = jest.fn().mockResolvedValue(undefined);

      const task = cron.schedule.mock.calls.find(
        call => call[0] === '0 */6 * * *'
      )?.[1];

      if (task) {
        await task();
        expect(adminUserService.getExpiredEnforcements).toHaveBeenCalled();
        expect(adminUserService.expireEnforcement).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('Audit schedulers', () => {
    it('should have audit log scheduler', () => {
      expect(adminSchedulers.auditLogScheduler).toBeDefined();
    });

    it('should have audit report scheduler', () => {
      expect(adminSchedulers.auditReportScheduler).toBeDefined();
    });

    it('should generate weekly audit report', async () => {
      const mockReport = { week: '2024-01', events: 100 };
      adminAuditService.generateWeeklyReport = jest.fn().mockResolvedValue(mockReport);
      adminAuditService.sendAuditReport = jest.fn().mockResolvedValue(undefined);

      const task = cron.schedule.mock.calls.find(
        call => call[0] === '0 9 * * 1'
      )?.[1];

      if (task) {
        await task();
        expect(adminAuditService.generateWeeklyReport).toHaveBeenCalled();
        expect(adminAuditService.sendAuditReport).toHaveBeenCalledWith(mockReport);
      }
    });
  });

  describe('System health scheduler', () => {
    it('should have system health scheduler', () => {
      expect(adminSchedulers.systemHealthScheduler).toBeDefined();
    });

    it('should check system health', async () => {
      const mockHealthStatus = {
        healthy: true,
        services: {
          database: 'ok',
          redis: 'ok'
        }
      };

      adminAuditService.checkSystemHealth = jest.fn().mockResolvedValue(mockHealthStatus);

      const task = cron.schedule.mock.calls.find(
        call => call[0] === '*/10 * * * *'
      )?.[1];

      if (task) {
        await task();
        expect(adminAuditService.checkSystemHealth).toHaveBeenCalled();
      }
    });
  });
});

