const notificationDispatcher = require('../../../src/services/notificationDispatcher');

describe('notificationDispatcher', () => {
  const mockDispatcher = {
    send: jest.fn(async () => ({ success: true })),
    sendBulk: jest.fn(async () => ({ success: true, results: [{ success: true }] })),
    getStats: jest.fn(() => ({ queued: 0 })),
  };

  beforeEach(() => {
    mockDispatcher.send.mockClear();
    mockDispatcher.sendBulk.mockClear();
    notificationDispatcher.registerDispatcher('push', mockDispatcher);
  });

  test('registerDispatcher and isChannelAvailable', () => {
    expect(notificationDispatcher.isChannelAvailable('push')).toBe(true);
    expect(notificationDispatcher.getAvailableChannels()).toContain('push');
  });

  test('send routes to channel dispatcher', async () => {
    const res = await notificationDispatcher.send({ _id: 'n1', channel: 'push', title: 't', message: 'm', type: 'x' }, { canReceiveNotification: () => true });
    expect(res.success).toBe(true);
    expect(mockDispatcher.send).toHaveBeenCalled();
  });

  test('sendWithFallback tries channels and returns success on first success', async () => {
    const userSettings = { canReceiveNotification: () => true };
    const res = await notificationDispatcher.sendWithFallback({ _id: 'n2', channel: 'email', title: 't', message: 'm', type: 'x' }, userSettings, ['push']);
    expect(res.success).toBe(true);
  });

  test('getStats includes dispatcher stats', () => {
    const stats = notificationDispatcher.getStats();
    expect(stats.totalDispatchers).toBeGreaterThan(0);
    expect(stats.push).toBeDefined();
  });
});

const service = require('../../../src/services/notificationDispatcher');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('notificationDispatcher', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
