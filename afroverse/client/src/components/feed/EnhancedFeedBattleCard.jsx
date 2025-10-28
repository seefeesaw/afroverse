import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Confetti from '../common/Confetti';

const EnhancedFeedBattleCard = ({ battle, onVote, onShare, onNext }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState(null);

  const handleVote = async (side) => {
    if (hasVoted) return;

    setSelectedSide(side);
    setVoteAnimation(side);
    setHasVoted(true);

    // Trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Call parent vote handler
    await onVote(battle.id, side);

    // Auto-advance after vote
    setTimeout(() => {
      if (onNext) onNext();
    }, 2000);
  };

  const leftPercentage = battle.leftVotes || 0;
  const rightPercentage = battle.rightVotes || 0;
  const totalVotes = battle.totalVotes || 0;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Battle Info Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl">⚔️</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{battle.title || 'Epic Battle'}</h3>
              <p className="text-gray-300 text-sm">{totalVotes} votes • {battle.timeRemaining || '2h left'}</p>
            </div>
          </div>
          <button
            onClick={() => onShare(battle)}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <span className="text-xl">📤</span>
          </button>
        </div>
      </div>

      {/* Main Battle Content - Side by Side */}
      <div className="absolute inset-0 flex">
        {/* Left Side */}
        <button
          onClick={() => handleVote('left')}
          disabled={hasVoted}
          className={`relative flex-1 group overflow-hidden transition-all duration-500 ${
            hasVoted ? 'cursor-default' : 'cursor-pointer'
          } ${selectedSide === 'left' ? 'scale-105 z-10' : selectedSide === 'right' ? 'scale-95 opacity-50' : ''}`}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <img
              src={battle.leftImage || '/placeholder.jpg'}
              alt={battle.leftUser || 'Contestant 1'}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent ${
              !hasVoted ? 'group-hover:from-purple-500/30' : ''
            }`} />
          </div>

          {/* User Info */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                  {battle.leftEmoji || '👤'}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{battle.leftUser || 'User 1'}</h4>
                  <p className="text-gray-300 text-sm">{battle.leftStyle || 'Maasai Warrior'}</p>
                </div>
              </div>

              {/* Vote Progress */}
              {hasVoted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">{leftPercentage}%</span>
                    <span className="text-gray-400">{battle.leftVoteCount || 0} votes</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${leftPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Vote Button */}
              {!hasVoted && (
                <div className="mt-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg py-2 text-center font-bold text-white group-hover:scale-105 transition-transform">
                    👈 Vote
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vote Animation */}
          {voteAnimation === 'left' && (
            <div className="absolute inset-0 flex items-center justify-center z-30 animate-vote-pulse">
              <div className="text-9xl">👑</div>
            </div>
          )}

          {/* Winner Badge */}
          {hasVoted && selectedSide === 'left' && leftPercentage > rightPercentage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-yellow-500 rounded-full px-6 py-3 shadow-2xl animate-bounce">
                <span className="text-2xl font-bold text-white">🏆 WINNING!</span>
              </div>
            </div>
          )}
        </button>

        {/* VS Divider */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-black">
              <span className="text-white font-bold text-lg">VS</span>
            </div>
            {hasVoted && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-bold">Swipe up ↑</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <button
          onClick={() => handleVote('right')}
          disabled={hasVoted}
          className={`relative flex-1 group overflow-hidden transition-all duration-500 ${
            hasVoted ? 'cursor-default' : 'cursor-pointer'
          } ${selectedSide === 'right' ? 'scale-105 z-10' : selectedSide === 'left' ? 'scale-95 opacity-50' : ''}`}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <img
              src={battle.rightImage || '/placeholder.jpg'}
              alt={battle.rightUser || 'Contestant 2'}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent ${
              !hasVoted ? 'group-hover:from-pink-500/30' : ''
            }`} />
          </div>

          {/* User Info */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
                  {battle.rightEmoji || '👤'}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{battle.rightUser || 'User 2'}</h4>
                  <p className="text-gray-300 text-sm">{battle.rightStyle || 'Zulu King'}</p>
                </div>
              </div>

              {/* Vote Progress */}
              {hasVoted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">{rightPercentage}%</span>
                    <span className="text-gray-400">{battle.rightVoteCount || 0} votes</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${rightPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Vote Button */}
              {!hasVoted && (
                <div className="mt-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg py-2 text-center font-bold text-white group-hover:scale-105 transition-transform">
                    Vote 👉
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vote Animation */}
          {voteAnimation === 'right' && (
            <div className="absolute inset-0 flex items-center justify-center z-30 animate-vote-pulse">
              <div className="text-9xl">👑</div>
            </div>
          )}

          {/* Winner Badge */}
          {hasVoted && selectedSide === 'right' && rightPercentage > leftPercentage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-yellow-500 rounded-full px-6 py-3 shadow-2xl animate-bounce">
                <span className="text-2xl font-bold text-white">🏆 WINNING!</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Actions Bar (after vote) */}
      {hasVoted && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-6 animate-slide-up">
          <div className="flex items-center justify-around">
            <button
              onClick={() => onShare(battle)}
              className="flex flex-col items-center space-y-1 text-white hover:scale-110 transition-transform"
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
              <span className="text-xs">Share</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 text-white hover:scale-110 transition-transform">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <span className="text-xs">Comment</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 text-white hover:scale-110 transition-transform">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <span className="text-xs">Boost</span>
            </button>
          </div>
        </div>
      )}

      {/* Swipe Hint (before vote) */}
      {!hasVoted && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm">👆 Tap to vote</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes vote-pulse {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-vote-pulse {
          animation: vote-pulse 0.8s ease-out;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnhancedFeedBattleCard;


