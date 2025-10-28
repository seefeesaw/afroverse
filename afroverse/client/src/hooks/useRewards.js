import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUserAchievements,
  getUnclaimedRewards,
  claimReward,
  equipCosmetic,
  getUserInventory,
  getEquippedCosmetics,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getAllAchievements,
  getAchievementByKey,
  getUserAchievementStatistics,
  getRecentAchievements,
  getAchievementProgressSummary,
  getAchievementCategories,
  getRarityInfo,
  setAchievements,
  setRewards,
  setCosmetics,
  setStatistics,
  setCategories,
  setFilters,
  setUI,
  setSelectedAchievement,
  setSelectedCategory,
  setSelectedRarity,
  setSelectedStatus,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  clearErrors,
  resetReward
} from '../store/slices/rewardSlice';
import { useAuth } from './useAuth';
import rewardService from '../services/rewardService';

export const useRewards = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const rewardState = useSelector(state => state.reward);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize rewards system
  const initialize = useCallback(async () => {
    try {
      // Fetch initial data
      await Promise.all([
        dispatch(getUserAchievements()),
        dispatch(getUnclaimedRewards()),
        dispatch(getUserInventory()),
        dispatch(getEquippedCosmetics()),
        dispatch(getAchievementCategories())
      ]);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize rewards system:', error);
    }
  }, [dispatch]);

  // Get user achievements
  const fetchUserAchievements = useCallback(async () => {
    try {
      await dispatch(getUserAchievements());
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }, [dispatch]);

  // Get unclaimed rewards
  const fetchUnclaimedRewards = useCallback(async () => {
    try {
      await dispatch(getUnclaimedRewards());
    } catch (error) {
      console.error('Error fetching unclaimed rewards:', error);
      throw error;
    }
  }, [dispatch]);

  // Claim reward
  const claimUserReward = useCallback(async (rewardId) => {
    try {
      const result = await dispatch(claimReward(rewardId));
      return result.payload;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }, [dispatch]);

  // Equip cosmetic
  const equipUserCosmetic = useCallback(async (slot, key) => {
    try {
      const result = await dispatch(equipCosmetic({ slot, key }));
      return result.payload;
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      throw error;
    }
  }, [dispatch]);

  // Get user inventory
  const fetchUserInventory = useCallback(async () => {
    try {
      await dispatch(getUserInventory());
    } catch (error) {
      console.error('Error fetching user inventory:', error);
      throw error;
    }
  }, [dispatch]);

  // Get equipped cosmetics
  const fetchEquippedCosmetics = useCallback(async () => {
    try {
      await dispatch(getEquippedCosmetics());
    } catch (error) {
      console.error('Error fetching equipped cosmetics:', error);
      throw error;
    }
  }, [dispatch]);

  // Get achievements by category
  const fetchAchievementsByCategory = useCallback(async (category) => {
    try {
      await dispatch(getAchievementsByCategory(category));
    } catch (error) {
      console.error('Error fetching achievements by category:', error);
      throw error;
    }
  }, [dispatch]);

  // Get achievements by rarity
  const fetchAchievementsByRarity = useCallback(async (rarity) => {
    try {
      await dispatch(getAchievementsByRarity(rarity));
    } catch (error) {
      console.error('Error fetching achievements by rarity:', error);
      throw error;
    }
  }, [dispatch]);

  // Get all achievements
  const fetchAllAchievements = useCallback(async () => {
    try {
      await dispatch(getAllAchievements());
    } catch (error) {
      console.error('Error fetching all achievements:', error);
      throw error;
    }
  }, [dispatch]);

  // Get achievement by key
  const fetchAchievementByKey = useCallback(async (key) => {
    try {
      await dispatch(getAchievementByKey(key));
    } catch (error) {
      console.error('Error fetching achievement by key:', error);
      throw error;
    }
  }, [dispatch]);

  // Get user achievement statistics
  const fetchUserAchievementStatistics = useCallback(async () => {
    try {
      await dispatch(getUserAchievementStatistics());
    } catch (error) {
      console.error('Error fetching user achievement statistics:', error);
      throw error;
    }
  }, [dispatch]);

  // Get recent achievements
  const fetchRecentAchievements = useCallback(async (limit = 5) => {
    try {
      await dispatch(getRecentAchievements(limit));
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
      throw error;
    }
  }, [dispatch]);

  // Get achievement progress summary
  const fetchAchievementProgressSummary = useCallback(async () => {
    try {
      await dispatch(getAchievementProgressSummary());
    } catch (error) {
      console.error('Error fetching achievement progress summary:', error);
      throw error;
    }
  }, [dispatch]);

  // Get achievement categories
  const fetchAchievementCategories = useCallback(async () => {
    try {
      await dispatch(getAchievementCategories());
    } catch (error) {
      console.error('Error fetching achievement categories:', error);
      throw error;
    }
  }, [dispatch]);

  // Get rarity info
  const fetchRarityInfo = useCallback(async (rarity) => {
    try {
      await dispatch(getRarityInfo(rarity));
    } catch (error) {
      console.error('Error fetching rarity info:', error);
      throw error;
    }
  }, [dispatch]);

  // Set selected achievement
  const selectAchievement = useCallback((achievement) => {
    dispatch(setSelectedAchievement(achievement));
  }, [dispatch]);

  // Set selected category
  const selectCategory = useCallback((category) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  // Set selected rarity
  const selectRarity = useCallback((rarity) => {
    dispatch(setSelectedRarity(rarity));
  }, [dispatch]);

  // Set selected status
  const selectStatus = useCallback((status) => {
    dispatch(setSelectedStatus(status));
  }, [dispatch]);

  // Set search query
  const setSearch = useCallback((query) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  // Set sort by
  const setSort = useCallback((sortBy) => {
    dispatch(setSortBy(sortBy));
  }, [dispatch]);

  // Set sort order
  const setSortDirection = useCallback((order) => {
    dispatch(setSortOrder(order));
  }, [dispatch]);

  // Clear errors
  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Reset reward state
  const resetRewardState = useCallback(() => {
    dispatch(resetReward());
  }, [dispatch]);

  // Getters
  const getAchievements = useCallback(() => {
    return rewardState.achievements;
  }, [rewardState.achievements]);

  const getRewards = useCallback(() => {
    return rewardState.rewards;
  }, [rewardState.rewards]);

  const getCosmetics = useCallback(() => {
    return rewardState.cosmetics;
  }, [rewardState.cosmetics]);

  const getStatistics = useCallback(() => {
    return rewardState.statistics;
  }, [rewardState.statistics]);

  const getCategories = useCallback(() => {
    return rewardState.categories;
  }, [rewardState.categories]);

  const getFilters = useCallback(() => {
    return rewardState.filters;
  }, [rewardState.filters]);

  const getUI = useCallback(() => {
    return rewardState.ui;
  }, [rewardState.ui]);

  const getLoading = useCallback(() => {
    return rewardState.loading;
  }, [rewardState.loading]);

  const getErrors = useCallback(() => {
    return rewardState.errors;
  }, [rewardState.errors]);

  // Utility methods
  const getRarityColor = useCallback((rarity) => {
    return rewardService.getRarityColor(rarity);
  }, []);

  const getRarityIcon = useCallback((rarity) => {
    return rewardService.getRarityIcon(rarity);
  }, []);

  const getCategoryIcon = useCallback((category) => {
    return rewardService.getCategoryIcon(category);
  }, []);

  const getCategoryName = useCallback((category) => {
    return rewardService.getCategoryName(category);
  }, []);

  const getRewardTypeIcon = useCallback((type) => {
    return rewardService.getRewardTypeIcon(type);
  }, []);

  const getRewardTypeName = useCallback((type) => {
    return rewardService.getRewardTypeName(type);
  }, []);

  const getCosmeticTypeName = useCallback((type) => {
    return rewardService.getCosmeticTypeName(type);
  }, []);

  const getCosmeticSlotName = useCallback((slot) => {
    return rewardService.getCosmeticSlotName(slot);
  }, []);

  const formatProgress = useCallback((progress) => {
    return rewardService.formatProgress(progress);
  }, []);

  const getProgressColor = useCallback((progress) => {
    return rewardService.getProgressColor(progress);
  }, []);

  const getAchievementDisplayInfo = useCallback((achievement) => {
    return rewardService.getAchievementDisplayInfo(achievement);
  }, []);

  const getRewardDisplayInfo = useCallback((reward) => {
    return rewardService.getRewardDisplayInfo(reward);
  }, []);

  const getCosmeticDisplayInfo = useCallback((cosmetic) => {
    return rewardService.getCosmeticDisplayInfo(cosmetic);
  }, []);

  const isAchievementUnlocked = useCallback((achievement, unlockedAchievements) => {
    return rewardService.isAchievementUnlocked(achievement, unlockedAchievements);
  }, []);

  const getAchievementProgress = useCallback((achievement, progress) => {
    return rewardService.getAchievementProgress(achievement, progress);
  }, []);

  const getAchievementStatus = useCallback((achievement, unlockedAchievements, progress) => {
    return rewardService.getAchievementStatus(achievement, unlockedAchievements, progress);
  }, []);

  const getAchievementStatusColor = useCallback((status) => {
    return rewardService.getAchievementStatusColor(status);
  }, []);

  const getAchievementStatusText = useCallback((status) => {
    return rewardService.getAchievementStatusText(status);
  }, []);

  const getAchievementStatusIcon = useCallback((status) => {
    return rewardService.getAchievementStatusIcon(status);
  }, []);

  const getAchievementUnlockDate = useCallback((achievement, unlockedAchievements) => {
    return rewardService.getAchievementUnlockDate(achievement, unlockedAchievements);
  }, []);

  const formatUnlockDate = useCallback((date) => {
    return rewardService.formatUnlockDate(date);
  }, []);

  const getAchievementRequirementsText = useCallback((achievement) => {
    return rewardService.getAchievementRequirementsText(achievement);
  }, []);

  const getAchievementRewardsText = useCallback((achievement) => {
    return rewardService.getAchievementRewardsText(achievement);
  }, []);

  const getAchievementDescription = useCallback((achievement) => {
    return rewardService.getAchievementDescription(achievement);
  }, []);

  const getAchievementName = useCallback((achievement) => {
    return rewardService.getAchievementName(achievement);
  }, []);

  const getAchievementKey = useCallback((achievement) => {
    return rewardService.getAchievementKey(achievement);
  }, []);

  const getAchievementRarity = useCallback((achievement) => {
    return rewardService.getAchievementRarity(achievement);
  }, []);

  const getAchievementCategory = useCallback((achievement) => {
    return rewardService.getAchievementCategory(achievement);
  }, []);

  const getAchievementIcon = useCallback((achievement) => {
    return rewardService.getAchievementIcon(achievement);
  }, []);

  const getAchievementBadge = useCallback((achievement) => {
    return rewardService.getAchievementBadge(achievement);
  }, []);

  const getAchievementRewards = useCallback((achievement) => {
    return rewardService.getAchievementRewards(achievement);
  }, []);

  const getAchievementRequirements = useCallback((achievement) => {
    return rewardService.getAchievementRequirements(achievement);
  }, []);

  const getAchievementSortOrder = useCallback((achievement) => {
    return rewardService.getAchievementSortOrder(achievement);
  }, []);

  const sortAchievements = useCallback((achievements, sortBy) => {
    return rewardService.sortAchievements(achievements, sortBy);
  }, []);

  const filterAchievements = useCallback((achievements, filters) => {
    return rewardService.filterAchievements(achievements, filters);
  }, []);

  const searchAchievements = useCallback((achievements, query) => {
    return rewardService.searchAchievements(achievements, query);
  }, []);

  const getAchievementCountByCategory = useCallback((achievements) => {
    return rewardService.getAchievementCountByCategory(achievements);
  }, []);

  const getAchievementCountByRarity = useCallback((achievements) => {
    return rewardService.getAchievementCountByRarity(achievements);
  }, []);

  const getAchievementCountByStatus = useCallback((achievements, unlockedAchievements, progress) => {
    return rewardService.getAchievementCountByStatus(achievements, unlockedAchievements, progress);
  }, []);

  const getAchievementCompletionPercentage = useCallback((achievements, unlockedAchievements) => {
    return rewardService.getAchievementCompletionPercentage(achievements, unlockedAchievements);
  }, []);

  const getAchievementProgressSummary = useCallback((achievements, unlockedAchievements, progress) => {
    return rewardService.getAchievementProgressSummary(achievements, unlockedAchievements, progress);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    }
  }, [user, initialize, isInitialized]);

  return {
    // State
    ...rewardState,
    isInitialized,
    
    // Actions
    initialize,
    fetchUserAchievements,
    fetchUnclaimedRewards,
    claimUserReward,
    equipUserCosmetic,
    fetchUserInventory,
    fetchEquippedCosmetics,
    fetchAchievementsByCategory,
    fetchAchievementsByRarity,
    fetchAllAchievements,
    fetchAchievementByKey,
    fetchUserAchievementStatistics,
    fetchRecentAchievements,
    fetchAchievementProgressSummary,
    fetchAchievementCategories,
    fetchRarityInfo,
    selectAchievement,
    selectCategory,
    selectRarity,
    selectStatus,
    setSearch,
    setSort,
    setSortDirection,
    clearAllErrors,
    resetRewardState,
    
    // Getters
    getAchievements,
    getRewards,
    getCosmetics,
    getStatistics,
    getCategories,
    getFilters,
    getUI,
    getLoading,
    getErrors,
    
    // Utilities
    getRarityColor,
    getRarityIcon,
    getCategoryIcon,
    getCategoryName,
    getRewardTypeIcon,
    getRewardTypeName,
    getCosmeticTypeName,
    getCosmeticSlotName,
    formatProgress,
    getProgressColor,
    getAchievementDisplayInfo,
    getRewardDisplayInfo,
    getCosmeticDisplayInfo,
    isAchievementUnlocked,
    getAchievementProgress,
    getAchievementStatus,
    getAchievementStatusColor,
    getAchievementStatusText,
    getAchievementStatusIcon,
    getAchievementUnlockDate,
    formatUnlockDate,
    getAchievementRequirementsText,
    getAchievementRewardsText,
    getAchievementDescription,
    getAchievementName,
    getAchievementKey,
    getAchievementRarity,
    getAchievementCategory,
    getAchievementIcon,
    getAchievementBadge,
    getAchievementRewards,
    getAchievementRequirements,
    getAchievementSortOrder,
    sortAchievements,
    filterAchievements,
    searchAchievements,
    getAchievementCountByCategory,
    getAchievementCountByRarity,
    getAchievementCountByStatus,
    getAchievementCompletionPercentage,
    getAchievementProgressSummary
  };
};

export default useRewards;
