describe('database config edge cases', () => {
  const modulePath = '../../../src/config/database';

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  test('loads without MONGODB_URI', () => {
    delete process.env.MONGODB_URI;
    expect(() => require(modulePath)).not.toThrow();
  });

  test('reloads cleanly with malformed URI', () => {
    process.env.MONGODB_URI = 'not-a-valid-uri';
    expect(() => require(modulePath)).not.toThrow();
  });
});


