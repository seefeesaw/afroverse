import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectCurrentProfile,
  selectProfileLoading,
  selectProfileError,
  selectProfileFeed,
  selectFeedLoading,
  selectFeedError,
  selectFeedHasMore,
  selectFeedNextCursor,
  selectFollowers,
  selectFollowersLoading,
  selectFollowersError,
  selectFollowersHasMore,
  selectFollowersNextCursor,
  selectFollowing,
  selectFollowingLoading,
  selectFollowingError,
  selectFollowingHasMore,
  selectFollowingNextCursor,
  selectTopCreators,
  selectTopCreatorsLoading,
  selectTopCreatorsError,
  selectTopCreatorsHasMore,
  selectTopCreatorsNextCursor,
  selectCreatorStats,
  selectStatsLoading,
  selectStatsError,
  selectFollowStatus,
  selectFollowStatusLoading,
  selectFollowStatusError,
  selectCreatorStatus,
  selectCreatorError,
  setCurrentProfile,
  updateProfileFollowStatus,
  addFeedItem,
  addFollower,
  removeFollower,
  addFollowing,
  removeFollowing,
  clearError,
  resetCreatorState,
  getCreatorProfile,
  getCreatorFeed,
  followCreator,
  unfollowCreator,
  getFollowers,
  getFollowing,
  updateCreatorProfile,
  getTopCreators,
  getCreatorStats,
  getFollowStatus,
} from '../store/slices/creatorSlice';

export const useCreator = () => {
  const dispatch = useDispatch();

  // Selectors
  const currentProfile = useSelector(selectCurrentProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const profileError = useSelector(selectProfileError);
  const profileFeed = useSelector(selectProfileFeed);
  const feedLoading = useSelector(selectFeedLoading);
  const feedError = useSelector(selectFeedError);
  const feedHasMore = useSelector(selectFeedHasMore);
  const feedNextCursor = useSelector(selectFeedNextCursor);
  const followers = useSelector(selectFollowers);
  const followersLoading = useSelector(selectFollowersLoading);
  const followersError = useSelector(selectFollowersError);
  const followersHasMore = useSelector(selectFollowersHasMore);
  const followersNextCursor = useSelector(selectFollowersNextCursor);
  const following = useSelector(selectFollowing);
  const followingLoading = useSelector(selectFollowingLoading);
  const followingError = useSelector(selectFollowingError);
  const followingHasMore = useSelector(selectFollowingHasMore);
  const followingNextCursor = useSelector(selectFollowingNextCursor);
  const topCreators = useSelector(selectTopCreators);
  const topCreatorsLoading = useSelector(selectTopCreatorsLoading);
  const topCreatorsError = useSelector(selectTopCreatorsError);
  const topCreatorsHasMore = useSelector(selectTopCreatorsHasMore);
  const topCreatorsNextCursor = useSelector(selectTopCreatorsNextCursor);
  const creatorStats = useSelector(selectCreatorStats);
  const statsLoading = useSelector(selectStatsLoading);
  const statsError = useSelector(selectStatsError);
  const followStatus = useSelector(selectFollowStatus);
  const followStatusLoading = useSelector(selectFollowStatusLoading);
  const followStatusError = useSelector(selectFollowStatusError);
  const status = useSelector(selectCreatorStatus);
  const error = useSelector(selectCreatorError);

  // Profile actions
  const handleGetCreatorProfile = useCallback(async (username) => {
    try {
      const result = await dispatch(getCreatorProfile(username)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetCurrentProfile = useCallback((profile) => {
    dispatch(setCurrentProfile(profile));
  }, [dispatch]);

  const handleUpdateProfileFollowStatus = useCallback((data) => {
    dispatch(updateProfileFollowStatus(data));
  }, [dispatch]);

  // Feed actions
  const handleGetCreatorFeed = useCallback(async (params) => {
    try {
      const result = await dispatch(getCreatorFeed(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleAddFeedItem = useCallback((item) => {
    dispatch(addFeedItem(item));
  }, [dispatch]);

  // Follow actions
  const handleFollowCreator = useCallback(async (userId) => {
    try {
      const result = await dispatch(followCreator(userId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUnfollowCreator = useCallback(async (userId) => {
    try {
      const result = await dispatch(unfollowCreator(userId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetFollowStatus = useCallback(async (username) => {
    try {
      const result = await dispatch(getFollowStatus(username)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Followers/Following actions
  const handleGetFollowers = useCallback(async (params) => {
    try {
      const result = await dispatch(getFollowers(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetFollowing = useCallback(async (params) => {
    try {
      const result = await dispatch(getFollowing(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleAddFollower = useCallback((follower) => {
    dispatch(addFollower(follower));
  }, [dispatch]);

  const handleRemoveFollower = useCallback((followerId) => {
    dispatch(removeFollower(followerId));
  }, [dispatch]);

  const handleAddFollowing = useCallback((following) => {
    dispatch(addFollowing(following));
  }, [dispatch]);

  const handleRemoveFollowing = useCallback((followingId) => {
    dispatch(removeFollowing(followingId));
  }, [dispatch]);

  // Profile update actions
  const handleUpdateCreatorProfile = useCallback(async (updates) => {
    try {
      const result = await dispatch(updateCreatorProfile(updates)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Discovery actions
  const handleGetTopCreators = useCallback(async (params) => {
    try {
      const result = await dispatch(getTopCreators(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Stats actions
  const handleGetCreatorStats = useCallback(async (username) => {
    try {
      const result = await dispatch(getCreatorStats(username)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Utility actions
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetCreatorState = useCallback(() => {
    dispatch(resetCreatorState());
  }, [dispatch]);

  return {
    // Profile state
    currentProfile,
    profileLoading,
    profileError,
    
    // Feed state
    profileFeed,
    feedLoading,
    feedError,
    feedHasMore,
    feedNextCursor,
    
    // Followers state
    followers,
    followersLoading,
    followersError,
    followersHasMore,
    followersNextCursor,
    
    // Following state
    following,
    followingLoading,
    followingError,
    followingHasMore,
    followingNextCursor,
    
    // Top creators state
    topCreators,
    topCreatorsLoading,
    topCreatorsError,
    topCreatorsHasMore,
    topCreatorsNextCursor,
    
    // Stats state
    creatorStats,
    statsLoading,
    statsError,
    
    // Follow status state
    followStatus,
    followStatusLoading,
    followStatusError,
    
    // General state
    status,
    error,
    
    // Profile actions
    getCreatorProfile: handleGetCreatorProfile,
    setCurrentProfile: handleSetCurrentProfile,
    updateProfileFollowStatus: handleUpdateProfileFollowStatus,
    
    // Feed actions
    getCreatorFeed: handleGetCreatorFeed,
    addFeedItem: handleAddFeedItem,
    
    // Follow actions
    followCreator: handleFollowCreator,
    unfollowCreator: handleUnfollowCreator,
    getFollowStatus: handleGetFollowStatus,
    
    // Followers/Following actions
    getFollowers: handleGetFollowers,
    getFollowing: handleGetFollowing,
    addFollower: handleAddFollower,
    removeFollower: handleRemoveFollower,
    addFollowing: handleAddFollowing,
    removeFollowing: handleRemoveFollowing,
    
    // Profile update actions
    updateCreatorProfile: handleUpdateCreatorProfile,
    
    // Discovery actions
    getTopCreators: handleGetTopCreators,
    
    // Stats actions
    getCreatorStats: handleGetCreatorStats,
    
    // Utility actions
    clearError: handleClearError,
    resetCreatorState: handleResetCreatorState,
  };
};

export default useCreator;
