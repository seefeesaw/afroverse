import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transformService from '../../services/transformService';

// Async thunks
export const getAvailableStyles = createAsyncThunk(
  'transform/getAvailableStyles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transformService.getAvailableStyles();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTransformation = createAsyncThunk(
  'transform/createTransformation',
  async ({ imageFile, style, intensity }, { rejectWithValue }) => {
    try {
      const response = await transformService.createTransformation(imageFile, style, intensity);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTransformationStatus = createAsyncThunk(
  'transform/getTransformationStatus',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await transformService.getTransformationStatus(jobId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTransformationHistory = createAsyncThunk(
  'transform/getTransformationHistory',
  async ({ cursor, limit }, { rejectWithValue }) => {
    try {
      const response = await transformService.getTransformationHistory(cursor, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPublicTransformation = createAsyncThunk(
  'transform/getPublicTransformation',
  async (shareCode, { rejectWithValue }) => {
    try {
      const response = await transformService.getPublicTransformation(shareCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Styles
  availableStyles: {},
  userSubscription: 'free',
  
  // Current transformation
  currentTransformation: null,
  selectedImage: null,
  selectedStyle: null,
  selectedIntensity: 0.8,
  
  // Processing state
  isProcessing: false,
  processingProgress: 0,
  processingStep: '',
  estimatedTime: 20,
  
  // Results
  transformationResult: null,
  error: null,
  
  // History
  history: [],
  historyCursor: null,
  hasMoreHistory: true,
  
  // UI state
  currentStep: 'upload', // 'upload', 'style', 'processing', 'result'
  showShareModal: false,
  showUpgradeModal: false,
  
  // Loading states
  isLoadingStyles: false,
  isLoadingHistory: false,
  isCreatingTransformation: false,
  isCheckingStatus: false,
};

// Transform slice
const transformSlice = createSlice({
  name: 'transform',
  initialState,
  reducers: {
    // Step management
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      const steps = ['upload', 'style', 'processing', 'result'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },
    prevStep: (state) => {
      const steps = ['upload', 'style', 'processing', 'result'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },
    
    // Image selection
    setSelectedImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    clearSelectedImage: (state) => {
      state.selectedImage = null;
    },
    
    // Style selection
    setSelectedStyle: (state, action) => {
      state.selectedStyle = action.payload;
    },
    setSelectedIntensity: (state, action) => {
      state.selectedIntensity = action.payload;
    },
    
    // Processing state
    setProcessingProgress: (state, action) => {
      state.processingProgress = action.payload;
    },
    setProcessingStep: (state, action) => {
      state.processingStep = action.payload;
    },
    setEstimatedTime: (state, action) => {
      state.estimatedTime = action.payload;
    },
    
    // Results
    setTransformationResult: (state, action) => {
      state.transformationResult = action.payload;
    },
    clearTransformationResult: (state) => {
      state.transformationResult = null;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Modal management
    setShowShareModal: (state, action) => {
      state.showShareModal = action.payload;
    },
    setShowUpgradeModal: (state, action) => {
      state.showUpgradeModal = action.payload;
    },
    
    // Reset state
    resetTransformState: (state) => {
      state.currentTransformation = null;
      state.selectedImage = null;
      state.selectedStyle = null;
      state.isProcessing = false;
      state.processingProgress = 0;
      state.processingStep = '';
      state.transformationResult = null;
      state.error = null;
      state.currentStep = 'upload';
      state.showShareModal = false;
      state.showUpgradeModal = false;
    },
    
    // History management
    addToHistory: (state, action) => {
      state.history.unshift(action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
      state.historyCursor = null;
      state.hasMoreHistory = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Available Styles
      .addCase(getAvailableStyles.pending, (state) => {
        state.isLoadingStyles = true;
        state.error = null;
      })
      .addCase(getAvailableStyles.fulfilled, (state, action) => {
        state.isLoadingStyles = false;
        state.availableStyles = action.payload.styles;
        state.userSubscription = action.payload.userSubscription;
      })
      .addCase(getAvailableStyles.rejected, (state, action) => {
        state.isLoadingStyles = false;
        state.error = action.payload;
      })
      
      // Create Transformation
      .addCase(createTransformation.pending, (state) => {
        state.isCreatingTransformation = true;
        state.error = null;
        state.isProcessing = true;
        state.processingProgress = 0;
        state.processingStep = 'Starting transformation...';
      })
      .addCase(createTransformation.fulfilled, (state, action) => {
        state.isCreatingTransformation = false;
        state.currentTransformation = action.payload;
        state.currentStep = 'processing';
        state.estimatedTime = action.payload.estimatedTime;
      })
      .addCase(createTransformation.rejected, (state, action) => {
        state.isCreatingTransformation = false;
        state.isProcessing = false;
        state.error = action.payload;
      })
      
      // Get Transformation Status
      .addCase(getTransformationStatus.pending, (state) => {
        state.isCheckingStatus = true;
      })
      .addCase(getTransformationStatus.fulfilled, (state, action) => {
        state.isCheckingStatus = false;
        
        if (action.payload.status === 'completed') {
          state.isProcessing = false;
          state.processingProgress = 100;
          state.transformationResult = action.payload.result;
          state.currentStep = 'result';
        } else if (action.payload.status === 'failed') {
          state.isProcessing = false;
          state.error = action.payload.error;
        }
      })
      .addCase(getTransformationStatus.rejected, (state, action) => {
        state.isCheckingStatus = false;
        state.isProcessing = false;
        state.error = action.payload;
      })
      
      // Get Transformation History
      .addCase(getTransformationHistory.pending, (state) => {
        state.isLoadingHistory = true;
      })
      .addCase(getTransformationHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        
        if (action.payload.nextCursor) {
          state.history = [...state.history, ...action.payload.items];
          state.historyCursor = action.payload.nextCursor;
        } else {
          state.history = action.payload.items;
          state.historyCursor = null;
          state.hasMoreHistory = false;
        }
      })
      .addCase(getTransformationHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      })
      
      // Get Public Transformation
      .addCase(getPublicTransformation.pending, (state) => {
        state.isLoadingHistory = true;
      })
      .addCase(getPublicTransformation.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.transformationResult = action.payload.transformation;
      })
      .addCase(getPublicTransformation.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectTransform = (state) => state.transform;
export const selectAvailableStyles = (state) => state.transform.availableStyles;
export const selectCurrentStep = (state) => state.transform.currentStep;
export const selectSelectedImage = (state) => state.transform.selectedImage;
export const selectSelectedStyle = (state) => state.transform.selectedStyle;
export const selectIsProcessing = (state) => state.transform.isProcessing;
export const selectProcessingProgress = (state) => state.transform.processingProgress;
export const selectProcessingStep = (state) => state.transform.processingStep;
export const selectTransformationResult = (state) => state.transform.transformationResult;
export const selectTransformError = (state) => state.transform.error;
export const selectTransformHistory = (state) => state.transform.history;
export const selectShowShareModal = (state) => state.transform.showShareModal;
export const selectShowUpgradeModal = (state) => state.transform.showUpgradeModal;

// Action creators
export const {
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
} = transformSlice.actions;

export default transformSlice.reducer;