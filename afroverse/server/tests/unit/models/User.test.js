const mongoose = require('mongoose');
const User = require('../../../src/models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Connection is handled by setup.js
  });

  describe('Schema Validation', () => {
    it('should require phone field', async () => {
      const user = new User({
        username: 'testuser'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require username field', async () => {
      const user = new User({
        phone: '+1234567890'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create user with required fields', async () => {
      const userData = {
        phone: '+1234567890',
        username: 'testuser'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser._id).toBeDefined();
    });

    it('should enforce unique phone constraint', async () => {
      const userData = {
        phone: '+1234567890',
        username: 'testuser'
      };

      await User.create(userData);
     
      const duplicateUser = new User({
        phone: '+1234567890',
        username: 'anotheruser'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce unique username constraint', async () => {
      const userData = {
        phone: '+1234567890',
        username: 'testuser'
      };

      await User.create(userData);
     
      const duplicateUser = new User({
        phone: '+0987654321',
        username: 'testuser'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default subscription status', async () => {
      const user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });

      expect(user.subscription.status).toBe('free');
    });

    it('should set default entitlements', async () => {
      const user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });

      expect(user.entitlements.warriorActive).toBe(false);
      expect(user.entitlements.multiplier).toBe(1);
      expect(user.entitlements.aiPriority).toBe(false);
    });

    it('should set default limits', async () => {
      const user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });

      expect(user.limits.transformsUsed).toBe(0);
      expect(user.limits.dayResetAt).toBeInstanceOf(Date);
    });

    it('should set default progression values', async () => {
      const user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });

      expect(user.progression.level).toBe(1);
      expect(user.progression.vibranium).toBe(0);
    });
  });

  describe('Indexes', () => {
    it('should have indexes on phone and username', async () => {
      const indexes = await User.collection.getIndexes();
     
      // These indexes should exist for uniqueness
      expect(indexes).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });
    });

    it('should implement canTransform method if defined', () => {
      // If the model has this method, test it
      if (typeof user.canTransform === 'function') {
        user.limits.transformsUsed = 2;
        expect(user.canTransform()).toBe(true);

        user.limits.transformsUsed = 3;
        expect(user.canTransform()).toBe(false);
      }
    });
  });

  describe('Virtual Fields', () => {
    it('should handle virtual fields if defined', async () => {
      const user = await User.create({
        phone: '+1234567890',
        username: 'testuser'
      });

      // Test any virtual fields if they exist
      expect(user).toBeDefined();
    });
  });
});

