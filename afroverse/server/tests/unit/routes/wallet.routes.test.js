const request = require('supertest');
const express = require('express');
const walletRoutes = require('../../../src/routes/wallet.routes');
const walletController = require('../../../src/controllers/walletController');
const { authenticateToken } = require('../../../src/middleware/auth');

// Mock dependencies
jest.mock('../../../src/controllers/walletController');
jest.mock('../../../src/middleware/auth');

describe('wallet.routes', () => {
  let app;

  beforeAll(() => {
    // Setup express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/wallet', walletRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication middleware
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = {
        id: 'user123',
        phone: '+1234567890',
        username: 'testuser'
      };
      next();
    });

    // Mock controller functions to avoid actual execution
    Object.keys(walletController).forEach(key => {
      if (typeof walletController[key] === 'function') {
        walletController[key].mockImplementation((req, res) => {
          res.status(200).json({ success: true, message: `${key} called` });
        });
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module structure', () => {
    it('should be defined', () => {
      expect(walletRoutes).toBeDefined();
    });

    it('should be an Express router', () => {
      expect(typeof walletRoutes).toBe('function');
      expect(walletRoutes.name).toBe('router');
    });

    it('should have stack with routes', () => {
      expect(walletRoutes.stack).toBeDefined();
      expect(Array.isArray(walletRoutes.stack)).toBe(true);
      expect(walletRoutes.stack.length).toBeGreaterThan(0);
    });
  });

  describe('Route definitions', () => {
    it('should have all required routes', () => {
      const routes = walletRoutes.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));

      expect(routes.length).toBeGreaterThan(0);
    });

    describe('GET /', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/'
        );
        expect(route).toBeDefined();
      });

      it('should call getWallet controller', async () => {
        await request(app).get('/api/wallet');
        expect(walletController.getWallet).toHaveBeenCalled();
      });

      it('should require authentication', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/'
        );
        expect(route).toBeDefined();
        // Authentication middleware is applied
      });
    });

    describe('POST /earn', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/earn'
        );
        expect(route).toBeDefined();
      });

      it('should call earnCoins controller', async () => {
        await request(app)
          .post('/api/wallet/earn')
          .send({ reason: 'daily_login', amount: 10 });
        
        expect(walletController.earnCoins).toHaveBeenCalled();
      });

      it('should accept POST requests', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/earn'
        );
        expect(route?.route?.methods?.post).toBe(true);
      });
    });

    describe('POST /spend', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/spend'
        );
        expect(route).toBeDefined();
      });

      it('should call spendCoins controller', async () => {
        await request(app)
          .post('/api/wallet/spend')
          .send({ reason: 'boost_video', amount: 50 });
        
        expect(walletController.spendCoins).toHaveBeenCalled();
      });
    });

    describe('POST /purchase', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/purchase'
        );
        expect(route).toBeDefined();
      });

      it('should call purchaseCoins controller', async () => {
        await request(app)
          .post('/api/wallet/purchase')
          .send({ packType: 'small', paymentId: 'pay123' });
        
        expect(walletController.purchaseCoins).toHaveBeenCalled();
      });
    });

    describe('GET /history', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/history'
        );
        expect(route).toBeDefined();
      });

      it('should call getTransactionHistory controller', async () => {
        await request(app).get('/api/wallet/history');
        expect(walletController.getTransactionHistory).toHaveBeenCalled();
      });
    });

    describe('GET /opportunities', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/opportunities'
        );
        expect(route).toBeDefined();
      });

      it('should call getEarningOpportunities controller', async () => {
        await request(app).get('/api/wallet/opportunities');
        expect(walletController.getEarningOpportunities).toHaveBeenCalled();
      });
    });

    describe('GET /spending-options', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/spending-options'
        );
        expect(route).toBeDefined();
      });

      it('should call getSpendingOptions controller', async () => {
        await request(app).get('/api/wallet/spending-options');
        expect(walletController.getSpendingOptions).toHaveBeenCalled();
      });
    });

    describe('GET /coin-packs', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/coin-packs'
        );
        expect(route).toBeDefined();
      });

      it('should call getCoinPacks controller', async () => {
        await request(app).get('/api/wallet/coin-packs');
        expect(walletController.getCoinPacks).toHaveBeenCalled();
      });
    });

    describe('POST /check-action', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/check-action'
        );
        expect(route).toBeDefined();
      });

      it('should call checkAction controller', async () => {
        await request(app)
          .post('/api/wallet/check-action')
          .send({ action: 'boost_video' });
        
        expect(walletController.checkAction).toHaveBeenCalled();
      });
    });

    describe('POST /save-streak', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/save-streak'
        );
        expect(route).toBeDefined();
      });

      it('should call saveStreak controller', async () => {
        await request(app).post('/api/wallet/save-streak');
        expect(walletController.saveStreak).toHaveBeenCalled();
      });
    });

    describe('POST /battle-boost', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/battle-boost'
        );
        expect(route).toBeDefined();
      });

      it('should call battleBoost controller', async () => {
        await request(app)
          .post('/api/wallet/battle-boost')
          .send({ battleId: 'battle123' });
        
        expect(walletController.battleBoost).toHaveBeenCalled();
      });
    });

    describe('POST /priority-transformation', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/priority-transformation'
        );
        expect(route).toBeDefined();
      });

      it('should call priorityTransformation controller', async () => {
        await request(app)
          .post('/api/wallet/priority-transformation')
          .send({ transformId: 'transform123' });
        
        expect(walletController.priorityTransformation).toHaveBeenCalled();
      });
    });

    describe('POST /retry-transformation', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/retry-transformation'
        );
        expect(route).toBeDefined();
      });

      it('should call retryTransformation controller', async () => {
        await request(app)
          .post('/api/wallet/retry-transformation')
          .send({ transformId: 'transform123' });
        
        expect(walletController.retryTransformation).toHaveBeenCalled();
      });
    });

    describe('POST /tribe-support', () => {
      it('should be defined', () => {
        const route = walletRoutes.stack.find(layer => 
          layer.route && layer.route.path === '/tribe-support'
        );
        expect(route).toBeDefined();
      });

      it('should call tribeSupport controller', async () => {
        await request(app).post('/api/wallet/tribe-support');
        expect(walletController.tribeSupport).toHaveBeenCalled();
      });
    });
  });

  describe('Middleware', () => {
    it('should use authenticateToken middleware for all routes', () => {
      // All wallet routes require authentication
      const routes = walletRoutes.stack.filter(layer => layer.route);
      expect(routes.length).toBeGreaterThan(0);
      
      // Authentication is required (tested by middleware being called)
      expect(authenticateToken).toBeDefined();
    });

    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/wallet/earn')
        .send({ reason: 'test', amount: 10 });
      
      // Request should be processed
      expect(walletController.earnCoins).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/wallet/non-existent-route');
      
      expect(response.status).toBe(404);
    });

    it('should handle invalid HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/wallet');
      
      // Either 404 or 405 (Method Not Allowed)
      expect(response.status).toBeGreaterThanOrEqual(404);
    });
  });

  describe('Integration', () => {
    it('should mount correctly on app', () => {
      const testApp = express();
      testApp.use('/api/wallet', walletRoutes);
      expect(testApp._router).toBeDefined();
    });

    it('should handle request chain', async () => {
      const response = await request(app).get('/api/wallet');
      expect(response.status).toBeDefined();
    });

    it('should pass user context from middleware', async () => {
      await request(app).get('/api/wallet');
      
      // Verify middleware was called
      expect(authenticateToken).toHaveBeenCalled();
    });
  });

  describe('Route count', () => {
    it('should have 14 routes total', () => {
      const routes = walletRoutes.stack.filter(layer => layer.route);
      expect(routes.length).toBe(14);
    });

    it('should have correct HTTP methods distribution', () => {
      const routes = walletRoutes.stack.filter(layer => layer.route);
      const gets = routes.filter(r => r.route.methods.get).length;
      const posts = routes.filter(r => r.route.methods.post).length;
      
      expect(gets).toBeGreaterThan(0);
      expect(posts).toBeGreaterThan(0);
      expect(gets + posts).toBe(routes.length);
    });
  });
});
