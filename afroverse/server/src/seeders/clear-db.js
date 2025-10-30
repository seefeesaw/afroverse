const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/afroverse';

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'afroverse',
  });
  logger.info('MongoDB connected for clearing');
}

async function clearDatabase() {
  try {
    await connect();
    
    logger.info('⚠️  Clearing database...');
    
    // Get all collection names
    const collections = await mongoose.connection.db.collections();
    
    // Drop each collection
    for (const collection of collections) {
      await collection.deleteMany({});
      logger.info(`✓ Cleared: ${collection.collectionName}`);
    }
    
    logger.info('\n✅ Database cleared successfully!');
    logger.info('You can now run the seed script.');
    
  } catch (err) {
    logger.error('❌ Clear error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 MongoDB connection closed');
  }
}

if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase };

