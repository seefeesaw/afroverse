const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Coin earning rates
const COIN_RATES = {
  // Daily activities
  daily_checkin: 5,
  vote_10_battles: 5,
  
  // Streak bonuses
  streak_maintain_3: 5,
  streak_maintain_7: 10,
  streak_maintain_14: 20,
  streak_maintain_30: 30,
  streak_maintain_90: 75,
  
  // Battle rewards
  battle_win: 15,
  battle_participation: 5,
  
  // Social rewards
  share_transformation: 5,
  referral_join: 25,
  tribe_win: 10,
  
  // Progression rewards
  level_up: 10,
  achievement_unlock: 15,
  first_transformation: 20,
  first_battle: 15,
  weekly_challenge: 50,
  monthly_challenge: 100,
  
  // Special rewards
  admin_grant: 0, // Variable amount
  system_bonus: 0, // Variable amount
  compensation: 0, // Variable amount
};

// Coin spending costs
const COIN_COSTS = {
  streak_save: 30,
  battle_boost: 25,
  priority_transformation: 20,
  retry_transformation: 15,
  premium_filter: 50,
  tribe_support: 40,
  rematch_battle: 20,
  skip_ad: 10,
  unlock_style: 30,
};

// Coin pack prices (in cents)
const COIN_PACKS = {
  small: { coins: 100, price: 149 },
  medium: { coins: 500, price: 599 },
  large: { coins: 1200, price: 1199 },
  mega: { coins: 2500, price: 1999 },
};

