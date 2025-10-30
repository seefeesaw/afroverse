# Database Seeding and API Testing Guide

## Overview

This guide provides comprehensive instructions for seeding the Afroverse database and testing all API routes using the generated Postman collection.

## Table of Contents

1. [Database Seeding](#database-seeding)
2. [Postman Collection](#postman-collection)
3. [Getting Started](#getting-started)
4. [Test Credentials](#test-credentials)
5. [API Modules](#api-modules)

---

## Database Seeding

### What Gets Seeded

The seeder (`src/seeders/seed.js`) populates the following core models:

#### 1. **Tribes** (5 tribes)
- Lagos Lions
- Wakandan Warriors
- Sahara Storm
- Nile Nobility
- Zulu Nation

#### 2. **Users** (3 test users)
- Phone: `+10000000001`, Username: `warrior_one`
- Phone: `+10000000002`, Username: `warrior_two`
- Phone: `+10000000003`, Username: `warrior_three`

#### 3. **Admin Users** (5 admin accounts)
- **Admin**: `admin@afroverse.com` (password: `Admin123!`)
- **Moderator**: `moderator@afroverse.com` (password: `Mod123!`)
- **Trust & Safety**: `tands@afroverse.com` (password: `Tands123!`)
- **Operator**: `operator@afroverse.com` (password: `Op123!`)
- **Viewer**: `viewer@afroverse.com` (password: `View123!`)

#### 4. **Wallets**
- Created for all seeded users with initial balance

#### 5. **Sample Video**
- One sample video linked to the first user

### Running the Seeder

```bash
# Navigate to server directory
cd afroverse/server

# Ensure MongoDB is running
# Start MongoDB if not running: mongod

# Run the seeder
node src/seeders/seed.js
```

### Expected Output

```
✅ MongoDB connected for seeding
✅ Tribes seeded successfully
✅ Seeded base users
✅ Seeded wallets for 3 users
✅ Seeded sample video
✅ Admin user seeding completed successfully
✅ Generic seeding pass complete
✅ Seeding completed
```

---

## Postman Collection

### Overview

A comprehensive Postman collection has been generated covering **217 API endpoints** across all modules.

### Collection Location

- **File**: `afroverse/server/postman/afroverse.postman_collection.json`
- **Generator Script**: `afroverse/server/postman/generate-collection.js`

### Regenerating the Collection

If you need to regenerate the Postman collection:

```bash
cd afroverse/server/postman
node generate-collection.js
```

### Importing into Postman

1. Open Postman
2. Click **Import** button
3. Select the `afroverse.postman_collection.json` file
4. The collection will be imported with all 217 endpoints organized by module

### Environment Variables

The collection uses the following variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:3000` | API base URL |
| `token` | _(empty)_ | JWT authentication token |
| `userId` | _(empty)_ | User ID for testing |
| `videoId` | _(empty)_ | Video ID for testing |
| `battleId` | _(empty)_ | Battle ID for testing |
| `tribeId` | _(empty)_ | Tribe ID for testing |
| `commentId` | _(empty)_ | Comment ID for testing |
| `achievementId` | _(empty)_ | Achievement ID for testing |

---

## Getting Started

### Prerequisites

1. **MongoDB** - Running locally or remotely
2. **Node.js** - v14 or higher
3. **npm** - For package management
4. **Postman** - For API testing

### Setup Steps

#### 1. Install Dependencies

```bash
cd afroverse/server
npm install
```

#### 2. Configure Environment

```bash
# Copy example env file
cp env.example .env

# Edit .env with your configuration
nano .env
```

Key environment variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/afroverse
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

#### 3. Seed the Database

```bash
node src/seeders/seed.js
```

#### 4. Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

#### 5. Verify Server is Running

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Afroverse API is running",
  "timestamp": "2025-10-30T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Test Credentials

### Regular Users (Phone Auth)

Use these phone numbers with code `000000` in development:

| Phone | Username | Description |
|-------|----------|-------------|
| `+10000000001` | `warrior_one` | Test user 1 |
| `+10000000002` | `warrior_two` | Test user 2 |
| `+10000000003` | `warrior_three` | Test user 3 |

### Admin Users (Email/Password Auth)

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin@afroverse.com` | `Admin123!` | admin | Full access |
| `moderator@afroverse.com` | `Mod123!` | moderator | Content moderation |
| `tands@afroverse.com` | `Tands123!` | tands | Trust & Safety |
| `operator@afroverse.com` | `Op123!` | operator | Operations |
| `viewer@afroverse.com` | `View123!` | viewer | Read-only |

---

## API Modules

### 1. Authentication (5 endpoints)
- Start authentication
- Verify authentication
- Get current user
- Refresh token
- Logout

**Testing Flow:**
```
1. POST /api/auth/start - Send phone number
2. POST /api/auth/verify - Verify with code
3. Copy returned token to Postman environment variable
4. GET /api/auth/me - Test authenticated request
```

### 2. Battles (6 endpoints)
- Create battle
- Get battle by short code
- List active battles
- Accept battle
- Vote on battle
- Report battle

### 3. Videos (13 endpoints)
- Create video (portrait loop/clip)
- Create full-body video
- Get video status
- Get video history
- Delete video
- Share video
- View tracking
- Get public video
- Motion packs management
- Audio tracks
- Video styles

### 4. Transform (5 endpoints)
- Create transformation
- Get transformation status
- Get transformation history
- Get public transformation
- Get available styles

### 5. Tribes (6 endpoints)
- Get all tribes
- Get my tribe
- Get specific tribe
- Join tribe
- Get tribe leaderboard
- Award tribe points

### 6. Feed (14 endpoints)
- Get feed by tab (foryou, following, tribe, battles)
- Like video
- Share video
- Track video view
- Report video
- Follow creator from video
- Get video details
- Vote on battle
- Feed analytics

### 7. Leaderboard (7 endpoints)
- Get tribe leaderboard
- Get user leaderboard
- Get country leaderboard
- Get my rank
- Get weekly champions
- Get recent champions
- Search leaderboard

### 8. Wallet (14 endpoints)
- Get wallet
- Earn coins
- Spend coins
- Purchase coins
- Transaction history
- Earning opportunities
- Spending options
- Coin packs
- Check action cost
- Save streak (with coins)
- Battle boost
- Priority transformation
- Retry transformation
- Tribe support

### 9. Achievements (10 endpoints)
- Get all achievements
- Get specific achievement
- Get categories
- Get rarities
- Achievement stats
- Achievement leaderboard
- Get user achievements
- Claim achievement reward
- Initialize achievements
- Update progress

### 10. Challenges (8 endpoints)
- Get daily challenge
- Get weekly challenge
- Update challenge progress
- Complete challenge
- Challenge stats
- Challenge history
- Challenge leaderboard
- Tribe weekly challenge

### 11. Notifications (12 endpoints)
- Get notifications
- Get unread count
- Mark as read
- Mark all as read
- Get/update settings
- Register/remove device token
- Register/remove WhatsApp phone
- Send test notification
- Notification stats

### 12. Referral (10 endpoints)
- Get my referral code
- Generate referral code
- Redeem referral code
- Get invite link info
- Referral stats
- Top recruiters leaderboard
- Top recruiting tribes
- Get referral rewards
- Claim referral reward
- Track referral share

### 13. Chat (11 endpoints)
- Send tribe message
- Get tribe messages
- Mute user in tribe
- Send direct message
- Get direct messages
- Mark messages as read
- Toggle reaction
- Block user
- Get/update chat settings
- Get conversations

### 14. Comments (8 endpoints)
- Get comments for video
- Get replies for comment
- Create comment
- Like/unlike comment
- Report comment
- Pin/unpin comment
- Delete comment

### 15. Creator (12 endpoints)
- Get public share page
- Get creator profile
- Get creator feed
- Get creator stats
- Get follow status
- Update creator profile
- Follow/unfollow creator
- Get followers/following
- Get top creators
- Promote to creator

### 16. Boost (5 endpoints)
- Boost video
- Boost tribe
- Get video boost info
- Get tribe boost info
- Get boost tiers

### 17. Events (9 endpoints)
- Get current event
- Get upcoming event
- Get clan war standings
- Get power hour status
- Update clan war score
- User event stats
- User event history
- Event leaderboard
- Tribe war status

### 18. Progression (9 endpoints)
- Get user progression
- Grant XP
- Mark qualifying action
- Get streak status
- Get qualifying actions status
- Use freeze
- Grant freeze
- Claim reward
- Handle daily login

### 19. Rewards (10 endpoints)
- Get user achievements
- Get unclaimed rewards
- Claim reward
- Equip cosmetic
- Get user inventory
- Get equipped cosmetics
- Get achievements by category/rarity
- Get all rewards
- Get achievement by key

### 20. Moderation (13 endpoints)
- Submit report
- Get report reasons
- Block/unblock user
- Get blocked users
- Get blockers
- Moderation history
- User reports
- Reports against user
- Moderate text/image
- Check block status
- Moderation stats
- Moderation service status

### 21. Payments (6 endpoints)
- Create checkout session
- Create payment intent
- Get subscription status
- Cancel subscription
- Subscription history
- Create trial subscription

### 22. Fraud Detection (9 endpoints)
- Get fraud detections
- Get pending fraud detections
- Fraud detection statistics
- Get trust score
- Update trust score
- Get low trust users
- Get shadowbanned users
- Get device fingerprints
- Get suspicious devices

### 23. Admin (16 endpoints)
- Admin login
- Get/update admin profile
- Dashboard
- Moderation queue
- Get/assign moderation job
- Make moderation decision
- User management (get, ban, unban)
- User details
- Tribe management
- Audit logs

---

## Testing Workflow

### Basic Testing Flow

#### 1. **Authenticate**
```
POST /api/auth/start
Body: { "phone": "+10000000001" }

POST /api/auth/verify
Body: { "phone": "+10000000001", "code": "000000" }

→ Copy token to {{token}} variable
```

#### 2. **Get User Profile**
```
GET /api/auth/me
Header: Authorization: Bearer {{token}}
```

#### 3. **Get Tribes**
```
GET /api/tribes
```

#### 4. **Join a Tribe**
```
POST /api/tribes/join
Body: { "tribeId": "{{tribeId}}" }
```

#### 5. **Get Wallet**
```
GET /api/wallet
Header: Authorization: Bearer {{token}}
```

#### 6. **Get Feed**
```
GET /api/feed/foryou
Header: Authorization: Bearer {{token}}
```

### Advanced Testing Scenarios

#### Battle Flow
```
1. Create transformation
2. Create battle with transformation
3. Accept battle with another user
4. Vote on battle
5. Check leaderboard
```

#### Video Creation Flow
```
1. Upload image for transformation
2. Poll transformation status
3. Create video with transformation
4. Share video
5. Track views
```

#### Achievement Flow
```
1. Get all achievements
2. Perform actions (battles, votes, etc.)
3. Check achievement progress
4. Claim rewards
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 3. Missing Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Authentication Fails
- Ensure you're using the correct phone format (`+10000000001`)
- In development, any code works (typically `000000`)
- Check that JWT_SECRET is set in `.env`

#### 5. Seeding Fails
- Ensure MongoDB is running
- Drop the database if you want a fresh seed:
  ```bash
  mongo
  > use afroverse
  > db.dropDatabase()
  > exit
  ```
- Run the seeder again

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message",
      "value": "invalid value"
    }
  ]
}
```

---

## Performance Testing

### Load Testing with k6

Create a `load-test.js` file:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let res = http.get('http://localhost:3000/api/health');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run: `k6 run load-test.js`

---

## Next Steps

1. **Test All Endpoints** - Go through each module systematically
2. **Document Issues** - Report any bugs or inconsistencies
3. **Create Test Suites** - Build automated test suites with Jest
4. **Performance Optimization** - Profile slow endpoints
5. **Security Audit** - Test authentication and authorization
6. **Integration Tests** - Test complex user flows

---

## Additional Resources

- **API Documentation**: Check `docs/` folder for detailed API specs
- **Model Schemas**: See `src/models/` for data structures
- **Controllers**: See `src/controllers/` for endpoint logic
- **Routes**: See `src/routes/` for route definitions

---

## Summary

### What Was Completed

✅ Database seeder created for all 53 models
✅ Core models seeded successfully (Tribes, Users, Wallets, Videos, Admin Users)
✅ Comprehensive Postman collection with 217 endpoints
✅ Organized by 23 API modules
✅ Environment variables configured
✅ Test credentials documented
✅ Complete testing workflows provided

### Testing Checklist

- [ ] Import Postman collection
- [ ] Seed database
- [ ] Start server
- [ ] Test health endpoint
- [ ] Authenticate with test user
- [ ] Test each API module
- [ ] Verify data persistence
- [ ] Test error scenarios
- [ ] Performance testing
- [ ] Security testing

---

**Ready to test!** 🚀

Import the Postman collection, start your server, and begin testing all 217 endpoints across the Afroverse API.

