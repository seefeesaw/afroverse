import React, { useState, useEffect } from 'react';
import { useStreak } from '../../hooks/useStreak';
import { Button } from '../common/Button';

const StreakChip = ({ onClick, className = '' }) => {
  const { 
    getStreakDisplay, 
    getStreakStats, 
    isAtRisk, 
    openStreakPanel 
  } = useStreak();
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  const display = getStreakDisplay();
  const stats = getStreakStats();
  
  // Trigger animation when streak changes
  useEffect(() => {
    if (stats.current > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stats.current]);
  
  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openStreakPanel();
    }
  };
  
  // Get chip classes
  const getChipClasses = () => {
    const baseClasses = 'flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 cursor-pointer';
    const colorClasses = `${display.backgroundColor} ${display.borderColor} border`;
    const effectClasses = isAtRisk ? 'animate-pulse shadow-lg' : '';
    const animationClasses = isAnimating ? 'scale-110' : 'hover:scale-105';
    
    return `${baseClasses} ${colorClasses} ${effectClasses} ${animationClasses} ${className}`;
  };
  
  // Get streak text classes
  const getStreakTextClasses = () => {
    const baseClasses = 'font-semibold';
    const colorClasses = display.color;
    const sizeClasses = display.size;
    const weightClasses = display.weight;
    
    return `${baseClasses} ${colorClasses} ${sizeClasses} ${weightClasses}`;
  };
  
  // Get emoji classes
  const getEmojiClasses = () => {
    const baseClasses = 'text-lg';
    const animationClasses = display.animation;
    
    return `${baseClasses} ${animationClasses}`;
  };
  
  return (
    <Button
      onClick={handleClick}
      className={getChipClasses()}
      title={display.tooltip}
    >
      {/* Streak Emoji */}
      <span className={getEmojiClasses()}>
        {display.emoji}
      </span>
      
      {/* Streak Text */}
      <span className={getStreakTextClasses()}>
        {display.text}
      </span>
      
      {/* At Risk Indicator */}
      {isAtRisk && (
        <span className="text-red-400 text-sm animate-pulse">
          ⚠️
        </span>
      )}
      
      {/* Safe Today Indicator */}
      {stats.safeToday && !isAtRisk && (
        <span className="text-green-400 text-sm">
          ✅
        </span>
      )}
    </Button>
  );
};

export default StreakChip;
