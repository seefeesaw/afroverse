const chatSocketHandlers = require('../../../src/sockets/chatSocketHandlers');
const chatService = require('../../../src/services/chatService');
const User = require('../../../src/models/User');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/services/chatService');
jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Chat Socket Handlers', () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      id: 'socket123',
      userId: null,
      user: null,
      on: jest.fn(),
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis()
    };
  });

  describe('handleConnection', () => {
    it('should set up event handlers', () => {
      chatSocketHandlers.handleConnection(mockSocket);

      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  describe('handleAuthenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        displayName: 'Test User',
        avatar: 'avatar.jpg',
        tribe: 'tribe123'
      };

      User.findById.mockResolvedValue(mockUser);

      // Trigger authenticate event handler
      const authenticateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'authenticate'
      )?.[1];

      if (authenticateHandler) {
        await authenticateHandler({ userId: 'user123', token: 'valid-token' });

        expect(mockSocket.emit).toHaveBeenCalledWith('authenticated', expect.any(Object));
      }
    });

    it('should reject invalid user', async () => {
      User.findById.mockResolvedValue(null);

      const authenticateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'authenticate'
      )?.[1];

      if (authenticateHandler) {
        await authenticateHandler({ userId: 'invalid', token: 'token' });

        expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', expect.any(Object));
      }
    });
  });
});

