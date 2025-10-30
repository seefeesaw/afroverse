# Database Seeding Guide for Postman Testing

## Overview

This guide explains how to seed your database with comprehensive test data for Postman API testing. The seeding script creates realistic data across all models with proper relationships.

## Quick Start

### 1. Make sure your MongoDB is running

```bash
# Check if MongoDB is running
mongosh

# Or start it if needed
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongodb
```

### 2. Set up environment variables

Make sure your `.env` file has the correct MongoDB connection string:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/afroverse
MONGODB_DB=afroverse
```

### 3. Run the seed script

```bash
cd server
node src/seeders/seed.js
```

## What Gets Seeded

### 📊 Core Data

#### **Tribes (5 total)**
- Lagos Lions
- Wakandan Warriors  
- Sahara Storm
- Nile Nobility
- Zulu Nation

Each tribe has:
- Display name, motto, description
- Emblem (icon & color)
- Member counts and points
- Rankings and weekly challenges

#### **Admin Users**
- Multiple admin users with different roles
- Pre-configured permissions
- Test credentials for admin endpoints

### 👥 Users (15 total)

The script creates diverse users for testing different scenarios:

**Regular Users (10)**
- Phone numbers: `+10000000000` to `+10000000009`
- Usernames: warrior_one, warrior_two, etc.
- Distributed across all 5 tribes
- Various progression levels (1-20)
- Different XP and vibranium amounts

**Creator Users (6)**
- Usernames: creator_king, battle_queen, tribe_chief, dance_master, video_pro, legend_player
- Have bio and creator stats
- Higher follower counts (100-1000)
- Creator rankings

**Warrior (Premium) Users (5)**
- Every 3rd user is a warrior subscriber
- Unlocked warrior entitlements
- 2x XP multiplier
- Unlimited transformations
- Premium benefits active

### 💰 Wallets

- Wallet created for every user
- Random balance (0-5000 vibranium)
- Ready for transaction testing

### 🎬 Videos (50 total)

Diverse video content for feed testing:

**Video Types:**
- portrait_loop
- fullbody_dance
- battle_clip
- image_loop

**Styles:**
- classic
- warrior
- royal
- modern
- traditional

**Video Stats:**
- Random views (0-5000)
- Random likes (0-1000)
- Random shares (0-200)
- Completion rates
- Vote counts

**Moderation Status:**
- Most approved
- Some pending (every 10th video)
- Mix of public/private

### 🔄 Transformations (30 total)

**Statuses:**
- Most completed (ready for battles)
- Some processing
- Some failed

Each transformation has:
- Input/output URLs
- Associated tribe
- Style information

### ⚔️ Battles (25 total)

**Battle States:**
- Pending (awaiting defender)
- Active (voting in progress)
- Completed (with winners)
- Expired

Each battle includes:
- Unique short code (BT1000-BT1024)
- Share code and URL
- Challenger and defender info
- Vote counts
- Engagement metrics
- Result data for completed battles

### 🤝 Social Features

#### **Follows**
- Each user follows 3 other users
- Network graph for testing follow/unfollow
- Follower/following counts updated

#### **Votes**
- Votes distributed across active and completed battles
- Users vote for challenger or defender
- Proper vote tracking

#### **Comments**
- 1-10 comments per video (first 20 videos)
- Realistic comment text with emojis
- Linked to user and video

#### **Referrals**
- Chain of referrals between users
- Referral codes generated
- Mix of pending and completed status

### 🏆 Achievements (5 predefined)

1. **First Steps** (Bronze)
   - Complete first transformation
   - Rewards: 50 XP, 10 Vibranium

2. **Battle Champion** (Bronze)
   - Win first battle
   - Rewards: 100 XP, 25 Vibranium

3. **Tribe Warrior** (Silver)
   - Earn 1000 tribe points
   - Rewards: 200 XP, 50 Vibranium

4. **Social Butterfly** (Silver)
   - Get 100 followers
   - Rewards: 150 XP, 30 Vibranium

5. **Content Creator** (Gold)
   - Create 50 videos
   - Rewards: 500 XP, 100 Vibranium

### 🔔 Notifications (50 total)

Each of the first 10 users gets 5 notifications:

- Battle challenges
- Battle victories
- New followers
- Comments
- Achievement unlocks

Mix of read/unread status for testing notification UI.

### 📦 Additional Models

The script also creates sample data for:
- AuditLog
- BlockedUser
- Boost
- ChatSettings
- CommentLike
- Conversation
- DeviceFingerprint
- DeviceToken
- DmMessage
- Enforcement
- Event
- FraudDetection
- Message
- ModerationJob
- ModerationLog
- MotionPack
- NotificationCampaign
- NotificationTemplate
- Purchase
- Report
- Subscription
- TribeAggregate
- TrustScore
- UserCosmetic
- UserEvent
- UserNotificationSettings
- UserReward
- UserSettings
- ViralLanding
- WalletTransaction
- WeeklyChampions

## Using Seeded Data in Postman

### Test User Credentials

Use these phone numbers to test authentication:

```
+10000000000 (warrior_one) - Regular user
+10000000001 (warrior_two) - Regular user
+10000000002 (warrior_three) - Regular + Warrior subscription
+10000000003 (creator_king) - Creator user
+10000000004 (battle_queen) - Creator user
+10000000005 (tribe_chief) - Creator user
```

### Sample Battle Short Codes

```
BT1000, BT1001, BT1002, ..., BT1024
```

### Sample Video IDs

Query videos endpoint to get actual MongoDB ObjectIds, or use:
```
GET /api/videos?limit=50
```

### Testing Flows

#### 1. **User Registration & Authentication**
- Register new users (phone numbers not in seed data)
- Login with seeded users
- Test different user types (regular, creator, warrior)

#### 2. **Tribe System**
- Get tribe leaderboards
- View tribe members
- Test tribe points accumulation

#### 3. **Battle System**
- List all battles
- View specific battle (use BT codes)
- Accept pending battles
- Vote on active battles
- View completed battle results

#### 4. **Video Feed**
- Get For You feed
- Get Tribe feed
- Get Following feed
- Filter by video type
- Test pagination

#### 5. **Social Features**
- Follow/unfollow users
- View follower lists
- Post comments
- Like videos
- Share content

#### 6. **Creator Features**
- View creator profiles
- Get creator stats
- Creator rankings
- Video uploads

#### 7. **Progression System**
- View user level and XP
- Check achievements
- Claim achievement rewards
- Test vibranium earning

#### 8. **Referral System**
- Generate referral codes
- Test referral links
- Track referral rewards

## Resetting the Database

If you need to start fresh:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use afroverse

# Drop all collections
db.dropDatabase()

# Re-run the seed script
node src/seeders/seed.js
```

