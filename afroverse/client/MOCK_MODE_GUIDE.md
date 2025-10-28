# 🎭 Mock Mode Guide - Test Your UI Without a Server

This guide explains how to use the mock data system to navigate and test the entire Afroverse UI without needing the backend server running.

## 🚀 Quick Start

### 1. Enable Mock Mode

Create a `.env.local` file in the `client` directory:

```bash
cd client
```

Copy the example environment configuration:

```bash
cp env.example.txt .env.local
```

Or create `.env.local` manually with this content:

```env
# Enable Mock Mode (no server required)
VITE_USE_MOCK_DATA=true

# API Configuration (not used in mock mode)
VITE_API_URL=http://localhost:5000/api
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Navigate the UI

You'll see a console message: `🎭 Mock Mode Enabled - Using dummy data for all API calls`

Now you can:
- ✅ Browse the feed
- ✅ View videos
- ✅ Like and share content
- ✅ View creator profiles
- ✅ Check leaderboards
- ✅ View battles
- ✅ Explore challenges
- ✅ Check notifications
- ✅ View achievements
- ✅ Manage wallet
- ✅ And more!

## 📦 What's Included

### Mock Data Available

1. **Users** - 3 mock users with complete profiles
2. **Videos** - Multiple videos with metadata
3. **Battles** - Active and pending battles
4. **Leaderboard** - 23 ranked users across all tribes
5. **Challenges** - 2 active challenges
6. **Notifications** - Various notification types
7. **Achievements** - Unlocked and locked achievements
8. **Wallet** - Transaction history and balance
9. **Comments** - Sample comments
10. **Events** - Upcoming and active events
11. **Tribes** - All 5 tribes with details

### Features That Work

#### Authentication
- Auto-login in mock mode (no OTP needed)
- Already logged in as `african_warrior`
- Can test different users by modifying `mockData.js`

#### Feed System
- For You tab
- Following tab
- Tribe tab
- Battles tab
- Infinite scroll simulation
- Video interactions (like, share, comment)

#### Creator Features
- View creator profiles
- Follow/unfollow creators
- View creator's content feed
- View followers/following lists
- Creator discovery

#### Battle System
- View active battles
- Vote on battles
- Create new battles
- View battle history

#### Leaderboard
- Global leaderboard
- Tribe leaderboards
- Your rank tracking
- Live updates (simulated)

#### Progression System
- Level and XP tracking
- Achievement viewing
- Streak tracking
- Rewards

#### Wallet & Transactions
- View balance
- Transaction history
- Earn/spend tracking
- Pending rewards

## 🎨 Customizing Mock Data

### Adding More Users

Edit `client/src/services/mockData.js`:

```javascript
const NEW_USER = {
  id: 'user4',
  username: 'new_warrior',
  displayName: 'New Warrior',
  phone: '+27111222333',
  tribe: TRIBES[0],
  vibranium: 5000,
  level: 10,
  // ... add more fields
};

// Add to MOCK_USERS array
const MOCK_USERS = [
  // ... existing users
  NEW_USER,
];
```

### Adding More Videos

```javascript
// Use the helper function
const moreVideos = generateMoreVideos(20); // Generate 20 videos

// Or create custom videos
const CUSTOM_VIDEO = {
  id: 'video_custom',
  userId: 'user1',
  user: MOCK_USERS[0],
  videoUrl: 'https://your-video-url.mp4',
  caption: 'Custom video caption',
  // ... add more fields
};
```

### Modifying Current User

Change who you're logged in as:

```javascript
export const mockData = {
  // Change this to any user from MOCK_USERS
  currentUser: MOCK_USERS[1], // Now logged in as maasai_dancer
  // ...
};
```

## 🔄 Switching Between Mock and Real API

### Enable Mock Mode
```env
VITE_USE_MOCK_DATA=true
```

### Disable Mock Mode (Use Real Server)
```env
VITE_USE_MOCK_DATA=false
```

**Important:** After changing the environment variable, restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🛠️ How It Works

### Architecture

```
User Action
    ↓
Service Call (e.g., feedService.getFeed())
    ↓
api.js (checks VITE_USE_MOCK_DATA)
    ↓
Mock Mode?
    ├─ YES → mockApi.js → mockData.js → Returns dummy data
    └─ NO  → axios → Real Server API
```

### Files Involved

1. **`mockData.js`** - Contains all dummy data
2. **`mockApi.js`** - Simulates API endpoints
3. **`api.js`** - Routing logic (mock vs real)
4. **`authService.js`** - Authentication with mock support

## 🎯 Testing Scenarios

### Test User Flows

1. **New User Experience**
   - View feed as first-time user
   - Explore different tabs
   - Interact with content

2. **Creator Journey**
   - View creator profiles
   - Follow creators
   - View creator content

3. **Battle Participation**
   - Browse active battles
   - Vote on battles
   - View battle results

4. **Progression Tracking**
   - Check leaderboard position
   - View achievements
   - Track vibranium earnings

5. **Social Features**
   - Like videos
   - Comment on content
   - Share videos
   - Follow users

## 🐛 Troubleshooting

### Mock Mode Not Working?

1. **Check the console** - You should see: `🎭 Mock Mode Enabled`
   - If not, verify `.env.local` file exists
   - Ensure `VITE_USE_MOCK_DATA=true` is set correctly

2. **Restart the dev server** - Environment variables are loaded at startup

3. **Clear browser cache** - Old data might be cached

4. **Check file location** - `.env.local` must be in the `client` directory

### API Errors in Mock Mode?

Mock API might not have all endpoints implemented. Check:

1. `mockApi.js` - Does the endpoint exist?
2. Console logs - What endpoint is being called?
3. Add missing endpoints to `mockApi.js` following existing patterns

### Data Not Showing?

1. Check `mockData.js` - Is the data structure correct?
2. Verify array lengths - Are there items in the arrays?
3. Check component expectations - Does the UI expect different data format?

## 📝 Adding New Mock Endpoints

When you add new features, add corresponding mock endpoints:

```javascript
// In mockApi.js
'GET /your/new/endpoint': async (params) => {
  await delay(); // Simulate network delay
  return {
    success: true,
    data: {
      // Your mock data here
    },
  };
},
```

## 🎓 Best Practices

1. **Keep mock data realistic** - Use proper data types and realistic values
2. **Simulate delays** - Use the `delay()` function to simulate network latency
3. **Test edge cases** - Add data for empty states, errors, etc.
4. **Update mock data** - Keep it in sync with server schema changes
5. **Document changes** - Update this guide when adding new mock features

## 🚦 When to Use Mock Mode

### ✅ Good for:
- UI/UX testing and iteration
- Frontend development without backend dependency
- Demos and presentations
- Component development
- Design system testing
- Navigation flow testing

### ❌ Not suitable for:
- Testing actual API integration
- Performance testing
- Real data validation
- Authentication flow testing
- File upload testing
- WebSocket/real-time features

## 🔐 Security Note

Mock mode auto-logs you in and bypasses authentication. **NEVER** deploy with `VITE_USE_MOCK_DATA=true` in production!

## 📚 Additional Resources

- See `mockData.js` for all available mock data
- See `mockApi.js` for all implemented endpoints
- Check `api.js` for the mock/real API switching logic

---

**Happy Testing! 🎉**

If you encounter issues or need more mock data, update the mock files or contact the development team.

