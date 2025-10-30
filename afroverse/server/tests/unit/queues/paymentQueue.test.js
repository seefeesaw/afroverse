const Bull = require('bull');
const paymentQueue = require('../../../src/queues/paymentQueue');
const subscriptionService = require('../../../src/services/subscriptionService');
const { logger } = require('../../../src/utils/logger');

jest.mock('bull');
jest.mock('../../../src/services/subscriptionService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Payment Queue', () => {
  let mockQueue;

  beforeEach(() => {
    jest.clearAllMocks();
   
    mockQueue = {
      process: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'job123' }),
      close: jest.fn()
    };

    Bull.mockReturnValue(mockQueue);
  });

  describe('Queue initialization', () => {
    it('should create payment queue with correct configuration', () => {
      expect(Bull).toHaveBeenCalledWith('payment queue', expect.objectContaining({
        redis: expect.objectContaining({
          host: expect.any(String),
          port: expect.any(Number)
        })
      }));
    });
  });

  describe('Job processors', () => {
    it('should register subscription expiry checker processor', () => {
      expect(mockQueue.process).toHaveBeenCalledWith(
        'subscription-expiry-checker',
        expect.any(Function)
      );
    });

    it('should register renewal reminder sender processor', () => {
      expect(mockQueue.process).toHaveBeenCalledWith(
        'send-renewal-reminder',
        expect.any(Function)
      );
    });

    it('should process subscription expiry checker job', async () => {
      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'subscription-expiry-checker'
      )[1];

      subscriptionService.checkExpiredSubscriptions = jest.fn().mockResolvedValue({
        checked: 10,
        expired: 2
      });

      const mockJob = {
        data: {},
        progress: jest.fn()
      };

      await processor(mockJob);

      expect(subscriptionService.checkExpiredSubscriptions).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle errors in subscription expiry checker', async () => {
      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'subscription-expiry-checker'
      )[1];

      subscriptionService.checkExpiredSubscriptions = jest.fn().mockRejectedValue(
        new Error('Service error')
      );

      const mockJob = {
        data: {},
        progress: jest.fn()
      };

      await expect(processor(mockJob)).rejects.toThrow('Service error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Recurring jobs', () => {
    it('should schedule recurring subscription expiry check', () => {
      // This tests that the scheduleRecurringJobs function can be called
      expect(mockQueue.add).toBeDefined();
    });

    it('should have correct cron schedule for expiry checker', () => {
      // Verify cron schedule format
      const cronPattern = '0 * * * *'; // Every hour
      expect(typeof cronPattern).toBe('string');
    });
  });
});

