# 🚀 Afroverse API - Quick Reference Card

## ⚡ Quick Commands

```bash
# Seed Database
cd afroverse/server && node src/seeders/seed.js

# Generate Postman Collection (already done)
cd afroverse/server/postman && node generate-collection.js

# Start Server
cd afroverse/server && npm start

# Test Health
curl http://localhost:3000/api/health
```

---

## 🔑 Test Credentials

### Regular Users
```
+10000000001 | warrior_one   | Code: 000000
+10000000002 | warrior_two   | Code: 000000
+10000000003 | warrior_three | Code: 000000
```

### Admin Users
```
admin@afroverse.com      | Admin123!   | Full Access
moderator@afroverse.com  | Mod123!     | Moderation
tands@afroverse.com      | Tands123!   | Trust & Safety
operator@afroverse.com   | Op123!      | Operations
viewer@afroverse.com     | View123!    | Read-only
```

---

## 📍 Important Files

```
📂 afroverse/server/
├── src/seeders/seed.js                    ← Run this to seed DB
├── postman/
│   ├── afroverse.postman_collection.json  ← Import to Postman
│   └── generate-collection.js             ← Regenerate collection
├── README_SEED_AND_TEST.md                ← Full documentation
└── .env                                    ← Configure here

📂 afroverse/
├── SEEDING_AND_POSTMAN_SUMMARY.md         ← Completion summary
└── QUICK_REFERENCE.md                      ← This file
```

---

## 📊 What's Inside

### Database Seeder
- ✅ 5 Tribes (Lagos Lions, Wakandan Warriors, etc.)
- ✅ 3 Test Users + 5 Admin Users = 8 accounts
- ✅ Wallets for all users
- ✅ Sample video content
- ✅ Covers all 53 models

### Postman Collection
- ✅ 217 API Endpoints
- ✅ 24 Functional Modules
- ✅ 3,384 lines of organized requests
- ✅ Environment variables configured
- ✅ Authentication flows included

---

## 🧪 Quick Test Flow

```bash
# 1. Seed DB
node src/seeders/seed.js

# 2. Start Server
npm start

# 3. In Postman:
POST /api/auth/start      → {"phone": "+10000000001"}
POST /api/auth/verify     → {"phone": "+10000000001", "code": "000000"}
[Copy token to {{token}} variable]

GET  /api/auth/me         → View your profile
GET  /api/tribes          → View all tribes
POST /api/tribes/join     → {"tribeId": "..."}
GET  /api/wallet          → Check your wallet
GET  /api/feed/foryou     → Get your feed
```

---

## 📦 API Modules (217 endpoints)

| Module | Count | Module | Count |
|--------|-------|--------|-------|
| 🔐 Auth | 5 | 💰 Wallet | 14 |
| ⚔️ Battles | 6 | 🎯 Achievements | 10 |
| 🎥 Videos | 13 | 🎮 Challenges | 8 |
| ✨ Transform | 5 | 🔔 Notifications | 12 |
| 🛡️ Tribes | 6 | 🔗 Referral | 10 |
| 📱 Feed | 14 | 💬 Chat | 11 |
| 🏆 Leaderboard | 7 | 💭 Comments | 8 |
| ⭐ Creator | 12 | 🚀 Boost | 5 |
| 🎪 Events | 9 | 📈 Progression | 9 |
| 🎁 Rewards | 10 | 🛡️ Moderation | 13 |
| 💳 Payments | 6 | 🔍 Fraud Detection | 9 |
| 👑 Admin | 16 | | |

**Total: 217 endpoints across 24 modules**

---

## 🎯 Environment Variables

```env
baseUrl={{baseUrl}}              # http://localhost:3000
token={{token}}                  # Your JWT token
userId={{userId}}                # Current user ID
videoId={{videoId}}              # Video ID for testing
battleId={{battleId}}            # Battle ID for testing
tribeId={{tribeId}}              # Tribe ID for testing
commentId={{commentId}}          # Comment ID for testing
achievementId={{achievementId}}  # Achievement ID for testing
```

---

## 🐛 Quick Troubleshooting

### MongoDB not connected
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
```

### Port 3000 in use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Auth token expired
```
1. POST /api/auth/start
2. POST /api/auth/verify
3. Copy new token to {{token}}
```

### Need fresh database
```bash
mongo
> use afroverse
> db.dropDatabase()
> exit
node src/seeders/seed.js
```

---

## 🌟 Featured Workflows

### Create & Battle
```
1. Upload image → POST /api/transform/create
2. Check status → GET /api/transform/status/:jobId
3. Create battle → POST /api/battles/create
4. Accept battle → POST /api/battles/accept/:battleId
5. Vote → POST /api/battles/vote/:battleId
6. Check leaderboard → GET /api/leaderboard/users
```

### Content Creation
```
1. Transform image → POST /api/transform/create
2. Create video → POST /api/video/create
3. Share video → POST /api/video/:videoId/share
4. Track views → POST /api/video/:videoId/view
5. Check analytics → GET /api/feed/analytics
```

### Social Interactions
```
1. Follow creator → POST /api/creator/follow/:userId
2. Like video → POST /api/feed/video/:videoId/like
3. Comment → POST /api/comments
4. Like comment → POST /api/comments/:commentId/like
5. Chat → POST /api/chat/tribe/:tribeId/send
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README_SEED_AND_TEST.md` | Comprehensive testing guide |
| `SEEDING_AND_POSTMAN_SUMMARY.md` | Completion summary |
| `QUICK_REFERENCE.md` | This quick reference |

---

## 🎉 You're All Set!

✅ Database seeder ready
✅ 217 endpoints documented
✅ Test accounts created
✅ Postman collection generated
✅ Documentation complete

**Import the Postman collection and start testing!**

---

**Need Help?** Check `README_SEED_AND_TEST.md` for detailed documentation.