const walletService = {
  /**
   * Get or create wallet for user
   * @param {string} userId - User ID
   * @returns {Promise<Wallet>} Wallet instance
   */
  async getOrCreateWallet(userId) {
    try {
      if (!userId) {
        return null;
      }
      const wallet = await Wallet.getOrCreateWallet(userId);
      return wallet;
    } catch (error) {
      logger.error('Error getting/creating wallet:', error);
      throw error;
    }
  },

  /**
   * Get wallet by userId
   * @param {string} userId - User ID
   * @returns {Promise<Wallet>} Wallet instance
   */
  async getWallet(userId) {
    return this.getOrCreateWallet(userId);
  },

  /**
   * Get wallet balance
   * @param {string} userId - User ID
   * @returns {Promise<number>} Balance
   */
  async getBalance(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet.balance;
    } catch (error) {
      logger.error('Error getting balance:', error);
      throw error;
    }
  },

  /**
   * Check if user can afford an amount
   * @param {string} userId - User ID
   * @param {number} amount - Amount to check
   * @returns {Promise<boolean>} Can afford
   */
  async canAfford(userId, amount) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet.hasEnough(amount);
    } catch (error) {
      logger.error('Error checking affordability:', error);
      return false;
    }
  },

  /**
   * Get wallet balance and basic info
   * @param {string} userId - User ID
   * @returns {Promise<object>} Wallet info
   */
  async getWalletInfo(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      
      return {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        dailyEarned: wallet.dailyEarned,
        canEarnToday: wallet.canEarnToday(),
        lastEarnedAt: wallet.lastEarnedAt,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      };
    } catch (error) {
      logger.error('Error getting wallet info:', error);
      throw error;
    }
  },

  /**
   * Earn coins for a specific action
   * @param {string} userId - User ID
   * @param {number} amount - Amount to earn
   * @param {string} reason - Reason for earning coins
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Transaction result
   */
  async earnCoins(userId, amount, reason, metadata = {}) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const wallet = await this.getOrCreateWallet(userId);
      
      // Check if user can earn today
      if (!wallet.canEarnToday()) {
        throw new Error('Daily earning limit reached');
      }
      
      // Check daily limit
      if (wallet.dailyEarned + amount > 100) {
        throw new Error('Daily earning limit would be exceeded');
      }
      
      const balanceBefore = wallet.balance;
      
      // Add coins to wallet
      await wallet.addCoins(amount);
      
      // Create transaction record
      const transaction = new WalletTransaction({
        userId,
        walletId: wallet._id,
        type: 'earn',
        amount,
        reason,
        metadata,
        balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed'
      });
      
      await transaction.save();
      
      logger.info(`User ${userId} earned ${amount} coins for ${reason}`);
      
      return {
        success: true,
        amount,
        balance: wallet.balance,
        transaction: transaction.getSummary()
      };
    } catch (error) {
      logger.error('Error earning coins:', error);
      throw error;
    }
  },

  /**
   * Spend coins for a specific action
   * @param {string} userId - User ID
   * @param {number} amount - Amount to spend
   * @param {string} reason - Reason for spending coins
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Transaction result
   */
  async spendCoins(userId, amount, reason, metadata = {}) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const wallet = await this.getOrCreateWallet(userId);
      
      // Check if user has enough coins
      if (!wallet.hasEnough(amount)) {
        throw new Error('Insufficient balance');
      }
      
      const balanceBefore = wallet.balance;
      
      // Spend coins from wallet
      await wallet.spendCoins(amount);
      
      // Create transaction record
      const transaction = new WalletTransaction({
        userId,
        walletId: wallet._id,
        type: 'spend',
        amount: -amount, // Negative for spending
        reason,
        metadata,
        balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed'
      });
      
      await transaction.save();
      
      logger.info(`User ${userId} spent ${amount} coins for ${reason}`);
      
      return {
        success: true,
        amount,
        balance: wallet.balance,
        transaction: transaction.getSummary()
      };
    } catch (error) {
      logger.error('Error spending coins:', error);
      throw error;
    }
  },

  /**
   * Refund coins to user
   * @param {string} userId - User ID
   * @param {number} amount - Amount to refund
   * @param {string} reason - Reason for refund
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Transaction result
   */
  async refundCoins(userId, amount, reason, metadata = {}) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const wallet = await this.getOrCreateWallet(userId);
      const balanceBefore = wallet.balance;
      
      // Add coins back to wallet
      await wallet.addCoins(amount);
      
      // Create transaction record
      const transaction = new WalletTransaction({
        userId,
        walletId: wallet._id,
        type: 'refund',
        amount,
        reason,
        metadata,
        balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed'
      });
      
      await transaction.save();
      
      logger.info(`User ${userId} refunded ${amount} coins for ${reason}`);
      
      return {
        success: true,
        amount,
        balance: wallet.balance,
        transaction: transaction.getSummary()
      };
    } catch (error) {
      logger.error('Error refunding coins:', error);
      throw error;
    }
  },

  /**
   * Purchase coins with real money
   * @param {string} userId - User ID
   * @param {string} packType - Type of coin pack
   * @param {string} paymentId - Payment transaction ID
   * @returns {Promise<object>} Transaction result
   */
  async purchaseCoins(userId, packType, paymentId) {
    try {
      const pack = COIN_PACKS[packType];
      if (!pack) {
        throw new Error(`Invalid coin pack: ${packType}`);
      }
      
      const wallet = await this.getOrCreateWallet(userId);
      const balanceBefore = wallet.balance;
      
      // Add coins to wallet
      await wallet.addCoins(pack.coins, `coin_pack_${packType}`);
      
      // Create transaction record
      const transaction = new WalletTransaction({
        userId,
        walletId: wallet._id,
        type: 'purchase',
        amount: pack.coins,
        reason: `coin_pack_${packType}`,
        metadata: { packType, price: pack.price },
        balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed',
        paymentId
      });
      
      await transaction.save();
      
      logger.info(`User ${userId} purchased ${pack.coins} coins (${packType} pack)`);
      
      return {
        success: true,
        amount: pack.coins,
        balance: wallet.balance,
        transaction: transaction.getSummary()
      };
    } catch (error) {
      logger.error('Error purchasing coins:', error);
      throw error;
    }
  },

  /**
   * Get transaction history
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<object>} Transaction history
   */
  async getTransactionHistory(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        reason = null,
        startDate = null,
        endDate = null
      } = options;
      
      const query = { userId };
      
      if (type) query.type = type;
      if (reason) query.reason = reason;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const transactions = await WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await WalletTransaction.countDocuments(query);
      
      return {
        transactions: transactions.map(t => t.getSummary()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  },

  /**
   * Get wallet statistics
   * @param {string} userId - User ID
   * @returns {Promise<object>} Wallet stats
   */
  async getWalletStats(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      
      return {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        netEarnings: wallet.totalEarned - wallet.totalSpent,
        dailyEarned: wallet.dailyEarned,
        canEarnMore: wallet.canEarnToday(),
        lastEarnedAt: wallet.lastEarnedAt
      };
    } catch (error) {
      logger.error('Error getting wallet stats:', error);
      throw error;
    }
  },

  /**
   * Get coin earning opportunities for user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Earning opportunities
   */
  async getEarningOpportunities(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const opportunities = [];
      
      // Daily check-in
      opportunities.push({
        id: 'daily_checkin',
        title: 'Daily Check-in',
        description: 'Check in daily to earn coins',
        reward: COIN_RATES.daily_checkin,
        icon: '🎯',
        available: true
      });
      
      // Voting milestone
      opportunities.push({
        id: 'vote_10_battles',
        title: 'Vote in 10 Battles',
        description: 'Vote in 10 battles today',
        reward: COIN_RATES.vote_10_battles,
        icon: '🗳️',
        available: true
      });
      
      // Streak bonuses
      if (user.streak && user.streak.current >= 3) {
        opportunities.push({
          id: 'streak_maintain_3',
          title: '3-Day Streak',
          description: 'Maintain your 3-day streak',
          reward: COIN_RATES.streak_maintain_3,
          icon: '🔥',
          available: true
        });
      }
      
      // Share transformation
      opportunities.push({
        id: 'share_transformation',
        title: 'Share Transformation',
        description: 'Share your transformation with friends',
        reward: COIN_RATES.share_transformation,
        icon: '📤',
        available: true
      });
      
      // Referral bonus
      opportunities.push({
        id: 'referral_join',
        title: 'Refer a Friend',
        description: 'Invite friends to join Afroverse',
        reward: COIN_RATES.referral_join,
        icon: '👥',
        available: true
      });
      
      return opportunities;
    } catch (error) {
      logger.error('Error getting earning opportunities:', error);
      throw error;
    }
  },

  /**
   * Get coin spending options
   * @returns {Promise<Array>} Spending options
   */
  async getSpendingOptions() {
    return [
      {
        action: 'streak_save',
        title: 'Save Streak',
        description: 'Protect your streak from breaking',
        cost: COIN_COSTS.streak_save,
        icon: '🛡️'
      },
      {
        action: 'boost_video',
        title: 'Battle Boost',
        description: 'Double your battle visibility',
        cost: COIN_COSTS.battle_boost,
        icon: '⚡'
      },
      {
        action: 'priority_transformation',
        title: 'Priority Processing',
        description: 'Skip the queue for faster results',
        cost: COIN_COSTS.priority_transformation,
        icon: '⚡'
      },
      {
        action: 'retry_transformation',
        title: 'Retry Transformation',
        description: 'Try again with the same photo',
        cost: COIN_COSTS.retry_transformation,
        icon: '🔄'
      },
      {
        action: 'premium_filter',
        title: 'Premium Filter',
        description: 'Unlock premium filters for 24 hours',
        cost: COIN_COSTS.premium_filter,
        icon: '✨'
      },
      {
        action: 'tribe_support',
        title: 'Tribe Support',
        description: 'Add 50 points to your tribe',
        cost: COIN_COSTS.tribe_support,
        icon: '🤝'
      },
      {
        action: 'rematch_battle',
        title: 'Battle Rematch',
        description: 'Challenge the same opponent again',
        cost: COIN_COSTS.rematch_battle,
        icon: '🔄'
      }
    ];
  },

  /**
   * Get coin packs for purchase
   * @returns {Promise<Array>} Coin packs
   */
  async getCoinPacks() {
    return Object.entries(COIN_PACKS).map(([type, pack]) => ({
      id: type,
      type,
      coins: pack.coins,
      price: {
        amount: pack.price,
        formatted: `$${(pack.price / 100).toFixed(2)}`
      },
      priceFormatted: `$${(pack.price / 100).toFixed(2)}`,
      bonus: type === 'mega' ? 'Best Value!' : null
    }));
  },

  /**
   * Get cost for a specific action
   * @param {string} action - Action name
   * @returns {Promise<number>} Cost
   */
  async getActionCost(action) {
    // Map alternative action names
    const actionMap = {
      'boost_video': 'battle_boost',
      'save_streak': 'streak_save'
    };
    
    const mappedAction = actionMap[action] || action;
    return COIN_COSTS[mappedAction] || 0;
  },

  /**
   * Check if user can perform a specific action
   * @param {string} userId - User ID
   * @param {string} action - Action to check
   * @returns {Promise<boolean>} Can perform action
   */
  async canPerformAction(userId, action) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const cost = COIN_COSTS[action];
      
      if (!cost) {
        return true; // Free action
      }
      
      return wallet.balance >= cost;
    } catch (error) {
      logger.error('Error checking action availability:', error);
      return false;
    }
  },

  /**
   * Reset daily earning limits (cron job)
   * @returns {Promise<void>}
   */
  async resetDailyLimits() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      await Wallet.updateMany(
        { dailyEarnedDate: { $lt: yesterday } },
        { 
          $set: { 
            dailyEarned: 0,
            dailyEarnedDate: today
          }
        }
      );
      
      logger.info('Daily earning limits reset');
    } catch (error) {
      logger.error('Error resetting daily limits:', error);
      throw error;
    }
  }
};

module.exports = walletService;
