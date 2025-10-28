# 🎭 Mock Mode - Test UI Without Server

## What is Mock Mode?

Mock Mode allows you to test and navigate the **entire Afroverse UI** using dummy data - **no backend server required!**

Perfect for:
- 🎨 UI/UX development and testing
- 🚀 Quick demos and presentations  
- 📱 Frontend work without backend dependencies
- 🧪 Testing navigation and user flows

## Quick Start (30 seconds)

### 1️⃣ Run Setup Script

**Mac/Linux:**
```bash
cd client
./setup-mock-mode.sh
```

**Windows:**
```cmd
cd client
setup-mock-mode.bat
```

### 2️⃣ Start Dev Server

```bash
npm run dev
```

### 3️⃣ Verify It's Working

Open browser console - you should see:
```
🎭 Mock Mode Enabled - Using dummy data for all API calls
```

That's it! 🎉

## What Can You Test?

**Everything in the UI works with dummy data:**

✅ Browse video feeds (For You, Following, Tribe, Battles)  
✅ Like, share, and comment on videos  
✅ View creator profiles and follow/unfollow  
✅ Check leaderboards (global and tribe)  
✅ View and vote on battles  
✅ Explore challenges and events  
✅ Check achievements and progression  
✅ View wallet balance and transactions  
✅ Receive and view notifications  
✅ Navigate all pages and features  

## Default Mock User

You're auto-logged in as:
- **Username**: african_warrior
- **Tribe**: Zulu Warriors  
- **Level**: 12
- **Vibranium**: 15,420
- **Rank**: #45

## Toggle Mock Mode On/Off

### Enable Mock Mode
Create/edit `client/.env.local`:
```env
VITE_USE_MOCK_DATA=true
```

### Disable Mock Mode (Use Real Server)
Edit `client/.env.local`:
```env
VITE_USE_MOCK_DATA=false
```

**Important:** Restart dev server after changing!

## Documentation

- 📖 **Quick Start**: `../QUICK_START_MOCK_MODE.md`
- 📚 **Full Guide**: `MOCK_MODE_GUIDE.md`
- 🔧 **Implementation**: `../MOCK_SYSTEM_IMPLEMENTATION.md`

## Need Help?

1. Check the console for the `🎭 Mock Mode Enabled` message
2. Ensure `.env.local` exists with `VITE_USE_MOCK_DATA=true`
3. Restart the dev server after changes
4. See `MOCK_MODE_GUIDE.md` for troubleshooting

---

**Happy Testing!** 🚀

