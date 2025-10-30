describe('replicate config edge cases', () => {
  const modulePath = '../../../src/config/replicate';

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  test('loads without REPLICATE_API_TOKEN', () => {
    delete process.env.REPLICATE_API_TOKEN;
    expect(() => require(modulePath)).not.toThrow();
  });

  test('reloads cleanly with invalid token', () => {
    process.env.REPLICATE_API_TOKEN = '';
    expect(() => require(modulePath)).not.toThrow();
  });
});


