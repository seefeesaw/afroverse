/**
 * Generate short codes for various purposes (referrals, battles, etc.)
 */

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LENGTH = 6;

/**
 * Generate a short code
 * @returns {string} Short code
 */
function generateShortCode() {
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

/**
 * Generate a unique short code (with collision checking if provided)
 * @param {Function} checkExists - Function to check if code exists
 * @returns {Promise<string>} Unique short code
 */
async function generateUniqueShortCode(checkExists) {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const code = generateShortCode();
    
    if (!checkExists) {
      return code;
    }
    
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Unable to generate unique short code after maximum attempts');
}

module.exports = {
  generateShortCode,
  generateUniqueShortCode
};


