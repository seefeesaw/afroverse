import React, { useState, useEffect } from 'react';

const Timer = ({ 
  endsAt, 
  status, 
  onComplete, 
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!endsAt || status !== 'active') {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const endTime = new Date(endsAt).getTime();
      const remaining = Math.max(0, endTime - now);

      setTimeRemaining(remaining);

      if (remaining === 0 && !isCompleted) {
        setIsCompleted(true);
        onComplete?.();
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, status, onComplete, isCompleted]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return '0:00';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getStatusColor = () => {
    if (status === 'completed') return 'text-green-400';
    if (status === 'expired') return 'text-gray-400';
    if (timeRemaining < 60000) return 'text-red-400'; // Less than 1 minute
    if (timeRemaining < 300000) return 'text-yellow-400'; // Less than 5 minutes
    return 'text-white';
  };

  const getStatusText = () => {
    if (status === 'completed') return 'Final results';
    if (status === 'expired') return 'Battle expired';
    if (timeRemaining <= 0) return 'Battle ended';
    return `${formatTime(timeRemaining)} left`;
  };

  const getStatusIcon = () => {
    if (status === 'completed') return '🏆';
    if (status === 'expired') return '⏰';
    if (timeRemaining <= 0) return '⏰';
    return '⏱️';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`text-sm font-semibold ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {/* Progress indicator for active battles */}
      {status === 'active' && timeRemaining > 0 && (
        <div className="flex items-center space-x-1 ml-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      )}
    </div>
  );
};

export default Timer;
