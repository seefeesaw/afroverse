const mongoose = require('mongoose');
const Transformation = require('../../../src/models/Transformation');
const User = require('../../../src/models/User');

describe('Transformation Model', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });
  });

  describe('Schema Validation', () => {
    it('should require ownerId field', async () => {
      const transformation = new Transformation({
        style: 'african_warrior',
        inputImageUrl: 'https://example.com/image.jpg'
      });

      await expect(transformation.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require style field', async () => {
      const transformation = new Transformation({
        ownerId: testUser._id,
        inputImageUrl: 'https://example.com/image.jpg'
      });

      await expect(transformation.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create transformation with required fields', async () => {
      const transformation = await Transformation.create({
        ownerId: testUser._id,
        style: 'african_warrior',
        inputImageUrl: 'https://example.com/image.jpg'
      });

      expect(transformation.ownerId.toString()).toBe(testUser._id.toString());
      expect(transformation.style).toBe('african_warrior');
    });
  });

  describe('Default Values', () => {
    it('should set default status', async () => {
      const transformation = await Transformation.create({
        ownerId: testUser._id,
        style: 'african_warrior',
        inputImageUrl: 'https://example.com/image.jpg'
      });

      expect(transformation.status).toBe('pending');
    });
  });
});

