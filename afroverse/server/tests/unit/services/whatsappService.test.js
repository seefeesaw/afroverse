const whatsappService = require('../../../src/services/whatsappService.js');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('whatsappService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module exports', () => {
    it('should be defined', () => {
      expect(whatsappService).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof whatsappService).toBe('object');
    });

  });

});
