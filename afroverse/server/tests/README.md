# Test Suite Documentation

This directory contains comprehensive tests for the Afroverse server codebase.

## Structure

```
tests/
├── setup.js                    # Jest setup and MongoDB memory server configuration
├── fixtures/                   # Test fixtures and mock data
├── integration/                # Integration tests
└── unit/                       # Unit tests
    ├── config/                 # Configuration tests
    │   ├── redis.test.js
    │   ├── s3.test.js
    │   └── constants.test.js
    ├── middleware/             # Middleware tests
    │   ├── auth.test.js
    │   ├── adminAuth.test.js
    │   ├── validation.test.js
    │   ├── rateLimiter.test.js
    │   ├── entitlementMiddleware.test.js
    │   └── errorHandler.test.js
    └── models/                 # Model tests
        ├── User.test.js
        ├── Video.test.js
        └── Battle.test.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

### Config Tests
- **redis.test.js**: Tests Redis connection, client retrieval, and disconnection
- **s3.test.js**: Tests S3 client initialization, file uploads, deletions, and signed URLs
- **constants.test.js**: Tests configuration constants

### Middleware Tests
- **auth.test.js**: Tests JWT authentication, token validation, and optional auth
- **adminAuth.test.js**: Tests admin authentication, role-based access, permissions, and rate limiting
- **validation.test.js**: Tests request validation middleware
- **rateLimiter.test.js**: Tests rate limiting with Redis
- **entitlementMiddleware.test.js**: Tests entitlement checks (Warrior Pass, transforms, etc.)
- **errorHandler.test.js**: Tests error handling middleware

### Model Tests
- **User.test.js**: Tests User model schema validation, defaults, and constraints
- **Video.test.js**: Tests Video model schema validation, required fields, and enums
- **Battle.test.js**: Tests Battle model schema validation, status enums, and unique constraints

### Service Tests
- **walletService.test.js**: Tests wallet operations (earn coins, spend coins, transactions)
- **subscriptionService.test.js**: Tests subscription management (expired checks, renewal reminders)
- **imageService.test.js**: Tests image processing (validation, resizing, face detection, NSFW checks)
- **notificationService.test.js**: Tests notification sending, dispatchers, and rules engine
- **fraudDetectionService.test.js**: Tests fraud detection (vote fraud, multi-account detection)
- **storageService.test.js**: Tests S3 storage operations (upload, delete, signed URLs)
- **leaderboardService.test.js**: Tests leaderboard operations (award points, rankings)

### Queue Tests
- **queueManager.test.js**: Tests queue management and initialization
- **paymentQueue.test.js**: Tests payment/subscription queue jobs
- **transformQueue.test.js**: Tests transformation processing queue
- **leaderboardQueue.test.js**: Tests leaderboard reset and reconciliation jobs

### Scheduler Tests
- **notificationScheduler.test.js**: Tests notification scheduling (daily challenges, streaks, etc.)
- **adminSchedulers.test.js**: Tests admin scheduled tasks (moderation, fraud, audit, etc.)

### Controller Tests
- **authController.test.js**: Tests authentication (OTP generation, verification, token generation)
- **walletController.test.js**: Tests wallet operations (get wallet, earn/spend coins)

### Utility Tests
- **shortCodeGenerator.test.js**: Tests short code generation for referrals/battles
- **constants.test.js**: Tests constant definitions (moderation actions, reasons, etc.)
- **logger.test.js**: Tests logger configuration and methods
- **validators.test.js**: Tests validation utility functions

### Socket Tests
- **socketService.test.js**: Tests Socket.IO service (authentication, event handling, room management)

### Worker Tests
- **transformWorker.test.js**: Tests transformation worker functionality
- **battleWorker.test.js**: Tests battle worker functionality
- **videoWorker.test.js**: Tests video worker functionality
- **referralWorker.test.js**: Tests referral worker functionality
- **eventWorker.test.js**: Tests event worker functionality
- **challengeWorker.test.js**: Tests challenge worker functionality
- **adminQueueWorkers.test.js**: Tests admin queue workers
- **notificationQueueWorkers.test.js**: Tests notification queue workers

### Integration Tests
- **routes/**: Integration tests for all route files (25 route test files)

### Additional Tests
- **app.test.js**: Tests application initialization
- **seeders/adminSeeder.test.js**: Tests admin seeder

## Dependencies

The test suite uses:
- **Jest**: Testing framework
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **Supertest**: HTTP assertions for API testing

## Setup

The test setup (`setup.js`) automatically:
1. Creates an in-memory MongoDB instance
2. Connects Mongoose to the test database
3. Cleans up collections after each test
4. Tears down the database after all tests

## Environment Variables

Test environment variables are automatically set in `setup.js`:
- `JWT_SECRET`: test-jwt-secret
- `ADMIN_JWT_SECRET`: test-admin-jwt-secret
- `NODE_ENV`: test

## Notes

- Tests use mocks for external services (Redis, S3, etc.)
- Database operations use an in-memory MongoDB instance
- All tests are isolated and can run independently
- Test data is automatically cleaned up between tests

