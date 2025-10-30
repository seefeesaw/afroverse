const eventWorker = require('../../../src/workers/eventWorker');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('eventWorker', () => {
  it('should be defined', () => {
    expect(eventWorker).toBeDefined();
  });
});
