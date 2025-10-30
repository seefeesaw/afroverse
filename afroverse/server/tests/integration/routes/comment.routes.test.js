// Integration test for comment.routes
const request = require('supertest');
const app = require('../../../src/app');

describe('comment.routes', () => {
  it('should have routes defined', () => {
    const routes = require('../../../src/routes/comment.routes');
    expect(routes).toBeDefined();
  });
  
  // Add integration tests for routes as needed
});
