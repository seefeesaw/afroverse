// Integration test for achievement.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('achievement.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/achievement.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
