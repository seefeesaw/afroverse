// Integration test for event.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('event.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/event.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
