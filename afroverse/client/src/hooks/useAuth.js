import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectAuthStep,
  selectPhone,
  startAuth,
  verifyAuth,
  refreshToken,
  getMe,
  logout,
  clearError,
  setAuthStep,
  setPhone,
  clearAuth,
  initializeAuth
} from '../store/slices/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const authStep = useSelector(selectAuthStep);
  const phone = useSelector(selectPhone);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (isAuthenticated && authService.getAccessToken()) {
      const refreshInterval = setInterval(() => {
        dispatch(refreshToken());
      }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15)

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, dispatch]);

  // Action creators
  const handleStartAuth = useCallback(async (phoneNumber) => {
    try {
      dispatch(setPhone(phoneNumber));
      await dispatch(startAuth(phoneNumber)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleVerifyAuth = useCallback(async (otpCode) => {
    try {
      await dispatch(verifyAuth({ phone, otp: otpCode })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, phone]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      // Clear local state anyway
      dispatch(clearAuth());
      throw error;
    }
  }, [dispatch]);

  const handleRefreshToken = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      dispatch(clearAuth());
      throw error;
    }
  }, [dispatch]);

  const handleGetMe = useCallback(async () => {
    try {
      await dispatch(getMe()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSetAuthStep = useCallback((step) => {
    dispatch(setAuthStep(step));
  }, [dispatch]);

  // Utility functions
  const validatePhoneNumber = useCallback((phoneNumber) => {
    return authService.validatePhoneNumber(phoneNumber);
  }, []);

  const formatPhoneNumber = useCallback((phoneNumber) => {
    return authService.formatPhoneNumber(phoneNumber);
  }, []);

  const getCountryCode = useCallback((phoneNumber) => {
    return authService.getCountryCode(phoneNumber);
  }, []);

  const getPhoneNumberWithoutCountryCode = useCallback((phoneNumber) => {
    return authService.getPhoneNumberWithoutCountryCode(phoneNumber);
  }, []);

  // Check if user can transform (daily limits)
  const canTransform = useCallback(() => {
    if (!user) return false;
    
    if (user.subscription?.status === 'warrior') {
      return true;
    }
    
    return user.limits?.transformsUsed < 3;
  }, [user]);

  // Get remaining transforms
  const getRemainingTransforms = useCallback(() => {
    if (!user) return 0;
    
    if (user.subscription?.status === 'warrior') {
      return 'unlimited';
    }
    
    return Math.max(0, 3 - (user.limits?.transformsUsed || 0));
  }, [user]);

  // Check if user needs to upgrade
  const needsUpgrade = useCallback(() => {
    if (!user) return false;
    
    return user.subscription?.status === 'free' && user.limits?.transformsUsed >= 3;
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    authStep,
    phone,
    
    // Actions
    startAuth: handleStartAuth,
    verifyAuth: handleVerifyAuth,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    getMe: handleGetMe,
    clearError: handleClearError,
    setAuthStep: handleSetAuthStep,
    
    // Utilities
    validatePhoneNumber,
    formatPhoneNumber,
    getCountryCode,
    getPhoneNumberWithoutCountryCode,
    canTransform,
    getRemainingTransforms,
    needsUpgrade,
    
    // Raw auth state for advanced usage
    auth
  };
};
