const queueManager = require('../../../src/queues/queueManager');
const battleQueue = require('../../../src/queues/battleQueue');
const feedQueue = require('../../../src/queues/feedQueue');
const leaderboardQueue = require('../../../src/queues/leaderboardQueue');
const notificationQueue = require('../../../src/queues/notificationQueue');
const paymentQueue = require('../../../src/queues/paymentQueue');
const progressionQueue = require('../../../src/queues/progressionQueue');
const transformQueue = require('../../../src/queues/transformQueue');

jest.mock('../../../src/queues/battleQueue');
jest.mock('../../../src/queues/feedQueue');
jest.mock('../../../src/queues/leaderboardQueue');
jest.mock('../../../src/queues/notificationQueue');
jest.mock('../../../src/queues/paymentQueue');
jest.mock('../../../src/queues/progressionQueue');
jest.mock('../../../src/queues/transformQueue');

describe('Queue Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQueue', () => {
    it('should return queue by name with Queue suffix', () => {
      const queue = queueManager.getQueue('battle');
      expect(queue).toBe(battleQueue);
    });

    it('should return queue by full name', () => {
      const queue = queueManager.getQueue('battleQueue');
      expect(queue).toBe(battleQueue);
    });

    it('should return null for non-existent queue', () => {
      const queue = queueManager.getQueue('nonexistent');
      expect(queue).toBeUndefined();
    });

    it('should return all available queues', () => {
      expect(queueManager.getQueue('battle')).toBe(battleQueue);
      expect(queueManager.getQueue('feed')).toBe(feedQueue);
      expect(queueManager.getQueue('leaderboard')).toBe(leaderboardQueue);
      expect(queueManager.getQueue('notification')).toBe(notificationQueue);
      expect(queueManager.getQueue('payment')).toBe(paymentQueue);
      expect(queueManager.getQueue('progression')).toBe(progressionQueue);
      expect(queueManager.getQueue('transform')).toBe(transformQueue);
    });
  });

  describe('initializeQueues', () => {
    it('should initialize all queues', async () => {
      const result = await queueManager.initializeQueues();
      expect(result).toBeDefined();
    });

    it('should resolve successfully', async () => {
      await expect(queueManager.initializeQueues()).resolves.not.toThrow();
    });
  });

  describe('queues object', () => {
    it('should have all expected queues', () => {
      expect(queueManager.queues).toHaveProperty('battleQueue');
      expect(queueManager.queues).toHaveProperty('feedQueue');
      expect(queueManager.queues).toHaveProperty('leaderboardQueue');
      expect(queueManager.queues).toHaveProperty('notificationQueue');
      expect(queueManager.queues).toHaveProperty('paymentQueue');
      expect(queueManager.queues).toHaveProperty('progressionQueue');
      expect(queueManager.queues).toHaveProperty('transformQueue');
    });
  });
});


