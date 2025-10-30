// Integration test for moderation.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('moderation.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/moderation.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
