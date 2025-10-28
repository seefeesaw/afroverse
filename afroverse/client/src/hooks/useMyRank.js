import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRank } from '../store/slices/leaderboardSlice';
import { useAuth } from './useAuth';

export const useMyRank = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const leaderboardState = useSelector(state => state.leaderboard);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch my rank for specific scope and period
  const fetchRank = useCallback(async (scope = 'users', period = 'weekly', country = null) => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(fetchMyRank({ scope, period, country }));
      return result.payload;
    } catch (err) {
      setError(err.message || 'Failed to fetch rank');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  // Get my rank data
  const getMyRank = useCallback((scope, period) => {
    return leaderboardState.myRank[scope]?.[period] || null;
  }, [leaderboardState.myRank]);

  // Get my tribe rank
  const getMyTribeRank = useCallback((period = 'weekly') => {
    return getMyRank('tribes', period);
  }, [getMyRank]);

  // Get my user rank
  const getMyUserRank = useCallback((period = 'weekly', country = null) => {
    return getMyRank('users', period);
  }, [getMyRank]);

  // Check if I have a rank
  const hasRank = useCallback((scope, period) => {
    const rank = getMyRank(scope, period);
    return rank && rank.rank !== null;
  }, [getMyRank]);

  // Get rank change indicator
  const getRankChange = useCallback((scope, period) => {
    const rank = getMyRank(scope, period);
    if (!rank || !rank.delta) return null;
    
    const change = rank.delta;
    if (change > 0) return { direction: 'up', change };
    if (change < 0) return { direction: 'down', change: Math.abs(change) };
    return { direction: 'same', change: 0 };
  }, [getMyRank]);

  // Get rank percentage
  const getRankPercentage = useCallback((scope, period) => {
    const rank = getMyRank(scope, period);
    if (!rank || !rank.total) return null;
    
    // This would need total participants count from the API
    // For now, return a placeholder
    return null;
  }, [getMyRank]);

  // Get rank tier
  const getRankTier = useCallback((scope, period) => {
    const rank = getMyRank(scope, period);
    if (!rank || !rank.rank) return null;
    
    const rankValue = rank.rank;
    
    if (rankValue === 1) return 'champion';
    if (rankValue <= 3) return 'elite';
    if (rankValue <= 10) return 'gold';
    if (rankValue <= 50) return 'silver';
    if (rankValue <= 100) return 'bronze';
    return 'iron';
  }, [getMyRank]);

  // Get rank tier color
  const getRankTierColor = useCallback((scope, period) => {
    const tier = getRankTier(scope, period);
    
    const colors = {
      champion: '#FFD700',
      elite: '#C0C0C0',
      gold: '#FFA500',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      iron: '#708090'
    };
    
    return colors[tier] || '#708090';
  }, [getRankTier]);

  // Get rank tier emoji
  const getRankTierEmoji = useCallback((scope, period) => {
    const tier = getRankTier(scope, period);
    
    const emojis = {
      champion: '👑',
      elite: '🏆',
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉',
      iron: '⚡'
    };
    
    return emojis[tier] || '⚡';
  }, [getRankTier]);

  // Get motivational message
  const getMotivationalMessage = useCallback((scope, period) => {
    const rank = getMyRank(scope, period);
    if (!rank || !rank.rank) return null;
    
    const rankValue = rank.rank;
    
    if (rankValue === 1) {
      return scope === 'tribes' ? '🏆 Your tribe is #1! Keep the crown!' : '👑 You\'re the champion! Stay on top!';
    }
    
    if (rankValue <= 3) {
      return scope === 'tribes' ? '🔥 Your tribe is in the top 3! Push for #1!' : '⭐ You\'re in the top 3! Go for gold!';
    }
    
    if (rankValue <= 10) {
      return scope === 'tribes' ? '💪 Your tribe is in the top 10! Keep climbing!' : '🚀 You\'re in the top 10! Keep pushing!';
    }
    
    if (rankValue <= 50) {
      return scope === 'tribes' ? '📈 Your tribe is climbing! Keep the momentum!' : '📊 You\'re making progress! Keep going!';
    }
    
    return scope === 'tribes' ? '🌟 Your tribe needs you! Start climbing!' : '🎯 Time to climb the leaderboard!';
  }, [getMyRank]);

  // Refresh all ranks
  const refreshAllRanks = useCallback(async (country = null) => {
    if (!user) return;

    try {
      await Promise.all([
        fetchRank('users', 'weekly', country),
        fetchRank('users', 'all', country),
        fetchRank('tribes', 'weekly'),
        fetchRank('tribes', 'all')
      ]);
    } catch (error) {
      console.error('Failed to refresh ranks:', error);
    }
  }, [fetchRank, user]);

  // Auto-refresh ranks when user changes
  useEffect(() => {
    if (user) {
      refreshAllRanks();
    }
  }, [user, refreshAllRanks]);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    fetchRank,
    refreshAllRanks,
    
    // Getters
    getMyRank,
    getMyTribeRank,
    getMyUserRank,
    hasRank,
    getRankChange,
    getRankPercentage,
    getRankTier,
    getRankTierColor,
    getRankTierEmoji,
    getMotivationalMessage
  };
};

export default useMyRank;
