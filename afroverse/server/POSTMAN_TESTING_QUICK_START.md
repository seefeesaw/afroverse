# Postman Testing Quick Start Guide

## 🎉 Your Database is Ready!

The database has been successfully seeded with comprehensive test data. Here's everything you need to start testing your API with Postman.

## 📊 What Was Seeded

### Core Data
- **5 Tribes**: Lagos Lions, Wakandan Warriors, Sahara Storm, Nile Nobility, Zulu Nation
- **15 Users**: Mix of regular users, creators, and warrior (premium) subscribers
- **15 Wallets**: One for each user with random balances (0-5000 vibranium)
- **5 Admin Users**: admin, moderator, tands, operator, viewer

### Content
- **50 Videos**: Various types (portrait_loop, fullbody_dance, battle_clip, image_loop)
- **30 Transformations**: Different styles (maasai, zulu, pharaoh, afrofuturistic)
- **25 Battles**: Pending, active, completed, and expired states

### Social & Engagement
- **45 Follow Relationships**: Users following each other
- **180 Votes**: Distributed across battles
- **130 Comments**: On various videos
- **9 Referrals**: Chain of referrals between users

### System Features
- **7 Achievements**: From common to legendary
- **50 Notifications**: Various types for testing notification system

## 🔐 Test User Credentials

### Regular Users
```
Phone: +10000000000 | Username: warrior_one
Phone: +10000000001 | Username: warrior_two  
Phone: +10000000002 | Username: warrior_three
```

### Warrior (Premium) Users
```
Phone: +10000000000 | Username: warrior_one (Premium)
Phone: +10000000003 | Username: creator_king (Premium)
Phone: +10000000006 | Username: dance_master (Premium)
Phone: +10000000009 | Username: rookie_star (Premium)
Phone: +10000000012 | Username: power_user (Premium)
```

### Creator Users
```
Phone: +10000000003 | Username: creator_king
Phone: +10000000004 | Username: battle_queen
Phone: +10000000005 | Username: tribe_chief
Phone: +10000000006 | Username: dance_master
Phone: +10000000007 | Username: video_pro
Phone: +10000000008 | Username: legend_player
```

### Admin Users
```
Email: admin@afroverse.com | Password: Admin123!@#
Email: moderator@afroverse.com | Password: Moderator123!@#
Email: tands@afroverse.com | Password: TAndS123!@#
Email: operator@afroverse.com | Password: Operator123!@#
Email: viewer@afroverse.com | Password: Viewer123!@#
```

## 🚀 Quick Start Testing

### 1. Authentication Flow

**Register a New User**
```
POST /api/auth/register
{
  "phone": "+1234567890",
  "username": "test_user_new"
}
```

**Login with Seeded User**
```
POST /api/auth/login
{
  "phone": "+10000000000"
}
```

**Verify OTP** (in development, any code works)
```
POST /api/auth/verify-otp
{
  "phone": "+10000000000",
  "code": "123456"
}
```

### 2. User & Profile

**Get User Profile**
```
GET /api/users/me
Authorization: Bearer {your_jwt_token}
```

**Get Specific User**
```
GET /api/users/{userId}
```

