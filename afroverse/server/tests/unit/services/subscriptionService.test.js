const SubscriptionService = require('../../../src/services/subscriptionService');
const Subscription = require('../../../src/models/Subscription');
const User = require('../../../src/models/User');
const notificationService = require('../../../src/services/notificationService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/Subscription');
jest.mock('../../../src/models/User');
jest.mock('../../../src/services/notificationService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Subscription Service', () => {
  let subscriptionService;
  let mockSubscription, mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    subscriptionService = new SubscriptionService();

    mockSubscription = {
      _id: 'sub123',
      userId: 'user123',
      status: 'active',
      plan: 'monthly',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {},
      save: jest.fn().mockResolvedValue(mockSubscription)
    };

    mockUser = {
      _id: 'user123',
      updateEntitlementsFromSubscription: jest.fn().mockResolvedValue(undefined)
    };

    Subscription.getExpiredSubscriptions = jest.fn().mockResolvedValue([]);
    Subscription.getExpiringSubscriptions = jest.fn().mockResolvedValue([]);
    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  describe('checkExpiredSubscriptions', () => {
    it('should process expired subscriptions', async () => {
      const expiredSub = {
        ...mockSubscription,
        status: 'active',
        expiresAt: new Date(Date.now() - 1000)
      };

      Subscription.getExpiredSubscriptions.mockResolvedValue([expiredSub]);

      const result = await subscriptionService.checkExpiredSubscriptions();

      expect(result.checked).toBe(1);
      expect(result.expired).toBe(1);
      expect(expiredSub.status).toBe('expired');
      expect(expiredSub.save).toHaveBeenCalled();
      expect(mockUser.updateEntitlementsFromSubscription).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const expiredSub = {
        ...mockSubscription,
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };

      Subscription.getExpiredSubscriptions.mockResolvedValue([expiredSub]);

      const result = await subscriptionService.checkExpiredSubscriptions();

      expect(result.errors).toHaveLength(1);
      expect(result.expired).toBe(0);
    });

    it('should return empty results when no expired subscriptions', async () => {
      const result = await subscriptionService.checkExpiredSubscriptions();

      expect(result.checked).toBe(0);
      expect(result.expired).toBe(0);
    });
  });

  describe('sendRenewalReminders', () => {
    it('should send renewal reminders', async () => {
      const expiringSub = { ...mockSubscription };
      Subscription.getExpiringSubscriptions.mockResolvedValue([expiringSub]);
      notificationService.sendNotification = jest.fn().mockResolvedValue({});

      const result = await subscriptionService.sendRenewalReminders();

      expect(result.sent).toBeGreaterThan(0);
      expect(notificationService.sendNotification).toHaveBeenCalled();
    });

    it('should not send duplicate reminders', async () => {
      const expiringSub = {
        ...mockSubscription,
        metadata: {
          renewal_reminder_7d: new Date()
        }
      };

      Subscription.getExpiringSubscriptions.mockResolvedValue([expiringSub]);

      const result = await subscriptionService.sendRenewalReminders();

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should handle errors when sending reminders', async () => {
      const expiringSub = { ...mockSubscription };
      Subscription.getExpiringSubscriptions.mockResolvedValue([expiringSub]);
      notificationService.sendNotification = jest.fn().mockRejectedValue(new Error('Send failed'));

      const result = await subscriptionService.sendRenewalReminders();

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sendRenewalReminder', () => {
    it('should send reminder for specific subscription', async () => {
      notificationService.sendNotification = jest.fn().mockResolvedValue({});

      await subscriptionService.sendRenewalReminder(mockSubscription, 7);

      expect(notificationService.sendNotification).toHaveBeenCalled();
      expect(mockSubscription.metadata.renewal_reminder_7d).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        subscriptionService.sendRenewalReminder(mockSubscription, 7)
      ).rejects.toThrow('User not found');
    });
  });

  describe('getRenewalReminderMessage', () => {
    it('should return correct message for 7 days', () => {
      const message = subscriptionService.getRenewalReminderMessage(7, 'monthly');

      expect(message.title).toContain('Expires Soon');
      expect(message.body).toContain('7 days');
    });

    it('should return correct message for 3 days', () => {
      const message = subscriptionService.getRenewalReminderMessage(3, 'monthly');

      expect(message.title).toContain('3 Days');
    });

    it('should return correct message for 1 day', () => {
      const message = subscriptionService.getRenewalReminderMessage(1, 'weekly');

      expect(message.title).toContain('Last Day');
      expect(message.body).toContain('Weekly');
    });
  });
});


