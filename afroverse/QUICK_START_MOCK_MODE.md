# 🎭 Quick Start - Mock Mode (No Server Required)

Test your Afroverse UI with dummy data in 3 simple steps!

## Option 1: Automated Setup (Recommended)

### Mac/Linux:
```bash
cd client
./setup-mock-mode.sh
npm run dev
```

### Windows:
```cmd
cd client
setup-mock-mode.bat
npm run dev
```

## Option 2: Manual Setup

### Step 1: Create `.env.local` file
```bash
cd client
```

Create a file named `.env.local` with:
```env
VITE_USE_MOCK_DATA=true
```

### Step 2: Start the app
```bash
npm run dev
```

### Step 3: Confirm it's working
Open the browser console - you should see:
```
🎭 Mock Mode Enabled - Using dummy data for all API calls
🎭 AuthService: Mock mode enabled, auto-logged in
```

## ✨ What You Can Test

✅ **All UI Features Work Without Server!**

- Browse video feed (For You, Following, Tribe, Battles)
- View and interact with videos (like, share, comment)
- Visit creator profiles
- Follow/unfollow creators
- View leaderboards (global and tribe-based)
- Check battles and vote
- View achievements and progression
- Check wallet and transactions
- Explore challenges and events
- Receive notifications
- Navigate all pages and flows

## 🔄 To Switch Back to Real Server

Edit `.env.local`:
```env
VITE_USE_MOCK_DATA=false
```

Then restart:
```bash
npm run dev
```

## 📚 More Information

- **Full Guide**: `client/MOCK_MODE_GUIDE.md`
- **Mock Data**: `client/src/services/mockData.js`
- **Mock API**: `client/src/services/mockApi.js`

## 🎯 Default Mock User

You're automatically logged in as:
- **Username**: african_warrior
- **Tribe**: Zulu Warriors
- **Level**: 12
- **Vibranium**: 15,420
- **Rank**: #45

## 🛠️ Customization

Want to test as a different user or add more data?

Edit `client/src/services/mockData.js`:
```javascript
// Change current user
currentUser: MOCK_USERS[1], // Now you're maasai_dancer

// Add more videos
...generateMoreVideos(50), // Generate 50 videos

// Customize anything!
```

## ⚠️ Important Notes

1. **Mock mode is for UI testing only** - no real data is saved
2. **Always disable before deploying** - never ship with mock mode enabled
3. **Restart required** - after changing `.env.local`, restart the dev server
4. **Network delays simulated** - mock API includes realistic delays (300ms)

## 🎉 Happy Testing!

No server setup, no backend dependencies - just start coding and testing your UI!

---

**Need Help?** Check `client/MOCK_MODE_GUIDE.md` for detailed documentation.

