const express = require('express');
const { body, query, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  getTribeLeaderboard,
  getUserLeaderboard,
  getCountryLeaderboard,
  getMyRank,
  getWeeklyChampions,
  getRecentChampions,
  searchLeaderboard
} = require('../controllers/leaderboardController');

const router = express.Router();

// Validation rules
const leaderboardQueryValidation = [
  query('period').optional().isIn(['weekly', 'all']).withMessage('Period must be weekly or all'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('cursor').optional().isString().withMessage('Cursor must be a string')
];

const countryCodeValidation = [
  param('code').isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters')
];

const myRankQueryValidation = [
  query('scope').optional().isIn(['users', 'tribes']).withMessage('Scope must be users or tribes'),
  query('period').optional().isIn(['weekly', 'all']).withMessage('Period must be weekly or all'),
  query('country').optional().isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters')
];

const searchQueryValidation = [
  query('q').isLength({ min: 2, max: 50 }).withMessage('Search query must be between 2 and 50 characters'),
  query('scope').optional().isIn(['users', 'tribes']).withMessage('Scope must be users or tribes'),
  query('period').optional().isIn(['weekly', 'all']).withMessage('Period must be weekly or all'),
  query('country').optional().isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters')
];

// Public routes (no authentication required)
router.get('/tribes', 
  leaderboardQueryValidation,
  handleValidationErrors,
  getTribeLeaderboard
);

router.get('/users', 
  leaderboardQueryValidation,
  handleValidationErrors,
  getUserLeaderboard
);

router.get('/users/country/:code', 
  countryCodeValidation,
  leaderboardQueryValidation,
  handleValidationErrors,
  getCountryLeaderboard
);

router.get('/weekly-champions',
  query('weekStart').optional().isISO8601().withMessage('WeekStart must be a valid date'),
  handleValidationErrors,
  getWeeklyChampions
);

router.get('/recent-champions',
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10'),
  handleValidationErrors,
  getRecentChampions
);

router.get('/search',
  searchQueryValidation,
  handleValidationErrors,
  searchLeaderboard
);

// Protected routes (authentication required)
router.get('/me',
  authenticateToken,
  generalLimiter,
  myRankQueryValidation,
  handleValidationErrors,
  getMyRank
);

module.exports = router;
