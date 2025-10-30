const challengeWorker = require('../../../src/workers/challengeWorker');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('challengeWorker', () => {
  it('should be defined', () => {
    expect(challengeWorker).toBeDefined();
  });
});
