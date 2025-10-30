jest.mock('bull');
jest.mock('../../../src/services/leaderboardService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

const Bull = require('bull');
const leaderboardService = require('../../../src/services/leaderboardService');
const { logger } = require('../../../src/utils/logger');

describe('Leaderboard Queue', () => {
  let mockQueue;

  beforeAll(() => {
    mockQueue = {
      process: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'job123' }),
      on: jest.fn(),
      close: jest.fn()
    };

    Bull.mockReturnValue(mockQueue);
    
    // Now require the module which will use the mocked Bull
    require('../../../src/queues/leaderboardQueue');
  });

  beforeEach(() => {
    leaderboardService.weeklyReset = jest.fn();
  });

  describe('Queue initialization', () => {
    it('should create leaderboard queue', () => {
      expect(Bull).toHaveBeenCalledWith('leaderboard queue', expect.objectContaining({
        redis: expect.objectContaining({
          host: expect.any(String)
        })
      }));
    });
  });

  describe('Job processors', () => {
    it('should register weekly reset processor', () => {
      expect(mockQueue.process).toHaveBeenCalledWith(
        'weekly-reset',
        expect.any(Function)
      );
    });

    it('should process weekly reset job', async () => {
      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'weekly-reset'
      )?.[1];

      if (processor) {
        leaderboardService.weeklyReset = jest.fn().mockResolvedValue({
          success: true,
          reset: true
        });

        const mockJob = {
          data: {}
        };

        await processor(mockJob);

        expect(leaderboardService.weeklyReset).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalled();
      }
    });

    it('should handle weekly reset errors', async () => {
      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'weekly-reset'
      )?.[1];

      if (processor) {
        leaderboardService.weeklyReset = jest.fn().mockRejectedValue(
          new Error('Reset failed')
        );

        const mockJob = {
          data: {}
        };

        await expect(processor(mockJob)).rejects.toThrow();
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });
});

