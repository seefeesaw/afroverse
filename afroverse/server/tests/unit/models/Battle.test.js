const mongoose = require('mongoose');
const Battle = require('../../../src/models/Battle');
const User = require('../../../src/models/User');
const Transformation = require('../../../src/models/Transformation');

describe('Battle Model', () => {
  let testUser1, testUser2;
  let testTransform1, testTransform2;

  beforeAll(async () => {
    testUser1 = await User.create({
      phone: '+1234567890',
      username: 'challenger'
    });

    testUser2 = await User.create({
      phone: '+0987654321',
      username: 'defender'
    });

    // Create mock transformations if needed
    if (mongoose.models.Transformation) {
      testTransform1 = await Transformation.create({
        ownerId: testUser1._id,
        style: 'test-style',
        inputImageUrl: 'https://example.com/image1.jpg',
        outputImageUrl: 'https://example.com/output1.jpg',
        status: 'completed'
      });

      testTransform2 = await Transformation.create({
        ownerId: testUser2._id,
        style: 'test-style',
        inputImageUrl: 'https://example.com/image2.jpg',
        outputImageUrl: 'https://example.com/output2.jpg',
        status: 'completed'
      });
    }
  });

  describe('Schema Validation', () => {
    it('should require shortCode field', async () => {
      const battle = new Battle({
        share: {
          code: 'ABC123',
          url: 'https://example.com/battle/ABC123'
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      await expect(battle.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require share field', async () => {
      const battle = new Battle({
        shortCode: 'ABC123',
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      await expect(battle.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require challenger field', async () => {
      const battle = new Battle({
        shortCode: 'ABC123',
        share: {
          code: 'ABC123',
          url: 'https://example.com/battle/ABC123'
        }
      });

      await expect(battle.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate status enum values', async () => {
      const battle = new Battle({
        shortCode: 'ABC123',
        share: {
          code: 'ABC123',
          url: 'https://example.com/battle/ABC123'
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        },
        status: {
          current: 'invalid_status'
        }
      });

      await expect(battle.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create battle with required fields', async () => {
      const battleData = {
        shortCode: 'ABC123',
        share: {
          code: 'ABC123',
          url: 'https://example.com/battle/ABC123'
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      };

      const battle = await Battle.create(battleData);

      expect(battle.shortCode).toBe(battleData.shortCode);
      expect(battle.challenger.userId.toString()).toBe(testUser1._id.toString());
      expect(battle.status.current).toBe('pending');
    });
  });

  describe('Default Values', () => {
    it('should set default status to pending', async () => {
      const battle = await Battle.create({
        shortCode: 'DEF456',
        share: {
          code: 'DEF456',
          url: 'https://example.com/battle/DEF456'
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      expect(battle.status.current).toBe('pending');
    });

    it('should set default timeline.created', async () => {
      const battle = await Battle.create({
        shortCode: 'GHI789',
        share: {
          code: 'GHI789',
          url: 'https://example.com/battle/GHI789'
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      expect(battle.status.timeline.created).toBeInstanceOf(Date);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique shortCode', async () => {
      const shortCode = 'UNIQUE123';

      await Battle.create({
        shortCode: shortCode,
        share: {
          code: shortCode,
          url: `https://example.com/battle/${shortCode}`
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      const duplicateBattle = new Battle({
        shortCode: shortCode,
        share: {
          code: shortCode,
          url: `https://example.com/battle/${shortCode}`
        },
        challenger: {
          userId: testUser1._id,
          username: 'challenger',
          tribe: 'test-tribe',
          transformId: testTransform1?._id || new mongoose.Types.ObjectId(),
          transformUrl: 'https://example.com/transform1.jpg'
        }
      });

      await expect(duplicateBattle.save()).rejects.toThrow();
    });
  });
});

