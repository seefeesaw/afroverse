import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import feedService from '../../services/feedService';

// Async Thunks
export const getFeed = createAsyncThunk(
  'feed/getFeed',
  async ({ tab, cursor, limit, region }, { rejectWithValue }) => {
    try {
      const response = await feedService.getFeed(tab, cursor, limit, region);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const likeVideo = createAsyncThunk(
  'feed/likeVideo',
  async ({ videoId, on }, { rejectWithValue }) => {
    try {
      const response = await feedService.likeVideo(videoId, on);
      return { videoId, likes: response.data.likes, liked: on };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const shareVideo = createAsyncThunk(
  'feed/shareVideo',
  async ({ videoId, channel }, { rejectWithValue }) => {
    try {
      const response = await feedService.shareVideo(videoId, channel);
      return { videoId, shares: response.data.shares, shareUrl: response.data.shareUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const trackView = createAsyncThunk(
  'feed/trackView',
  async ({ videoId, viewData }, { rejectWithValue }) => {
    try {
      const response = await feedService.trackView(videoId, viewData);
      return { videoId, impression: response.data.impression };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const followCreator = createAsyncThunk(
  'feed/followCreator',
  async ({ videoId }, { rejectWithValue }) => {
    try {
      const response = await feedService.followCreator(videoId);
      return { videoId, followersCount: response.data.followersCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const voteOnBattle = createAsyncThunk(
  'feed/voteOnBattle',
  async ({ battleId, side }, { rejectWithValue }) => {
    try {
      const response = await feedService.voteOnBattle(battleId, side);
      return { battleId, side, votes: response.data.votes };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const startChallenge = createAsyncThunk(
  'feed/startChallenge',
  async ({ videoId, opponentId }, { rejectWithValue }) => {
    try {
      const response = await feedService.startChallenge(videoId, opponentId);
      return { videoId, battle: response.data.battle };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFeedAnalytics = createAsyncThunk(
  'feed/getFeedAnalytics',
  async ({ tab, days }, { rejectWithValue }) => {
    try {
      const response = await feedService.getFeedAnalytics(tab, days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getVideo = createAsyncThunk(
  'feed/getVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await feedService.getVideo(videoId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    // Feed data by tab
    feeds: {
      foryou: { videos: [], nextCursor: null, loading: false, error: null },
      following: { videos: [], nextCursor: null, loading: false, error: null },
      tribe: { videos: [], nextCursor: null, loading: false, error: null },
      battles: { videos: [], nextCursor: null, loading: false, error: null },
    },
    
    // Current active tab
    activeTab: 'foryou',
    
    // Current video being viewed
    currentVideo: null,
    currentVideoIndex: 0,
    
    // Video interactions
    videoInteractions: {}, // videoId -> { liked, shared, followed, voted }
    
    // Session tracking
    sessionId: null,
    currentPosition: 0,
    
    // Analytics
    analytics: null,
    analyticsLoading: false,
    analyticsError: null,
    
    // General state
    status: 'idle',
    error: null,
  },
  reducers: {
    // Set active tab
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    // Set current video
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload.video;
      state.currentVideoIndex = action.payload.index;
    },
    
    // Update video stats locally
    updateVideoStats: (state, action) => {
      const { videoId, stats } = action.payload;
      const tab = state.activeTab;
      const video = state.feeds[tab].videos.find(v => v.id === videoId);
      if (video) {
        video.stats = { ...video.stats, ...stats };
      }
    },
    
    // Update video interaction
    updateVideoInteraction: (state, action) => {
      const { videoId, interaction, value } = action.payload;
      if (!state.videoInteractions[videoId]) {
        state.videoInteractions[videoId] = {};
      }
      state.videoInteractions[videoId][interaction] = value;
    },
    
    // Add videos to feed
    addVideosToFeed: (state, action) => {
      const { tab, videos, nextCursor } = action.payload;
      state.feeds[tab].videos = [...state.feeds[tab].videos, ...videos];
      state.feeds[tab].nextCursor = nextCursor;
    },
    
    // Clear feed
    clearFeed: (state, action) => {
      const tab = action.payload || state.activeTab;
      state.feeds[tab].videos = [];
      state.feeds[tab].nextCursor = null;
      state.feeds[tab].error = null;
    },
    
    // Set session ID
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    
    // Update current position
    updateCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
      Object.keys(state.feeds).forEach(tab => {
        state.feeds[tab].error = null;
      });
    },
    
    // Reset state
    resetFeedState: (state) => {
      state.feeds = {
        foryou: { videos: [], nextCursor: null, loading: false, error: null },
        following: { videos: [], nextCursor: null, loading: false, error: null },
        tribe: { videos: [], nextCursor: null, loading: false, error: null },
        battles: { videos: [], nextCursor: null, loading: false, error: null },
      };
      state.activeTab = 'foryou';
      state.currentVideo = null;
      state.currentVideoIndex = 0;
      state.videoInteractions = {};
      state.sessionId = null;
      state.currentPosition = 0;
      state.analytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get feed
      .addCase(getFeed.pending, (state, action) => {
        const tab = action.meta.arg.tab;
        state.feeds[tab].loading = true;
        state.feeds[tab].error = null;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        const { tab, videos, nextCursor } = action.payload;
        state.feeds[tab].loading = false;
        state.feeds[tab].videos = videos;
        state.feeds[tab].nextCursor = nextCursor;
      })
      .addCase(getFeed.rejected, (state, action) => {
        const tab = action.meta.arg.tab;
        state.feeds[tab].loading = false;
        state.feeds[tab].error = action.payload;
      })
      
      // Like video
      .addCase(likeVideo.fulfilled, (state, action) => {
        const { videoId, likes, liked } = action.payload;
        state.updateVideoStats({ videoId, stats: { likes } });
        state.updateVideoInteraction({ videoId, interaction: 'liked', value: liked });
      })
      
      // Share video
      .addCase(shareVideo.fulfilled, (state, action) => {
        const { videoId, shares } = action.payload;
        state.updateVideoStats({ videoId, stats: { shares } });
        state.updateVideoInteraction({ videoId, interaction: 'shared', value: true });
      })
      
      // Follow creator
      .addCase(followCreator.fulfilled, (state, action) => {
        const { videoId, followersCount } = action.payload;
        state.updateVideoInteraction({ videoId, interaction: 'followed', value: true });
        // Update followers count in video owner data
        const tab = state.activeTab;
        const video = state.feeds[tab].videos.find(v => v.id === videoId);
        if (video) {
          video.owner.followersCount = followersCount;
        }
      })
      
      // Vote on battle
      .addCase(voteOnBattle.fulfilled, (state, action) => {
        const { battleId, side, votes } = action.payload;
        state.updateVideoInteraction({ battleId, interaction: 'voted', value: side });
        // Update vote count in battle data
        const tab = state.activeTab;
        const video = state.feeds[tab].videos.find(v => v.battle && v.battle.id === battleId);
        if (video) {
          video.stats.votesCast = votes;
        }
      })
      
      // Start challenge
      .addCase(startChallenge.fulfilled, (state, action) => {
        const { videoId, battle } = action.payload;
        state.updateVideoInteraction({ videoId, interaction: 'challenged', value: true });
      })
      
      // Get feed analytics
      .addCase(getFeedAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getFeedAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload.analytics;
      })
      .addCase(getFeedAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })
      
      // Get video
      .addCase(getVideo.fulfilled, (state, action) => {
        state.currentVideo = action.payload.video;
      });
  },
});

export const {
  setActiveTab,
  setCurrentVideo,
  updateVideoStats,
  updateVideoInteraction,
  addVideosToFeed,
  clearFeed,
  setSessionId,
  updateCurrentPosition,
  clearError,
  resetFeedState,
} = feedSlice.actions;

// Selectors
export const selectActiveTab = (state) => state.feed.activeTab;
export const selectCurrentVideo = (state) => state.feed.currentVideo;
export const selectCurrentVideoIndex = (state) => state.feed.currentVideoIndex;

export const selectFeedByTab = (state, tab) => state.feed.feeds[tab];
export const selectFeedVideos = (state, tab) => state.feed.feeds[tab].videos;
export const selectFeedLoading = (state, tab) => state.feed.feeds[tab].loading;
export const selectFeedError = (state, tab) => state.feed.feeds[tab].error;
export const selectFeedNextCursor = (state, tab) => state.feed.feeds[tab].nextCursor;

export const selectVideoInteractions = (state, videoId) => state.feed.videoInteractions[videoId] || {};
export const selectSessionId = (state) => state.feed.sessionId;
export const selectCurrentPosition = (state) => state.feed.currentPosition;

export const selectAnalytics = (state) => state.feed.analytics;
export const selectAnalyticsLoading = (state) => state.feed.analyticsLoading;
export const selectAnalyticsError = (state) => state.feed.analyticsError;

export const selectFeedStatus = (state) => state.feed.status;
export const selectFeedGeneralError = (state) => state.feed.error;

export default feedSlice.reducer;