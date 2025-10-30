const mongoose = require('mongoose');
const Notification = require('../../../src/models/Notification');
const User = require('../../../src/models/User');

describe('Notification Model', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });
  });

  describe('Schema Validation', () => {
    it('should require userId field', async () => {
      const notification = new Notification({
        type: 'battle_challenge',
        title: 'Test',
        message: 'Test message',
        channel: 'inapp'
      });

      await expect(notification.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require type field', async () => {
      const notification = new Notification({
        userId: testUser._id,
        title: 'Test',
        message: 'Test message',
        channel: 'inapp'
      });

      await expect(notification.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create notification with required fields', async () => {
      const notification = await Notification.create({
        userId: testUser._id,
        type: 'battle_challenge',
        title: 'Test Notification',
        message: 'This is a test notification',
        channel: 'inapp'
      });

      expect(notification.userId.toString()).toBe(testUser._id.toString());
      expect(notification.type).toBe('battle_challenge');
      expect(notification.status).toBe('pending');
    });
  });

  describe('Default Values', () => {
    it('should set default status to pending', async () => {
      const notification = await Notification.create({
        userId: testUser._id,
        type: 'battle_challenge',
        title: 'Test',
        message: 'Test message',
        channel: 'inapp'
      });

      expect(notification.status).toBe('pending');
    });
  });
});

