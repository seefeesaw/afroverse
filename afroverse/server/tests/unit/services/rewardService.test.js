jest.mock('../../../src/models/UserReward', () => ({
  grantReward: jest.fn(async () => ({ items: [{ id: 'r1' }] })),
  getUserRewards: jest.fn(async () => ({
    getUnclaimedRewards: () => [],
    getInventorySummary: () => ({ vouchers: {}, tokens: {}, boosts: [], cosmetics: { equipped: {}, owned: [], temporary: [] } }),
    hasReward: () => true,
    getRewardQuantity: () => 2,
    cleanExpiredRewards: () => 0,
    save: jest.fn(),
  })),
  getRewardStatistics: jest.fn(async () => ({})),
  getTopRewardEarners: jest.fn(async () => ([])),
}));

jest.mock('../../../src/models/UserCosmetic', () => ({
  addTemporaryCosmetic: jest.fn(async () => {}),
  addCosmetic: jest.fn(async () => {}),
  getUserCosmetics: jest.fn(async () => ({
    ownsCosmetic: () => true,
    getCosmeticDisplayInfo: () => ({ equipped: {}, owned: [], temporary: [] }),
    getEquippedCosmetics: () => ({ frame: null, title: null, confetti: null }),
    cleanExpiredCosmetics: () => 0,
    save: jest.fn(),
  })),
  equipCosmetic: jest.fn(async () => {}),
  unequipCosmetic: jest.fn(async () => {}),
  getCosmeticStatistics: jest.fn(async () => ({})),
  getTopCollectors: jest.fn(async () => ([])),
}));

const rewardService = require('../../../src/services/rewardService');

describe('rewardService', () => {
  test('validateRewardData catches invalid inputs', () => {
    const invalid = rewardService.validateRewardData({});
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  test('deriveLabel returns human-friendly label', () => {
    expect(rewardService.deriveLabel('frame_gold')).toContain('Gold');
  });

  test('grantReward returns success and id', async () => {
    const res = await rewardService.grantReward('u1', { type: 'cosmetic', key: 'frame_gold', qty: 1, grantedBy: { type: 'system' } });
    expect(res.success).toBe(true);
    expect(res.rewardId).toBeDefined();
  });
});

const service = require('../../../src/services/rewardService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('rewardService', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
