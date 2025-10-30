const whatsappProvider = require('../../../../src/services/providers/whatsappProvider');
const { logger } = require('../../../../src/utils/logger');

jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('WhatsApp Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(whatsappProvider).toBeDefined();
  });

  // Add specific provider method tests based on implementation
});


