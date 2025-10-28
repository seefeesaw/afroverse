const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// Wallet routes (all require authentication)
router.get('/', authenticateToken, walletController.getWallet);
router.post('/earn', authenticateToken, walletController.earnCoins);
router.post('/spend', authenticateToken, walletController.spendCoins);
router.post('/purchase', authenticateToken, walletController.purchaseCoins);
router.get('/history', authenticateToken, walletController.getTransactionHistory);
router.get('/opportunities', authenticateToken, walletController.getEarningOpportunities);
router.get('/spending-options', authenticateToken, walletController.getSpendingOptions);
router.get('/coin-packs', authenticateToken, walletController.getCoinPacks);
router.post('/check-action', authenticateToken, walletController.checkAction);

// Specific spending actions
router.post('/save-streak', authenticateToken, walletController.saveStreak);
router.post('/battle-boost', authenticateToken, walletController.battleBoost);
router.post('/priority-transformation', authenticateToken, walletController.priorityTransformation);
router.post('/retry-transformation', authenticateToken, walletController.retryTransformation);
router.post('/tribe-support', authenticateToken, walletController.tribeSupport);

module.exports = router;
