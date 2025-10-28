import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  loginAdmin,
  loginWithMagicLink,
  verifyTwoFA,
  refreshToken,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  getDashboard,
  getModerationQueue,
  getModerationJob,
  assignModerationJob,
  makeModerationDecision,
  escalateModerationJob,
  resolveAppeal,
  getFraudDetections,
  getFraudDetection,
  reviewFraudDetection,
  shadowbanUser,
  liftShadowban,
  getUsers,
  getUser,
  getUserDetails,
  applyEnforcement,
  banUser,
  unbanUser,
  getTribes,
  getTribe,
  updateTribe,
  changeTribeCaptain,
  getAuditLogs,
  getAuditLog,
  reverseAuditLog,
  clearError,
  setActiveTab,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentModerationJob,
  updateModerationJob,
  setCurrentFraudDetection,
  updateFraudDetection,
  setCurrentUser,
  setUserDetails,
  updateUser,
  setCurrentTribe,
  setCurrentAuditLog,
  resetAdminState
} from '../store/slices/adminSlice';
import adminService from '../services/adminService';

export const useAdmin = () => {
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.admin);

  // Authentication methods
  const login = useCallback(async (email, password) => {
    try {
      const result = await dispatch(loginAdmin({ email, password })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loginWithMagicLinkToken = useCallback(async (token) => {
    try {
      const result = await dispatch(loginWithMagicLink({ token })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const verifyTwoFAToken = useCallback(async (token) => {
    try {
      const result = await dispatch(verifyTwoFA({ token })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const refreshAdminToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshToken()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      const result = await dispatch(logoutAdmin()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Profile methods
  const getProfile = useCallback(async () => {
    try {
      const result = await dispatch(getAdminProfile()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const result = await dispatch(updateAdminProfile(updates)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Dashboard methods
  const getDashboardData = useCallback(async () => {
    try {
      const result = await dispatch(getDashboard()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Moderation methods
  const getModerationQueueData = useCallback(async (params) => {
    try {
      const result = await dispatch(getModerationQueue(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getModerationJobData = useCallback(async (jobId) => {
    try {
      const result = await dispatch(getModerationJob(jobId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const assignJob = useCallback(async (jobId) => {
    try {
      const result = await dispatch(assignModerationJob(jobId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const makeDecision = useCallback(async (jobId, decision, reason, notes) => {
    try {
      const result = await dispatch(makeModerationDecision({ jobId, decision, reason, notes })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const escalateJob = useCallback(async (jobId, reason, priority) => {
    try {
      const result = await dispatch(escalateModerationJob({ jobId, reason, priority })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const resolveAppealAction = useCallback(async (jobId, resolution, reason) => {
    try {
      const result = await dispatch(resolveAppeal({ jobId, resolution, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Fraud detection methods
  const getFraudDetectionsData = useCallback(async (params) => {
    try {
      const result = await dispatch(getFraudDetections(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getFraudDetectionData = useCallback(async (fraudDetectionId) => {
    try {
      const result = await dispatch(getFraudDetection(fraudDetectionId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const reviewFraud = useCallback(async (fraudDetectionId, action, notes) => {
    try {
      const result = await dispatch(reviewFraudDetection({ fraudDetectionId, action, notes })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const shadowban = useCallback(async (userId, reason) => {
    try {
      const result = await dispatch(shadowbanUser({ userId, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const liftShadowbanAction = useCallback(async (userId, reason) => {
    try {
      const result = await dispatch(liftShadowban({ userId, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // User management methods
  const getUsersData = useCallback(async (params) => {
    try {
      const result = await dispatch(getUsers(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getUserData = useCallback(async (userId) => {
    try {
      const result = await dispatch(getUser(userId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getUserDetailsData = useCallback(async (userId) => {
    try {
      const result = await dispatch(getUserDetails(userId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const applyEnforcementAction = useCallback(async (userId, type, scope, reason, expiresAt) => {
    try {
      const result = await dispatch(applyEnforcement({ userId, type, scope, reason, expiresAt })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const banUserAction = useCallback(async (userId, reason, duration) => {
    try {
      const result = await dispatch(banUser({ userId, reason, duration })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const unbanUserAction = useCallback(async (userId, reason) => {
    try {
      const result = await dispatch(unbanUser({ userId, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Tribe management methods
  const getTribesData = useCallback(async (params) => {
    try {
      const result = await dispatch(getTribes(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getTribeData = useCallback(async (tribeId) => {
    try {
      const result = await dispatch(getTribe(tribeId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const updateTribeData = useCallback(async (tribeId, updates) => {
    try {
      const result = await dispatch(updateTribe({ tribeId, updates })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const changeCaptain = useCallback(async (tribeId, newCaptainId, reason) => {
    try {
      const result = await dispatch(changeTribeCaptain({ tribeId, newCaptainId, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Audit log methods
  const getAuditLogsData = useCallback(async (params) => {
    try {
      const result = await dispatch(getAuditLogs(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getAuditLogData = useCallback(async (auditLogId) => {
    try {
      const result = await dispatch(getAuditLog(auditLogId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const reverseAuditLogAction = useCallback(async (auditLogId, reason) => {
    try {
      const result = await dispatch(reverseAuditLog({ auditLogId, reason })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // UI state methods
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setActiveTabAction = useCallback((tab) => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  const setFiltersAction = useCallback((filters) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const setPaginationAction = useCallback((pagination) => {
    dispatch(setPagination(pagination));
  }, [dispatch]);

  // Moderation state methods
  const setCurrentModerationJobAction = useCallback((job) => {
    dispatch(setCurrentModerationJob(job));
  }, [dispatch]);

  const updateModerationJobAction = useCallback((jobId, updates) => {
    dispatch(updateModerationJob({ jobId, updates }));
  }, [dispatch]);

  // Fraud detection state methods
  const setCurrentFraudDetectionAction = useCallback((detection) => {
    dispatch(setCurrentFraudDetection(detection));
  }, [dispatch]);

  const updateFraudDetectionAction = useCallback((fraudDetectionId, updates) => {
    dispatch(updateFraudDetection({ fraudDetectionId, updates }));
  }, [dispatch]);

  // User management state methods
  const setCurrentUserAction = useCallback((user) => {
    dispatch(setCurrentUser(user));
  }, [dispatch]);

  const setUserDetailsAction = useCallback((details) => {
    dispatch(setUserDetails(details));
  }, [dispatch]);

  const updateUserAction = useCallback((userId, updates) => {
    dispatch(updateUser({ userId, updates }));
  }, [dispatch]);

  // Tribe management state methods
  const setCurrentTribeAction = useCallback((tribe) => {
    dispatch(setCurrentTribe(tribe));
  }, [dispatch]);

  const updateTribeAction = useCallback((tribeId, updates) => {
    dispatch(updateTribe({ tribeId, updates }));
  }, [dispatch]);

  // Audit log state methods
  const setCurrentAuditLogAction = useCallback((log) => {
    dispatch(setCurrentAuditLog(log));
  }, [dispatch]);

  // Reset state
  const resetState = useCallback(() => {
    dispatch(resetAdminState());
  }, [dispatch]);

  // Utility methods
  const isAuthenticated = useCallback(() => {
    return adminService.isAuthenticated();
  }, []);

  const getRole = useCallback(() => {
    return adminService.getRole();
  }, []);

  const hasRole = useCallback((requiredRole) => {
    return adminService.hasRole(requiredRole);
  }, []);

  return {
    // State
    ...adminState,
    
    // Authentication
    login,
    loginWithMagicLinkToken,
    verifyTwoFAToken,
    refreshAdminToken,
    logout,
    
    // Profile
    getProfile,
    updateProfile,
    
    // Dashboard
    getDashboardData,
    
    // Moderation
    getModerationQueueData,
    getModerationJobData,
    assignJob,
    makeDecision,
    escalateJob,
    resolveAppealAction,
    
    // Fraud detection
    getFraudDetectionsData,
    getFraudDetectionData,
    reviewFraud,
    shadowban,
    liftShadowbanAction,
    
    // User management
    getUsersData,
    getUserData,
    getUserDetailsData,
    applyEnforcementAction,
    banUserAction,
    unbanUserAction,
    
    // Tribe management
    getTribesData,
    getTribeData,
    updateTribeData,
    changeCaptain,
    
    // Audit logs
    getAuditLogsData,
    getAuditLogData,
    reverseAuditLogAction,
    
    // UI state
    clearErrorAction,
    setActiveTabAction,
    setFiltersAction,
    clearFiltersAction,
    setPaginationAction,
    
    // Moderation state
    setCurrentModerationJobAction,
    updateModerationJobAction,
    
    // Fraud detection state
    setCurrentFraudDetectionAction,
    updateFraudDetectionAction,
    
    // User management state
    setCurrentUserAction,
    setUserDetailsAction,
    updateUserAction,
    
    // Tribe management state
    setCurrentTribeAction,
    updateTribeAction,
    
    // Audit log state
    setCurrentAuditLogAction,
    
    // Reset state
    resetState,
    
    // Utility
    isAuthenticated,
    getRole,
    hasRole
  };
};
