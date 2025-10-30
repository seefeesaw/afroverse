describe('cloudinary config edge cases', () => {
  const modulePath = '../../../src/config/cloudinary';

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  test('loads without CLOUDINARY_URL/keys', () => {
    delete process.env.CLOUDINARY_URL;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    expect(() => require(modulePath)).not.toThrow();
  });

  test('reloads cleanly with partial env', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    expect(() => require(modulePath)).not.toThrow();
  });
});


