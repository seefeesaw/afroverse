const walletService = require('../../../src/services/walletService');
const Wallet = require('../../../src/models/Wallet');
const WalletTransaction = require('../../../src/models/WalletTransaction');
const User = require('../../../src/models/User');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/models/Wallet');
jest.mock('../../../src/models/WalletTransaction');
jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Wallet Service', () => {
  let mockUser, mockWallet, mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      phone: '+1234567890',
      username: 'testuser'
    };

    mockWallet = {
      _id: 'wallet123',
      userId: 'user123',
      balance: 100,
      totalEarned: 200,
      totalSpent: 100,
      dailyEarned: 50,
      lastEarnedAt: new Date(),
      canEarnToday: jest.fn().mockReturnValue(true),
      addCoins: jest.fn().mockResolvedValue(undefined),
      spendCoins: jest.fn().mockResolvedValue(undefined),
      hasEnough: jest.fn().mockReturnValue(true),
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue({
        _id: 'wallet123',
        userId: 'user123',
        balance: 100
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTransaction = {
      _id: 'tx123',
      userId: 'user123',
      walletId: 'wallet123',
      type: 'earn',
      amount: 10,
      reason: 'test',
      save: jest.fn().mockResolvedValue(undefined),
      getSummary: jest.fn().mockReturnValue({
        _id: 'tx123',
        type: 'earn',
        amount: 10,
        reason: 'test'
      })
    };

    Wallet.getOrCreateWallet = jest.fn().mockResolvedValue(mockWallet);
    Wallet.findOne = jest.fn().mockResolvedValue(mockWallet);
    WalletTransaction.mockImplementation(() => mockTransaction);
    WalletTransaction.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockTransaction])
        })
      })
    });
    WalletTransaction.countDocuments = jest.fn().mockResolvedValue(10);
    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOrCreateWallet', () => {
    it('should get or create a wallet for user', async () => {
      const result = await walletService.getOrCreateWallet('user123');

      expect(Wallet.getOrCreateWallet).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockWallet);
    });

    it('should handle errors when getting wallet', async () => {
      const error = new Error('Database error');
      Wallet.getOrCreateWallet.mockRejectedValueOnce(error);

      await expect(walletService.getOrCreateWallet('user123'))
        .rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return null for invalid userId', async () => {
      const result = await walletService.getOrCreateWallet(null);
      expect(result).toBeNull();
    });
  });

  describe('getWallet', () => {
    it('should return wallet by userId', async () => {
      const result = await walletService.getWallet('user123');

      expect(Wallet.getOrCreateWallet).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockWallet);
    });

    it('should create wallet if not exists', async () => {
      Wallet.getOrCreateWallet.mockResolvedValueOnce(mockWallet);

      const result = await walletService.getWallet('newuser');

      expect(result).toEqual(mockWallet);
    });
  });

  describe('earnCoins', () => {
    it('should successfully earn coins', async () => {
      const result = await walletService.earnCoins('user123', 50, 'daily_login');

      expect(Wallet.getOrCreateWallet).toHaveBeenCalledWith('user123');
      expect(mockWallet.addCoins).toHaveBeenCalledWith(50);
      expect(WalletTransaction).toHaveBeenCalled();
      expect(mockTransaction.save).toHaveBeenCalled();
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('transaction');
    });

    it('should throw error for negative amount', async () => {
      await expect(walletService.earnCoins('user123', -10, 'test'))
        .rejects.toThrow();
    });

    it('should throw error for zero amount', async () => {
      await expect(walletService.earnCoins('user123', 0, 'test'))
        .rejects.toThrow();
    });

    it('should enforce daily earning limit', async () => {
      mockWallet.canEarnToday.mockReturnValueOnce(false);

      await expect(walletService.earnCoins('user123', 50, 'test'))
        .rejects.toThrow();
    });

    it('should log earning event', async () => {
      await walletService.earnCoins('user123', 50, 'daily_login');

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('spendCoins', () => {
    it('should successfully spend coins', async () => {
      const result = await walletService.spendCoins('user123', 25, 'boost_video');

      expect(Wallet.getOrCreateWallet).toHaveBeenCalledWith('user123');
      expect(mockWallet.spendCoins).toHaveBeenCalledWith(25);
      expect(WalletTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('transaction');
    });

    it('should throw error for insufficient balance', async () => {
      mockWallet.hasEnough.mockReturnValueOnce(false);

      await expect(walletService.spendCoins('user123', 200, 'boost'))
        .rejects.toThrow('Insufficient balance');
    });

    it('should throw error for negative amount', async () => {
      await expect(walletService.spendCoins('user123', -10, 'test'))
        .rejects.toThrow();
    });

    it('should log spending event', async () => {
      await walletService.spendCoins('user123', 25, 'boost_video');

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockWallet.spendCoins.mockRejectedValueOnce(new Error('DB error'));

      await expect(walletService.spendCoins('user123', 25, 'boost'))
        .rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      const result = await walletService.getTransactionHistory('user123', { limit: 10 });

      expect(WalletTransaction.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('total');
      expect(result.transactions).toBeInstanceOf(Array);
    });

    it('should apply pagination', async () => {
      await walletService.getTransactionHistory('user123', { limit: 20, skip: 10 });

      expect(WalletTransaction.find).toHaveBeenCalled();
    });

    it('should filter by transaction type', async () => {
      await walletService.getTransactionHistory('user123', { type: 'earn' });

      expect(WalletTransaction.find).toHaveBeenCalledWith({
        userId: 'user123',
        type: 'earn'
      });
    });

    it('should handle empty history', async () => {
      WalletTransaction.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });
      WalletTransaction.countDocuments.mockResolvedValueOnce(0);

      const result = await walletService.getTransactionHistory('user123');

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('should return current balance', async () => {
      const result = await walletService.getBalance('user123');

      expect(result).toBe(100);
      expect(Wallet.getOrCreateWallet).toHaveBeenCalledWith('user123');
    });

    it('should return 0 for new wallet', async () => {
      mockWallet.balance = 0;

      const result = await walletService.getBalance('user123');

      expect(result).toBe(0);
    });
  });

  describe('canAfford', () => {
    it('should return true if user can afford', async () => {
      mockWallet.hasEnough.mockReturnValueOnce(true);

      const result = await walletService.canAfford('user123', 50);

      expect(result).toBe(true);
      expect(mockWallet.hasEnough).toHaveBeenCalledWith(50);
    });

    it('should return false if user cannot afford', async () => {
      mockWallet.hasEnough.mockReturnValueOnce(false);

      const result = await walletService.canAfford('user123', 200);

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      Wallet.getOrCreateWallet.mockRejectedValueOnce(new Error('Error'));

      const result = await walletService.canAfford('user123', 50);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getEarningOpportunities', () => {
    it('should return list of earning opportunities', async () => {
      const result = await walletService.getEarningOpportunities('user123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(opp => {
        expect(opp).toHaveProperty('action');
        expect(opp).toHaveProperty('amount');
        expect(opp).toHaveProperty('description');
      });
    });

    it('should include daily login opportunity', async () => {
      const result = await walletService.getEarningOpportunities('user123');

      const dailyLogin = result.find(opp => opp.action === 'daily_login');
      expect(dailyLogin).toBeDefined();
    });

    it('should include transformation opportunity', async () => {
      const result = await walletService.getEarningOpportunities('user123');

      const transform = result.find(opp => opp.action === 'create_transformation');
      expect(transform).toBeDefined();
    });
  });

  describe('getSpendingOptions', () => {
    it('should return list of spending options', async () => {
      const result = await walletService.getSpendingOptions();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(option => {
        expect(option).toHaveProperty('action');
        expect(option).toHaveProperty('cost');
        expect(option).toHaveProperty('description');
      });
    });

    it('should include boost options', async () => {
      const result = await walletService.getSpendingOptions();

      const boost = result.find(opt => opt.action === 'boost_video');
      expect(boost).toBeDefined();
      expect(boost.cost).toBeGreaterThan(0);
    });
  });

  describe('getCoinPacks', () => {
    it('should return available coin packs', async () => {
      const result = await walletService.getCoinPacks();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(pack => {
        expect(pack).toHaveProperty('id');
        expect(pack).toHaveProperty('coins');
        expect(pack).toHaveProperty('price');
      });
    });

    it('should sort packs by price', async () => {
      const result = await walletService.getCoinPacks();

      for (let i = 1; i < result.length; i++) {
        expect(result[i].price.amount).toBeGreaterThanOrEqual(result[i - 1].price.amount);
      }
    });
  });

  describe('getActionCost', () => {
    it('should return cost for known action', async () => {
      const cost = await walletService.getActionCost('boost_video');

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should return 0 for unknown action', async () => {
      const cost = await walletService.getActionCost('unknown_action');

      expect(cost).toBe(0);
    });

    it('should return correct cost for save streak', async () => {
      const cost = await walletService.getActionCost('save_streak');

      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('refundCoins', () => {
    it('should refund coins to user', async () => {
      const result = await walletService.refundCoins('user123', 50, 'refund_failed_boost');

      expect(mockWallet.addCoins).toHaveBeenCalledWith(50);
      expect(WalletTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('balance');
    });

    it('should create refund transaction', async () => {
      await walletService.refundCoins('user123', 50, 'refund');

      expect(WalletTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'refund',
          amount: 50,
          reason: 'refund'
        })
      );
    });

    it('should handle refund errors', async () => {
      mockWallet.addCoins.mockRejectedValueOnce(new Error('Refund failed'));

      await expect(walletService.refundCoins('user123', 50, 'refund'))
        .rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getWalletStats', () => {
    it('should return wallet statistics', async () => {
      const result = await walletService.getWalletStats('user123');

      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('totalEarned');
      expect(result).toHaveProperty('totalSpent');
      expect(result).toHaveProperty('dailyEarned');
    });

    it('should calculate net earnings', async () => {
      const result = await walletService.getWalletStats('user123');

      expect(result.netEarnings).toBe(mockWallet.totalEarned - mockWallet.totalSpent);
    });
  });
});
