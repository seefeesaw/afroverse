import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTribeLeaderboard,
  fetchUserLeaderboard,
  fetchCountryLeaderboard,
  fetchMyRank,
  fetchWeeklyChampions,
  fetchRecentChampions,
  searchLeaderboard,
  shareRank,
  setActiveTab,
  setActivePeriod,
  setSelectedCountry,
  clearSearchResults,
  updateRankRealtime,
  enableRealTimeUpdates,
  disableRealTimeUpdates
} from '../store/slices/leaderboardSlice';

export const useLeaderboard = () => {
  const dispatch = useDispatch();
  const leaderboardState = useSelector(state => state.leaderboard);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize leaderboard data
  const initialize = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchTribeLeaderboard({ period: 'weekly' })),
        dispatch(fetchUserLeaderboard({ period: 'weekly' })),
        dispatch(fetchWeeklyChampions()),
        dispatch(fetchRecentChampions())
      ]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize leaderboard:', error);
    }
  }, [dispatch]);

  // Load more data for pagination
  const loadMore = useCallback(async (scope, period) => {
    const state = leaderboardState[`${scope}Leaderboard`][period];
    if (state.loading || !state.nextCursor) return;

    try {
      if (scope === 'tribe') {
        await dispatch(fetchTribeLeaderboard({ period, cursor: state.nextCursor }));
      } else if (scope === 'user') {
        await dispatch(fetchUserLeaderboard({ period, cursor: state.nextCursor }));
      } else if (scope === 'country') {
        await dispatch(fetchCountryLeaderboard({ 
          countryCode: leaderboardState.selectedCountry, 
          period, 
          cursor: state.nextCursor 
        }));
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    }
  }, [dispatch, leaderboardState]);

  // Refresh current data
  const refresh = useCallback(async (scope, period) => {
    try {
      if (scope === 'tribe') {
        await dispatch(fetchTribeLeaderboard({ period }));
      } else if (scope === 'user') {
        await dispatch(fetchUserLeaderboard({ period }));
      } else if (scope === 'country') {
        await dispatch(fetchCountryLeaderboard({ 
          countryCode: leaderboardState.selectedCountry, 
          period 
        }));
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [dispatch, leaderboardState.selectedCountry]);

  // Search functionality
  const search = useCallback(async (query, scope = 'users', period = 'weekly') => {
    if (!query.trim()) {
      dispatch(clearSearchResults());
      return;
    }

    try {
      await dispatch(searchLeaderboard({ 
        query, 
        scope, 
        period, 
        country: leaderboardState.selectedCountry 
      }));
    } catch (error) {
      console.error('Failed to search:', error);
    }
  }, [dispatch, leaderboardState.selectedCountry]);

  // Share rank functionality
  const shareUserRank = useCallback(async (scope, period, rank, points, name, tribe = null) => {
    try {
      const result = await dispatch(shareRank({ scope, period, rank, points, name, tribe }));
      return result.payload;
    } catch (error) {
      console.error('Failed to share rank:', error);
      throw error;
    }
  }, [dispatch]);

  // Get current leaderboard data
  const getCurrentData = useCallback(() => {
    const { activeTab, activePeriod } = leaderboardState;
    
    if (activeTab === 'tribes') {
      return leaderboardState.tribeLeaderboard[activePeriod];
    } else if (activeTab === 'users') {
      return leaderboardState.userLeaderboard[activePeriod];
    } else if (activeTab === 'country') {
      return leaderboardState.countryLeaderboard[activePeriod];
    }
    
    return { items: [], nextCursor: null, loading: false, error: null };
  }, [leaderboardState]);

  // Get my rank data
  const getMyRankData = useCallback((scope, period) => {
    return leaderboardState.myRank[scope]?.[period] || null;
  }, [leaderboardState.myRank]);

  // Check if user is in current leaderboard
  const isUserInLeaderboard = useCallback((userId) => {
    const currentData = getCurrentData();
    return currentData.items.some(item => item.userId === userId);
  }, [getCurrentData]);

  // Get user's position in current leaderboard
  const getUserPosition = useCallback((userId) => {
    const currentData = getCurrentData();
    const index = currentData.items.findIndex(item => item.userId === userId);
    return index >= 0 ? index + 1 : null;
  }, [getCurrentData]);

  // Format points for display
  const formatPoints = useCallback((points) => {
    return points.toLocaleString();
  }, []);

  // Get rank medal
  const getRankMedal = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }, []);

  // Get motivational message
  const getMotivationalMessage = useCallback((rank, scope) => {
    if (rank === 1) {
      return scope === 'tribes' ? '🏆 Your tribe is #1! Keep the crown!' : '👑 You\'re the champion! Stay on top!';
    }
    
    if (rank <= 3) {
      return scope === 'tribes' ? '🔥 Your tribe is in the top 3! Push for #1!' : '⭐ You\'re in the top 3! Go for gold!';
    }
    
    if (rank <= 10) {
      return scope === 'tribes' ? '💪 Your tribe is in the top 10! Keep climbing!' : '🚀 You\'re in the top 10! Keep pushing!';
    }
    
    if (rank <= 50) {
      return scope === 'tribes' ? '📈 Your tribe is climbing! Keep the momentum!' : '📊 You\'re making progress! Keep going!';
    }
    
    return scope === 'tribes' ? '🌟 Your tribe needs you! Start climbing!' : '🎯 Time to climb the leaderboard!';
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return {
    // State
    ...leaderboardState,
    isInitialized,
    
    // Actions
    initialize,
    loadMore,
    refresh,
    search,
    shareUserRank,
    
    // Getters
    getCurrentData,
    getMyRankData,
    isUserInLeaderboard,
    getUserPosition,
    formatPoints,
    getRankMedal,
    getMotivationalMessage,
    
    // UI actions
    setActiveTab: (tab) => dispatch(setActiveTab(tab)),
    setActivePeriod: (period) => dispatch(setActivePeriod(period)),
    setSelectedCountry: (country) => dispatch(setSelectedCountry(country)),
    clearSearchResults: () => dispatch(clearSearchResults()),
    
    // Real-time updates
    enableRealTimeUpdates: () => dispatch(enableRealTimeUpdates()),
    disableRealTimeUpdates: () => dispatch(disableRealTimeUpdates()),
    updateRankRealtime: (data) => dispatch(updateRankRealtime(data))
  };
};

export default useLeaderboard;
