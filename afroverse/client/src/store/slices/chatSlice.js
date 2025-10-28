import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// Async Thunks
export const sendTribeMessage = createAsyncThunk(
  'chat/sendTribeMessage',
  async ({ tribeId, text, replyTo, type }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendTribeMessage(tribeId, text, replyTo, type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getTribeMessages = createAsyncThunk(
  'chat/getTribeMessages',
  async ({ tribeId, cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await chatService.getTribeMessages(tribeId, cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendDirectMessage = createAsyncThunk(
  'chat/sendDirectMessage',
  async ({ userId, text }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendDirectMessage(userId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getDirectMessages = createAsyncThunk(
  'chat/getDirectMessages',
  async ({ userId, cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await chatService.getDirectMessages(userId, cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleReaction = createAsyncThunk(
  'chat/toggleReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      const response = await chatService.toggleReaction(messageId, emoji);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.markMessagesAsRead(conversationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async ({ cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations(cursor, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    // Tribe chat state
    tribeMessages: [],
    tribeMessagesLoading: false,
    tribeMessagesError: null,
    tribeHasMoreMessages: false,
    tribeNextCursor: null,
    
    // Direct messages state
    directMessages: [],
    directMessagesLoading: false,
    directMessagesError: null,
    directHasMoreMessages: false,
    directNextCursor: null,
    
    // Conversations state
    conversations: [],
    conversationsLoading: false,
    conversationsError: null,
    conversationsHasMore: false,
    conversationsNextCursor: null,
    
    // UI state
    currentTribeId: null,
    currentDmUserId: null,
    currentConversationId: null,
    isTyping: false,
    typingUsers: [],
    
    // Socket state
    isConnected: false,
    onlineUsers: [],
    
    // General state
    status: 'idle',
    error: null,
  },
  reducers: {
    // Tribe chat reducers
    setCurrentTribe: (state, action) => {
      state.currentTribeId = action.payload;
      state.tribeMessages = [];
      state.tribeNextCursor = null;
    },
    
    addTribeMessage: (state, action) => {
      const message = action.payload;
      const existingIndex = state.tribeMessages.findIndex(m => m._id === message._id);
      
      if (existingIndex === -1) {
        state.tribeMessages.push(message);
      }
    },
    
    updateTribeMessageReaction: (state, action) => {
      const { messageId, emoji, userId, action: reactionAction, reactionCounts } = action.payload;
      const message = state.tribeMessages.find(m => m._id === messageId);
      
      if (message) {
        if (reactionAction === 'add') {
          const existingReaction = message.reactions.find(r => r.userId === userId && r.emoji === emoji);
          if (!existingReaction) {
            message.reactions.push({ emoji, userId, createdAt: new Date() });
          }
        } else if (reactionAction === 'remove') {
          message.reactions = message.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
        }
        message.reactionCounts = reactionCounts;
      }
    },
    
    // Direct messages reducers
    setCurrentDmUser: (state, action) => {
      state.currentDmUserId = action.payload;
      state.directMessages = [];
      state.directNextCursor = null;
    },
    
    addDirectMessage: (state, action) => {
      const message = action.payload;
      const existingIndex = state.directMessages.findIndex(m => m._id === message._id);
      
      if (existingIndex === -1) {
        state.directMessages.push(message);
      }
    },
    
    markDirectMessagesAsRead: (state, action) => {
      const conversationId = action.payload;
      state.directMessages.forEach(message => {
        if (message.conversationId === conversationId) {
          message.isRead = true;
          message.readAt = new Date();
        }
      });
    },
    
    // Conversations reducers
    addConversation: (state, action) => {
      const conversation = action.payload;
      const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
      
      if (existingIndex === -1) {
        state.conversations.unshift(conversation);
      } else {
        state.conversations[existingIndex] = conversation;
        // Sort by lastMessageAt
        state.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      }
    },
    
    updateConversationUnreadCount: (state, action) => {
      const { conversationId, unreadCount } = action.payload;
      const conversation = state.conversations.find(c => c._id === conversationId);
      
      if (conversation) {
        conversation.unreadCount = unreadCount;
      }
    },
    
    // Typing indicators
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    
    addTypingUser: (state, action) => {
      const { userId, username, type } = action.payload;
      
      if (type === 'start') {
        if (!state.typingUsers.find(u => u.userId === userId)) {
          state.typingUsers.push({ userId, username });
        }
      } else if (type === 'stop') {
        state.typingUsers = state.typingUsers.filter(u => u.userId !== userId);
      }
    },
    
    // Socket connection state
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    
    // General reducers
    clearError: (state) => {
      state.error = null;
      state.tribeMessagesError = null;
      state.directMessagesError = null;
      state.conversationsError = null;
    },
    
    resetChatState: (state) => {
      state.tribeMessages = [];
      state.directMessages = [];
      state.conversations = [];
      state.currentTribeId = null;
      state.currentDmUserId = null;
      state.currentConversationId = null;
      state.isTyping = false;
      state.typingUsers = [];
      state.onlineUsers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send tribe message
      .addCase(sendTribeMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendTribeMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addTribeMessage(action.payload.message);
      })
      .addCase(sendTribeMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Get tribe messages
      .addCase(getTribeMessages.pending, (state) => {
        state.tribeMessagesLoading = true;
      })
      .addCase(getTribeMessages.fulfilled, (state, action) => {
        state.tribeMessagesLoading = false;
        const { messages, hasMore, nextCursor } = action.payload;
        
        if (state.tribeNextCursor === null) {
          // First load
          state.tribeMessages = messages;
        } else {
          // Pagination - prepend older messages
          state.tribeMessages = [...messages, ...state.tribeMessages];
        }
        
        state.tribeHasMoreMessages = hasMore;
        state.tribeNextCursor = nextCursor;
      })
      .addCase(getTribeMessages.rejected, (state, action) => {
        state.tribeMessagesLoading = false;
        state.tribeMessagesError = action.payload;
      })
      
      // Send direct message
      .addCase(sendDirectMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendDirectMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addDirectMessage(action.payload.message);
      })
      .addCase(sendDirectMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Get direct messages
      .addCase(getDirectMessages.pending, (state) => {
        state.directMessagesLoading = true;
      })
      .addCase(getDirectMessages.fulfilled, (state, action) => {
        state.directMessagesLoading = false;
        const { messages, hasMore, nextCursor } = action.payload;
        
        if (state.directNextCursor === null) {
          // First load
          state.directMessages = messages;
        } else {
          // Pagination - prepend older messages
          state.directMessages = [...messages, ...state.directMessages];
        }
        
        state.directHasMoreMessages = hasMore;
        state.directNextCursor = nextCursor;
      })
      .addCase(getDirectMessages.rejected, (state, action) => {
        state.directMessagesLoading = false;
        state.directMessagesError = action.payload;
      })
      
      // Toggle reaction
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const { message } = action.payload;
        const existingMessage = state.tribeMessages.find(m => m._id === message._id);
        
        if (existingMessage) {
          existingMessage.reactions = message.reactions;
          existingMessage.reactionCounts = message.reactionCounts;
        }
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversation } = action.payload;
        state.markDirectMessagesAsRead(conversation._id);
      })
      
      // Get conversations
      .addCase(getConversations.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        const { conversations, hasMore, nextCursor } = action.payload;
        
        if (state.conversationsNextCursor === null) {
          // First load
          state.conversations = conversations;
        } else {
          // Pagination - append newer conversations
          state.conversations = [...state.conversations, ...conversations];
        }
        
        state.conversationsHasMore = hasMore;
        state.conversationsNextCursor = nextCursor;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload;
      });
  },
});

export const {
  setCurrentTribe,
  addTribeMessage,
  updateTribeMessageReaction,
  setCurrentDmUser,
  addDirectMessage,
  markDirectMessagesAsRead,
  addConversation,
  updateConversationUnreadCount,
  setTyping,
  addTypingUser,
  setSocketConnected,
  addOnlineUser,
  removeOnlineUser,
  clearError,
  resetChatState,
} = chatSlice.actions;

// Selectors
export const selectTribeMessages = (state) => state.chat.tribeMessages;
export const selectTribeMessagesLoading = (state) => state.chat.tribeMessagesLoading;
export const selectTribeMessagesError = (state) => state.chat.tribeMessagesError;
export const selectTribeHasMoreMessages = (state) => state.chat.tribeHasMoreMessages;
export const selectTribeNextCursor = (state) => state.chat.tribeNextCursor;

export const selectDirectMessages = (state) => state.chat.directMessages;
export const selectDirectMessagesLoading = (state) => state.chat.directMessagesLoading;
export const selectDirectMessagesError = (state) => state.chat.directMessagesError;
export const selectDirectHasMoreMessages = (state) => state.chat.directHasMoreMessages;
export const selectDirectNextCursor = (state) => state.chat.directNextCursor;

export const selectConversations = (state) => state.chat.conversations;
export const selectConversationsLoading = (state) => state.chat.conversationsLoading;
export const selectConversationsError = (state) => state.chat.conversationsError;
export const selectConversationsHasMore = (state) => state.chat.conversationsHasMore;
export const selectConversationsNextCursor = (state) => state.chat.conversationsNextCursor;

export const selectCurrentTribeId = (state) => state.chat.currentTribeId;
export const selectCurrentDmUserId = (state) => state.chat.currentDmUserId;
export const selectCurrentConversationId = (state) => state.chat.currentConversationId;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectIsSocketConnected = (state) => state.chat.isConnected;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;

export default chatSlice.reducer;
