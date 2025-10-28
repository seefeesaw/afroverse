import React, { useState, useEffect } from 'react';
import { useProgression } from '../../hooks/useProgression';

const LevelProgressBar = ({ className = '', showDetails = true, size = 'medium' }) => {
  const { getXpStatus, getLevelProgressPercentage, getLevelEmoji } = useProgression();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousXp, setPreviousXp] = useState(0);
  
  const xp = getXpStatus();
  const levelProgress = getLevelProgressPercentage();
  const levelEmoji = getLevelEmoji();
  
  // Trigger animation when XP changes
  useEffect(() => {
    if (xp.value > previousXp) {
      setIsAnimating(true);
      setPreviousXp(xp.value);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [xp.value, previousXp]);
  
  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      small: 'h-2 text-xs',
      medium: 'h-3 text-sm',
      large: 'h-4 text-base'
    };
    return sizes[size] || sizes.medium;
  };
  
  // Get progress bar classes
  const getProgressBarClasses = () => {
    const baseClasses = 'w-full bg-gray-700 rounded-full transition-all duration-500';
    const sizeClasses = getSizeClasses().split(' ')[0];
    const animationClasses = isAnimating ? 'animate-pulse' : '';
    
    return `${baseClasses} ${sizeClasses} ${animationClasses}`;
  };
  
  // Get progress fill classes
  const getProgressFillClasses = () => {
    const baseClasses = 'bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500';
    const sizeClasses = getSizeClasses().split(' ')[0];
    const animationClasses = isAnimating ? 'animate-pulse' : '';
    
    return `${baseClasses} ${sizeClasses} ${animationClasses}`;
  };
  
  // Get text classes
  const getTextClasses = () => {
    const baseClasses = 'text-gray-300';
    const sizeClasses = getSizeClasses().split(' ')[1];
    
    return `${baseClasses} ${sizeClasses}`;
  };
  
  // Get level text classes
  const getLevelTextClasses = () => {
    const baseClasses = 'text-white font-semibold';
    const sizeClasses = getSizeClasses().split(' ')[1];
    
    return `${baseClasses} ${sizeClasses}`;
  };
  
  // Get XP text classes
  const getXpTextClasses = () => {
    const baseClasses = 'text-gray-300';
    const sizeClasses = getSizeClasses().split(' ')[1];
    
    return `${baseClasses} ${sizeClasses}`;
  };
  
  // Get sparkle animation
  const getSparkleAnimation = () => {
    if (isAnimating) {
      return (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-50 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      );
    }
    return null;
  };
  
  // Get progress bar
  const getProgressBar = () => {
    return (
      <div className="relative">
        <div className={getProgressBarClasses()}>
          <div 
            className={getProgressFillClasses()}
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        {getSparkleAnimation()}
      </div>
    );
  };
  
  // Get details section
  const getDetailsSection = () => {
    if (!showDetails) return null;
    
    return (
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-2">
          <span className={getLevelTextClasses()}>
            {levelEmoji} Level {xp.level}
          </span>
        </div>
        <div className={getXpTextClasses()}>
          {xp.value.toLocaleString()} / {xp.nextLevelXp.toLocaleString()} XP
        </div>
      </div>
    );
  };
  
  // Get compact version
  const getCompactVersion = () => {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex-shrink-0">
          <span className={getLevelTextClasses()}>
            {levelEmoji} {xp.level}
          </span>
        </div>
        <div className="flex-1">
          {getProgressBar()}
        </div>
        <div className="flex-shrink-0">
          <span className={getXpTextClasses()}>
            {xp.value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  };
  
  // Get full version
  const getFullVersion = () => {
    return (
      <div className={className}>
        {getProgressBar()}
        {getDetailsSection()}
      </div>
    );
  };
  
  // Render based on showDetails
  if (!showDetails) {
    return getCompactVersion();
  }
  
  return getFullVersion();
};

export default LevelProgressBar;
