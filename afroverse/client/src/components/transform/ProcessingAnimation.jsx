import React, { useState, useEffect } from 'react';
import { useTransform } from '../../hooks/useTransform';
import Card from '../common/Card';
import Loader from '../common/Loader';

const ProcessingAnimation = ({ jobId, onComplete }) => {
  const { 
    processingProgress, 
    processingStep, 
    estimatedTime,
    setProcessingProgress,
    setProcessingStep,
    getTransformationStatus,
    getProcessingSteps
  } = useTransform();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [culturalFacts, setCulturalFacts] = useState([]);
  const [currentFact, setCurrentFact] = useState(0);

  const processingSteps = getProcessingSteps();
  const facts = [
    "The Maasai people of Kenya and Tanzania are known for their distinctive red shuka cloth and intricate beadwork.",
    "Zulu warriors in South Africa traditionally wore isicholo headdresses as symbols of status and beauty.",
    "Ancient Egyptian pharaohs wore the nemes headdress, a striped headcloth that symbolized royal power.",
    "Afrofuturism combines African cultural elements with science fiction, inspiring works like Black Panther.",
    "Traditional African art often uses bold colors and geometric patterns to tell cultural stories.",
    "The Maasai jumping dance, or adumu, is a traditional ceremony that showcases strength and agility.",
    "Zulu beadwork uses specific colors and patterns to communicate messages and social status.",
    "Egyptian hieroglyphs were one of the world's first writing systems, dating back over 5000 years.",
    "Afrofuturistic design often incorporates traditional African motifs with futuristic technology.",
    "African cultures have rich oral traditions that preserve history through storytelling and music."
  ];

  useEffect(() => {
    // Initialize cultural facts
    setCulturalFacts(facts);
    
    // Start processing animation
    startProcessingAnimation();
    
    // Start cultural facts rotation
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 4000);

    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    // Update time remaining
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startProcessingAnimation = async () => {
    let stepIndex = 0;
    let progress = 0;
    
    // Animate through processing steps
    const stepInterval = setInterval(async () => {
      if (stepIndex < processingSteps.length) {
        const step = processingSteps[stepIndex];
        setProcessingStep(step.step);
        setCurrentStepIndex(stepIndex);
        
        // Animate progress for this step
        const stepProgress = (stepIndex + 1) * 25;
        animateProgress(progress, stepProgress);
        progress = stepProgress;
        
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        
        // Check for completion
        await checkCompletion();
      }
    }, 5000);

    // Check for completion every 2 seconds
    const completionInterval = setInterval(async () => {
      await checkCompletion();
    }, 2000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(completionInterval);
    };
  };

  const animateProgress = (from, to) => {
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentProgress = from + (to - from) * progress;
      setProcessingProgress(currentProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const checkCompletion = async () => {
    try {
      const status = await getTransformationStatus(jobId);
      
      if (status.status === 'completed') {
        setProcessingProgress(100);
        setProcessingStep('Transformation complete!');
        setTimeout(() => {
          onComplete(status.result);
        }, 1000);
      } else if (status.status === 'failed') {
        setProcessingStep('Transformation failed');
        // Handle error
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Loader size="lg" color="white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Creating Your Transformation
          </h2>
          <p className="text-gray-300 text-sm">
            This usually takes about {estimatedTime} seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Progress</span>
            <span className="text-gray-300 text-sm">
              {Math.round(processingProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {processingSteps[currentStepIndex]?.emoji || '🎨'}
              </span>
              <div>
                <h3 className="text-white font-semibold">
                  {processingStep}
                </h3>
                <p className="text-gray-300 text-sm">
                  Step {currentStepIndex + 1} of {processingSteps.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="mb-8">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-2">Estimated time remaining</p>
            <p className="text-2xl font-bold text-white">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Cultural Facts */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">
                  Did you know?
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {culturalFacts[currentFact]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Steps Indicator */}
        <div className="flex justify-center space-x-2">
          {processingSteps.map((step, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'bg-gradient-to-r from-green-500 to-blue-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Your transformation is being processed securely
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProcessingAnimation;
