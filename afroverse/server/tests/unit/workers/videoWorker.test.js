const videoWorker = require('../../../src/workers/videoWorker');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { 
    error: jest.fn(), 
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('videoWorker', () => {
  it('should be defined', () => {
    expect(videoWorker).toBeDefined();
  });
});