**Update Profile**
```
PATCH /api/users/me
{
  "bio": "Test bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 3. Tribe System

**Get All Tribes**
```
GET /api/tribes
```

**Get Tribe Leaderboard**
```
GET /api/tribes/leaderboard
?period=weekly
```

**Join a Tribe**
```
POST /api/tribes/{tribeId}/join
```

### 4. Battle System

**List All Battles**
```
GET /api/battles
?status=active
&limit=20
```

**Get Specific Battle**
```
GET /api/battles/{battleId}
```

**Get Battle by Short Code**
```
GET /api/battles/code/BT1000
```

**Vote on Battle**
```
POST /api/battles/{battleId}/vote
{
  "choice": "challenger"
}
```

**Sample Battle Short Codes**
```
BT1000, BT1001, BT1002, BT1003, BT1004
...
BT1024
```

### 5. Video System

**Get Video Feed**
```
GET /api/videos/feed
?type=foryou
&limit=20
```

**Get User's Videos**
```
GET /api/videos/user/{userId}
```

**Get Trending Videos**
```
GET /api/videos/trending
```

### 6. Social Features

**Follow User**
```
POST /api/social/follow/{userId}
```

**Unfollow User**
```
DELETE /api/social/follow/{userId}
```

**Get Followers**
```
GET /api/social/followers/{userId}
```

**Get Following**
```
GET /api/social/following/{userId}
```

### 7. Comments

**Get Video Comments**
```
GET /api/comments/video/{videoId}
?sort=top
&limit=20
```

**Post Comment**
```
POST /api/comments
{
  "videoId": "{videoId}",
  "text": "Amazing video! 🔥"
}
```

**Like Comment**
```
POST /api/comments/{commentId}/like
```

### 8. Achievements

**Get All Achievements**
```
GET /api/achievements
```

**Get User Achievements**
```
GET /api/achievements/user/{userId}
```

**Claim Achievement Reward**
```
POST /api/achievements/{achievementId}/claim
```

### 9. Notifications

**Get User Notifications**
```
GET /api/notifications
?status=unread
&limit=50
```

**Mark as Read**
```
PATCH /api/notifications/{notificationId}/read
```

### 10. Wallet & Transactions

**Get Wallet Balance**
```
GET /api/wallet
```

**Get Transaction History**
```
GET /api/wallet/transactions
?limit=50
```

### 11. Transformations

**Get User Transformations**
```
GET /api/transformations/user/{userId}
```

**Get Transformation by Share Code**
```
GET /api/transformations/share/{shareCode}
```

### 12. Referrals

**Get Referral Code**
```
GET /api/referrals/code
```

**Get Referral Stats**
```
GET /api/referrals/stats
```

## 📝 Testing Tips

### Use Variables in Postman

Create these environment variables:
```
base_url = http://localhost:5000
auth_token = {your_jwt_token}
user_id = {logged_in_user_id}
test_battle_id = {any_battle_id}
test_video_id = {any_video_id}
```

### Common Headers
```
Content-Type: application/json
Authorization: Bearer {{auth_token}}
```

### Test Different User Types

1. **Regular User**: Limited transformations, basic features
2. **Warrior User**: Unlimited transformations, premium features
3. **Creator User**: High follower count, creator stats
4. **Admin User**: Access to admin endpoints

### Test Different Battle States

- **Pending**: BT1000, BT1003, BT1006... (every 3rd battle)
- **Active**: BT1001, BT1002, BT1004...
- **Completed**: Some battles have results
- **Expired**: Some battles are past their end time

### Pagination Testing

Most list endpoints support pagination:
```
?limit=20&offset=0
?page=1&limit=10
```

### Filter Testing

Test various filters:
```
GET /api/videos?type=fullbody_dance&tribe=Zulu Nation
GET /api/battles?status=active&sort=recent
GET /api/users?isCreator=true&sort=followers
```

## 🔄 Reset Database

If you need fresh data:

```bash
cd server
node src/seeders/clear-db.js
node src/seeders/seed.js
```

Or combined:
```bash
node src/seeders/clear-db.js && node src/seeders/seed.js
```

## 🐛 Troubleshooting

### "User not found"
- Make sure you're using the correct user ID
- Check that authentication token is valid

### "Battle not found"
- Use battle short codes: BT1000-BT1024
- Or get battle IDs from `GET /api/battles`

### "Invalid token"
- Login again to get a fresh JWT token
- Check token expiration

### "Insufficient permissions"
- Some endpoints require specific user types
- Admin endpoints need admin authentication

## 📚 Useful Queries

### Get Sample IDs for Testing

**Get Video IDs:**
```
GET /api/videos/feed?limit=10
```
Copy `_id` from response for testing

**Get User IDs:**
```
GET /api/users?limit=15
```

**Get Battle IDs:**
```
GET /api/battles?limit=25
```

**Get Transformation Share Codes:**
```
GET /api/transformations/user/{userId}
```
Copy `shareCode` for testing

## 🎯 Common Test Scenarios

### 1. Complete User Journey
1. Register new user
2. Verify OTP
3. Join a tribe
4. View feed
5. Vote on battles
6. Comment on videos
7. Follow other users

### 2. Battle Flow
1. Get pending battle (BT1000, BT1003, etc.)
2. Vote on the battle
3. Check battle results after completion

### 3. Social Engagement
1. Follow multiple users
2. Comment on videos
3. Like comments
4. Share content

### 4. Progression System
1. Complete actions (vote, comment, share)
2. Check XP gains
3. Level up
4. Unlock achievements

## 🔗 Import Postman Collection

If you have a Postman collection generated:
```bash
File > Import > Select file from postman/ directory
```

## 📊 Data Statistics

- Total Users: 15 (10 regular, 5 premium)
- Total Videos: 50
- Total Battles: 25
- Total Votes: 180
- Total Comments: 130
- Total Follows: 45
- Total Achievements: 7
- Total Notifications: 50

---

**Happy Testing! 🚀**

For detailed seeding information, see `SEEDING_GUIDE.md`

