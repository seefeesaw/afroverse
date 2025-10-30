jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn().mockResolvedValue(null),
    zscore: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue(true),
    zadd: jest.fn().mockResolvedValue(true),
    zremrangebyrank: jest.fn().mockResolvedValue(true),
    zrevrange: jest.fn().mockResolvedValue([]),
    zrevrank: jest.fn().mockResolvedValue(null),
    expire: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../../src/models/Battle', () => ({
  find: jest.fn(() => ({ select: () => ({ limit: () => ({ lean: () => [] }) }) })),
}));

const feedScoringService = require('../../../src/services/feedScoringService');

describe('feedScoringService', () => {
  test('calculateRecency decreases with time', () => {
    const now = new Date();
    const recent = feedScoringService.calculateRecency(now);
    const old = feedScoringService.calculateRecency(new Date(now.getTime() - 10 * 60 * 60 * 1000));
    expect(recent).toBeGreaterThan(old);
  });

  test('calculateScore aggregates components and is non-negative', async () => {
    const battle = { _id: 'b1', status: { timeline: { started: new Date() } } };
    const score = await feedScoringService.calculateScore(battle, 'global');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('updateVelocity stores EMA-based velocity', async () => {
    const velocity = await feedScoringService.updateVelocity('b1');
    expect(typeof velocity).toBe('number');
  });

  test('recomputeScores returns summary object', async () => {
    const res = await feedScoringService.recomputeScores('global', 5);
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('updated');
  });
});

const service = require('../../../src/services/feedScoringService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('feedScoringService', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
