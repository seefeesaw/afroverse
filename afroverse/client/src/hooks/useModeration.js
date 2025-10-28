import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchReportReasons,
  submitReport,
  blockUser,
  unblockUser,
  fetchBlockedUsers,
  fetchBlockers,
  fetchModerationHistory,
  fetchUserReports,
  fetchReportsAgainst,
  moderateText,
  validateUsername,
  validateTribeName,
  fetchModerationStats,
  fetchModerationStatus,
  clearError,
  updateSettings,
  addBlockedUser,
  removeBlockedUser,
  addReport,
  updateReportStatus
} from '../store/slices/moderationSlice';
import moderationService from '../services/moderationService';

const useModeration = () => {
  const dispatch = useDispatch();
  const {
    reports,
    reportReasons,
    blockedUsers,
    blockers,
    moderationHistory,
    userReports,
    reportsAgainst,
    stats,
    serviceStatus,
    loading,
    error,
    settings
  } = useSelector((state) => state.moderation);

  // Fetch report reasons
  const getReportReasons = useCallback(() => {
    return dispatch(fetchReportReasons());
  }, [dispatch]);

  // Submit a report
  const reportContent = useCallback(async (reportData) => {
    try {
      const result = await dispatch(submitReport(reportData));
      return result.payload;
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }
  }, [dispatch]);

  // Report a user
  const reportUser = useCallback(async (userId, reason, description) => {
    try {
      const result = await moderationService.reportUser(userId, reason, description);
      dispatch(addReport(result));
      return result;
    } catch (error) {
      console.error('Failed to report user:', error);
      throw error;
    }
  }, [dispatch]);

  // Report an image
  const reportImage = useCallback(async (userId, imageId, reason, description) => {
    try {
      const result = await moderationService.reportImage(userId, imageId, reason, description);
      dispatch(addReport(result));
      return result;
    } catch (error) {
      console.error('Failed to report image:', error);
      throw error;
    }
  }, [dispatch]);

  // Report a battle
  const reportBattle = useCallback(async (userId, battleId, reason, description) => {
    try {
      const result = await moderationService.reportBattle(userId, battleId, reason, description);
      dispatch(addReport(result));
      return result;
    } catch (error) {
      console.error('Failed to report battle:', error);
      throw error;
    }
  }, [dispatch]);

  // Block a user
  const blockUserAction = useCallback(async (blockedUserId, reason, description) => {
    try {
      const result = await dispatch(blockUser({ blockedUserId, reason, description }));
      return result.payload;
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }, [dispatch]);

  // Unblock a user
  const unblockUserAction = useCallback(async (blockedUserId) => {
    try {
      const result = await dispatch(unblockUser(blockedUserId));
      return result.payload;
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  }, [dispatch]);

  // Get blocked users
  const getBlockedUsers = useCallback(() => {
    return dispatch(fetchBlockedUsers());
  }, [dispatch]);

  // Get blockers
  const getBlockers = useCallback(() => {
    return dispatch(fetchBlockers());
  }, [dispatch]);

  // Get moderation history
  const getModerationHistory = useCallback((params = {}) => {
    return dispatch(fetchModerationHistory(params));
  }, [dispatch]);

  // Get user reports
  const getUserReports = useCallback((params = {}) => {
    return dispatch(fetchUserReports(params));
  }, [dispatch]);

  // Get reports against user
  const getReportsAgainst = useCallback((params = {}) => {
    return dispatch(fetchReportsAgainst(params));
  }, [dispatch]);

  // Moderate text content
  const moderateTextContent = useCallback(async (text, contentType = 'text', options = {}) => {
    try {
      const result = await dispatch(moderateText({ text, contentType, options }));
      return result.payload;
    } catch (error) {
      console.error('Failed to moderate text:', error);
      throw error;
    }
  }, [dispatch]);

  // Validate username
  const validateUsernameContent = useCallback(async (username) => {
    try {
      const result = await dispatch(validateUsername(username));
      return result.payload;
    } catch (error) {
      console.error('Failed to validate username:', error);
      throw error;
    }
  }, [dispatch]);

  // Validate tribe name
  const validateTribeNameContent = useCallback(async (tribeName) => {
    try {
      const result = await dispatch(validateTribeName(tribeName));
      return result.payload;
    } catch (error) {
      console.error('Failed to validate tribe name:', error);
      throw error;
    }
  }, [dispatch]);

  // Get moderation stats
  const getModerationStats = useCallback((timeframe = '7d') => {
    return dispatch(fetchModerationStats(timeframe));
  }, [dispatch]);

  // Get moderation status
  const getModerationStatus = useCallback(() => {
    return dispatch(fetchModerationStatus());
  }, [dispatch]);

  // Clear error
  const clearModerationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Update settings
  const updateModerationSettings = useCallback((newSettings) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch]);

  // Check if user is blocked
  const isUserBlocked = useCallback(async (userId) => {
    try {
      return await moderationService.checkUserBlock(userId);
    } catch (error) {
      console.error('Failed to check user block status:', error);
      return false;
    }
  }, []);

  // Get block reasons
  const getBlockReasons = useCallback(() => {
    return moderationService.getBlockReasons();
  }, []);

  // Check if content is safe
  const isContentSafe = useCallback(async (text, contentType = 'text') => {
    try {
      return await moderationService.isContentSafe(text, contentType);
    } catch (error) {
      console.error('Failed to check content safety:', error);
      return false;
    }
  }, []);

  // Sanitize content
  const sanitizeContent = useCallback(async (text, contentType = 'text') => {
    try {
      return await moderationService.sanitizeContent(text, contentType);
    } catch (error) {
      console.error('Failed to sanitize content:', error);
      return text;
    }
  }, []);

  // Utility functions
  const isUserBlockedLocally = useCallback((userId) => {
    return blockedUsers.some(user => user.blockedUserId._id === userId);
  }, [blockedUsers]);

  const getBlockedUserById = useCallback((userId) => {
    return blockedUsers.find(user => user.blockedUserId._id === userId);
  }, [blockedUsers]);

  const getReportById = useCallback((reportId) => {
    return userReports.find(report => report._id === reportId);
  }, [userReports]);

  const getReportsByTarget = useCallback((targetUserId, targetType, targetId) => {
    return userReports.filter(report => 
      report.targetUserId === targetUserId &&
      report.targetType === targetType &&
      report.targetId === targetId
    );
  }, [userReports]);

  const getModerationActionById = useCallback((actionId) => {
    return moderationHistory.find(action => action._id === actionId);
  }, [moderationHistory]);

  const getActiveModerationActions = useCallback(() => {
    return moderationHistory.filter(action => !action.resolvedAt);
  }, [moderationHistory]);

  const getModerationActionsByType = useCallback((actionType) => {
    return moderationHistory.filter(action => action.action === actionType);
  }, [moderationHistory]);

  const getModerationActionsByCategory = useCallback((category) => {
    return moderationHistory.filter(action => action.category === category);
  }, [moderationHistory]);

  const getPendingReports = useCallback(() => {
    return userReports.filter(report => report.status === 'pending');
  }, [userReports]);

  const getResolvedReports = useCallback(() => {
    return userReports.filter(report => report.status === 'resolved');
  }, [userReports]);

  const getDismissedReports = useCallback(() => {
    return userReports.filter(report => report.status === 'dismissed');
  }, [userReports]);

  const getReportsByReason = useCallback((reason) => {
    return userReports.filter(report => report.reason === reason);
  }, [userReports]);

  const getReportsByPriority = useCallback((priority) => {
    return userReports.filter(report => report.priority === priority);
  }, [userReports]);

  const getHighPriorityReports = useCallback(() => {
    return userReports.filter(report => report.priority === 'high' || report.priority === 'urgent');
  }, [userReports]);

  const getModerationStatsByTimeframe = useCallback((timeframe) => {
    return stats[timeframe] || { logs: [], reports: [] };
  }, [stats]);

  const getServiceStatus = useCallback(() => {
    return serviceStatus;
  }, [serviceStatus]);

  const isServiceInitialized = useCallback(() => {
    return serviceStatus.initialized;
  }, [serviceStatus]);

  const getServiceHealth = useCallback(() => {
    const services = serviceStatus.services || {};
    const health = {
      faceDetection: services.faceDetection?.initialized || false,
      nsfwDetection: services.nsfwDetection?.initialized || false,
      textModeration: services.textModeration?.initialized || false,
      rulesEngine: services.rulesEngine?.totalRules > 0 || false
    };
    
    const healthyServices = Object.values(health).filter(Boolean).length;
    const totalServices = Object.keys(health).length;
    
    return {
      ...health,
      overall: healthyServices === totalServices,
      score: Math.round((healthyServices / totalServices) * 100)
    };
  }, [serviceStatus]);

  return {
    // State
    reports,
    reportReasons,
    blockedUsers,
    blockers,
    moderationHistory,
    userReports,
    reportsAgainst,
    stats,
    serviceStatus,
    loading,
    error,
    settings,

    // Actions
    getReportReasons,
    reportContent,
    reportUser,
    reportImage,
    reportBattle,
    blockUserAction,
    unblockUserAction,
    getBlockedUsers,
    getBlockers,
    getModerationHistory,
    getUserReports,
    getReportsAgainst,
    moderateTextContent,
    validateUsernameContent,
    validateTribeNameContent,
    getModerationStats,
    getModerationStatus,
    clearModerationError,
    updateModerationSettings,

    // Utilities
    isUserBlocked,
    getBlockReasons,
    isContentSafe,
    sanitizeContent,
    isUserBlockedLocally,
    getBlockedUserById,
    getReportById,
    getReportsByTarget,
    getModerationActionById,
    getActiveModerationActions,
    getModerationActionsByType,
    getModerationActionsByCategory,
    getPendingReports,
    getResolvedReports,
    getDismissedReports,
    getReportsByReason,
    getReportsByPriority,
    getHighPriorityReports,
    getModerationStatsByTimeframe,
    getServiceStatus,
    isServiceInitialized,
    getServiceHealth
  };
};

export default useModeration;
