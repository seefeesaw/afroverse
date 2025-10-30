const moderationRulesEngine = require('../../../src/services/moderationRulesEngine');

describe('moderationRulesEngine', () => {
  test('initializes default rules', () => {
    const stats = moderationRulesEngine.getStats();
    expect(stats.totalRules).toBeGreaterThan(0);
    expect(stats.ruleTypes).toContain('image_upload');
  });

  test('evaluateImage detects violations', () => {
    const res = moderationRulesEngine.evaluateImage({
      faceCount: 0,
      faces: [],
      nsfwConfidence: 0.8,
      violenceConfidence: 0.9,
      weaponsConfidence: 0.9,
      width: 50,
      height: 50,
      format: 'gif',
    });
    expect(res.allowed).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
  });

  test('evaluateText detects limits and categories', () => {
    const res = moderationRulesEngine.evaluateText({
      length: 2000,
      toxicityConfidence: 0.9,
      spamConfidence: 0.9,
      hateSpeechConfidence: 0.9,
      harassmentConfidence: 0.9,
      hasUrls: true,
      capsRatio: 0.9,
      punctuationRatio: 0.9,
    });
    expect(res.allowed).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
  });

  test('evaluateUsername enforces constraints', () => {
    const res = moderationRulesEngine.evaluateUsername('ad', { toxicityConfidence: 1, bannedWordsConfidence: 1 });
    expect(res.allowed).toBe(false);
  });

  test('getSeverityLevel maps actions', () => {
    expect(moderationRulesEngine.getSeverityLevel('warning')).toBe('low');
    expect(moderationRulesEngine.getSeverityLevel('hard_ban')).toBe('high');
  });
});

const service = require('../../../src/services/moderationRulesEngine');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('moderationRulesEngine', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
