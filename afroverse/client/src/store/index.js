import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import battleReducer from './slices/battleSlice';
import transformReducer from './slices/transformSlice';
import feedReducer from './slices/feedSlice';
import tribeReducer from './slices/tribeSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import progressionReducer from './slices/progressionSlice';
import notificationReducer from './slices/notificationSlice';
import paymentReducer from './slices/paymentSlice';
import rewardReducer from './slices/rewardSlice';
import moderationReducer from './slices/moderationSlice';
import referralReducer from './slices/referralSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';
import walletReducer from './slices/walletSlice';
import videoReducer from './slices/videoSlice';
import challengeReducer from './slices/challengeSlice';
import eventReducer from './slices/eventSlice';
import chatReducer from './slices/chatSlice';
import creatorReducer from './slices/creatorSlice';
import achievementReducer from './slices/achievementSlice';
import commentReducer from './slices/commentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    battle: battleReducer,
    transform: transformReducer,
    feed: feedReducer,
    tribe: tribeReducer,
    leaderboard: leaderboardReducer,
    progression: progressionReducer,
    notifications: notificationReducer,
    payment: paymentReducer,
    reward: rewardReducer,
    moderation: moderationReducer,
    referral: referralReducer,
    ui: uiReducer,
    admin: adminReducer,
    wallet: walletReducer,
    video: videoReducer,
    challenge: challengeReducer,
    event: eventReducer,
    chat: chatReducer,
    creator: creatorReducer,
    achievements: achievementReducer,
    comments: commentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const RootState = typeof store.getState;
export const AppDispatch = typeof store.dispatch;
