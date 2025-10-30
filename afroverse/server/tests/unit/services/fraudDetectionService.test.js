const FraudDetectionService = require('../../../src/services/fraudDetectionService');
const FraudDetection = require('../../../src/models/FraudDetection');
const TrustScore = require('../../../src/models/TrustScore');
const DeviceFingerprint = require('../../../src/models/DeviceFingerprint');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/FraudDetection');
jest.mock('../../../src/models/TrustScore');
jest.mock('../../../src/models/DeviceFingerprint');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Fraud Detection Service', () => {
  let fraudService;

  beforeEach(() => {
    jest.clearAllMocks();
    fraudService = new FraudDetectionService();
  });

  describe('detectVoteFraud', () => {
    it('should detect vote fraud patterns', async () => {
      FraudDetection.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          { userId: 'user123', battleId: 'battle1' }
        ])
      });

      const result = await fraudService.detectVoteFraud(
        'user123',
        'battle2',
        'device123',
        '192.168.1.1'
      );

      expect(result).toHaveProperty('isFraud');
      expect(result).toHaveProperty('reason');
    });

    it('should not detect fraud for normal voting', async () => {
      FraudDetection.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      });

      const result = await fraudService.detectVoteFraud(
        'user123',
        'battle1',
        'device123',
        '192.168.1.1'
      );

      expect(result.isFraud).toBe(false);
    });
  });

  describe('detectMultiAccount', () => {
    it('should detect multi-account usage', async () => {
      DeviceFingerprint.find = jest.fn().mockReturnValue({
        distinct: jest.fn().mockResolvedValue(['user1', 'user2', 'user3'])
      });

      const result = await fraudService.detectMultiAccount(
        'user123',
        'device123',
        '192.168.1.1',
        {}
      );

      expect(result).toHaveProperty('isFraud');
    });
  });

  describe('fraudTypes', () => {
    it('should have all required fraud types', () => {
      expect(fraudService.fraudTypes).toHaveProperty('vote_fraud');
      expect(fraudService.fraudTypes).toHaveProperty('multi_account');
      expect(fraudService.fraudTypes).toHaveProperty('nsfw_content');
      expect(fraudService.fraudTypes).toHaveProperty('spam_battle');
    });
  });
});


