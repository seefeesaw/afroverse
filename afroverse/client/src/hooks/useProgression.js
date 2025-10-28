import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProgression,
  fetchStreakStatus,
  fetchQualifyingActionsStatus,
  useFreeze,
  claimReward,
  handleDailyLogin,
  setShowStreakPanel,
  setShowFreezeModal,
  setShowLevelUpModal,
  setShowRewardModal,
  updateStreakRealtime,
  updateXpRealtime,
  updateRewardRealtime,
  updateQualifyingActionsRealtime,
  enableRealTimeUpdates,
  disableRealTimeUpdates,
  clearNotifications,
  setStreakAtRisk,
  resetProgression
} from '../store/slices/progressionSlice';
import { useAuth } from './useAuth';

export const useProgression = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const progressionState = useSelector(state => state.progression);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize progression data
  const initialize = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchUserProgression()),
        dispatch(fetchStreakStatus()),
        dispatch(fetchQualifyingActionsStatus())
      ]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize progression:', error);
    }
  }, [dispatch]);

  // Refresh progression data
  const refresh = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchUserProgression()),
        dispatch(fetchStreakStatus()),
        dispatch(fetchQualifyingActionsStatus())
      ]);
    } catch (error) {
      console.error('Failed to refresh progression:', error);
    }
  }, [dispatch]);

  // Use freeze
  const useFreezeAction = useCallback(async (confirm = true) => {
    try {
      const result = await dispatch(useFreeze(confirm));
      return result.payload;
    } catch (error) {
      console.error('Failed to use freeze:', error);
      throw error;
    }
  }, [dispatch]);

  // Claim reward
  const claimRewardAction = useCallback(async (rewardId) => {
    try {
      const result = await dispatch(claimReward(rewardId));
      return result.payload;
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw error;
    }
  }, [dispatch]);

  // Handle daily login
  const handleDailyLoginAction = useCallback(async () => {
    try {
      const result = await dispatch(handleDailyLogin());
      return result.payload;
    } catch (error) {
      console.error('Failed to handle daily login:', error);
      throw error;
    }
  }, [dispatch]);

  // Get streak status
  const getStreakStatus = useCallback(() => {
    return progressionState.progression.streak;
  }, [progressionState.progression.streak]);

  // Get XP status
  const getXpStatus = useCallback(() => {
    return progressionState.progression.xp;
  }, [progressionState.progression.xp]);

  // Get qualifying actions status
  const getQualifyingActionsStatus = useCallback(() => {
    return progressionState.qualifyingActions;
  }, [progressionState.qualifyingActions]);

  // Get milestones
  const getMilestones = useCallback(() => {
    return progressionState.progression.milestones;
  }, [progressionState.progression.milestones]);

  // Check if streak is at risk
  const isStreakAtRisk = useCallback(() => {
    const streak = getStreakStatus();
    return !streak.safeToday && streak.timeToMidnightSec > 0;
  }, [getStreakStatus]);

  // Get time until midnight
  const getTimeUntilMidnight = useCallback(() => {
    const streak = getStreakStatus();
    return streak.timeToMidnightSec;
  }, [getStreakStatus]);

  // Get streak emoji
  const getStreakEmoji = useCallback(() => {
    const streak = getStreakStatus();
    const current = streak.current;
    
    if (current >= 365) return '🏆';
    if (current >= 100) return '💎';
    if (current >= 30) return '🥇';
    if (current >= 7) return '🥈';
    if (current >= 3) return '🥉';
    return '🔥';
  }, [getStreakStatus]);

  // Get level emoji
  const getLevelEmoji = useCallback(() => {
    const xp = getXpStatus();
    const level = xp.level;
    
    if (level >= 50) return '👑';
    if (level >= 25) return '🏆';
    if (level >= 10) return '⭐';
    if (level >= 5) return '🌟';
    return '⭐';
  }, [getXpStatus]);

  // Get level progress percentage
  const getLevelProgressPercentage = useCallback(() => {
    const xp = getXpStatus();
    const currentXp = xp.value;
    const nextLevelXp = xp.nextLevelXp;
    
    if (!nextLevelXp || nextLevelXp <= 0) return 0;
    
    // Simple calculation for MVP
    const previousLevelXp = Math.floor(currentXp * 0.8); // Approximate
    const progressXp = currentXp - previousLevelXp;
    const requiredXp = nextLevelXp - previousLevelXp;
    
    return Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));
  }, [getXpStatus]);

  // Get motivational message
  const getMotivationalMessage = useCallback(() => {
    const streak = getStreakStatus();
    const current = streak.current;
    
    if (current >= 365) {
      return 'You\'re a legend! Keep the mythic streak alive!';
    } else if (current >= 100) {
      return 'Diamond status! You\'re unstoppable!';
    } else if (current >= 30) {
      return 'Gold streak! You\'re on fire!';
    } else if (current >= 7) {
      return 'Silver streak! Keep the momentum!';
    } else if (current >= 3) {
      return 'Bronze streak! You\'re getting started!';
    } else if (current > 0) {
      return 'Keep it up! Every day counts!';
    } else {
      return 'Start your streak today!';
    }
  }, [getStreakStatus]);

  // Get at-risk message
  const getAtRiskMessage = useCallback(() => {
    const streak = getStreakStatus();
    const timeToMidnight = getTimeUntilMidnight();
    
    const hours = Math.floor(timeToMidnight / 3600);
    const minutes = Math.floor((timeToMidnight % 3600) / 60);
    const timeLeft = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const current = streak.current;
    
    if (current >= 30) {
      return `Don't lose your ${current} day gold streak! ${timeLeft} left`;
    } else if (current >= 7) {
      return `Don't lose your ${current} day silver streak! ${timeLeft} left`;
    } else if (current >= 3) {
      return `Don't lose your ${current} day bronze streak! ${timeLeft} left`;
    } else {
      return `Don't lose your ${current} day streak! ${timeLeft} left`;
    }
  }, [getStreakStatus, getTimeUntilMidnight]);

  // Get quick action suggestions
  const getQuickActionSuggestions = useCallback(() => {
    const qualifyingActions = getQualifyingActionsStatus();
    const suggestions = [];
    
    if (!qualifyingActions.transform) {
      suggestions.push({
        action: 'transform',
        title: 'Create a Transformation',
        description: 'Upload a selfie and transform it',
        icon: '🎨',
        priority: 1
      });
    }
    
    if (!qualifyingActions.voteBundle && qualifyingActions.votesNeeded > 0) {
      suggestions.push({
        action: 'vote',
        title: `Vote ${qualifyingActions.votesNeeded} More Times`,
        description: 'Vote on battles to complete your daily goal',
        icon: '🗳️',
        priority: 2
      });
    }
    
    if (!qualifyingActions.battleAction) {
      suggestions.push({
        action: 'battle',
        title: 'Start or Accept a Battle',
        description: 'Challenge someone or accept a challenge',
        icon: '⚔️',
        priority: 3
      });
    }
    
    return suggestions.sort((a, b) => a.priority - b.priority);
  }, [getQualifyingActionsStatus]);

  // Check for streak at risk
  useEffect(() => {
    if (isInitialized && isStreakAtRisk()) {
      dispatch(setStreakAtRisk(true));
    } else {
      dispatch(setStreakAtRisk(false));
    }
  }, [isInitialized, isStreakAtRisk, dispatch]);

  // Initialize on mount
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    }
  }, [user, initialize, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(disableRealTimeUpdates());
    };
  }, [dispatch]);

  return {
    // State
    ...progressionState,
    isInitialized,
    
    // Actions
    initialize,
    refresh,
    useFreezeAction,
    claimRewardAction,
    handleDailyLoginAction,
    
    // Getters
    getStreakStatus,
    getXpStatus,
    getQualifyingActionsStatus,
    getMilestones,
    isStreakAtRisk,
    getTimeUntilMidnight,
    getStreakEmoji,
    getLevelEmoji,
    getLevelProgressPercentage,
    getMotivationalMessage,
    getAtRiskMessage,
    getQuickActionSuggestions,
    
    // UI actions
    setShowStreakPanel: (show) => dispatch(setShowStreakPanel(show)),
    setShowFreezeModal: (show) => dispatch(setShowFreezeModal(show)),
    setShowLevelUpModal: (show) => dispatch(setShowLevelUpModal(show)),
    setShowRewardModal: (show) => dispatch(setShowRewardModal(show)),
    clearNotifications: () => dispatch(clearNotifications()),
    
    // Real-time updates
    enableRealTimeUpdates: () => dispatch(enableRealTimeUpdates()),
    disableRealTimeUpdates: () => dispatch(disableRealTimeUpdates()),
    updateStreakRealtime: (data) => dispatch(updateStreakRealtime(data)),
    updateXpRealtime: (data) => dispatch(updateXpRealtime(data)),
    updateRewardRealtime: (data) => dispatch(updateRewardRealtime(data)),
    updateQualifyingActionsRealtime: (data) => dispatch(updateQualifyingActionsRealtime(data)),
    
    // Reset
    resetProgression: () => dispatch(resetProgression())
  };
};

export default useProgression;
