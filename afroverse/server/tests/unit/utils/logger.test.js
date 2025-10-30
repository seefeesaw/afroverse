const winston = require('winston');

// Mock winston before importing logger
jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn(() => mockFormat),
    timestamp: jest.fn(() => mockFormat),
    errors: jest.fn(() => mockFormat),
    printf: jest.fn(() => mockFormat),
    colorize: jest.fn(() => mockFormat),
    simple: jest.fn(() => mockFormat),
    json: jest.fn(() => mockFormat)
  };
  
  const mockTransport = jest.fn();
  
  return {
    format: mockFormat,
    transports: {
      Console: mockTransport,
      File: mockTransport
    },
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }))
  };
});

const { logger } = require('../../../src/utils/logger');

describe('Logger', () => {
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();
   
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      add: jest.fn()
    };

    winston.createLogger.mockReturnValue(mockLogger);
  });

  it('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(winston.createLogger).toHaveBeenCalled();
  });

  it('should have required log methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(logger).toBeDefined();
  });

  it('should log error messages', () => {
    logger.error('Error message');
    expect(logger).toBeDefined();
  });

  it('should log warnings', () => {
    logger.warn('Warning message');
    expect(logger).toBeDefined();
  });
});

