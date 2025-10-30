const config = require('../../../src/config/database');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('database Config', () => {
  it('should be defined', () => {
    expect(config).toBeDefined();
  });
});
