const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const chatController = require('../controllers/chatController');

// All routes require authentication
router.use(authenticateToken);

// Tribe chat routes
router.post(
  '/tribe/:tribeId/send',
  [
    check('text', 'Message text is required').notEmpty().isLength({ min: 1, max: 280 }),
    check('type', 'Invalid message type').optional().isIn(['message', 'announcement']),
    check('replyTo', 'Invalid reply message ID').optional().isMongoId(),
  ],
  chatController.sendTribeMessage
);

router.get(
  '/tribe/:tribeId/messages',
  [
    check('cursor', 'Invalid cursor').optional().isMongoId(),
    check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 100 }),
  ],
  chatController.getTribeMessages
);

router.post(
  '/tribe/:tribeId/mute/:userId',
  [
    check('durationHours', 'Invalid duration').optional().isInt({ min: 1, max: 168 }),
    check('reason', 'Mute reason is required').optional().isLength({ max: 200 }),
  ],
  chatController.muteUser
);

// Direct message routes
router.post(
  '/dm/:userId/send',
  [
    check('text', 'Message text is required').notEmpty().isLength({ min: 1, max: 280 }),
  ],
  chatController.sendDirectMessage
);

router.get(
  '/dm/:userId/messages',
  [
    check('cursor', 'Invalid cursor').optional().isMongoId(),
    check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 100 }),
  ],
  chatController.getDirectMessages
);

router.post(
  '/dm/:conversationId/read',
  chatController.markMessagesAsRead
);

// Reaction routes
router.post(
  '/react',
  [
    check('messageId', 'Message ID is required').isMongoId(),
    check('emoji', 'Invalid emoji').isIn(['❤️', '🔥', '😂', '👍']),
  ],
  chatController.toggleReaction
);

// User management routes
router.post(
  '/block/:userId',
  chatController.blockUser
);

// Settings routes
router.get(
  '/settings',
  [
    check('tribeId', 'Tribe ID is required').isMongoId(),
  ],
  chatController.getChatSettings
);

router.put(
  '/settings',
  [
    check('tribeId', 'Tribe ID is required').isMongoId(),
    check('notificationSettings', 'Invalid notification settings').optional().isObject(),
  ],
  chatController.updateChatSettings
);

// Conversation routes
router.get(
  '/conversations',
  [
    check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
    check('cursor', 'Invalid cursor').optional().isMongoId(),
  ],
  chatController.getConversations
);

module.exports = router;
