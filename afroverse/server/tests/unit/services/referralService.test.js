jest.mock('../../../src/models/Referral', () => ({
  countDocuments: jest.fn(async () => 0),
  findById: jest.fn(async () => null),
  getReferralStats: jest.fn(async () => []),
  getTopRecruiters: jest.fn(async () => []),
  getTopRecruitingTribes: jest.fn(async () => []),
  find: jest.fn(() => ({ select: () => [] })),
}));

jest.mock('../../../src/models/User', () => ({
  findById: jest.fn(async () => ({ referral: {}, save: jest.fn(), _id: 'u1' })),
  findOne: jest.fn(async () => null),
  updateMany: jest.fn(async () => ({})),
}));

jest.mock('../../../src/queues/queueManager', () => ({
  getQueue: () => ({ add: jest.fn(async () => ({})) }),
}));

jest.mock('../../../src/services/walletService', () => ({
  earnCoins: jest.fn(async () => ({})),
}));

jest.mock('../../../src/services/notificationService', () => ({
  createNotification: jest.fn(async () => ({})),
}));

jest.mock('../../../src/sockets/socketService', () => ({
  io: { to: () => ({ emit: jest.fn() }) },
}));

const referralService = require('../../../src/services/referralService');

describe('referralService', () => {
  test('calculateReferrerRewards accumulates per tiers', () => {
    const rewards = referralService.calculateReferrerRewards(10);
    expect(rewards.xp).toBeGreaterThan(0);
    expect(rewards.message).toBeDefined();
  });

  test('calculateRecruitmentRank returns expected tiers', () => {
    expect(referralService.calculateRecruitmentRank(0)).toBe('scout');
    expect(referralService.calculateRecruitmentRank(10)).toBe('captain');
    expect(referralService.calculateRecruitmentRank(25)).toBe('warlord');
  });

  test('getNextRewardThreshold returns next threshold data', () => {
    const t = referralService.getNextRewardThreshold(1);
    expect(t).toBeTruthy();
    expect(t.threshold).toBeGreaterThan(1);
  });

  test('performFraudChecks passes with low activity', async () => {
    const res = await referralService.performFraudChecks('r1', 'u2', {});
    expect(res.passed).toBe(true);
  });
});

const service = require('../../../src/services/referralService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('referralService', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
