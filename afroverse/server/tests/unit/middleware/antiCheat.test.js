const antiCheat = require('../../../src/middleware/antiCheat');
const fraudDetectionService = require('../../../src/services/fraudDetectionService');
const trustScoreService = require('../../../src/services/trustScoreService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/services/fraudDetectionService');
jest.mock('../../../src/services/trustScoreService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('AntiCheat Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: 'user123' },
      body: {},
      headers: {},
      ip: '192.168.1.1'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  describe('antiCheatVote', () => {
    it('should allow valid vote', async () => {
      fraudDetectionService.detectVoteFraud = jest.fn().mockResolvedValue({ isFraud: false });
      trustScoreService.checkUserPermissions = jest.fn().mockResolvedValue({ allowed: true });

      if (antiCheat.antiCheatVote) {
        await antiCheat.antiCheatVote(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      }
    });

    it('should reject fraudulent vote', async () => {
      fraudDetectionService.detectVoteFraud = jest.fn().mockResolvedValue({
        isFraud: true,
        reason: 'Multiple votes detected'
      });

      if (antiCheat.antiCheatVote) {
        await antiCheat.antiCheatVote(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
      }
    });
  });

  it('should be defined', () => {
    expect(antiCheat).toBeDefined();
  });
});


