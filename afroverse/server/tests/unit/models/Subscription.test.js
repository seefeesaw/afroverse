const mongoose = require('mongoose');
const Subscription = require('../../../src/models/Subscription');
const User = require('../../../src/models/User');

describe('Subscription Model', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });
  });

  describe('Schema Validation', () => {
    it('should require userId field', async () => {
      const subscription = new Subscription({
        plan: 'monthly',
        status: 'active'
      });

      await expect(subscription.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require plan field', async () => {
      const subscription = new Subscription({
        userId: testUser._id,
        status: 'active'
      });

      await expect(subscription.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate plan enum', async () => {
      const subscription = new Subscription({
        userId: testUser._id,
        plan: 'invalid_plan',
        status: 'active'
      });

      await expect(subscription.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create subscription with required fields', async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        plan: 'monthly',
        status: 'active'
      });

      expect(subscription.userId.toString()).toBe(testUser._id.toString());
      expect(subscription.plan).toBe('monthly');
      expect(subscription.status).toBe('active');
    });
  });
});


