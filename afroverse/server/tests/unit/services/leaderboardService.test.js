const LeaderboardService = require('../../../src/services/leaderboardService');
const UserAggregate = require('../../../src/models/UserAggregate');
const TribeAggregate = require('../../../src/models/TribeAggregate');
const { redisClient } = require('../../../src/config/redis');
const socketService = require('../../../src/sockets/socketService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/UserAggregate');
jest.mock('../../../src/models/TribeAggregate');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/sockets/socketService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Leaderboard Service', () => {
  let leaderboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    leaderboardService = new LeaderboardService();

    redisClient.zincrby = jest.fn().mockResolvedValue(100);
    redisClient.zscore = jest.fn().mockResolvedValue('150');
    redisClient.zrevrange = jest.fn().mockResolvedValue(['user1', 'user2', 'user3']);
    redisClient.zrank = jest.fn().mockResolvedValue(5);
  });

  describe('awardUserPoints', () => {
    it('should award points to user successfully', async () => {
      const mockUserAgg = {
        _id: 'user123',
        country: 'US',
        awardPoints: jest.fn().mockResolvedValue(undefined)
      };

      UserAggregate.findById.mockResolvedValue(mockUserAgg);

      const result = await leaderboardService.awardUserPoints({
        userId: 'user123',
        points: 50,
        reason: 'battle_win'
      });

      expect(redisClient.zincrby).toHaveBeenCalled();
      expect(mockUserAgg.awardPoints).toHaveBeenCalled();
      expect(socketService.emitLeaderboardUpdate).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.points).toBe(50);
    });

    it('should reject missing parameters', async () => {
      await expect(
        leaderboardService.awardUserPoints({})
      ).rejects.toThrow('Missing required parameters');
    });

    it('should update country leaderboards when user has country', async () => {
      const mockUserAgg = {
        _id: 'user123',
        country: 'US',
        awardPoints: jest.fn().mockResolvedValue(undefined)
      };

      UserAggregate.findById.mockResolvedValue(mockUserAgg);

      await leaderboardService.awardUserPoints({
        userId: 'user123',
        points: 50,
        reason: 'battle_win'
      });

      // Should update country-specific leaderboards
      expect(redisClient.zincrby).toHaveBeenCalledWith(
        expect.stringContaining('country:US'),
        50,
        'user123'
      );
    });
  });

  describe('awardTribePoints', () => {
    it('should award points to tribe successfully', async () => {
      const mockTribeAgg = {
        _id: 'tribe123',
        awardPoints: jest.fn().mockResolvedValue(undefined)
      };

      TribeAggregate.findById.mockResolvedValue(mockTribeAgg);

      const result = await leaderboardService.awardTribePoints({
        tribeId: 'tribe123',
        points: 100,
        reason: 'battle_win'
      });

      expect(redisClient.zincrby).toHaveBeenCalled();
      expect(mockTribeAgg.awardPoints).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('getLeaderboard', () => {
    it('should get user leaderboard', async () => {
      const result = await leaderboardService.getLeaderboard('users', 'weekly', {
        limit: 10,
        offset: 0
      });

      expect(redisClient.zrevrange).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should get tribe leaderboard', async () => {
      const result = await leaderboardService.getLeaderboard('tribes', 'all', {
        limit: 10
      });

      expect(redisClient.zrevrange).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getUserRank', () => {
    it('should get user rank', async () => {
      const result = await leaderboardService.getUserRank('user123', 'weekly');

      expect(redisClient.zrank).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});


