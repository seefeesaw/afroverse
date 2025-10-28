import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectActiveTab,
  selectFeedVideos,
  selectFeedLoading,
  selectFeedError,
  selectFeedNextCursor,
  selectCurrentVideo,
  selectCurrentVideoIndex,
  selectVideoInteractions,
  selectSessionId,
  selectAnalytics,
  selectAnalyticsLoading,
  selectAnalyticsError,
  setActiveTab,
  setCurrentVideo,
  updateVideoStats,
  updateVideoInteraction,
  setSessionId,
  getFeed,
  likeVideo,
  shareVideo,
  trackView,
  followCreator,
  voteOnBattle,
  startChallenge,
  getFeedAnalytics,
  getVideo,
  clearError,
  resetFeedState,
} from '../store/slices/feedSlice';
import feedService from '../services/feedService';

export const useFeed = () => {
  const dispatch = useDispatch();

  // Selectors
  const activeTab = useSelector(selectActiveTab);
  const videos = useSelector(state => selectFeedVideos(state, activeTab));
  const loading = useSelector(state => selectFeedLoading(state, activeTab));
  const error = useSelector(state => selectFeedError(state, activeTab));
  const nextCursor = useSelector(state => selectFeedNextCursor(state, activeTab));
  const currentVideo = useSelector(selectCurrentVideo);
  const currentVideoIndex = useSelector(selectCurrentVideoIndex);
  const videoInteractions = useSelector(state => selectVideoInteractions(state, currentVideo?.id));
  const sessionId = useSelector(selectSessionId);
  const analytics = useSelector(selectAnalytics);
  const analyticsLoading = useSelector(selectAnalyticsLoading);
  const analyticsError = useSelector(selectAnalyticsError);

  // Feed actions
  const handleGetFeed = useCallback(async (tab, cursor = null, limit = 10, region = 'ZA') => {
    try {
      const result = await dispatch(getFeed({ tab, cursor, limit, region })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetActiveTab = useCallback((tab) => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  const handleSetCurrentVideo = useCallback((video, index) => {
    dispatch(setCurrentVideo({ video, index }));
  }, [dispatch]);

  // Video interaction actions
  const handleLikeVideo = useCallback(async (videoId, on) => {
    try {
      const result = await dispatch(likeVideo({ videoId, on })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleShareVideo = useCallback(async (videoId, channel) => {
    try {
      const result = await dispatch(shareVideo({ videoId, channel })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleTrackView = useCallback(async (videoId, viewData) => {
    try {
      const result = await dispatch(trackView({ videoId, viewData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleFollowCreator = useCallback(async (videoId) => {
    try {
      const result = await dispatch(followCreator({ videoId })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleVoteOnBattle = useCallback(async (battleId, side) => {
    try {
      const result = await dispatch(voteOnBattle({ battleId, side })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleStartChallenge = useCallback(async (videoId, opponentId) => {
    try {
      const result = await dispatch(startChallenge({ videoId, opponentId })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Analytics actions
  const handleGetFeedAnalytics = useCallback(async (tab = null, days = 7) => {
    try {
      const result = await dispatch(getFeedAnalytics({ tab, days })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetVideo = useCallback(async (videoId) => {
    try {
      const result = await dispatch(getVideo(videoId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Local state actions
  const handleUpdateVideoStats = useCallback((videoId, stats) => {
    dispatch(updateVideoStats({ videoId, stats }));
  }, [dispatch]);

  const handleUpdateVideoInteraction = useCallback((videoId, interaction, value) => {
    dispatch(updateVideoInteraction({ videoId, interaction, value }));
  }, [dispatch]);

  const handleSetSessionId = useCallback((sessionId) => {
    dispatch(setSessionId(sessionId));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetFeedState = useCallback(() => {
    dispatch(resetFeedState());
  }, [dispatch]);

  // Utility functions
  const getVideoById = useCallback((videoId) => {
    return videos.find(video => video.id === videoId);
  }, [videos]);

  const getVideoInteractions = useCallback((videoId) => {
    return videoInteractions || {};
  }, [videoInteractions]);

  const isVideoLiked = useCallback((videoId) => {
    const interactions = getVideoInteractions(videoId);
    return interactions.liked || false;
  }, [getVideoInteractions]);

  const isVideoShared = useCallback((videoId) => {
    const interactions = getVideoInteractions(videoId);
    return interactions.shared || false;
  }, [getVideoInteractions]);

  const isCreatorFollowed = useCallback((videoId) => {
    const interactions = getVideoInteractions(videoId);
    return interactions.followed || false;
  }, [getVideoInteractions]);

  const hasVotedOnBattle = useCallback((videoId) => {
    const interactions = getVideoInteractions(videoId);
    return !!interactions.voted;
  }, [getVideoInteractions]);

  const getVoteSide = useCallback((videoId) => {
    const interactions = getVideoInteractions(videoId);
    return interactions.voted || null;
  }, [getVideoInteractions]);

  // Share functions
  const shareToExternal = useCallback(async (videoId, channel, username) => {
    try {
      await feedService.shareToExternal(videoId, channel, username);
      await handleShareVideo(videoId, channel);
    } catch (error) {
      throw error;
    }
  }, [handleShareVideo]);

  // Session management
  const generateSessionId = useCallback(() => {
    return feedService.generateSessionId();
  }, []);

  const detectDeviceType = useCallback(() => {
    return feedService.detectDeviceType();
  }, []);

  const detectConnectionType = useCallback(() => {
    return feedService.detectConnectionType();
  }, []);

  // Feed navigation
  const navigateToVideo = useCallback((index) => {
    if (index >= 0 && index < videos.length) {
      handleSetCurrentVideo(videos[index], index);
    }
  }, [videos, handleSetCurrentVideo]);

  const navigateToNextVideo = useCallback(() => {
    if (currentVideoIndex < videos.length - 1) {
      navigateToVideo(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, videos.length, navigateToVideo]);

  const navigateToPreviousVideo = useCallback(() => {
    if (currentVideoIndex > 0) {
      navigateToVideo(currentVideoIndex - 1);
    }
  }, [currentVideoIndex, navigateToVideo]);

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (nextCursor && !loading) {
      try {
        await handleGetFeed(activeTab, nextCursor, 10, 'ZA');
      } catch (error) {
        console.error('Error loading more videos:', error);
      }
    }
  }, [nextCursor, loading, activeTab, handleGetFeed]);

  // Check if more videos can be loaded
  const canLoadMore = useCallback(() => {
    return !!nextCursor && !loading;
  }, [nextCursor, loading]);

  // Get feed stats
  const getFeedStats = useCallback(() => {
    return {
      totalVideos: videos.length,
      currentIndex: currentVideoIndex,
      hasNext: currentVideoIndex < videos.length - 1,
      hasPrevious: currentVideoIndex > 0,
      canLoadMore: canLoadMore(),
      isLoading: loading,
      error: error,
    };
  }, [videos.length, currentVideoIndex, canLoadMore, loading, error]);

  // Get video stats
  const getVideoStats = useCallback((videoId) => {
    const video = getVideoById(videoId);
    if (!video) return null;

    return {
      views: video.stats.views,
      likes: video.stats.likes,
      shares: video.stats.shares,
      completions: video.stats.completions,
      replays: video.stats.replays,
      votesCast: video.stats.votesCast,
      followsAfterView: video.stats.followsAfterView,
      avgWatchTime: video.stats.avgWatchTime,
      completionRate: video.stats.completionRate,
      shareRate: video.stats.shareRate,
      voteRate: video.stats.voteRate,
      followRate: video.stats.followRate,
    };
  }, [getVideoById]);

  // Get creator stats
  const getCreatorStats = useCallback((videoId) => {
    const video = getVideoById(videoId);
    if (!video) return null;

    return {
      id: video.owner.id,
      username: video.owner.username,
      displayName: video.owner.displayName,
      avatar: video.owner.avatar,
      tribe: video.owner.tribe,
      followersCount: video.owner.followersCount,
    };
  }, [getVideoById]);

  return {
    // State
    activeTab,
    videos,
    loading,
    error,
    nextCursor,
    currentVideo,
    currentVideoIndex,
    videoInteractions,
    sessionId,
    analytics,
    analyticsLoading,
    analyticsError,

    // Actions
    getFeed: handleGetFeed,
    setActiveTab: handleSetActiveTab,
    setCurrentVideo: handleSetCurrentVideo,
    likeVideo: handleLikeVideo,
    shareVideo: handleShareVideo,
    trackView: handleTrackView,
    followCreator: handleFollowCreator,
    voteOnBattle: handleVoteOnBattle,
    startChallenge: handleStartChallenge,
    getFeedAnalytics: handleGetFeedAnalytics,
    getVideo: handleGetVideo,

    // Local state actions
    updateVideoStats: handleUpdateVideoStats,
    updateVideoInteraction: handleUpdateVideoInteraction,
    setSessionId: handleSetSessionId,
    clearError: handleClearError,
    resetFeedState: handleResetFeedState,

    // Utility functions
    getVideoById,
    getVideoInteractions,
    isVideoLiked,
    isVideoShared,
    isCreatorFollowed,
    hasVotedOnBattle,
    getVoteSide,
    shareToExternal,
    generateSessionId,
    detectDeviceType,
    detectConnectionType,

    // Navigation
    navigateToVideo,
    navigateToNextVideo,
    navigateToPreviousVideo,
    loadMoreVideos,
    canLoadMore,

    // Stats
    getFeedStats,
    getVideoStats,
    getCreatorStats,
  };
};

export default useFeed;