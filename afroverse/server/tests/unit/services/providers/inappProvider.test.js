const inappProvider = require('../../../../src/services/providers/inappProvider');
const { logger } = require('../../../../src/utils/logger');

jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('InApp Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(inappProvider).toBeDefined();
  });

  // Add specific provider method tests based on implementation
});


