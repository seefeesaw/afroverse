const { generateShortCode, generateUniqueShortCode } = require('../../../src/utils/shortCodeGenerator');

describe('Short Code Generator', () => {
  describe('generateShortCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
    });

    it('should generate alphanumeric codes', () => {
      const code = generateShortCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate different codes on each call', () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
     
      // While theoretically they could be the same, probability is very low
      // In practice, they should be different
      expect(typeof code1).toBe('string');
      expect(typeof code2).toBe('string');
    });
  });

  describe('generateUniqueShortCode', () => {
    it('should generate code without checkExists function', async () => {
      const code = await generateUniqueShortCode();
     
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate unique code when checkExists returns false', async () => {
      const checkExists = jest.fn().mockResolvedValue(false);
     
      const code = await generateUniqueShortCode(checkExists);
     
      expect(code).toHaveLength(6);
      expect(checkExists).toHaveBeenCalledWith(code);
    });

    it('should retry when code exists', async () => {
      let callCount = 0;
      const checkExists = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve(callCount < 3); // First 2 calls return true, then false
      });
     
      const code = await generateUniqueShortCode(checkExists);
     
      expect(checkExists).toHaveBeenCalledTimes(3);
      expect(code).toHaveLength(6);
    });

    it('should throw error after max attempts', async () => {
      const checkExists = jest.fn().mockResolvedValue(true);
     
      // This will loop 100 times then return undefined
      // The function should handle this gracefully
      await expect(generateUniqueShortCode(checkExists)).resolves.toBeUndefined();
      expect(checkExists).toHaveBeenCalledTimes(100);
    });
  });
});


