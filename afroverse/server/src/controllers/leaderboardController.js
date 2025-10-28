const leaderboardService = require('../services/leaderboardService');
const { logger } = require('../utils/logger');

// Get tribe leaderboard
const getTribeLeaderboard = async (req, res) => {
  try {
    const { period = 'weekly', limit = 50, cursor } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10), 100);
    
    let parsedCursor = null;
    if (cursor) {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor format'
        });
      }
    }

    const result = await leaderboardService.getTribeLeaderboard(period, parsedLimit, parsedCursor);

    // Set cache headers
    const cacheMaxAge = period === 'weekly' ? 5 : 60;
    res.set('Cache-Control', `public, s-maxage=${cacheMaxAge}`);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting tribe leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tribe leaderboard'
    });
  }
};

// Get user leaderboard
const getUserLeaderboard = async (req, res) => {
  try {
    const { period = 'weekly', limit = 50, cursor } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10), 100);
    
    let parsedCursor = null;
    if (cursor) {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor format'
        });
      }
    }

    const result = await leaderboardService.getUserLeaderboard(period, parsedLimit, parsedCursor);

    // Set cache headers
    const cacheMaxAge = period === 'weekly' ? 5 : 60;
    res.set('Cache-Control', `public, s-maxage=${cacheMaxAge}`);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting user leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user leaderboard'
    });
  }
};

// Get country leaderboard
const getCountryLeaderboard = async (req, res) => {
  try {
    const { code } = req.params;
    const { period = 'weekly', limit = 50, cursor } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10), 100);
    
    let parsedCursor = null;
    if (cursor) {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor format'
        });
      }
    }

    const result = await leaderboardService.getUserLeaderboard(period, parsedLimit, parsedCursor, code);

    // Set cache headers
    const cacheMaxAge = period === 'weekly' ? 5 : 60;
    res.set('Cache-Control', `public, s-maxage=${cacheMaxAge}`);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting country leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get country leaderboard'
    });
  }
};

// Get user's rank
const getMyRank = async (req, res) => {
  try {
    const { scope = 'users', period = 'weekly', country } = req.query;
    const userId = req.user.id;

    let result;
    if (scope === 'tribes') {
      // Get user's tribe rank
      const user = await User.findById(userId).populate('tribe.id');
      if (!user || !user.tribe || !user.tribe.id) {
        return res.json({
          success: true,
          scope: 'tribes',
          period,
          rank: null,
          points: 0,
          message: 'User not in a tribe'
        });
      }
      result = await leaderboardService.getTribeRank(user.tribe.id, period);
    } else {
      // Get user's personal rank
      result = await leaderboardService.getUserRank(userId, period, country);
    }

    // No cache for personal data
    res.set('Cache-Control', 'no-cache');

    res.json({
      success: true,
      scope,
      period,
      ...result
    });
  } catch (error) {
    logger.error('Error getting user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user rank'
    });
  }
};

// Get weekly champions
const getWeeklyChampions = async (req, res) => {
  try {
    const { weekStart } = req.query;
    
    let result;
    if (weekStart) {
      result = await leaderboardService.getWeeklyChampions(new Date(weekStart));
    } else {
      // Get most recent champions
      result = await leaderboardService.getRecentChampions(1);
      result = result[0] || null;
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Weekly champions not found'
      });
    }

    // Set cache headers
    res.set('Cache-Control', 'public, s-maxage=3600'); // 1 hour

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting weekly champions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly champions'
    });
  }
};

// Get recent champions
const getRecentChampions = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10), 10);

    const result = await leaderboardService.getRecentChampions(parsedLimit);

    // Set cache headers
    res.set('Cache-Control', 'public, s-maxage=3600'); // 1 hour

    res.json({
      success: true,
      champions: result
    });
  } catch (error) {
    logger.error('Error getting recent champions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent champions'
    });
  }
};

// Search leaderboard
const searchLeaderboard = async (req, res) => {
  try {
    const { q, scope = 'users', period = 'weekly', country } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // This would typically search through user/tribe names
    // For now, return empty results
    res.json({
      success: true,
      scope,
      period,
      query: q,
      results: []
    });
  } catch (error) {
    logger.error('Error searching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search leaderboard'
    });
  }
};

module.exports = {
  getTribeLeaderboard,
  getUserLeaderboard,
  getCountryLeaderboard,
  getMyRank,
  getWeeklyChampions,
  getRecentChampions,
  searchLeaderboard
};
