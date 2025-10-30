const mongoose = require('mongoose');
const Vote = require('../../../src/models/Vote');
const User = require('../../../src/models/User');
const Battle = require('../../../src/models/Battle');

describe('Vote Model', () => {
  let testUser, testBattle;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });

    testBattle = await Battle.create({
      shortCode: 'VOTE123',
      share: {
        code: 'VOTE123',
        url: 'https://example.com/battle/VOTE123'
      },
      challenger: {
        userId: testUser._id,
        username: 'challenger',
        tribe: 'test-tribe',
        transformId: new mongoose.Types.ObjectId(),
        transformUrl: 'https://example.com/transform1.jpg'
      }
    });
  });

  describe('Schema Validation', () => {
    it('should require battleId field', async () => {
      const vote = new Vote({
        userId: testUser._id,
        winner: 'challenger'
      });

      await expect(vote.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require userId field', async () => {
      const vote = new Vote({
        battleId: testBattle._id,
        winner: 'challenger'
      });

      await expect(vote.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate winner enum', async () => {
      const vote = new Vote({
        battleId: testBattle._id,
        userId: testUser._id,
        winner: 'invalid'
      });

      await expect(vote.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create vote with valid winner', async () => {
      const vote = await Vote.create({
        battleId: testBattle._id,
        userId: testUser._id,
        winner: 'challenger'
      });

      expect(vote.winner).toBe('challenger');
    });
  });
});


