import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import referralService from '../../services/referralService';

const initialState = {
  referralCode: null,
  referralProgress: null,
  statistics: null,
  leaderboard: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async Thunks
export const getReferralCode = createAsyncThunk(
  'referral/getReferralCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralService.getReferralCode();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const redeemReferralCode = createAsyncThunk(
  'referral/redeemReferralCode',
  async (inviterCode, { rejectWithValue }) => {
    try {
      const response = await referralService.redeemReferralCode(inviterCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferralProgress = createAsyncThunk(
  'referral/getReferralProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralService.getReferralProgress();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferralRewards = createAsyncThunk(
  'referral/getReferralRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralService.getReferralRewards();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const claimReferralReward = createAsyncThunk(
  'referral/claimReferralReward',
  async (rewardType, { rejectWithValue }) => {
    try {
      const response = await referralService.claimReferralReward(rewardType);
      return { rewardType, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const shareReferralLink = createAsyncThunk(
  'referral/shareReferralLink',
  async ({ platform, message }, { rejectWithValue }) => {
    try {
      const response = await referralService.shareReferralLink(platform, message);
      return { platform, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const inviteViaWhatsApp = createAsyncThunk(
  'referral/inviteViaWhatsApp',
  async ({ phoneNumber, message }, { rejectWithValue }) => {
    try {
      const response = await referralService.inviteViaWhatsApp(phoneNumber, message);
      return { phoneNumber, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const validateReferralCode = createAsyncThunk(
  'referral/validateReferralCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await referralService.validateReferralCode(code);
      return { code, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferralStatistics = createAsyncThunk(
  'referral/getReferralStatistics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await referralService.getReferralStatistics(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReferralLeaderboard = createAsyncThunk(
  'referral/getReferralLeaderboard',
  async (options, { rejectWithValue }) => {
    try {
      const response = await referralService.getReferralLeaderboard(options);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
    updateReferralProgress: (state, action) => {
      const { totalInvites, completedInvites, rewardsClaimed } = action.payload;
      if (state.referralProgress) {
        state.referralProgress.user.totalInvites = totalInvites;
        state.referralProgress.user.completedInvites = completedInvites;
        state.referralProgress.user.rewardsClaimed = rewardsClaimed;
      }
    },
    referralCompleted: (state, action) => {
      const { rewards } = action.payload;
      if (state.referralProgress) {
        state.referralProgress.user.completedInvites += 1;
        // Update reward progress based on new completion
        state.referralProgress.rewardProgress.forEach(reward => {
          reward.current = state.referralProgress.user.completedInvites;
          reward.progress = Math.min(100, (reward.current / reward.threshold) * 100);
          reward.unlocked = reward.current >= reward.threshold;
        });
      }
    },
    rewardClaimed: (state, action) => {
      const { rewardType } = action.payload;
      if (state.referralProgress) {
        if (!state.referralProgress.user.rewardsClaimed.includes(rewardType)) {
          state.referralProgress.user.rewardsClaimed.push(rewardType);
        }
        // Mark reward as claimed in progress
        const reward = state.referralProgress.rewardProgress.find(r => r.type === rewardType);
        if (reward) {
          reward.claimed = true;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // getReferralCode
      .addCase(getReferralCode.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getReferralCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.referralCode = action.payload;
      })
      .addCase(getReferralCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // redeemReferralCode
      .addCase(redeemReferralCode.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(redeemReferralCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle successful redemption
      })
      .addCase(redeemReferralCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // getReferralProgress
      .addCase(getReferralProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getReferralProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.referralProgress = action.payload;
      })
      .addCase(getReferralProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // getReferralRewards
      .addCase(getReferralRewards.fulfilled, (state, action) => {
        // Update rewards in progress if needed
        if (state.referralProgress) {
          state.referralProgress.rewards = action.payload;
        }
      })
      
      // claimReferralReward
      .addCase(claimReferralReward.fulfilled, (state, action) => {
        const { rewardType } = action.payload;
        if (state.referralProgress) {
          if (!state.referralProgress.user.rewardsClaimed.includes(rewardType)) {
            state.referralProgress.user.rewardsClaimed.push(rewardType);
          }
        }
      })
      
      // shareReferralLink
      .addCase(shareReferralLink.fulfilled, (state, action) => {
        // Track sharing analytics if needed
      })
      
      // inviteViaWhatsApp
      .addCase(inviteViaWhatsApp.fulfilled, (state, action) => {
        // Track invitation analytics if needed
      })
      
      // validateReferralCode
      .addCase(validateReferralCode.fulfilled, (state, action) => {
        // Store validation result if needed
      })
      
      // getReferralStatistics
      .addCase(getReferralStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      
      // getReferralLeaderboard
      .addCase(getReferralLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.leaderboard || [];
      });
  },
});

export const {
  clearError,
  setReferralCode,
  updateReferralProgress,
  referralCompleted,
  rewardClaimed,
} = referralSlice.actions;

export default referralSlice.reducer;