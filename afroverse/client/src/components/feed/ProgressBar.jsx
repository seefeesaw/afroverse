import React from 'react';

const ProgressBar = ({ 
  challengerVotes, 
  defenderVotes, 
  totalVotes, 
  isAnimating = false,
  className = '' 
}) => {
  const challengerPercentage = totalVotes > 0 ? Math.round((challengerVotes / totalVotes) * 100) : 0;
  const defenderPercentage = totalVotes > 0 ? Math.round((defenderVotes / totalVotes) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Vote counts */}
      <div className="flex justify-between text-sm text-gray-300 mb-2">
        <span className="font-semibold">
          Challenger: {challengerVotes}
        </span>
        <span className="font-semibold">
          Defender: {defenderVotes}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div className="flex h-3 rounded-full overflow-hidden">
          <div
            className={`bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{ width: `${challengerPercentage}%` }}
          />
          <div
            className={`bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{ width: `${defenderPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Percentages */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{challengerPercentage}%</span>
        <span>{defenderPercentage}%</span>
      </div>
      
      {/* Total votes */}
      <div className="text-center text-xs text-gray-500 mt-2">
        {totalVotes} total votes
      </div>
    </div>
  );
};

export default ProgressBar;
