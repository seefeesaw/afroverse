import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectTransform,
  selectAvailableStyles,
  selectCurrentStep,
  selectSelectedImage,
  selectSelectedStyle,
  selectIsProcessing,
  selectProcessingProgress,
  selectProcessingStep,
  selectTransformationResult,
  selectTransformError,
  selectTransformHistory,
  selectShowShareModal,
  selectShowUpgradeModal,
  getAvailableStyles,
  createTransformation,
  getTransformationStatus,
  getTransformationHistory,
  getPublicTransformation,
  setCurrentStep,
  nextStep,
  prevStep,
  setSelectedImage,
  clearSelectedImage,
  setSelectedStyle,
  setSelectedIntensity,
  setProcessingProgress,
  setProcessingStep,
  setEstimatedTime,
  setTransformationResult,
  clearTransformationResult,
  clearError,
  setError,
  setShowShareModal,
  setShowUpgradeModal,
  resetTransformState,
  addToHistory,
  clearHistory,
} from '../store/slices/transformSlice';
import transformService from '../services/transformService';
import { useChallenge } from './useChallenge';
import { useEvent } from './useEvent';

export const useTransform = () => {
  const dispatch = useDispatch();
  const { updateProgress } = useChallenge();
  const { updateClanWarScore } = useEvent();
  
  // Selectors
  const transform = useSelector(selectTransform);
  const availableStyles = useSelector(selectAvailableStyles);
  const currentStep = useSelector(selectCurrentStep);
  const selectedImage = useSelector(selectSelectedImage);
  const selectedStyle = useSelector(selectSelectedStyle);
  const isProcessing = useSelector(selectIsProcessing);
  const processingProgress = useSelector(selectProcessingProgress);
  const processingStep = useSelector(selectProcessingStep);
  const transformationResult = useSelector(selectTransformationResult);
  const error = useSelector(selectTransformError);
  const history = useSelector(selectTransformHistory);
  const showShareModal = useSelector(selectShowShareModal);
  const showUpgradeModal = useSelector(selectShowUpgradeModal);

  // Load available styles on mount
  useEffect(() => {
    dispatch(getAvailableStyles());
  }, [dispatch]);

  // Action creators
  const handleGetAvailableStyles = useCallback(async () => {
    try {
      await dispatch(getAvailableStyles()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleCreateTransformation = useCallback(async (imageFile, style, intensity = 0.8) => {
    try {
      const result = await dispatch(createTransformation({
        imageFile,
        style,
        intensity
      })).unwrap();
      
      // Update challenge progress for transformation creation
      try {
        await updateProgress('transformation_created', 1, {
          style,
          intensity,
          timestamp: new Date().toISOString(),
        });
      } catch (challengeError) {
        console.warn('Failed to update challenge progress:', challengeError);
      }
      
      // Update clan war score for transformation creation
      try {
        await updateClanWarScore('transformation_created', 1, {
          style,
          intensity,
          timestamp: new Date().toISOString(),
        });
      } catch (eventError) {
        console.warn('Failed to update clan war score:', eventError);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, updateProgress, updateClanWarScore]);

  const handleGetTransformationStatus = useCallback(async (jobId) => {
    try {
      const result = await dispatch(getTransformationStatus(jobId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetTransformationHistory = useCallback(async (cursor = null, limit = 20) => {
    try {
      const result = await dispatch(getTransformationHistory({ cursor, limit })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetPublicTransformation = useCallback(async (shareCode) => {
    try {
      const result = await dispatch(getPublicTransformation(shareCode)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Step management
  const handleSetCurrentStep = useCallback((step) => {
    dispatch(setCurrentStep(step));
  }, [dispatch]);

  const handleNextStep = useCallback(() => {
    dispatch(nextStep());
  }, [dispatch]);

  const handlePrevStep = useCallback(() => {
    dispatch(prevStep());
  }, [dispatch]);

  // Image management
  const handleSetSelectedImage = useCallback((image) => {
    dispatch(setSelectedImage(image));
  }, [dispatch]);

  const handleClearSelectedImage = useCallback(() => {
    dispatch(clearSelectedImage());
  }, [dispatch]);

  // Style management
  const handleSetSelectedStyle = useCallback((style) => {
    dispatch(setSelectedStyle(style));
  }, [dispatch]);

  const handleSetSelectedIntensity = useCallback((intensity) => {
    dispatch(setSelectedIntensity(intensity));
  }, [dispatch]);

  // Processing state management
  const handleSetProcessingProgress = useCallback((progress) => {
    dispatch(setProcessingProgress(progress));
  }, [dispatch]);

  const handleSetProcessingStep = useCallback((step) => {
    dispatch(setProcessingStep(step));
  }, [dispatch]);

  const handleSetEstimatedTime = useCallback((time) => {
    dispatch(setEstimatedTime(time));
  }, [dispatch]);

  // Result management
  const handleSetTransformationResult = useCallback((result) => {
    dispatch(setTransformationResult(result));
  }, [dispatch]);

  const handleClearTransformationResult = useCallback(() => {
    dispatch(clearTransformationResult());
  }, [dispatch]);

  // Error management
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSetError = useCallback((error) => {
    dispatch(setError(error));
  }, [dispatch]);

  // Modal management
  const handleSetShowShareModal = useCallback((show) => {
    dispatch(setShowShareModal(show));
  }, [dispatch]);

  const handleSetShowUpgradeModal = useCallback((show) => {
    dispatch(setShowUpgradeModal(show));
  }, [dispatch]);

  // Reset state
  const handleResetTransformState = useCallback(() => {
    dispatch(resetTransformState());
  }, [dispatch]);

  // History management
  const handleAddToHistory = useCallback((item) => {
    dispatch(addToHistory(item));
  }, [dispatch]);

  const handleClearHistory = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // Utility functions
  const validateImageFile = useCallback((file) => {
    return transformService.validateImageFile(file);
  }, []);

  const createImagePreview = useCallback((file) => {
    return transformService.createImagePreview(file);
  }, []);

  const downloadImage = useCallback(async (imageUrl, filename) => {
    try {
      await transformService.downloadImage(imageUrl, filename);
    } catch (error) {
      throw error;
    }
  }, []);

  const shareToSocial = useCallback((platform, url, text) => {
    transformService.shareToSocial(platform, url, text);
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await transformService.copyToClipboard(text);
    } catch (error) {
      throw error;
    }
  }, []);

  // Check if style is premium
  const isPremiumStyle = useCallback((style) => {
    return availableStyles[style]?.isPremium || false;
  }, [availableStyles]);

  // Check if style is available for user
  const isStyleAvailable = useCallback((style) => {
    return availableStyles[style]?.available || false;
  }, [availableStyles]);

  // Get style info
  const getStyleInfo = useCallback((style) => {
    return availableStyles[style] || null;
  }, [availableStyles]);

  // Check if user can transform
  const canTransform = useCallback(() => {
    return selectedImage && selectedStyle && !isProcessing;
  }, [selectedImage, selectedStyle, isProcessing]);

  // Get processing steps for animation
  const getProcessingSteps = useCallback(() => {
    return [
      { step: 'Analyzing your selfie…', emoji: '📌', duration: 5000 },
      { step: 'Applying heritage style…', emoji: '🎨', duration: 10000 },
      { step: 'Adding Afroverse magic…', emoji: '✨', duration: 15000 },
      { step: 'Finalizing your look…', emoji: '🎭', duration: 20000 },
    ];
  }, []);

  return {
    // State
    transform,
    availableStyles,
    currentStep,
    selectedImage,
    selectedStyle,
    isProcessing,
    processingProgress,
    processingStep,
    transformationResult,
    error,
    history,
    showShareModal,
    showUpgradeModal,
    
    // Actions
    getAvailableStyles: handleGetAvailableStyles,
    createTransformation: handleCreateTransformation,
    getTransformationStatus: handleGetTransformationStatus,
    getTransformationHistory: handleGetTransformationHistory,
    getPublicTransformation: handleGetPublicTransformation,
    
    // Step management
    setCurrentStep: handleSetCurrentStep,
    nextStep: handleNextStep,
    prevStep: handlePrevStep,
    
    // Image management
    setSelectedImage: handleSetSelectedImage,
    clearSelectedImage: handleClearSelectedImage,
    
    // Style management
    setSelectedStyle: handleSetSelectedStyle,
    setSelectedIntensity: handleSetSelectedIntensity,
    
    // Processing state
    setProcessingProgress: handleSetProcessingProgress,
    setProcessingStep: handleSetProcessingStep,
    setEstimatedTime: handleSetEstimatedTime,
    
    // Result management
    setTransformationResult: handleSetTransformationResult,
    clearTransformationResult: handleClearTransformationResult,
    
    // Error management
    clearError: handleClearError,
    setError: handleSetError,
    
    // Modal management
    setShowShareModal: handleSetShowShareModal,
    setShowUpgradeModal: handleSetShowUpgradeModal,
    
    // State management
    resetTransformState: handleResetTransformState,
    addToHistory: handleAddToHistory,
    clearHistory: handleClearHistory,
    
    // Utilities
    validateImageFile,
    createImagePreview,
    downloadImage,
    shareToSocial,
    copyToClipboard,
    isPremiumStyle,
    isStyleAvailable,
    getStyleInfo,
    canTransform,
    getProcessingSteps,
  };
};
