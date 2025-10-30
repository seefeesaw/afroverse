// Integration test for creator.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('creator.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/creator.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
