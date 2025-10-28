import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';

// Async Thunks
export const getComments = createAsyncThunk(
  'comments/getComments',
  async ({ videoId, sort, limit, skip }, { rejectWithValue }) => {
    try {
      const response = await commentService.getComments(videoId, sort, limit, skip);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReplies = createAsyncThunk(
  'comments/getReplies',
  async ({ commentId, limit }, { rejectWithValue }) => {
    try {
      const response = await commentService.getReplies(commentId, limit);
      return { commentId, replies: response.data.replies };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ videoId, text, parentId }, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(videoId, text, parentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  'comments/toggleLike',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await commentService.toggleLike(commentId);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reportComment = createAsyncThunk(
  'comments/reportComment',
  async ({ commentId, reason }, { rejectWithValue }) => {
    try {
      const response = await commentService.reportComment(commentId, reason);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await commentService.deleteComment(commentId);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const pinComment = createAsyncThunk(
  'comments/pinComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await commentService.pinComment(commentId);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const unpinComment = createAsyncThunk(
  'comments/unpinComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await commentService.unpinComment(commentId);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    // Comments by video
    videos: {}, // videoId -> { comments: [], pinnedComment, totalCount, loading, error }
    
    // Comment interactions (likes)
    likedComments: [], // Array of liked comment IDs
    
    // Current video being viewed
    currentVideoId: null,
    
    // Draft comment (for reply)
    draftComment: null,
    
    // General state
    status: 'idle',
    error: null,
  },
  reducers: {
    // Set current video
    setCurrentVideoId: (state, action) => {
      state.currentVideoId = action.payload;
    },
    
    // Add new comment to feed
    addComment: (state, action) => {
      const { videoId, comment } = action.payload;
      if (!state.videos[videoId]) {
        state.videos[videoId] = { comments: [], pinnedComment: null, totalCount: 0, loading: false, error: null };
      }
      state.videos[videoId].comments.unshift(comment);
      state.videos[videoId].totalCount += 1;
    },
    
    // Update comment
    updateComment: (state, action) => {
      const { videoId, commentId, updates } = action.payload;
      const comments = state.videos[videoId]?.comments || [];
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments[index] = { ...comments[index], ...updates };
      }
    },
    
    // Remove comment
    removeComment: (state, action) => {
      const { videoId, commentId } = action.payload;
      const comments = state.videos[videoId]?.comments || [];
      state.videos[videoId].comments = comments.filter(c => c.id !== commentId);
      state.videos[videoId].totalCount -= 1;
    },
    
    // Add like
    addLike: (state, action) => {
      const { videoId, commentId } = action.payload;
      if (!state.likedComments.includes(commentId)) {
        state.likedComments.push(commentId);
      }
      const comments = state.videos[videoId]?.comments || [];
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments[index].likes += 1;
        comments[index].liked = true;
      }
    },
    
    // Remove like
    removeLike: (state, action) => {
      const { videoId, commentId } = action.payload;
      state.likedComments = state.likedComments.filter(id => id !== commentId);
      const comments = state.videos[videoId]?.comments || [];
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments[index].likes = Math.max(0, comments[index].likes - 1);
        comments[index].liked = false;
      }
    },
    
    // Set draft comment
    setDraftComment: (state, action) => {
      state.draftComment = action.payload;
    },
    
    // Clear draft comment
    clearDraftComment: (state) => {
      state.draftComment = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetCommentState: (state) => {
      state.videos = {};
      state.likedComments = [];
      state.currentVideoId = null;
      state.draftComment = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get comments
      .addCase(getComments.pending, (state, action) => {
        const videoId = action.meta.arg.videoId;
        if (!state.videos[videoId]) {
          state.videos[videoId] = { comments: [], pinnedComment: null, totalCount: 0, loading: true, error: null };
        }
        state.videos[videoId].loading = true;
        state.videos[videoId].error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        const videoId = action.meta.arg.videoId;
        const { comments, pinnedComment, totalCount } = action.payload;
        state.videos[videoId].comments = comments;
        state.videos[videoId].pinnedComment = pinnedComment;
        state.videos[videoId].totalCount = totalCount;
        state.videos[videoId].loading = false;
      })
      .addCase(getComments.rejected, (state, action) => {
        const videoId = action.meta.arg.videoId;
        state.videos[videoId].loading = false;
        state.videos[videoId].error = action.payload;
      })
      
      // Create comment
      .addCase(createComment.fulfilled, (state, action) => {
        const { videoId, comment } = action.payload;
        if (!state.videos[videoId]) {
          state.videos[videoId] = { comments: [], pinnedComment: null, totalCount: 0, loading: false, error: null };
        }
        state.videos[videoId].comments.unshift(comment);
        state.videos[videoId].totalCount += 1;
      })
      
      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { commentId, liked } = action.payload;
        if (liked) {
          state.addLike({ payload: { videoId: state.currentVideoId, commentId } });
        } else {
          state.removeLike({ payload: { videoId: state.currentVideoId, commentId } });
        }
      })
      
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const videoId = state.currentVideoId;
        state.removeComment({ payload: { videoId, commentId } });
      });
  },
});

export const {
  setCurrentVideoId,
  addComment,
  updateComment,
  removeComment,
  addLike,
  removeLike,
  setDraftComment,
  clearDraftComment,
  clearError,
  resetCommentState,
} = commentSlice.actions;

// Selectors
export const selectCommentsByVideo = (state, videoId) => state.comments.videos[videoId] || { comments: [], pinnedComment: null, totalCount: 0, loading: false, error: null };
export const selectComments = (state, videoId) => state.comments.videos[videoId]?.comments || [];
export const selectPinnedComment = (state, videoId) => state.comments.videos[videoId]?.pinnedComment;
export const selectTotalCommentCount = (state, videoId) => state.comments.videos[videoId]?.totalCount || 0;
export const selectCommentsLoading = (state, videoId) => state.comments.videos[videoId]?.loading || false;
export const selectCommentsError = (state, videoId) => state.comments.videos[videoId]?.error;

export const selectCurrentVideoId = (state) => state.comments.currentVideoId;
export const selectDraftComment = (state) => state.comments.draftComment;
export const selectIsCommentLiked = (state, commentId) => state.comments.likedComments.includes(commentId);

export default commentSlice.reducer;
