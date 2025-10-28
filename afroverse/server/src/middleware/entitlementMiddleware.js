const { logger } = require('../utils/logger');

// Middleware to check if user has warrior entitlements
const requireWarriorEntitlements = (req, res, next) => {
  // Skip entitlement checks in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!user.entitlements.warriorActive) {
      return res.status(403).json({
        success: false,
        error: 'PREMIUM_REQUIRED',
        paywall: 'warrior_pass',
        message: 'Warrior Pass required for this feature'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireWarriorEntitlements middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user can transform
const requireTransformAccess = (req, res, next) => {
  // Skip transform limit checks in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user can transform
    if (!user.canTransform()) {
      return res.status(403).json({
        success: false,
        error: 'TRANSFORM_LIMIT_REACHED',
        paywall: 'warrior_pass',
        message: 'Daily transform limit reached. Upgrade to Warrior Pass for unlimited transformations.',
        limits: {
          used: user.limits.transformsUsed,
          max: 3,
          resetAt: user.limits.dayResetAt
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireTransformAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has all styles access
const requireAllStylesAccess = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!user.entitlements.allStyles) {
      return res.status(403).json({
        success: false,
        error: 'PREMIUM_REQUIRED',
        paywall: 'warrior_pass',
        message: 'Warrior Pass required to access all styles'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireAllStylesAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has AI priority
const requireAiPriority = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!user.entitlements.aiPriority) {
      return res.status(403).json({
        success: false,
        error: 'PREMIUM_REQUIRED',
        paywall: 'warrior_pass',
        message: 'Warrior Pass required for priority AI processing'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireAiPriority middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has streak insurance
const requireStreakInsurance = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!user.streak.freeze.available || user.streak.freeze.available <= 0) {
      return res.status(403).json({
        success: false,
        error: 'STREAK_INSURANCE_REQUIRED',
        paywall: 'streak_insurance',
        message: 'Streak insurance required to protect your streak'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireStreakInsurance middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has battle boost
const requireBattleBoost = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has active battle boost
    // This would need to be implemented based on your battle system
    // For now, we'll just check if user has warrior entitlements
    if (!user.entitlements.warriorActive) {
      return res.status(403).json({
        success: false,
        error: 'BATTLE_BOOST_REQUIRED',
        paywall: 'battle_boost',
        message: 'Battle boost required for this feature'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireBattleBoost middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has instant finish
const requireInstantFinish = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has active instant finish
    // This would need to be implemented based on your transform system
    // For now, we'll just check if user has warrior entitlements
    if (!user.entitlements.warriorActive) {
      return res.status(403).json({
        success: false,
        error: 'INSTANT_FINISH_REQUIRED',
        paywall: 'instant_finish',
        message: 'Instant finish required for this feature'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in requireInstantFinish middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to add entitlement info to response
const addEntitlementInfo = (req, res, next) => {
  try {
    const user = req.user;
    
    if (user) {
      req.entitlementInfo = {
        hasWarriorPass: user.entitlements.warriorActive,
        tribePointsMultiplier: user.entitlements.multiplier,
        hasAiPriority: user.entitlements.aiPriority,
        hasUnlimitedTransformations: user.entitlements.unlimitedTransformations,
        hasAllStyles: user.entitlements.allStyles,
        hasWarriorBadge: user.entitlements.warriorBadge,
        hasFasterProcessing: user.entitlements.fasterProcessing,
        streakInsuranceAvailable: user.streak.freeze.available
      };
    }

    next();
  } catch (error) {
    logger.error('Error in addEntitlementInfo middleware:', error);
    next();
  }
};

// Middleware to check if user needs to see paywall
const checkPaywallTrigger = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return next();
    }

    // Check if user should see paywall
    const shouldShowPaywall = (
      !user.entitlements.warriorActive && 
      user.limits.transformsUsed >= 3
    );

    if (shouldShowPaywall) {
      req.shouldShowPaywall = true;
      req.paywallType = 'warrior_pass';
    }

    next();
  } catch (error) {
    logger.error('Error in checkPaywallTrigger middleware:', error);
    next();
  }
};

module.exports = {
  requireWarriorEntitlements,
  requireTransformAccess,
  requireAllStylesAccess,
  requireAiPriority,
  requireStreakInsurance,
  requireBattleBoost,
  requireInstantFinish,
  addEntitlementInfo,
  checkPaywallTrigger
};
