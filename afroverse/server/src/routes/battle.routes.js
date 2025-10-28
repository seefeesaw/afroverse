const express = require('express');
const router = express.Router();
const {
  createBattle,
  acceptBattle,
  getBattle,
  voteOnBattle,
  listActiveBattles,
  reportBattle
} = require('../controllers/battleController');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules
const validateCreateBattle = [
  body('transformId')
    .isMongoId()
    .withMessage('Invalid transformation ID'),
  body('challengeMethod')
    .isIn(['whatsapp', 'link', 'username'])
    .withMessage('Invalid challenge method'),
  body('challengeTarget')
    .isString()
    .notEmpty()
    .withMessage('Challenge target is required'),
  body('message')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Message must be less than 200 characters'),
  handleValidationErrors
];

const validateAcceptBattle = [
  body('transformId')
    .isMongoId()
    .withMessage('Invalid transformation ID'),
  handleValidationErrors
];

const validateVote = [
  body('votedFor')
    .isIn(['challenger', 'defender'])
    .withMessage('Invalid vote choice'),
  handleValidationErrors
];

const validateReport = [
  body('reason')
    .isIn(['nsfw', 'abuse', 'other'])
    .withMessage('Invalid report reason'),
  body('details')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Details must be less than 500 characters'),
  handleValidationErrors
];

// Public routes
router.get('/:shortCode', getBattle);
router.get('/active/list', listActiveBattles);

// Protected routes
router.post('/create', 
  authenticateToken, 
  generalLimiter,
  validateCreateBattle,
  createBattle
);

router.post('/accept/:battleId', 
  authenticateToken, 
  validateAcceptBattle,
  acceptBattle
);

// Public voting (with rate limiting)
router.post('/vote/:battleId', 
  generalLimiter,
  validateVote,
  voteOnBattle
);

router.post('/:battleId/report', 
  validateReport,
  reportBattle
);

module.exports = router;
