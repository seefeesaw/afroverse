const {
  requireWarriorEntitlements,
  requireTransformAccess,
  requireAllStylesAccess,
  requireAiPriority,
  requireStreakInsurance,
  requireBattleBoost,
  requireInstantFinish,
  addEntitlementInfo,
  checkPaywallTrigger
} = require('../../../src/middleware/entitlementMiddleware');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Entitlement Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.NODE_ENV = 'production';
  });

  describe('requireWarriorEntitlements', () => {
    it('should allow access for users with warrior entitlements', () => {
      req.user = {
        entitlements: {
          warriorActive: true
        }
      };

      requireWarriorEntitlements(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject users without warrior entitlements', () => {
      req.user = {
        entitlements: {
          warriorActive: false
        }
      };

      requireWarriorEntitlements(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'PREMIUM_REQUIRED',
          paywall: 'warrior_pass'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated users', () => {
      requireWarriorEntitlements(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should skip in development mode', () => {
      process.env.NODE_ENV = 'development';
      requireWarriorEntitlements(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('requireTransformAccess', () => {
    it('should allow access when user can transform', () => {
      req.user = {
        limits: {
          transformsUsed: 2,
          dayResetAt: new Date(Date.now() + 3600000)
        },
        entitlements: {
          unlimitedTransformations: false
        },
        canTransform: jest.fn().mockReturnValue(true)
      };

      requireTransformAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject when transform limit reached', () => {
      req.user = {
        limits: {
          transformsUsed: 3,
          dayResetAt: new Date(Date.now() + 3600000)
        },
        entitlements: {
          unlimitedTransformations: false
        },
        canTransform: jest.fn().mockReturnValue(false)
      };

      requireTransformAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'TRANSFORM_LIMIT_REACHED'
        })
      );
    });
  });

  describe('requireAllStylesAccess', () => {
    it('should allow access for users with all styles', () => {
      req.user = {
        entitlements: {
          allStyles: true
        }
      };

      requireAllStylesAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject users without all styles access', () => {
      req.user = {
        entitlements: {
          allStyles: false
        }
      };

      requireAllStylesAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAiPriority', () => {
    it('should allow access for users with AI priority', () => {
      req.user = {
        entitlements: {
          aiPriority: true
        }
      };

      requireAiPriority(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject users without AI priority', () => {
      req.user = {
        entitlements: {
          aiPriority: false
        }
      };

      requireAiPriority(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireStreakInsurance', () => {
    it('should allow access when streak insurance available', () => {
      req.user = {
        streak: {
          freeze: {
            available: 1
          }
        }
      };

      requireStreakInsurance(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject when no streak insurance', () => {
      req.user = {
        streak: {
          freeze: {
            available: 0
          }
        }
      };

      requireStreakInsurance(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('addEntitlementInfo', () => {
    it('should add entitlement info to request', () => {
      req.user = {
        entitlements: {
          warriorActive: true,
          multiplier: 2,
          aiPriority: true,
          unlimitedTransformations: true,
          allStyles: true,
          warriorBadge: true,
          fasterProcessing: true
        },
        streak: {
          freeze: {
            available: 1
          }
        }
      };

      addEntitlementInfo(req, res, next);

      expect(req.entitlementInfo).toBeDefined();
      expect(req.entitlementInfo.hasWarriorPass).toBe(true);
      expect(req.entitlementInfo.tribePointsMultiplier).toBe(2);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkPaywallTrigger', () => {
    it('should set paywall flag when limit reached', () => {
      req.user = {
        entitlements: {
          warriorActive: false
        },
        limits: {
          transformsUsed: 3
        }
      };

      checkPaywallTrigger(req, res, next);

      expect(req.shouldShowPaywall).toBe(true);
      expect(req.paywallType).toBe('warrior_pass');
      expect(next).toHaveBeenCalled();
    });

    it('should not set paywall flag for warrior users', () => {
      req.user = {
        entitlements: {
          warriorActive: true
        },
        limits: {
          transformsUsed: 3
        }
      };

      checkPaywallTrigger(req, res, next);

      expect(req.shouldShowPaywall).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});

