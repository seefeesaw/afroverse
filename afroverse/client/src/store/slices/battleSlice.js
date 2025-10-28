import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import battleService from '../../services/battleService';

// Async thunks
export const createBattle = createAsyncThunk(
  'battle/createBattle',
  async ({ transformId, challengeMethod, challengeTarget, message }, { rejectWithValue }) => {
    try {
      const response = await battleService.createBattle(transformId, challengeMethod, challengeTarget, message);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptBattle = createAsyncThunk(
  'battle/acceptBattle',
  async ({ battleId, transformId }, { rejectWithValue }) => {
    try {
      const response = await battleService.acceptBattle(battleId, transformId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBattle = createAsyncThunk(
  'battle/getBattle',
  async (shortCode, { rejectWithValue }) => {
    try {
      const response = await battleService.getBattle(shortCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const voteOnBattle = createAsyncThunk(
  'battle/voteOnBattle',
  async ({ battleId, votedFor }, { rejectWithValue }) => {
    try {
      const response = await battleService.voteOnBattle(battleId, votedFor);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const listActiveBattles = createAsyncThunk(
  'battle/listActiveBattles',
  async ({ cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await battleService.listActiveBattles(cursor, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reportBattle = createAsyncThunk(
  'battle/reportBattle',
  async ({ battleId, reason, details }, { rejectWithValue }) => {
    try {
      const response = await battleService.reportBattle(battleId, reason, details);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Current battle
  currentBattle: null,
  
  // Battle feed
  activeBattles: [],
  feedCursor: null,
  hasMoreBattles: true,
  
  // Battle creation
  isCreatingBattle: false,
  challengeMethod: 'link',
  challengeTarget: '',
  challengeMessage: '',
  
  // Battle acceptance
  isAcceptingBattle: false,
  selectedTransformForAcceptance: null,
  
  // Voting
  isVoting: false,
  hasVoted: false,
  userVote: null,
  
  // UI state
  showBattleCreationModal: false,
  showBattleAcceptanceModal: false,
  showBattleResultModal: false,
  showShareModal: false,
  
  // Loading states
  isLoadingBattle: false,
  isLoadingFeed: false,
  
  // Error handling
  error: null,
  
  // Real-time updates
  battleUpdates: {},
};

// Battle slice
const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    // Battle creation
    setChallengeMethod: (state, action) => {
      state.challengeMethod = action.payload;
    },
    setChallengeTarget: (state, action) => {
      state.challengeTarget = action.payload;
    },
    setChallengeMessage: (state, action) => {
      state.challengeMessage = action.payload;
    },
    setShowBattleCreationModal: (state, action) => {
      state.showBattleCreationModal = action.payload;
    },
    
    // Battle acceptance
    setSelectedTransformForAcceptance: (state, action) => {
      state.selectedTransformForAcceptance = action.payload;
    },
    setShowBattleAcceptanceModal: (state, action) => {
      state.showBattleAcceptanceModal = action.payload;
    },
    
    // Voting
    setHasVoted: (state, action) => {
      state.hasVoted = action.payload;
    },
    setUserVote: (state, action) => {
      state.userVote = action.payload;
    },
    
    // UI state
    setShowBattleResultModal: (state, action) => {
      state.showBattleResultModal = action.payload;
    },
    setShowShareModal: (state, action) => {
      state.showShareModal = action.payload;
    },
    
    // Real-time updates
    updateBattleVotes: (state, action) => {
      const { battleId, votes } = action.payload;
      state.battleUpdates[battleId] = {
        ...state.battleUpdates[battleId],
        votes
      };
      
      // Update current battle if it matches
      if (state.currentBattle && state.currentBattle.battleId === battleId) {
        state.currentBattle.votes = votes;
      }
      
      // Update feed battles
      const battleIndex = state.activeBattles.findIndex(battle => battle.battleId === battleId);
      if (battleIndex !== -1) {
        state.activeBattles[battleIndex].votes = votes;
      }
    },
    
    updateBattleStatus: (state, action) => {
      const { battleId, status, endsAt, defender } = action.payload;
      state.battleUpdates[battleId] = {
        ...state.battleUpdates[battleId],
        status,
        endsAt,
        defender
      };
      
      // Update current battle if it matches
      if (state.currentBattle && state.currentBattle.battleId === battleId) {
        state.currentBattle.status = status;
        state.currentBattle.endsAt = endsAt;
        if (defender) {
          state.currentBattle.defender = defender;
        }
      }
    },
    
    updateBattleCompletion: (state, action) => {
      const { battleId, result } = action.payload;
      state.battleUpdates[battleId] = {
        ...state.battleUpdates[battleId],
        status: 'completed',
        result
      };
      
      // Update current battle if it matches
      if (state.currentBattle && state.currentBattle.battleId === battleId) {
        state.currentBattle.status = 'completed';
        state.currentBattle.result = result;
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Reset state
    resetBattleState: (state) => {
      state.currentBattle = null;
      state.isCreatingBattle = false;
      state.isAcceptingBattle = false;
      state.isVoting = false;
      state.hasVoted = false;
      state.userVote = null;
      state.showBattleCreationModal = false;
      state.showBattleAcceptanceModal = false;
      state.showBattleResultModal = false;
      state.showShareModal = false;
      state.error = null;
    },
    
    // Clear battle updates
    clearBattleUpdates: (state) => {
      state.battleUpdates = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Battle
      .addCase(createBattle.pending, (state) => {
        state.isCreatingBattle = true;
        state.error = null;
      })
      .addCase(createBattle.fulfilled, (state, action) => {
        state.isCreatingBattle = false;
        state.showBattleCreationModal = false;
        // Reset form
        state.challengeMethod = 'link';
        state.challengeTarget = '';
        state.challengeMessage = '';
      })
      .addCase(createBattle.rejected, (state, action) => {
        state.isCreatingBattle = false;
        state.error = action.payload;
      })
      
      // Accept Battle
      .addCase(acceptBattle.pending, (state) => {
        state.isAcceptingBattle = true;
        state.error = null;
      })
      .addCase(acceptBattle.fulfilled, (state, action) => {
        state.isAcceptingBattle = false;
        state.showBattleAcceptanceModal = false;
        state.selectedTransformForAcceptance = null;
      })
      .addCase(acceptBattle.rejected, (state, action) => {
        state.isAcceptingBattle = false;
        state.error = action.payload;
      })
      
      // Get Battle
      .addCase(getBattle.pending, (state) => {
        state.isLoadingBattle = true;
        state.error = null;
      })
      .addCase(getBattle.fulfilled, (state, action) => {
        state.isLoadingBattle = false;
        state.currentBattle = action.payload;
        state.hasVoted = false; // Reset voting state
        state.userVote = null;
      })
      .addCase(getBattle.rejected, (state, action) => {
        state.isLoadingBattle = false;
        state.error = action.payload;
      })
      
      // Vote on Battle
      .addCase(voteOnBattle.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(voteOnBattle.fulfilled, (state, action) => {
        state.isVoting = false;
        state.hasVoted = true;
        state.userVote = action.payload.votedFor;
        
        // Update votes in current battle
        if (state.currentBattle) {
          state.currentBattle.votes = action.payload.votes;
        }
      })
      .addCase(voteOnBattle.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload;
      })
      
      // List Active Battles
      .addCase(listActiveBattles.pending, (state) => {
        state.isLoadingFeed = true;
      })
      .addCase(listActiveBattles.fulfilled, (state, action) => {
        state.isLoadingFeed = false;
        
        if (action.payload.nextCursor) {
          state.activeBattles = [...state.activeBattles, ...action.payload.items];
          state.feedCursor = action.payload.nextCursor;
        } else {
          state.activeBattles = action.payload.items;
          state.feedCursor = null;
          state.hasMoreBattles = false;
        }
      })
      .addCase(listActiveBattles.rejected, (state, action) => {
        state.isLoadingFeed = false;
        state.error = action.payload;
      })
      
      // Report Battle
      .addCase(reportBattle.pending, (state) => {
        // No loading state for reporting
      })
      .addCase(reportBattle.fulfilled, (state) => {
        // Success - could show a toast
      })
      .addCase(reportBattle.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectBattle = (state) => state.battle;
export const selectCurrentBattle = (state) => state.battle.currentBattle;
export const selectActiveBattles = (state) => state.battle.activeBattles;
export const selectIsCreatingBattle = (state) => state.battle.isCreatingBattle;
export const selectIsAcceptingBattle = (state) => state.battle.isAcceptingBattle;
export const selectIsVoting = (state) => state.battle.isVoting;
export const selectHasVoted = (state) => state.battle.hasVoted;
export const selectUserVote = (state) => state.battle.userVote;
export const selectBattleError = (state) => state.battle.error;
export const selectShowBattleCreationModal = (state) => state.battle.showBattleCreationModal;
export const selectShowBattleAcceptanceModal = (state) => state.battle.showBattleAcceptanceModal;
export const selectShowBattleResultModal = (state) => state.battle.showBattleResultModal;
export const selectShowShareModal = (state) => state.battle.showShareModal;
export const selectBattleUpdates = (state) => state.battle.battleUpdates;

// Action creators
export const {
  setChallengeMethod,
  setChallengeTarget,
  setChallengeMessage,
  setShowBattleCreationModal,
  setSelectedTransformForAcceptance,
  setShowBattleAcceptanceModal,
  setHasVoted,
  setUserVote,
  setShowBattleResultModal,
  setShowShareModal,
  updateBattleVotes,
  updateBattleStatus,
  updateBattleCompletion,
  clearError,
  setError,
  resetBattleState,
  clearBattleUpdates,
} = battleSlice.actions;

export default battleSlice.reducer;