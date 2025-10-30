// const cron = require('node-cron'); // Optional dependency
const notificationScheduler = require('../../../src/schedulers/notificationScheduler');
const notificationService = require('../../../src/services/notificationService');
const User = require('../../../src/models/User');
const Tribe = require('../../../src/models/Tribe');
const { logger } = require('../../../src/utils/logger');

// jest.mock('node-cron'); // Optional dependency
jest.mock('../../../src/services/notificationService');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Tribe');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Notification Scheduler', () => {
  let mockCronJob;

  beforeEach(() => {
    jest.clearAllMocks();
   
    mockCronJob = {
      start: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn()
    };

    cron.schedule.mockReturnValue(mockCronJob);
  });

  describe('Scheduler initialization', () => {
    it('should initialize all scheduled jobs', () => {
      expect(notificationScheduler.jobs).toBeDefined();
      expect(notificationScheduler.jobs instanceof Map).toBe(true);
    });

    it('should schedule daily challenge notification', () => {
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 7 * * *',
        expect.any(Function),
        expect.objectContaining({
          scheduled: true,
          timezone: 'UTC'
        })
      );
    });

    it('should schedule streak reminder', () => {
      const calls = cron.schedule.mock.calls;
      const streakCall = calls.find(call => call[0] === '0 23 * * *');
      expect(streakCall).toBeDefined();
    });

    it('should schedule tribe reset notification', () => {
      const calls = cron.schedule.mock.calls;
      const tribeResetCall = calls.find(call => call[0] === '0 8 * * 1');
      expect(tribeResetCall).toBeDefined();
    });
  });

  describe('sendDailyChallengeNotification', () => {
    it('should send daily challenge notifications', async () => {
      const mockUsers = [
        { _id: 'user1', notifications: { push: { daily: true } } },
        { _id: 'user2', notifications: { push: { daily: true } } }
      ];

      User.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockUsers)
      });

      notificationService.sendNotification = jest.fn().mockResolvedValue({});

      await notificationScheduler.sendDailyChallengeNotification();

      expect(User.find).toHaveBeenCalled();
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      User.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await notificationScheduler.sendDailyChallengeNotification();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendStreakReminderNotification', () => {
    it('should send streak reminders', async () => {
      const mockUsers = [
        { _id: 'user1', streak: { current: 5 } }
      ];

      User.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockUsers)
      });

      notificationService.sendNotification = jest.fn().mockResolvedValue({});

      await notificationScheduler.sendStreakReminderNotification();

      expect(User.find).toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredNotifications', () => {
    it('should cleanup expired notifications', async () => {
      await notificationScheduler.cleanupExpiredNotifications();

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('triggerJob', () => {
    it('should manually trigger a job', async () => {
      notificationScheduler.jobs.set('daily-challenge', mockCronJob);

      const result = await notificationScheduler.triggerJob('daily-challenge');

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error for non-existent job', async () => {
      await expect(
        notificationScheduler.triggerJob('nonexistent-job')
      ).rejects.toThrow('Job nonexistent-job not found');
    });
  });

  describe('getStatus', () => {
    it('should return scheduler status', () => {
      notificationScheduler.jobs.set('daily-challenge', mockCronJob);
      mockCronJob.running = true;

      const status = notificationScheduler.getStatus();

      expect(status).toHaveProperty('jobs');
      expect(status).toHaveProperty('totalJobs');
    });
  });
});


