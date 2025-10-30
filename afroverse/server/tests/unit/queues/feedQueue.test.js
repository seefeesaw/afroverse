const queue = require('../../../src/queues/feedQueue');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('feedQueue', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(queue).toBeDefined(); });
});
