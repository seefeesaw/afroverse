import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import UploadSelfieScreen from '../components/onboarding/UploadSelfieScreen';
import TransformationScreen from '../components/onboarding/TransformationScreen';
import WowRevealScreen from '../components/onboarding/WowRevealScreen';
import ChallengePromptScreen from '../components/onboarding/ChallengePromptScreen';
import TribeSelectionScreen from '../components/onboarding/TribeSelectionScreen';
import OnboardingCompleteScreen from '../components/onboarding/OnboardingCompleteScreen';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    uploadedImage: null,
    selectedStyle: null,
    transformationResult: null,
    selectedTribe: null,
    challengeSent: false
  });

  // Check if user already completed onboarding
  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const steps = [
    'welcome',
    'upload',
    'transform',
    'reveal',
    'challenge',
    'tribe',
    'complete'
  ];

  const handleNext = (data = {}) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    // Skip to tribe selection (minimum required step)
    setCurrentStep(steps.indexOf('tribe'));
  };

  const handleComplete = async (tribeData) => {
    try {
      // Update user profile with onboarding completion
      await updateUserProfile({
        onboardingCompleted: true,
        tribe: tribeData.selectedTribe,
        ...onboardingData
      });
      
      // Navigate to main feed
      navigate('/feed');
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return <WelcomeScreen onNext={handleNext} />;
      
      case 'upload':
        return (
          <UploadSelfieScreen 
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      
      case 'transform':
        return (
          <TransformationScreen 
            uploadedImage={onboardingData.uploadedImage}
            onNext={handleNext}
          />
        );
      
      case 'reveal':
        return (
          <WowRevealScreen 
            result={onboardingData.transformationResult}
            onNext={handleNext}
          />
        );
      
      case 'challenge':
        return (
          <ChallengePromptScreen 
            result={onboardingData.transformationResult}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      
      case 'tribe':
        return (
          <TribeSelectionScreen 
            onNext={handleNext}
            onComplete={handleComplete}
          />
        );
      
      case 'complete':
        return (
          <OnboardingCompleteScreen 
            tribe={onboardingData.selectedTribe}
            onComplete={() => navigate('/feed')}
          />
        );
      
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;


