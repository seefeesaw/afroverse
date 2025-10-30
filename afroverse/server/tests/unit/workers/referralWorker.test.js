const referralWorker = require('../../../src/workers/referralWorker');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('referralWorker', () => {
  it('should be defined', () => {
    expect(referralWorker).toBeDefined();
  });
});
