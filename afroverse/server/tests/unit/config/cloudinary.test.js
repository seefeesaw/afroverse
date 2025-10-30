const config = require('../../../src/config/cloudinary');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('cloudinary Config', () => {
  it('should be defined', () => { expect(config).toBeDefined(); });
});
