/**
 * VibraniumProgressRing - Circular progress timer with purple glow
 * 
 * Features:
 * - Circular countdown timer
 * - Purple glow effect
 * - Smooth animation
 * - Urgency states (green -> gold -> red)
 */

import React, { useEffect, useState } from 'react';

const VibraniumProgressRing = ({ 
  duration = 60, // seconds
  onComplete,
  size = 120,
  strokeWidth = 8
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const newProgress = (timeLeft / duration) * 100;
    setProgress(newProgress);
  }, [timeLeft, duration]);

  // Color based on urgency
  const getColor = () => {
    if (progress > 50) return '#3CCF4E'; // Green
    if (progress > 20) return '#F5B63F'; // Gold
    return '#FF4D6D'; // Red
  };

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: `drop-shadow(0 0 10px ${getColor()})`,
          }}
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {timeLeft}
        </span>
        <span className="text-xs text-text-secondary">
          seconds
        </span>
      </div>
    </div>
  );
};

export default VibraniumProgressRing;


