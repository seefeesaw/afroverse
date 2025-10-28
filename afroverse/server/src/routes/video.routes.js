const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const { videoController: controller, upload } = require('../controllers/videoController');

// All video routes require authentication
router.use(authenticateToken);

// Validation middleware
const createVideoValidation = [
  check('variant', 'Variant is required').isIn(['loop', 'clip', 'fullbody']),
  check('style', 'Style is required').isIn(['maasai', 'zulu', 'pharaoh', 'afrofuturistic']),
  check('vibe', 'Invalid vibe').optional().isIn(['afrobeats', 'amapiano', 'highlife', 'epic']),
  check('captions', 'Captions must be a string').optional().isString().isLength({ max: 200 }),
  check('intensity', 'Intensity must be between 0 and 1').optional().isFloat({ min: 0, max: 1 }),
  check('transformId', 'TransformId must be a valid ObjectId').optional().isMongoId()
];

const createFullBodyVideoValidation = [
  check('transformId', 'Transform ID is required').isMongoId(),
  check('style', 'Style is required').isIn(['maasai', 'zulu', 'pharaoh', 'afrofuturistic']),
  check('motionPack', 'Motion pack is required').isIn(['amapiano', 'maasai_jump', 'zulu_hero', 'afrofusion']),
  check('vibe', 'Music vibe must be valid').optional().isIn(['afrobeats', 'amapiano', 'highlife', 'epic']),
  check('durationSec', 'Duration must be between 6 and 15 seconds').optional().isInt({ min: 6, max: 15 }),
  check('intensity', 'Intensity must be a number between 0.1 and 1.0').optional().isFloat({ min: 0.1, max: 1.0 }),
  check('background', 'Background must be valid').optional().isIn(['auto', 'savanna', 'temple', 'neon_city']),
  check('captions', 'Captions must be a string').optional().isString().trim().isLength({ max: 100 }),
];

const shareVideoValidation = [
  check('platform', 'Platform is required').isIn(['whatsapp', 'instagram', 'tiktok', 'twitter', 'facebook', 'copy'])
];

// Video creation routes
router.post(
  '/create',
  upload.single('image'),
  createVideoValidation,
  controller.createVideo
);

// Full-body video creation
router.post('/fullbody/create', createFullBodyVideoValidation, controller.createFullBodyVideo);

// Motion packs and recommendations
router.get('/motion-packs', controller.getMotionPacks);
router.get('/motion-packs/recommended', controller.getRecommendedMotionPacks);

// Full-body video statistics
router.get('/fullbody/stats', controller.getFullBodyVideoStats);

// Video status and management
router.get('/status/:videoId', controller.getVideoStatus);
router.get('/history', controller.getVideoHistory);
router.delete('/:videoId', controller.deleteVideo);

// Video engagement
router.post('/:videoId/share', shareVideoValidation, controller.shareVideo);
router.post('/:videoId/view', controller.viewVideo);

// Public video info (for sharing)
router.get('/:videoId/public', controller.getPublicVideo);

// Static data endpoints
router.get('/audio-tracks', controller.getAudioTracks);
router.get('/styles', controller.getVideoStyles);

module.exports = router;
