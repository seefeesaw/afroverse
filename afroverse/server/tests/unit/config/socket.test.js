const config = require('../../../src/config/socket');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('socket Config', () => {
  it('should be defined', () => {
    expect(config).toBeDefined();
  });
});
