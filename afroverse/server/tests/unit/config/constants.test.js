const constants = require('../../../src/config/constants');

describe('Constants Config', () => {
  it('should export constants object', () => {
    expect(constants).toBeDefined();
    expect(typeof constants).toBe('object');
  });

  it('should have all expected constant properties', () => {
    // This test will vary based on what constants are exported
    // Add specific checks for your constants
    expect(constants).toBeDefined();
  });
});


