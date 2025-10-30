const { MODERATION_ACTIONS, MODERATION_REASONS } = require('../../../src/utils/constants');

describe('Constants', () => {
  describe('MODERATION_ACTIONS', () => {
    it('should have all required moderation actions', () => {
      expect(MODERATION_ACTIONS).toHaveProperty('APPROVE');
      expect(MODERATION_ACTIONS).toHaveProperty('REJECT');
      expect(MODERATION_ACTIONS).toHaveProperty('FLAG');
      expect(MODERATION_ACTIONS).toHaveProperty('BAN_USER');
      expect(MODERATION_ACTIONS).toHaveProperty('DELETE_CONTENT');
    });

    it('should have correct action values', () => {
      expect(MODERATION_ACTIONS.APPROVE).toBe('approve');
      expect(MODERATION_ACTIONS.REJECT).toBe('reject');
      expect(MODERATION_ACTIONS.FLAG).toBe('flag');
      expect(MODERATION_ACTIONS.BAN_USER).toBe('ban_user');
      expect(MODERATION_ACTIONS.DELETE_CONTENT).toBe('delete_content');
    });
  });

  describe('MODERATION_REASONS', () => {
    it('should have all required moderation reasons', () => {
      expect(MODERATION_REASONS).toHaveProperty('NSFW');
      expect(MODERATION_REASONS).toHaveProperty('VIOLENCE');
      expect(MODERATION_REASONS).toHaveProperty('HATE_SPEECH');
      expect(MODERATION_REASONS).toHaveProperty('SPAM');
      expect(MODERATION_REASONS).toHaveProperty('COPYRIGHT');
      expect(MODERATION_REASONS).toHaveProperty('OTHER');
    });

    it('should have correct reason values', () => {
      expect(MODERATION_REASONS.NSFW).toBe('nsfw');
      expect(MODERATION_REASONS.VIOLENCE).toBe('violence');
      expect(MODERATION_REASONS.HATE_SPEECH).toBe('hate_speech');
      expect(MODERATION_REASONS.SPAM).toBe('spam');
      expect(MODERATION_REASONS.COPYRIGHT).toBe('copyright');
      expect(MODERATION_REASONS.OTHER).toBe('other');
    });
  });
});


