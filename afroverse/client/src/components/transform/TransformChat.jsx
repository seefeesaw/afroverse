import React, { useState, useEffect, useCallback } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { useAuth } from '../../hooks/useAuth';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import ProcessingAnimation from './ProcessingAnimation';
import ResultDisplay from './ResultDisplay';
import Button from '../common/Button';
import Card from '../common/Card';
import Toast from '../common/Toast';

const TransformChat = () => {
  const {
    currentStep,
    selectedImage,
    selectedStyle,
    selectedIntensity,
    isProcessing,
    transformationResult,
    error,
    createTransformation,
    getTransformationStatus,
    setCurrentStep,
    nextStep,
    prevStep,
    clearError,
    resetTransformState,
    canTransform
  } = useTransform();
  
  const { user, canTransform: userCanTransform, needsUpgrade } = useAuth();
  
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showError, setShowError] = useState(false);

  // Show error toast
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleImageSelected = useCallback((imageFile) => {
    nextStep();
  }, [nextStep]);

  const handleStyleSelected = useCallback(async (style) => {
    try {
      // Check if user can transform
      if (!userCanTransform()) {
        // Show upgrade modal or error
        return;
      }

      // Create transformation
      const result = await createTransformation(selectedImage, style, selectedIntensity);
      
      if (result) {
        setCurrentJobId(result.jobId);
        nextStep();
      }
    } catch (error) {
      console.error('Transformation creation error:', error);
    }
  }, [selectedImage, selectedStyle, selectedIntensity, createTransformation, nextStep, userCanTransform]);

  const handleTransformationComplete = useCallback((result) => {
    nextStep();
  }, [nextStep]);

  const handleTransformAgain = useCallback(() => {
    resetTransformState();
    setCurrentJobId(null);
  }, [resetTransformState]);

  const handleBack = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                Transform Your Selfie
              </h1>
              <p className="text-gray-300 text-lg">
                Upload your selfie and choose a cultural style to create an amazing transformation
              </p>
            </div>
            
            <ImageUploader onImageSelected={handleImageSelected} />
            
            {/* User Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Welcome, {user?.username}!</h3>
                  <p className="text-gray-300 text-sm">
                    {user?.subscription?.status === 'warrior' 
                      ? 'Warrior Plan - Unlimited transforms' 
                      : `Free Plan - ${user?.limits ? Math.max(0, 3 - user.limits.transformsUsed) : 3} transforms remaining today`
                    }
                  </p>
                </div>
                
                {needsUpgrade() && (
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Upgrade to Warrior
                  </Button>
                )}
              </div>
            </Card>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                Choose Your Style
              </h1>
              <p className="text-gray-300 text-lg">
                Select a cultural style to transform your selfie
              </p>
            </div>
            
            <StyleSelector onStyleSelected={handleStyleSelected} />
            
            <div className="flex justify-center">
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                ← Back to Upload
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <ProcessingAnimation 
              jobId={currentJobId}
              onComplete={handleTransformationComplete}
            />
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <ResultDisplay 
              result={transformationResult}
              onTransformAgain={handleTransformAgain}
            />
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Transform Your Selfie
            </h1>
            <p className="text-gray-300 text-lg">
              Upload your selfie and choose a cultural style
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Afroverse Transform
          </h1>
          <p className="text-gray-300 text-lg">
            AI-powered cultural transformations
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['upload', 'style', 'processing', 'result'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : index < ['upload', 'style', 'processing', 'result'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 h-1 mx-2 ${
                      index < ['upload', 'style', 'processing', 'result'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {renderStep()}

        {/* Error Toast */}
        {showError && error && (
          <Toast
            message={error}
            type="error"
            onClose={() => {
              setShowError(false);
              clearError();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TransformChat;
