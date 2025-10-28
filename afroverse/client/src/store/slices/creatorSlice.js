import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import creatorService from '../../services/creatorService';

// Async Thunks
export const getCreatorProfile = createAsyncThunk(
  'creator/getCreatorProfile',
  async (username, { rejectWithValue }) => {
    try {
      const response = await creatorService.getCreatorProfile(username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getCreatorFeed = createAsyncThunk(
  'creator/getCreatorFeed',
  async ({ username, cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await creatorService.getCreatorFeed(username, cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const followCreator = createAsyncThunk(
  'creator/followCreator',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await creatorService.followCreator(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const unfollowCreator = createAsyncThunk(
  'creator/unfollowCreator',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await creatorService.unfollowCreator(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFollowers = createAsyncThunk(
  'creator/getFollowers',
  async ({ userId, cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await creatorService.getFollowers(userId, cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFollowing = createAsyncThunk(
  'creator/getFollowing',
  async ({ userId, cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await creatorService.getFollowing(userId, cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCreatorProfile = createAsyncThunk(
  'creator/updateCreatorProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await creatorService.updateCreatorProfile(updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getTopCreators = createAsyncThunk(
  'creator/getTopCreators',
  async ({ cursor, limit, tribeId }, { rejectWithValue }) => {
    try {
      const response = await creatorService.getTopCreators(cursor, limit, tribeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getCreatorStats = createAsyncThunk(
  'creator/getCreatorStats',
  async (username, { rejectWithValue }) => {
    try {
      const response = await creatorService.getCreatorStats(username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFollowStatus = createAsyncThunk(
  'creator/getFollowStatus',
  async (username, { rejectWithValue }) => {
    try {
      const response = await creatorService.getFollowStatus(username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const creatorSlice = createSlice({
  name: 'creator',
  initialState: {
    // Current profile being viewed
    currentProfile: null,
    profileLoading: false,
    profileError: null,
    
    // Profile feed
    profileFeed: [],
    feedLoading: false,
    feedError: null,
    feedHasMore: false,
    feedNextCursor: null,
    
    // Followers/Following
    followers: [],
    followersLoading: false,
    followersError: null,
    followersHasMore: false,
    followersNextCursor: null,
    
    following: [],
    followingLoading: false,
    followingError: null,
    followingHasMore: false,
    followingNextCursor: null,
    
    // Top creators for discovery
    topCreators: [],
    topCreatorsLoading: false,
    topCreatorsError: null,
    topCreatorsHasMore: false,
    topCreatorsNextCursor: null,
    
    // Creator stats
    creatorStats: null,
    statsLoading: false,
    statsError: null,
    
    // Follow status
    followStatus: null,
    followStatusLoading: false,
    followStatusError: null,
    
    // General state
    status: 'idle',
    error: null,
  },
  reducers: {
    // Profile reducers
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    },
    
    updateProfileFollowStatus: (state, action) => {
      const { isFollowing, followersCount } = action.payload;
      if (state.currentProfile) {
        state.currentProfile.isFollowing = isFollowing;
        state.currentProfile.followersCount = followersCount;
      }
    },
    
    // Feed reducers
    addFeedItem: (state, action) => {
      const item = action.payload;
      const existingIndex = state.profileFeed.findIndex(i => i._id === item._id);
      
      if (existingIndex === -1) {
        state.profileFeed.push(item);
      }
    },
    
    // Followers/Following reducers
    addFollower: (state, action) => {
      const follower = action.payload;
      const existingIndex = state.followers.findIndex(f => f._id === follower._id);
      
      if (existingIndex === -1) {
        state.followers.unshift(follower);
      }
    },
    
    removeFollower: (state, action) => {
      const followerId = action.payload;
      state.followers = state.followers.filter(f => f._id !== followerId);
    },
    
    addFollowing: (state, action) => {
      const following = action.payload;
      const existingIndex = state.following.findIndex(f => f._id === following._id);
      
      if (existingIndex === -1) {
        state.following.unshift(following);
      }
    },
    
    removeFollowing: (state, action) => {
      const followingId = action.payload;
      state.following = state.following.filter(f => f._id !== followingId);
    },
    
    // General reducers
    clearError: (state) => {
      state.error = null;
      state.profileError = null;
      state.feedError = null;
      state.followersError = null;
      state.followingError = null;
      state.topCreatorsError = null;
      state.statsError = null;
      state.followStatusError = null;
    },
    
    resetCreatorState: (state) => {
      state.currentProfile = null;
      state.profileFeed = [];
      state.followers = [];
      state.following = [];
      state.topCreators = [];
      state.creatorStats = null;
      state.followStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get creator profile
      .addCase(getCreatorProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getCreatorProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentProfile = action.payload.profile;
      })
      .addCase(getCreatorProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      // Get creator feed
      .addCase(getCreatorFeed.pending, (state) => {
        state.feedLoading = true;
      })
      .addCase(getCreatorFeed.fulfilled, (state, action) => {
        state.feedLoading = false;
        const { items, hasMore, nextCursor } = action.payload.feed;
        
        if (state.feedNextCursor === null) {
          // First load
          state.profileFeed = items;
        } else {
          // Pagination - append newer items
          state.profileFeed = [...state.profileFeed, ...items];
        }
        
        state.feedHasMore = hasMore;
        state.feedNextCursor = nextCursor;
      })
      .addCase(getCreatorFeed.rejected, (state, action) => {
        state.feedLoading = false;
        state.feedError = action.payload;
      })
      
      // Follow creator
      .addCase(followCreator.fulfilled, (state, action) => {
        const { followersCount, followingCount } = action.payload;
        state.updateProfileFollowStatus({ isFollowing: true, followersCount });
      })
      
      // Unfollow creator
      .addCase(unfollowCreator.fulfilled, (state, action) => {
        const { followersCount, followingCount } = action.payload;
        state.updateProfileFollowStatus({ isFollowing: false, followersCount });
      })
      
      // Get followers
      .addCase(getFollowers.pending, (state) => {
        state.followersLoading = true;
      })
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        const { followers, hasMore, nextCursor } = action.payload;
        
        if (state.followersNextCursor === null) {
          // First load
          state.followers = followers;
        } else {
          // Pagination - append newer followers
          state.followers = [...state.followers, ...followers];
        }
        
        state.followersHasMore = hasMore;
        state.followersNextCursor = nextCursor;
      })
      .addCase(getFollowers.rejected, (state, action) => {
        state.followersLoading = false;
        state.followersError = action.payload;
      })
      
      // Get following
      .addCase(getFollowing.pending, (state) => {
        state.followingLoading = true;
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        const { following, hasMore, nextCursor } = action.payload;
        
        if (state.followingNextCursor === null) {
          // First load
          state.following = following;
        } else {
          // Pagination - append newer following
          state.following = [...state.following, ...following];
        }
        
        state.followingHasMore = hasMore;
        state.followingNextCursor = nextCursor;
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.followingLoading = false;
        state.followingError = action.payload;
      })
      
      // Update creator profile
      .addCase(updateCreatorProfile.fulfilled, (state, action) => {
        state.currentProfile = action.payload.profile;
      })
      
      // Get top creators
      .addCase(getTopCreators.pending, (state) => {
        state.topCreatorsLoading = true;
      })
      .addCase(getTopCreators.fulfilled, (state, action) => {
        state.topCreatorsLoading = false;
        const { creators, hasMore, nextCursor } = action.payload;
        
        if (state.topCreatorsNextCursor === null) {
          // First load
          state.topCreators = creators;
        } else {
          // Pagination - append newer creators
          state.topCreators = [...state.topCreators, ...creators];
        }
        
        state.topCreatorsHasMore = hasMore;
        state.topCreatorsNextCursor = nextCursor;
      })
      .addCase(getTopCreators.rejected, (state, action) => {
        state.topCreatorsLoading = false;
        state.topCreatorsError = action.payload;
      })
      
      // Get creator stats
      .addCase(getCreatorStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getCreatorStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.creatorStats = action.payload.stats;
      })
      .addCase(getCreatorStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Get follow status
      .addCase(getFollowStatus.pending, (state) => {
        state.followStatusLoading = true;
      })
      .addCase(getFollowStatus.fulfilled, (state, action) => {
        state.followStatusLoading = false;
        state.followStatus = action.payload.isFollowing;
      })
      .addCase(getFollowStatus.rejected, (state, action) => {
        state.followStatusLoading = false;
        state.followStatusError = action.payload;
      });
  },
});

export const {
  setCurrentProfile,
  updateProfileFollowStatus,
  addFeedItem,
  addFollower,
  removeFollower,
  addFollowing,
  removeFollowing,
  clearError,
  resetCreatorState,
} = creatorSlice.actions;

// Selectors
export const selectCurrentProfile = (state) => state.creator.currentProfile;
export const selectProfileLoading = (state) => state.creator.profileLoading;
export const selectProfileError = (state) => state.creator.profileError;

export const selectProfileFeed = (state) => state.creator.profileFeed;
export const selectFeedLoading = (state) => state.creator.feedLoading;
export const selectFeedError = (state) => state.creator.feedError;
export const selectFeedHasMore = (state) => state.creator.feedHasMore;
export const selectFeedNextCursor = (state) => state.creator.feedNextCursor;

export const selectFollowers = (state) => state.creator.followers;
export const selectFollowersLoading = (state) => state.creator.followersLoading;
export const selectFollowersError = (state) => state.creator.followersError;
export const selectFollowersHasMore = (state) => state.creator.followersHasMore;
export const selectFollowersNextCursor = (state) => state.creator.followersNextCursor;

export const selectFollowing = (state) => state.creator.following;
export const selectFollowingLoading = (state) => state.creator.followingLoading;
export const selectFollowingError = (state) => state.creator.followingError;
export const selectFollowingHasMore = (state) => state.creator.followingHasMore;
export const selectFollowingNextCursor = (state) => state.creator.followingNextCursor;

export const selectTopCreators = (state) => state.creator.topCreators;
export const selectTopCreatorsLoading = (state) => state.creator.topCreatorsLoading;
export const selectTopCreatorsError = (state) => state.creator.topCreatorsError;
export const selectTopCreatorsHasMore = (state) => state.creator.topCreatorsHasMore;
export const selectTopCreatorsNextCursor = (state) => state.creator.topCreatorsNextCursor;

export const selectCreatorStats = (state) => state.creator.creatorStats;
export const selectStatsLoading = (state) => state.creator.statsLoading;
export const selectStatsError = (state) => state.creator.statsError;

export const selectFollowStatus = (state) => state.creator.followStatus;
export const selectFollowStatusLoading = (state) => state.creator.followStatusLoading;
export const selectFollowStatusError = (state) => state.creator.followStatusError;

export const selectCreatorStatus = (state) => state.creator.status;
export const selectCreatorError = (state) => state.creator.error;

export default creatorSlice.reducer;
