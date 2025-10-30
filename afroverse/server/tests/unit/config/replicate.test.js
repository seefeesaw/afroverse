const config = require('../../../src/config/replicate');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('replicate Config', () => {
  it('should be defined', () => {
    expect(config).toBeDefined();
  });
});
