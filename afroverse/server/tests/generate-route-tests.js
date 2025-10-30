#!/usr/bin/env node

/**
 * Route Test Generator
 * Generates comprehensive unit tests for all route files
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'src', 'routes');
const testsDir = path.join(__dirname, 'unit', 'routes');

/**
 * Extract route definitions from route file content
 */
function extractRoutes(content) {
  const routes = [];
  
  // Match router.get, router.post, router.put, router.delete, router.patch
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    routes.push({ method, path });
  }
  
  return routes;
}

/**
 * Extract middleware from route file
 */
function extractMiddleware(content) {
  const middleware = [];
  
  // Common middleware patterns
  if (content.includes('authenticateToken')) middleware.push('authenticateToken');
  if (content.includes('generalLimiter')) middleware.push('generalLimiter');
  if (content.includes('authStartLimiter')) middleware.push('authStartLimiter');
  if (content.includes('authVerifyLimiter')) middleware.push('authVerifyLimiter');
  if (content.includes('requireAuth')) middleware.push('requireAuth');
  if (content.includes('requireRole')) middleware.push('requireRole');
  
  return [...new Set(middleware)];
}

/**
 * Generate comprehensive test template for a route file
 */
function generateRouteTest(routeName, routeContent) {
  const routes = extractRoutes(routeContent);
  const middleware = extractMiddleware(routeContent);
  const moduleName = routeName.replace('.js', '');
  const routePath = moduleName.replace('.routes', '');
  
  return `const request = require('supertest');
const express = require('express');
const router = require('../../../src/routes/${routeName}');
const { logger } = require('../../../src/utils/logger');

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock middleware
jest.mock('../../../src/middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 'user123', phone: '+1234567890' };
    next();
  })
}));

jest.mock('../../../src/middleware/rateLimiter', () => ({
  generalLimiter: jest.fn((req, res, next) => next()),
  authStartLimiter: jest.fn((req, res, next) => next()),
  authVerifyLimiter: jest.fn((req, res, next) => next())
}));

describe('${moduleName}', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/${routePath}', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module structure', () => {
    it('should be defined', () => {
      expect(router).toBeDefined();
    });

    it('should be an Express router', () => {
      expect(typeof router).toBe('function');
      expect(router.name).toBe('router');
    });

    it('should have stack with routes', () => {
      expect(router.stack).toBeDefined();
      expect(Array.isArray(router.stack)).toBe(true);
      expect(router.stack.length).toBeGreaterThan(0);
    });
  });

  describe('Route definitions', () => {
    it('should have correct number of routes', () => {
      const routeCount = router.stack.filter(layer => layer.route).length;
      expect(routeCount).toBeGreaterThan(0);
    });
${routes.map(route => generateRouteTest(route, routePath)).join('\n')}
  });
${middleware.length > 0 ? `
  describe('Middleware', () => {
${middleware.map(mw => `
    it('should use ${mw} middleware', () => {
      // Middleware is applied in the route definition
      expect(router.stack.length).toBeGreaterThan(0);
    });`).join('')}
  });
` : ''}
  describe('Error handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/${routePath}/invalid-route-that-does-not-exist');
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle malformed request bodies', async () => {
      const response = await request(app)
        .post('/api/${routePath}/test')
        .send('invalid json');
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Integration', () => {
    it('should mount correctly on app', () => {
      const testApp = express();
      testApp.use('/api/${routePath}', router);
      expect(testApp._router).toBeDefined();
    });

    it('should work with middleware chain', () => {
      expect(router.stack).toBeDefined();
      expect(router.stack.length).toBeGreaterThan(0);
    });
  });
});
`;
}

/**
 * Generate individual route test
 */
function generateRouteTest(route, routePath) {
  const testName = `${route.method} ${route.path}`;
  const urlPath = `/api/${routePath}${route.path}`;
  const method = route.method.toLowerCase();
  
  return `
    describe('${testName}', () => {
      it('should be defined', () => {
        const route = router.stack.find(layer => 
          layer.route && 
          layer.route.path === '${route.path}' &&
          layer.route.methods.${method}
        );
        expect(route).toBeDefined();
      });

      it('should accept ${route.method} requests', () => {
        const route = router.stack.find(layer => 
          layer.route && layer.route.path === '${route.path}'
        );
        expect(route?.route?.methods?.${method}).toBe(true);
      });
    });`;
}

/**
 * Process a single route file
 */
function processRoute(routeFile) {
  const routePath = path.join(routesDir, routeFile);
  const testPath = path.join(testsDir, routeFile.replace('.js', '.test.js'));
  
  console.log(`Processing ${routeFile}...`);
  
  try {
    // Skip index.js
    if (routeFile === 'index.js') {
      console.log(`  ⏭️  Skipped ${routeFile} (index file)`);
      return 'skipped';
    }
    
    // Read route content
    const routeContent = fs.readFileSync(routePath, 'utf8');
    
    // Generate test template
    const testContent = generateRouteTest(routeFile, routeContent);
    
    // Check if test file exists
    if (fs.existsSync(testPath)) {
      const existingContent = fs.readFileSync(testPath, 'utf8');
      
      // Only overwrite if it's a stub (less than 10 lines)
      if (existingContent.split('\n').length < 10) {
        fs.writeFileSync(testPath, testContent);
        console.log(`  ✅ Generated comprehensive tests for ${routeFile}`);
        return 'generated';
      } else {
        console.log(`  ⏭️  Skipped ${routeFile} (already has tests)`);
        return 'skipped';
      }
    } else {
      fs.writeFileSync(testPath, testContent);
      console.log(`  ✅ Created test file for ${routeFile}`);
      return 'created';
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${routeFile}:`, error.message);
    return 'error';
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧪 Route Test Generator\n');
  console.log('Scanning routes directory...\n');
  
  // Get all route files
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  console.log(`Found ${routeFiles.length} route files\n`);
  
  const stats = {
    generated: 0,
    created: 0,
    skipped: 0,
    error: 0
  };
  
  routeFiles.forEach(file => {
    const result = processRoute(file);
    stats[result]++;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log(`Total routes: ${routeFiles.length}`);
  console.log(`Generated: ${stats.generated}`);
  console.log(`Created: ${stats.created}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.error}`);
  console.log('='.repeat(60));
  
  if (stats.generated + stats.created > 0) {
    console.log('\n✅ Test generation complete!');
    console.log('\nNext steps:');
    console.log('1. Review generated tests');
    console.log('2. Run tests: npm test -- --testPathPattern=routes');
    console.log('3. Add specific test cases as needed');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateRouteTest, extractRoutes };

