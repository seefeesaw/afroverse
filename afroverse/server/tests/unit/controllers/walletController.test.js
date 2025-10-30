const walletController = require('../../../src/controllers/walletController');
const walletService = require('../../../src/services/walletService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/services/walletService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Wallet Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        id: 'user123',
        phone: '+1234567890',
        username: 'testuser'
      },
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module exports', () => {
    it('should be defined', () => {
      expect(walletController).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof walletController).toBe('object');
    });

    const expectedFunctions = [
      'getWallet',
      'earnCoins',
      'spendCoins',
      'purchaseCoins',
      'getTransactionHistory',
      'getEarningOpportunities',
      'getSpendingOptions',
      'getCoinPacks',
      'checkAction',
      'saveStreak',
      'battleBoost',
      'priorityTransformation',
      'retryTransformation',
      'tribeSupport'
    ];

    expectedFunctions.forEach(funcName => {
      it(`should have ${funcName} function`, () => {
        expect(walletController[funcName]).toBeDefined();
        expect(typeof walletController[funcName]).toBe('function');
      });
    });
  });

  describe('getWallet', () => {
    it('should return wallet info successfully', async () => {
      const mockWalletInfo = {
        balance: 100,
        totalEarned: 500,
        totalSpent: 400,
        dailyEarned: 50
      };

      walletService.getWalletInfo = jest.fn().mockResolvedValue(mockWalletInfo);

      await walletController.getWallet(req, res);

      expect(walletService.getWalletInfo).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        wallet: mockWalletInfo
      });
    });

    it('should handle service errors', async () => {
      walletService.getWalletInfo = jest.fn().mockRejectedValue(new Error('Service error'));

      await walletController.getWallet(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get wallet information'
      });
    });
  });

  describe('earnCoins', () => {
    it('should earn coins successfully', async () => {
      req.body = {
        reason: 'daily_login',
        amount: 10
      };

      const mockResult = {
        balance: 110,
        earned: 10,
        transaction: { id: 'tx123' }
      };

      walletService.earnCoins = jest.fn().mockResolvedValue(mockResult);

      await walletController.earnCoins(req, res);

      expect(walletService.earnCoins).toHaveBeenCalledWith('user123', 'daily_login', undefined, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should return 400 if reason is missing', async () => {
      req.body = { amount: 10 };

      await walletController.earnCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Reason is required'
      });
      expect(walletService.earnCoins).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      req.body = { reason: 'daily_login', amount: 10 };
      walletService.earnCoins = jest.fn().mockRejectedValue(new Error('Cannot earn more today'));

      await walletController.earnCoins(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot earn more today'
      });
    });
  });

  describe('spendCoins', () => {
    it('should spend coins successfully', async () => {
      req.body = {
        reason: 'boost_video',
        amount: 50
      };

      const mockResult = {
        balance: 50,
        spent: 50,
        transaction: { id: 'tx456' }
      };

      walletService.spendCoins = jest.fn().mockResolvedValue(mockResult);

      await walletController.spendCoins(req, res);

      expect(walletService.spendCoins).toHaveBeenCalledWith('user123', 'boost_video', undefined, 50);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should return 400 if reason is missing', async () => {
      req.body = { amount: 50 };

      await walletController.spendCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Reason is required'
      });
    });

    it('should handle insufficient balance error', async () => {
      req.body = { reason: 'boost_video', amount: 200 };
      walletService.spendCoins = jest.fn().mockRejectedValue(new Error('Insufficient balance'));

      await walletController.spendCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient balance'
      });
    });
  });

  describe('purchaseCoins', () => {
    it('should purchase coins successfully', async () => {
      req.body = {
        packType: 'small',
        paymentId: 'pay123'
      };

      const mockResult = {
        balance: 200,
        purchased: 100,
        transaction: { id: 'tx789' }
      };

      walletService.purchaseCoins = jest.fn().mockResolvedValue(mockResult);

      await walletController.purchaseCoins(req, res);

      expect(walletService.purchaseCoins).toHaveBeenCalledWith('user123', 'small', 'pay123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should return 400 if packType is missing', async () => {
      req.body = { paymentId: 'pay123' };

      await walletController.purchaseCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Pack type and payment ID are required'
      });
    });

    it('should return 400 if paymentId is missing', async () => {
      req.body = { packType: 'small' };

      await walletController.purchaseCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle payment processing errors', async () => {
      req.body = { packType: 'small', paymentId: 'pay123' };
      walletService.purchaseCoins = jest.fn().mockRejectedValue(new Error('Payment failed'));

      await walletController.purchaseCoins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Payment failed'
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      req.query = { limit: '20', skip: '0' };

      const mockHistory = {
        transactions: [
          { id: 'tx1', type: 'earn', amount: 10 },
          { id: 'tx2', type: 'spend', amount: 5 }
        ],
        total: 2
      };

      walletService.getTransactionHistory = jest.fn().mockResolvedValue(mockHistory);

      await walletController.getTransactionHistory(req, res);

      expect(walletService.getTransactionHistory).toHaveBeenCalledWith('user123', {
        limit: '20',
        skip: '0'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockHistory
      });
    });

    it('should handle errors', async () => {
      walletService.getTransactionHistory = jest.fn().mockRejectedValue(new Error('DB error'));

      await walletController.getTransactionHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getEarningOpportunities', () => {
    it('should return earning opportunities', async () => {
      const mockOpportunities = [
        { action: 'daily_login', amount: 10, description: 'Daily check-in' },
        { action: 'create_transformation', amount: 5, description: 'Create a transformation' }
      ];

      walletService.getEarningOpportunities = jest.fn().mockResolvedValue(mockOpportunities);

      await walletController.getEarningOpportunities(req, res);

      expect(walletService.getEarningOpportunities).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        opportunities: mockOpportunities
      });
    });
  });

  describe('getSpendingOptions', () => {
    it('should return spending options', async () => {
      const mockOptions = [
        { action: 'boost_video', cost: 50, description: 'Boost your video' },
        { action: 'save_streak', cost: 100, description: 'Save your streak' }
      ];

      walletService.getSpendingOptions = jest.fn().mockResolvedValue(mockOptions);

      await walletController.getSpendingOptions(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        options: mockOptions
      });
    });
  });

  describe('getCoinPacks', () => {
    it('should return available coin packs', async () => {
      const mockPacks = [
        { id: 'small', coins: 100, price: { amount: 0.99, currency: 'USD' } },
        { id: 'medium', coins: 500, price: { amount: 4.99, currency: 'USD' } }
      ];

      walletService.getCoinPacks = jest.fn().mockResolvedValue(mockPacks);

      await walletController.getCoinPacks(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        packs: mockPacks
      });
    });
  });

  describe('checkAction', () => {
    it('should check if user can afford action', async () => {
      req.body = { action: 'boost_video' };

      const mockResult = {
        canAfford: true,
        cost: 50,
        balance: 100
      };

      walletService.checkAction = jest.fn().mockResolvedValue(mockResult);

      await walletController.checkAction(req, res);

      expect(walletService.checkAction).toHaveBeenCalledWith('user123', 'boost_video');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should return 400 if action is missing', async () => {
      req.body = {};

      await walletController.checkAction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('saveStreak', () => {
    it('should save streak using coins', async () => {
      const mockResult = {
        balance: 0,
        streakSaved: true,
        cost: 100
      };

      walletService.saveStreak = jest.fn().mockResolvedValue(mockResult);

      await walletController.saveStreak(req, res);

      expect(walletService.saveStreak).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should handle insufficient funds', async () => {
      walletService.saveStreak = jest.fn().mockRejectedValue(new Error('Insufficient balance'));

      await walletController.saveStreak(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('battleBoost', () => {
    it('should boost battle using coins', async () => {
      req.body = { battleId: 'battle123' };

      const mockResult = {
        balance: 50,
        boosted: true,
        cost: 50
      };

      walletService.battleBoost = jest.fn().mockResolvedValue(mockResult);

      await walletController.battleBoost(req, res);

      expect(walletService.battleBoost).toHaveBeenCalledWith('user123', 'battle123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });
  });

  describe('priorityTransformation', () => {
    it('should prioritize transformation using coins', async () => {
      req.body = { transformId: 'transform123' };

      const mockResult = {
        balance: 25,
        prioritized: true,
        cost: 75
      };

      walletService.priorityTransformation = jest.fn().mockResolvedValue(mockResult);

      await walletController.priorityTransformation(req, res);

      expect(walletService.priorityTransformation).toHaveBeenCalledWith('user123', 'transform123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });
  });

  describe('retryTransformation', () => {
    it('should retry failed transformation using coins', async () => {
      req.body = { transformId: 'transform123' };

      const mockResult = {
        balance: 50,
        retried: true,
        cost: 50
      };

      walletService.retryTransformation = jest.fn().mockResolvedValue(mockResult);

      await walletController.retryTransformation(req, res);

      expect(walletService.retryTransformation).toHaveBeenCalledWith('user123', 'transform123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });
  });

  describe('tribeSupport', () => {
    it('should support tribe using coins', async () => {
      const mockResult = {
        balance: 70,
        supported: true,
        cost: 30
      };

      walletService.tribeSupport = jest.fn().mockResolvedValue(mockResult);

      await walletController.tribeSupport(req, res);

      expect(walletService.tribeSupport).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should handle errors', async () => {
      walletService.tribeSupport = jest.fn().mockRejectedValue(new Error('Service error'));

      await walletController.tribeSupport(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
