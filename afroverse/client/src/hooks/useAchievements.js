import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectUserAchievements,
  selectUserStats,
  selectUserAchievementsLoading,
  selectUserAchievementsError,
  selectLeaderboard,
  selectLeaderboardLoading,
  selectLeaderboardError,
  selectStats,
  selectStatsLoading,
  selectStatsError,
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  selectRarities,
  selectRaritiesLoading,
  selectRaritiesError,
  selectCurrentAchievement,
  selectCurrentAchievementLoading,
  selectCurrentAchievementError,
  selectRecentlyUnlocked,
  selectAchievementStatus,
  selectAchievementError,
  addRecentlyUnlocked,
  clearRecentlyUnlocked,
  updateAchievementProgress,
  markAchievementUnlocked,
  markRewardClaimed,
  updateUserStats,
  clearError,
  resetAchievementState,
  getUserAchievements,
  claimReward,
  getLeaderboard,
  getStats,
  getAchievement,
  getCategories,
  getRarities,
} from '../store/slices/achievementSlice';

export const useAchievements = () => {
  const dispatch = useDispatch();

  // Selectors
  const userAchievements = useSelector(selectUserAchievements);
  const userStats = useSelector(selectUserStats);
  const userAchievementsLoading = useSelector(selectUserAchievementsLoading);
  const userAchievementsError = useSelector(selectUserAchievementsError);
  const leaderboard = useSelector(selectLeaderboard);
  const leaderboardLoading = useSelector(selectLeaderboardLoading);
  const leaderboardError = useSelector(selectLeaderboardError);
  const stats = useSelector(selectStats);
  const statsLoading = useSelector(selectStatsLoading);
  const statsError = useSelector(selectStatsError);
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const rarities = useSelector(selectRarities);
  const raritiesLoading = useSelector(selectRaritiesLoading);
  const raritiesError = useSelector(selectRaritiesError);
  const currentAchievement = useSelector(selectCurrentAchievement);
  const currentAchievementLoading = useSelector(selectCurrentAchievementLoading);
  const currentAchievementError = useSelector(selectCurrentAchievementError);
  const recentlyUnlocked = useSelector(selectRecentlyUnlocked);
  const status = useSelector(selectAchievementStatus);
  const error = useSelector(selectAchievementError);

  // User achievements actions
  const handleGetUserAchievements = useCallback(async () => {
    try {
      const result = await dispatch(getUserAchievements()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleClaimReward = useCallback(async (achievementId) => {
    try {
      const result = await dispatch(claimReward(achievementId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Leaderboard actions
  const handleGetLeaderboard = useCallback(async (limit = 10) => {
    try {
      const result = await dispatch(getLeaderboard(limit)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Stats actions
  const handleGetStats = useCallback(async () => {
    try {
      const result = await dispatch(getStats()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Achievement actions
  const handleGetAchievement = useCallback(async (achievementId) => {
    try {
      const result = await dispatch(getAchievement(achievementId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Categories and rarities actions
  const handleGetCategories = useCallback(async () => {
    try {
      const result = await dispatch(getCategories()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetRarities = useCallback(async () => {
    try {
      const result = await dispatch(getRarities()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Local state actions
  const handleAddRecentlyUnlocked = useCallback((achievement) => {
    dispatch(addRecentlyUnlocked(achievement));
  }, [dispatch]);

  const handleClearRecentlyUnlocked = useCallback(() => {
    dispatch(clearRecentlyUnlocked());
  }, [dispatch]);

  const handleUpdateAchievementProgress = useCallback((data) => {
    dispatch(updateAchievementProgress(data));
  }, [dispatch]);

  const handleMarkAchievementUnlocked = useCallback((data) => {
    dispatch(markAchievementUnlocked(data));
  }, [dispatch]);

  const handleMarkRewardClaimed = useCallback((data) => {
    dispatch(markRewardClaimed(data));
  }, [dispatch]);

  const handleUpdateUserStats = useCallback((data) => {
    dispatch(updateUserStats(data));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetAchievementState = useCallback(() => {
    dispatch(resetAchievementState());
  }, [dispatch]);

  // Utility functions
  const getAchievementById = useCallback((achievementId) => {
    return userAchievements.find(a => a._id === achievementId);
  }, [userAchievements]);

  const getAchievementsByCategory = useCallback((category) => {
    return userAchievements.filter(a => a.category === category);
  }, [userAchievements]);

  const getAchievementsByRarity = useCallback((rarity) => {
    return userAchievements.filter(a => a.rarity === rarity);
  }, [userAchievements]);

  const getUnlockedAchievements = useCallback(() => {
    return userAchievements.filter(a => a.isUnlocked);
  }, [userAchievements]);

  const getLockedAchievements = useCallback(() => {
    return userAchievements.filter(a => !a.isUnlocked);
  }, [userAchievements]);

  const getAchievementsWithRewards = useCallback(() => {
    return userAchievements.filter(a => a.reward && !a.rewardClaimed);
  }, [userAchievements]);

  const getCompletionPercentage = useCallback(() => {
    if (userAchievements.length === 0) return 0;
    const unlockedCount = userAchievements.filter(a => a.isUnlocked).length;
    return Math.round((unlockedCount / userAchievements.length) * 100);
  }, [userAchievements]);

  const getRarityBreakdown = useCallback(() => {
    const breakdown = {
      common: { unlocked: 0, total: 0 },
      rare: { unlocked: 0, total: 0 },
      epic: { unlocked: 0, total: 0 },
      legendary: { unlocked: 0, total: 0 },
    };

    userAchievements.forEach(achievement => {
      breakdown[achievement.rarity].total++;
      if (achievement.isUnlocked) {
        breakdown[achievement.rarity].unlocked++;
      }
    });

    return breakdown;
  }, [userAchievements]);

  return {
    // State
    userAchievements,
    userStats,
    userAchievementsLoading,
    userAchievementsError,
    leaderboard,
    leaderboardLoading,
    leaderboardError,
    stats,
    statsLoading,
    statsError,
    categories,
    categoriesLoading,
    categoriesError,
    rarities,
    raritiesLoading,
    raritiesError,
    currentAchievement,
    currentAchievementLoading,
    currentAchievementError,
    recentlyUnlocked,
    status,
    error,

    // Actions
    getUserAchievements: handleGetUserAchievements,
    claimReward: handleClaimReward,
    getLeaderboard: handleGetLeaderboard,
    getStats: handleGetStats,
    getAchievement: handleGetAchievement,
    getCategories: handleGetCategories,
    getRarities: handleGetRarities,

    // Local state actions
    addRecentlyUnlocked: handleAddRecentlyUnlocked,
    clearRecentlyUnlocked: handleClearRecentlyUnlocked,
    updateAchievementProgress: handleUpdateAchievementProgress,
    markAchievementUnlocked: handleMarkAchievementUnlocked,
    markRewardClaimed: handleMarkRewardClaimed,
    updateUserStats: handleUpdateUserStats,
    clearError: handleClearError,
    resetAchievementState: handleResetAchievementState,

    // Utility functions
    getAchievementById,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsWithRewards,
    getCompletionPercentage,
    getRarityBreakdown,
  };
};

export default useAchievements;
