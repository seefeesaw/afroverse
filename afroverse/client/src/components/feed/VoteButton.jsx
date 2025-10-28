import React, { useState } from 'react';
import Button from '../common/Button';

const VoteButton = ({ 
  choice, 
  onClick, 
  disabled, 
  isVoting, 
  hasVoted, 
  userVote, 
  voteCount, 
  totalVotes,
  className = '' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    if (disabled || isVoting || hasVoted) return;
    
    setIsAnimating(true);
    
    try {
      await onClick(choice);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getButtonColor = () => {
    if (hasVoted && userVote === choice) {
      return 'bg-green-500 hover:bg-green-600';
    }
    
    if (choice === 'challenger') {
      return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
    } else {
      return 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600';
    }
  };

  const getButtonText = () => {
    if (isVoting) return 'Voting...';
    if (hasVoted && userVote === choice) return '✓ Voted';
    if (hasVoted) return 'Vote';
    return `Vote ${choice === 'challenger' ? 'Challenger' : 'Defender'}`;
  };

  const getPercentage = () => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={handleClick}
        disabled={disabled || isVoting || hasVoted}
        className={`
          ${getButtonColor()} 
          text-white font-semibold py-3 px-6 rounded-lg
          transition-all duration-300 transform
          ${isAnimating ? 'scale-105' : 'scale-100'}
          ${hasVoted && userVote === choice ? 'ring-2 ring-green-300' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-lg">
            {hasVoted && userVote === choice ? '✓' : 
             choice === 'challenger' ? '👑' : '🛡️'}
          </span>
          <span>{getButtonText()}</span>
        </div>
      </Button>
      
      {/* Vote count and percentage */}
      <div className="mt-2 text-center">
        <div className="text-sm font-semibold text-white">
          {voteCount} votes
        </div>
        <div className="text-xs text-gray-300">
          {getPercentage()}%
        </div>
      </div>
      
      {/* Vote count animation */}
      {isAnimating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold animate-bounce">
            +1
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteButton;
