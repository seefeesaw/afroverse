const textModerationService = require('../../../src/services/textModerationService');

describe('textModerationService', () => {
  test('getStatus returns initialized state and counts', () => {
    const status = textModerationService.getStatus();
    expect(status.service).toBe('text-moderation');
    expect(typeof status.initialized).toBe('boolean');
    expect(typeof status.bannedWordsCount).toBe('number');
  });

  test('checkBannedWords detects banned words', () => {
    const result = textModerationService.checkBannedWords('This is spam and a scam');
    expect(result.safe).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  test('checkSpam detects excessive repetition and punctuation', () => {
    const text = 'buy buy buy buy NOW!!! CLICK HERE!!!';
    const result = textModerationService.checkSpam(text);
    expect(result.safe).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  test('moderateText flags toxic phrases', async () => {
    // Ensure initialized (it initializes in constructor)
    const res = await textModerationService.moderateText('you are a stupid idiot');
    expect(res.safe).toBe(false);
    expect(res.categories).toContain('hate_speech');
    expect(['block', 'warn']).toContain(res.action);
  });

  test('validateUsername returns violations for short and invalid chars', async () => {
    const res = await textModerationService.validateUsername('!');
    expect(res.valid).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
  });
});

const service = require('../../../src/services/textModerationService');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() }
}));

describe('textModerationService', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('should be defined', () => { expect(service).toBeDefined(); });
});
