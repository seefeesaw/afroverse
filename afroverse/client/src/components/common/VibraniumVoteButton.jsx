/**
 * VibraniumVoteButton - Vibranium Royalty Vote Button
 * 
 * Features:
 * - Pulsing purple ring animation
 * - Haptic bounce on click
 * - Confetti burst on vote
 */

import React, { useState } from 'react';

const VibraniumVoteButton = ({ 
  onVote, 
  side = 'left', 
  disabled = false,
  label = 'Vote'
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVote = async () => {
    if (disabled || isVoting) return;

    setIsVoting(true);
    setShowConfetti(true);

    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Trigger confetti
    setTimeout(() => setShowConfetti(false), 900);

    // Execute vote callback
    if (onVote) {
      await onVote(side);
    }

    setIsVoting(false);
  };

  return (
    <div className="relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full animate-confetti"
              style={{
                background: ['#6F2CFF', '#F5B63F', '#FF4D6D', '#2AB9FF', '#3CCF4E'][i % 5],
                transform: `rotate(${i * 30}deg) translateX(${20 + i * 5}px)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={disabled || isVoting}
        className={`
          btn-primary
          ${!disabled && !isVoting ? 'animate-vote-pulse' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-all duration-300
          ${isVoting ? 'scale-110' : ''}
        `}
      >
        {isVoting ? (
          <span className="flex items-center gap-2">
            <div className="spinner w-4 h-4"></div>
            Voting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🔥 {label}
          </span>
        )}
      </button>
    </div>
  );
};

export default VibraniumVoteButton;


