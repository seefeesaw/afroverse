const TrustScoreService = require('../../../src/services/trustScoreService');
const TrustScore = require('../../../src/models/TrustScore');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/TrustScore');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Trust Score Service', () => {
  let trustScoreService;

  beforeEach(() => {
    jest.clearAllMocks();
    trustScoreService = TrustScoreService;
  });

  it('should be defined', () => {
    expect(trustScoreService).toBeDefined();
  });

  describe('createTrustScore', () => {
    it('should create trust score for user', async () => {
      const mockTrustScore = {
        getSummary: jest.fn().mockReturnValue({ score: 50, level: 'normal' })
      };

      TrustScore.createTrustScore = jest.fn().mockResolvedValue(mockTrustScore);

      const result = await trustScoreService.createTrustScore('user123', 50);

      expect(result.success).toBe(true);
      expect(TrustScore.createTrustScore).toHaveBeenCalledWith('user123', 50);
    });
  });

  describe('getTrustScoreByUser', () => {
    it('should get trust score by user', async () => {
      const mockTrustScore = { _id: 'ts123', userId: 'user123', score: 75 };
      TrustScore.getTrustScoreByUser = jest.fn().mockResolvedValue(mockTrustScore);

      const result = await trustScoreService.getTrustScoreByUser('user123');

      expect(TrustScore.getTrustScoreByUser).toHaveBeenCalledWith('user123');
      expect(result).toBe(mockTrustScore);
    });
  });

  describe('checkUserPermissions', () => {
    it('should check user permissions', async () => {
      const mockTrustScore = {
        flags: {
          canVote: true,
          canCreateBattle: true
        }
      };

      TrustScore.getTrustScoreByUser = jest.fn().mockResolvedValue(mockTrustScore);

      const result = await trustScoreService.checkUserPermissions('user123', 'vote');

      expect(result).toHaveProperty('allowed');
    });
  });
});


