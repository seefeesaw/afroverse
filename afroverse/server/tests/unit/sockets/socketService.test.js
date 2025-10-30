const { Server } = require('socket.io');
const socketService = require('../../../src/sockets/socketService');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/User');
const chatSocketHandlers = require('../../../src/sockets/chatSocketHandlers');
const { logger } = require('../../../src/utils/logger');

jest.mock('socket.io');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/User');
jest.mock('../../../src/sockets/chatSocketHandlers');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Socket Service', () => {
  let mockServer, mockIO, mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';

    mockSocket = {
      id: 'socket123',
      handshake: {
        auth: {},
        headers: {}
      },
      join: jest.fn(),
      leave: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      userId: null,
      user: null
    };

    mockIO = {
      use: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      sockets: {
        sockets: new Map()
      }
    };

    mockServer = {
      listen: jest.fn()
    };

    Server.mockReturnValue(mockIO);
    chatSocketHandlers.handleConnection = jest.fn();
  });

  describe('initialize', () => {
    it('should initialize socket service', () => {
      socketService.initialize(mockServer);

      expect(Server).toHaveBeenCalled();
      expect(mockIO.use).toHaveBeenCalled();
      expect(mockIO.on).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Socket.IO initialized');
    });

    it('should configure CORS correctly', () => {
      socketService.initialize(mockServer);

      expect(Server).toHaveBeenCalledWith(
        mockServer,
        expect.objectContaining({
          cors: expect.objectContaining({
            origin: expect.any(String)
          })
        })
      );
    });
  });

  describe('setupMiddleware', () => {
    it('should authenticate socket with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        isActive: true,
        username: 'testuser'
      };

      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'access'
      });

      User.findById.mockResolvedValue(mockUser);

      socketService.initialize(mockServer);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = jest.fn();

      mockSocket.handshake.auth.token = 'valid-token';

      await middleware(mockSocket, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(next).toHaveBeenCalled();
      expect(mockSocket.userId).toBe('user123');
      expect(mockSocket.user).toBe(mockUser);
    });

    it('should reject socket without token', async () => {
      socketService.initialize(mockServer);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = jest.fn();

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('No token provided')
        })
      );
    });

    it('should reject invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      socketService.initialize(mockServer);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = jest.fn();

      mockSocket.handshake.auth.token = 'invalid-token';

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid token')
        })
      );
    });

    it('should reject inactive user', async () => {
      const mockUser = {
        _id: 'user123',
        isActive: false
      };

      jwt.verify.mockReturnValue({
        userId: 'user123',
        type: 'access'
      });

      User.findById.mockResolvedValue(mockUser);

      socketService.initialize(mockServer);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = jest.fn();

      mockSocket.handshake.auth.token = 'valid-token';

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('inactive')
        })
      );
    });
  });

  describe('emitLeaderboardUpdate', () => {
    it('should emit leaderboard update to room', () => {
      socketService.io = mockIO;
      mockIO.to.mockReturnThis();

      socketService.emitLeaderboardUpdate('users', 'weekly', {
        userId: 'user123',
        newPoints: 100
      });

      expect(mockIO.to).toHaveBeenCalledWith('leaderboard:users:weekly');
      expect(mockIO.emit).toHaveBeenCalledWith('leaderboard-update', expect.any(Object));
    });
  });

  describe('emitTransformationUpdate', () => {
    it('should emit transformation update to room', () => {
      socketService.io = mockIO;
      mockIO.to.mockReturnThis();

      socketService.emitTransformationUpdate('transform123', {
        status: 'completed',
        progress: 100
      });

      expect(mockIO.to).toHaveBeenCalledWith('transform:transform123');
      expect(mockIO.emit).toHaveBeenCalledWith('transform-update', expect.any(Object));
    });
  });
});


