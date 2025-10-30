const referralController = require('../../../src/controllers/referralController');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('referralController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 'user123' }, body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should be defined', () => {
    expect(referralController).toBeDefined();
  });
});
