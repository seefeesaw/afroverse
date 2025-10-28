const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes'); // Disabled if not needed
const battleRoutes = require('./battle.routes');
const transformRoutes = require('./transform.routes');
const tribeRoutes = require('./tribe.routes');
const feedRoutes = require('./feed.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const progressionRoutes = require('./progression.routes');
const notificationRoutes = require('./notification.routes');
const paymentRoutes = require('./payment.routes');
const rewardRoutes = require('./reward.routes');
const moderationRoutes = require('./moderation.routes');
const referralRoutes = require('./referral.routes');
const fraudDetectionRoutes = require('./fraudDetection.routes');
const adminRoutes = require('./admin.routes');
const walletRoutes = require('./wallet.routes');
const videoRoutes = require('./video.routes');
const challengeRoutes = require('./challenge.routes');
const eventRoutes = require('./event.routes');
const chatRoutes = require('./chat.routes');
const creatorRoutes = require('./creator.routes');
const achievementRoutes = require('./achievement.routes');
const commentRoutes = require('./comment.routes');
const boostRoutes = require('./boost.routes');

// Mount routes
router.use('/auth', authRoutes);
// router.use('/users', userRoutes); // Disabled if not needed
router.use('/battles', battleRoutes);
router.use('/transform', transformRoutes);
router.use('/tribes', tribeRoutes);
router.use('/feed', feedRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/progression', progressionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/rewards', rewardRoutes);
router.use('/moderation', moderationRoutes);
router.use('/referral', referralRoutes);
router.use('/fraud-detection', fraudDetectionRoutes);
router.use('/admin', adminRoutes);
router.use('/wallet', walletRoutes);
router.use('/video', videoRoutes);
router.use('/challenge', challengeRoutes);
router.use('/events', eventRoutes);
router.use('/chat', chatRoutes);
router.use('/creator', creatorRoutes);
router.use('/achievements', achievementRoutes);
router.use('/comments', commentRoutes);
router.use('/boost', boostRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Afroverse API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

module.exports = router;
