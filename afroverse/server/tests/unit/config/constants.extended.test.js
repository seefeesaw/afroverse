describe('constants config edge cases', () => {
  const modulePath = '../../../src/config/constants';

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  test('module exports an object and is cached by Node', () => {
    const a = require(modulePath);
    const b = require(modulePath);
    expect(typeof a).toBe('object');
    expect(a).toBe(b);
  });
});


