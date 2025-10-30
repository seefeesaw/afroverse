// Integration test for challenge.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('challenge.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/challenge.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
