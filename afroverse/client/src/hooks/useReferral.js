import { useState, useCallback } from 'react';
import api from '../services/api';
import { useChallenge } from './useChallenge';
import { useEvent } from './useEvent';

const useReferral = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const { updateProgress } = useChallenge();
  const { updateClanWarScore } = useEvent();

  const getReferralCode = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.get('/referral/my-code');
      setStatus('success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get referral code';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, []);

  const generateReferralCode = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.post('/referral/generate');
      setStatus('success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate referral code';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, []);

  const redeemReferralCode = useCallback(async (referralCode, userId, context = {}) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.post('/referral/redeem', {
        referralCode,
        userId,
        ...context,
      });
      setStatus('success');
      
      // Update challenge progress for friend invitation
      try {
        await updateProgress('friend_invited', 1, {
          referralCode,
          timestamp: new Date().toISOString(),
        });
      } catch (challengeError) {
        console.warn('Failed to update challenge progress:', challengeError);
      }
      
      // Update clan war score for friend invitation
      try {
        await updateClanWarScore('friend_invited', 1, {
          referralCode,
          timestamp: new Date().toISOString(),
        });
      } catch (eventError) {
        console.warn('Failed to update clan war score:', eventError);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to redeem referral code';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, [updateProgress, updateClanWarScore]);

  const getReferralStats = useCallback(async () => {
    try {
      const response = await api.get('/referral/stats');
      return response.data.stats;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get referral stats';
      throw new Error(errorMessage);
    }
  }, []);

  const getTopRecruiters = useCallback(async (limit = 10) => {
    try {
      const response = await api.get(`/referral/leaderboard/recruiters?limit=${limit}`);
      return response.data.recruiters;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get top recruiters';
      throw new Error(errorMessage);
    }
  }, []);

  const getTopRecruitingTribes = useCallback(async (limit = 10) => {
    try {
      const response = await api.get(`/referral/leaderboard/tribes?limit=${limit}`);
      return response.data.tribes;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get top recruiting tribes';
      throw new Error(errorMessage);
    }
  }, []);

  const getReferralRewards = useCallback(async () => {
    try {
      const response = await api.get('/referral/rewards');
      return response.data.rewards;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get referral rewards';
      throw new Error(errorMessage);
    }
  }, []);

  const shareReferral = useCallback(async (platform, referralCode) => {
    try {
      const response = await api.post('/referral/share', {
        platform,
        referralCode,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to track referral share';
      throw new Error(errorMessage);
    }
  }, []);

  const claimReferralReward = useCallback(async (rewardType) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.post('/referral/claim-reward', {
        rewardType,
      });
      setStatus('success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to claim reward';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, []);

  const getInviteLinkInfo = useCallback(async (code) => {
    try {
      const response = await api.get(`/referral/invite-link/${code}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get invite link info';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    status,
    error,
    getReferralCode,
    generateReferralCode,
    redeemReferralCode,
    getReferralStats,
    getTopRecruiters,
    getTopRecruitingTribes,
    getReferralRewards,
    shareReferral,
    claimReferralReward,
    getInviteLinkInfo,
  };
};

export default useReferral;
export { useReferral };