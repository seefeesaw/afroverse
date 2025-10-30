const mongoose = require('mongoose');
const Tribe = require('../../../src/models/Tribe');

describe('Tribe Model', () => {
  describe('Schema Validation', () => {
    it('should require name field', async () => {
      const tribe = new Tribe({
        code: 'ZULU'
      });

      await expect(tribe.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require code field', async () => {
      const tribe = new Tribe({
        name: 'Zulu Warriors'
      });

      await expect(tribe.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create tribe with required fields', async () => {
      const tribe = await Tribe.create({
        name: 'Zulu Warriors',
        displayName: 'Zulu Warriors',
        motto: 'Strength in Unity',
        code: 'ZULU',
        description: 'Test tribe',
        emblem: {
          icon: '⚔️',
          color: '#FF0000'
        }
      });

      expect(tribe.name).toBe('Zulu Warriors');
      expect(tribe.code).toBe('ZULU');
    });

    it('should enforce unique code constraint', async () => {
      await Tribe.create({
        name: 'Test Tribe',
        displayName: 'Test Tribe',
        motto: 'Test motto',
        code: 'UNIQUE',
        emblem: {
          icon: '⚔️',
          color: '#FF0000'
        }
      });

      const duplicateTribe = new Tribe({
        name: 'Another Tribe',
        displayName: 'Another Tribe',
        motto: 'Another motto',
        code: 'UNIQUE',
        emblem: {
          icon: '🛡️',
          color: '#00FF00'
        }
      });

      await expect(duplicateTribe.save()).rejects.toThrow();
    });
  });
});


