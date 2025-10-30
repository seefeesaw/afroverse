const NotificationService = require('../../../src/services/notificationService');
const Notification = require('../../../src/models/Notification');
const UserSettings = require('../../../src/models/UserSettings');
const NotificationTemplate = require('../../../src/models/NotificationTemplate');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/Notification');
jest.mock('../../../src/models/UserSettings');
jest.mock('../../../src/models/NotificationTemplate');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Notification Service', () => {
  let notificationService;
  let mockNotification, mockUserSettings, mockTemplate, mockDispatcher;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();

    mockUserSettings = {
      match: 'settings123',
      canReceiveNotification: jest.fn().mockReturnValue(true),
      updateNotificationStats: jest.fn().mockResolvedValue(undefined)
    };

    mockTemplate = {
      _id: 'template123',
      name: 'test_template',
      priority: 'normal',
      validateVariables: jest.fn().mockReturnValue([]),
      render: jest.fn().mockReturnValue({
        title: 'Test Title',
        message: 'Test Message',
        actionUrl: 'https://example.com'
      }),
      incrementUsage: jest.fn().mockResolvedValue(undefined)
    };

    mockNotification = {
      _id: 'notif123',
      userId: 'user123',
      status: 'pending',
      markAsFailed: jest.fn(),
      save: jest.fn().mockResolvedValue(mockNotification)
    };

    mockDispatcher = {
      send: jest.fn().mockResolvedValue({ success: true })
    };

    UserSettings.getOrCreate = jest.fn().mockResolvedValue(mockUserSettings);
    NotificationTemplate.getTemplate = jest.fn().mockResolvedValue(mockTemplate);
    Notification.mockImplementation(() => mockNotification);
  });

  describe('registerDispatcher', () => {
    it('should register a dispatcher for a channel', () => {
      notificationService.registerDispatcher('push', mockDispatcher);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Registered notification dispatcher')
      );
    });
  });

  describe('setRulesEngine', () => {
    it('should set the rules engine', () => {
      const mockRulesEngine = { shouldSendNotification: jest.fn() };
     
      notificationService.setRulesEngine(mockRulesEngine);

      expect(logger.info).toHaveBeenCalled();
      expect(notificationService.rulesEngine).toBe(mockRulesEngine);
    });
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      notificationService.registerDispatcher('push', mockDispatcher);

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push',
        { variable1: 'value1' }
      );

      expect(UserSettings.getOrCreate).toHaveBeenCalledWith('user123');
      expect(NotificationTemplate.getTemplate).toHaveBeenCalledWith('test_type', 'push');
      expect(mockTemplate.validateVariables).toHaveBeenCalled();
      expect(mockTemplate.render).toHaveBeenCalled();
      expect(mockDispatcher.send).toHaveBeenCalled();
      expect(mockNotification.save).toHaveBeenCalled();
      expect(result.status).toBe('sent');
    });

    it('should not send when user cannot receive notification', async () => {
      mockUserSettings.canReceiveNotification.mockReturnValue(false);

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(result).toBeNull();
      expect(mockDispatcher.send).not.toHaveBeenCalled();
    });

    it('should not send when template not found', async () => {
      NotificationTemplate.getTemplate.mockResolvedValue(null);

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should not send when template validation fails', async () => {
      mockTemplate.validateVariables.mockReturnValue(['Error 1', 'Error 2']);

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle dispatcher not available', async () => {
      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(mockNotification.markAsFailed).toHaveBeenCalledWith(
        'No dispatcher available'
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should block notification when rules engine rejects', async () => {
      const mockRulesEngine = {
        shouldSendNotification: jest.fn().mockResolvedValue(false)
      };
      notificationService.setRulesEngine(mockRulesEngine);
      notificationService.registerDispatcher('push', mockDispatcher);

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(mockRulesEngine.shouldSendNotification).toHaveBeenCalled();
      expect(result.status).toBe('failed');
      expect(mockDispatcher.send).not.toHaveBeenCalled();
    });

    it('should handle dispatch errors', async () => {
      notificationService.registerDispatcher('push', mockDispatcher);
      mockDispatcher.send.mockResolvedValue({
        success: false,
        error: 'Dispatch failed'
      });

      const result = await notificationService.sendNotification(
        'user123',
        'test_type',
        'push'
      );

      expect(mockNotification.markAsFailed).toHaveBeenCalledWith('Dispatch failed');
    });
  });

  describe('sendBulkNotification', () => {
    it('should send notifications to multiple users', async () => {
      notificationService.registerDispatcher('push', mockDispatcher);
      notificationService.sendNotification = jest.fn().mockResolvedValue(mockNotification);

      const userIds = ['user1', 'user2', 'user3'];
      const results = await notificationService.sendBulkNotification(
        userIds,
        'test_type',
        'push'
      );

      expect(results).toHaveLength(3);
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(3);
    });

    it('should handle individual failures', async () => {
      notificationService.sendNotification = jest.fn()
        .mockResolvedValueOnce(mockNotification)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockNotification);

      const userIds = ['user1', 'user2', 'user3'];
      const results = await notificationService.sendBulkNotification(
        userIds,
        'test_type',
        'push'
      );

      expect(results).toHaveLength(3);
      expect(results[1].success).toBe(false);
    });
  });
});

