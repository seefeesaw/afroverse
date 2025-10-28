import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import videoService from '../../services/videoService';

const initialState = {
  videos: [],
  currentVideo: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    hasMore: false,
    nextCursor: null,
  },
  audioTracks: [],
  videoStyles: [],
};

// Async Thunks
export const createVideo = createAsyncThunk(
  'video/createVideo',
  async (videoData, { rejectWithValue }) => {
    try {
      const response = await videoService.createVideo(videoData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getVideoStatus = createAsyncThunk(
  'video/getVideoStatus',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.getVideoStatus(videoId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getVideoHistory = createAsyncThunk(
  'video/getVideoHistory',
  async ({ userId, options = {} }, { rejectWithValue }) => {
    try {
      const response = await videoService.getVideoHistory(userId, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'video/deleteVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.deleteVideo(videoId);
      return { videoId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const shareVideo = createAsyncThunk(
  'video/shareVideo',
  async ({ videoId, platform }, { rejectWithValue }) => {
    try {
      const response = await videoService.shareVideo(videoId, platform);
      return { videoId, platform, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const viewVideo = createAsyncThunk(
  'video/viewVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.viewVideo(videoId);
      return { videoId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const likeVideo = createAsyncThunk(
  'video/likeVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.likeVideo(videoId);
      return { videoId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAudioTracks = createAsyncThunk(
  'video/getAudioTracks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoService.getAudioTracks();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getVideoStyles = createAsyncThunk(
  'video/getVideoStyles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoService.getVideoStyles();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPublicVideo = createAsyncThunk(
  'video/getPublicVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.getPublicVideo(videoId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    updateVideoProgress: (state, action) => {
      const { videoId, progress, status, message } = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.progress = progress;
        video.status = status;
        video.message = message;
      }
    },
    videoCompleted: (state, action) => {
      const { videoId, video } = action.payload;
      const index = state.videos.findIndex(v => v.id === videoId);
      if (index !== -1) {
        state.videos[index] = { ...state.videos[index], ...video, status: 'completed' };
      }
    },
    videoFailed: (state, action) => {
      const { videoId, error } = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.status = 'failed';
        video.error = error;
      }
    },
    incrementVideoEngagement: (state, action) => {
      const { videoId, metric, amount = 1 } = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.engagement[metric] = (video.engagement[metric] || 0) + amount;
      }
    },
    incrementVideoShareCount: (state, action) => {
      const { videoId } = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.shareCount = (video.shareCount || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // createVideo
      .addCase(createVideo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add the new video to the list
        state.videos.unshift({
          id: action.payload.videoId,
          status: 'queued',
          progress: 0,
          ...action.payload,
        });
      })
      .addCase(createVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // getVideoStatus
      .addCase(getVideoStatus.fulfilled, (state, action) => {
        const { videoId, status, progress, video } = action.payload;
        const existingVideo = state.videos.find(v => v.id === videoId);
        if (existingVideo) {
          existingVideo.status = status;
          existingVideo.progress = progress;
          if (video) {
            Object.assign(existingVideo, video);
          }
        }
      })
      
      // getVideoHistory
      .addCase(getVideoHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getVideoHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.meta.arg.options.cursor) {
          // Append to existing videos for pagination
          state.videos = [...state.videos, ...action.payload.videos];
        } else {
          // Replace videos for fresh load
          state.videos = action.payload.videos;
        }
        state.pagination.hasMore = action.payload.hasMore;
        state.pagination.nextCursor = action.payload.nextCursor;
      })
      .addCase(getVideoHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // deleteVideo
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(v => v.id !== action.payload.videoId);
      })
      
      // shareVideo
      .addCase(shareVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video) {
          video.shareCount = (video.shareCount || 0) + 1;
        }
      })
      
      // viewVideo
      .addCase(viewVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video) {
          video.engagement.views = (video.engagement.views || 0) + 1;
        }
      })
      
      // likeVideo
      .addCase(likeVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video) {
          video.engagement.likes = (video.engagement.likes || 0) + 1;
        }
      })
      
      // getAudioTracks
      .addCase(getAudioTracks.fulfilled, (state, action) => {
        state.audioTracks = action.payload;
      })
      
      // getVideoStyles
      .addCase(getVideoStyles.fulfilled, (state, action) => {
        state.videoStyles = action.payload;
      })
      
      // getPublicVideo
      .addCase(getPublicVideo.fulfilled, (state, action) => {
        state.currentVideo = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentVideo,
  clearCurrentVideo,
  updateVideoProgress,
  videoCompleted,
  videoFailed,
  incrementVideoEngagement,
  incrementVideoShareCount,
} = videoSlice.actions;

export default videoSlice.reducer;
