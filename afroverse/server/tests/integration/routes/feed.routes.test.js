// Integration test for feed.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('feed.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/feed.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