## Troubleshooting

### Issue: "MongoDB connection failed"
**Solution:** Make sure MongoDB is running and the connection string in `.env` is correct.

### Issue: "Duplicate key error"
**Solution:** The database already has seeded data. Drop the database first or the script will skip duplicates.

### Issue: "Model not found"
**Solution:** Make sure you're running the script from the `server` directory.

### Issue: "Not enough users/transformations for battles"
**Solution:** The script seeds data in order. If battles fail, check if users and transformations were created successfully.

## Advanced Usage

### Seed Only Specific Models

You can modify the `main()` function in `seed.js` to seed only what you need:

```javascript
// In seed.js main() function, comment out what you don't need
async function main() {
  await connect();
  
  await seedTribes();
  await seedUsers();
  // await seedVideos();  // Skip videos
  // await seedBattles(); // Skip battles
  
  await mongoose.connection.close();
}
```

### Adjust Data Quantity

Modify the loop counts in each seed function:

```javascript
// In seedUsers() function
for (let i = 0; i < 15; i++) {  // Change 15 to desired number
  // ...
}

// In seedVideos() function  
for (let i = 0; i < 50; i++) {  // Change 50 to desired number
  // ...
}
```

### Custom Test Data

Add your own test scenarios:

```javascript
// In seedUsers() after the main loop
const customUser = new User({
  phone: '+1234567890',
  username: 'custom_tester',
  // ... your custom fields
});
await customUser.save();
```

## Data Summary Table

| Model | Count | Purpose |
|-------|-------|---------|
| Tribes | 5 | Core tribe system |
| Users | 15 | Various user types |
| Videos | 50 | Feed testing |
| Battles | 25 | Battle flow testing |
| Transformations | 30 | AI transformation testing |
| Follows | ~45 | Social graph |
| Votes | Variable | Battle voting |
| Comments | ~100 | Engagement testing |
| Notifications | 50 | Notification system |
| Achievements | 5 | Achievement system |
| Referrals | 9 | Referral program |
| Wallets | 15 | Payment system |

## Next Steps

1. ✅ Run the seed script
2. 🧪 Import Postman collection (in `postman/` directory)
3. 🔑 Use seeded phone numbers for authentication
4. 🚀 Start testing your API endpoints!

## Support

For issues or questions:
1. Check the logs: `server/logs/combined.log`
2. Review the seed script: `server/src/seeders/seed.js`
3. Check model schemas in `server/src/models/`

---

**Happy Testing! 🎉**

