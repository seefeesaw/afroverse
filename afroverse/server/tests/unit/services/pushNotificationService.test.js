jest.mock('firebase-admin', () => {
  const sendMulticast = jest.fn(async () => ({ successCount: 0, failureCount: 1, responses: [{ success: false, error: { code: 'messaging/invalid-registration-token' } }] }));
  const send = jest.fn(async () => 'message-id');
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn(() => ({})) },
    messaging: () => ({ sendMulticast, send, subscribeToTopic: jest.fn(async () => ({ successCount: 0 })), unsubscribeFromTopic: jest.fn(async () => ({ successCount: 0 })) }),
  };
});

const pushNotificationService = require('../../../src/services/pushNotificationService');

describe('pushNotificationService', () => {
  const makeUserSettings = (tokens = []) => ({
    userId: 'u1',
    deviceTokens: tokens,
    save: jest.fn(async () => {}),
  });

  test('send returns error when no device tokens', async () => {
    const res = await pushNotificationService.send({ _id: 'n1', title: 't', message: 'm', type: 'x', metadata: {} }, makeUserSettings([]));
    expect(res.success).toBe(false);
  });

  test('sendBulk handles no valid messages gracefully', async () => {
    const res = await pushNotificationService.sendBulk([], []);
    expect(res.success).toBe(false);
  });
});

const service = require('../../../src/services/pushNotificationService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('pushNotificationService', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
