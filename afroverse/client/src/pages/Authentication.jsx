import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PhoneEntry from '../components/auth/PhoneEntry';
import OTPVerification from '../components/auth/OTPVerification';
import AutoOnboard from '../components/auth/AutoOnboard';

const Authentication = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authStep, setAuthStep } = useAuth();
  const [currentStep, setCurrentStep] = useState('phone');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/transform');
    }
  }, [isAuthenticated, navigate]);

  // Sync with Redux state
  useEffect(() => {
    if (authStep && authStep !== currentStep) {
      setCurrentStep(authStep);
    }
  }, [authStep, currentStep]);

  const handleNext = () => {
    const steps = ['phone', 'otp', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      setAuthStep(nextStep);
    }
  };

  const handleBack = () => {
    const steps = ['phone', 'otp', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
      setAuthStep(prevStep);
    }
  };

  const handleComplete = () => {
    navigate('/transform');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'phone':
        return <PhoneEntry onNext={handleNext} />;
      case 'otp':
        return <OTPVerification onNext={handleNext} onBack={handleBack} />;
      case 'complete':
        return <AutoOnboard onComplete={handleComplete} />;
      default:
        return <PhoneEntry onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderStep()}
    </div>
  );
};

export default Authentication;
