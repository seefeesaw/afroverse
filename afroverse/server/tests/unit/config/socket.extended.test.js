describe('socket config edge cases', () => {
  const modulePath = '../../../src/config/socket';

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  test('loads without SOCKET_CORS_ORIGIN', () => {
    delete process.env.SOCKET_CORS_ORIGIN;
    expect(() => require(modulePath)).not.toThrow();
  });

  test('reloads cleanly when origin is malformed', () => {
    process.env.SOCKET_CORS_ORIGIN = '\\bad[';
    expect(() => require(modulePath)).not.toThrow();
  });
});


