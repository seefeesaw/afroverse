const walletService = require('../services/walletService');
const { logger } = require('../utils/logger');

const walletController = {
  /**
   * GET /api/wallet - Get wallet balance and info
   */
  async getWallet(req, res) {
    try {
      const userId = req.user.id;
      const walletInfo = await walletService.getWalletInfo(userId);
      
      res.json({
        success: true,
        wallet: walletInfo
      });
    } catch (error) {
      logger.error('Get wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet information'
      });
    }
  },

  /**
   * POST /api/wallet/earn - Earn coins (internal use)
   */
  async earnCoins(req, res) {
    try {
      const userId = req.user.id;
      const { reason, metadata, amount } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required'
        });
      }
      
      const result = await walletService.earnCoins(userId, reason, metadata, amount);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Earn coins error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to earn coins'
      });
    }
  },

  /**
   * POST /api/wallet/spend - Spend coins
   */
  async spendCoins(req, res) {
    try {
      const userId = req.user.id;
      const { reason, metadata, amount } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required'
        });
      }
      
      const result = await walletService.spendCoins(userId, reason, metadata, amount);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Spend coins error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to spend coins'
      });
    }
  },

  /**
   * POST /api/wallet/purchase - Purchase coins
   */
  async purchaseCoins(req, res) {
    try {
      const userId = req.user.id;
      const { packType, paymentId } = req.body;
      
      if (!packType || !paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Pack type and payment ID are required'
        });
      }
      
      const result = await walletService.purchaseCoins(userId, packType, paymentId);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Purchase coins error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to purchase coins'
      });
    }
  },

  /**
   * GET /api/wallet/history - Get transaction history
   */
  async getTransactionHistory(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        type,
        reason,
        startDate,
        endDate
      } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        reason,
        startDate,
        endDate
      };
      
      const history = await walletService.getTransactionHistory(userId, options);
      
      res.json({
        success: true,
        ...history
      });
    } catch (error) {
      logger.error('Get transaction history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction history'
      });
    }
  },

  /**
   * GET /api/wallet/opportunities - Get earning opportunities
   */
  async getEarningOpportunities(req, res) {
    try {
      const userId = req.user.id;
      const opportunities = await walletService.getEarningOpportunities(userId);
      
      res.json({
        success: true,
        opportunities
      });
    } catch (error) {
      logger.error('Get earning opportunities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get earning opportunities'
      });
    }
  },

  /**
   * GET /api/wallet/spending-options - Get spending options
   */
  async getSpendingOptions(req, res) {
    try {
      const options = await walletService.getSpendingOptions();
      
      res.json({
        success: true,
        options
      });
    } catch (error) {
      logger.error('Get spending options error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get spending options'
      });
    }
  },

  /**
   * GET /api/wallet/coin-packs - Get coin packs for purchase
   */
  async getCoinPacks(req, res) {
    try {
      const packs = await walletService.getCoinPacks();
      
      res.json({
        success: true,
        packs
      });
    } catch (error) {
      logger.error('Get coin packs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get coin packs'
      });
    }
  },

  /**
   * POST /api/wallet/check-action - Check if user can perform action
   */
  async checkAction(req, res) {
    try {
      const userId = req.user.id;
      const { action } = req.body;
      
      if (!action) {
        return res.status(400).json({
          success: false,
          message: 'Action is required'
        });
      }
      
      const canPerform = await walletService.canPerformAction(userId, action);
      
      res.json({
        success: true,
        canPerform,
        action
      });
    } catch (error) {
      logger.error('Check action error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check action availability'
      });
    }
  },

  /**
   * POST /api/wallet/save-streak - Save streak with coins
   */
  async saveStreak(req, res) {
    try {
      const userId = req.user.id;
      const { reason } = req.body;
      
      const result = await walletService.spendCoins(userId, 'streak_save', {
        reason: reason || 'User requested streak save'
      });
      
      res.json({
        success: true,
        message: 'Streak saved successfully',
        ...result
      });
    } catch (error) {
      logger.error('Save streak error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to save streak'
      });
    }
  },

  /**
   * POST /api/wallet/battle-boost - Apply battle boost
   */
  async battleBoost(req, res) {
    try {
      const userId = req.user.id;
      const { battleId } = req.body;
      
      if (!battleId) {
        return res.status(400).json({
          success: false,
          message: 'Battle ID is required'
        });
      }
      
      const result = await walletService.spendCoins(userId, 'battle_boost', {
        battleId
      });
      
      res.json({
        success: true,
        message: 'Battle boost applied successfully',
        ...result
      });
    } catch (error) {
      logger.error('Battle boost error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply battle boost'
      });
    }
  },

  /**
   * POST /api/wallet/priority-transformation - Priority transformation processing
   */
  async priorityTransformation(req, res) {
    try {
      const userId = req.user.id;
      const { transformationId } = req.body;
      
      if (!transformationId) {
        return res.status(400).json({
          success: false,
          message: 'Transformation ID is required'
        });
      }
      
      const result = await walletService.spendCoins(userId, 'priority_transformation', {
        transformationId
      });
      
      res.json({
        success: true,
        message: 'Priority processing applied successfully',
        ...result
      });
    } catch (error) {
      logger.error('Priority transformation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply priority processing'
      });
    }
  },

  /**
   * POST /api/wallet/retry-transformation - Retry transformation
   */
  async retryTransformation(req, res) {
    try {
      const userId = req.user.id;
      const { transformationId } = req.body;
      
      if (!transformationId) {
        return res.status(400).json({
          success: false,
          message: 'Transformation ID is required'
        });
      }
      
      const result = await walletService.spendCoins(userId, 'retry_transformation', {
        transformationId
      });
      
      res.json({
        success: true,
        message: 'Transformation retry initiated successfully',
        ...result
      });
    } catch (error) {
      logger.error('Retry transformation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retry transformation'
      });
    }
  },

  /**
   * POST /api/wallet/tribe-support - Support tribe with coins
   */
  async tribeSupport(req, res) {
    try {
      const userId = req.user.id;
      const { tribeId } = req.body;
      
      if (!tribeId) {
        return res.status(400).json({
          success: false,
          message: 'Tribe ID is required'
        });
      }
      
      const result = await walletService.spendCoins(userId, 'tribe_support', {
        tribeId,
        pointsAdded: 50
      });
      
      res.json({
        success: true,
        message: 'Tribe support applied successfully',
        ...result
      });
    } catch (error) {
      logger.error('Tribe support error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to support tribe'
      });
    }
  }
};

module.exports = walletController;
