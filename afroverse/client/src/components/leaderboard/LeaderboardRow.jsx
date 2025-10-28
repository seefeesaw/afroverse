import React, { useState, useEffect } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useMyRank } from '../../hooks/useMyRank';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

const LeaderboardRow = ({ item, scope, period, rank, index }) => {
  const { shareUserRank, formatPoints, getRankMedal } = useLeaderboard();
  const { getMyUserRank } = useMyRank();
  
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState(false);

  // Check if this is the current user
  const myRank = getMyUserRank(period);
  const isCurrentUser = myRank && item.userId === myRank.userId;

  // Get rank medal
  const rankMedal = getRankMedal(rank);

  // Get tribe chip
  const getTribeChip = () => {
    if (scope === 'users' && item.tribe) {
      return (
        <div className="flex items-center space-x-1">
          <span className="text-xs">{item.tribe.emblem?.icon || '🏛️'}</span>
          <span className="text-xs text-gray-300">{item.tribe.name}</span>
        </div>
      );
    }
    return null;
  };

  // Get avatar
  const getAvatar = () => {
    if (scope === 'tribes') {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {item.emblem?.icon || '🏛️'}
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            item.username?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
      );
    }
  };

  // Get name
  const getName = () => {
    if (scope === 'tribes') {
      return item.displayName || item.name;
    } else {
      return item.username;
    }
  };

  // Get points
  const getPoints = () => {
    return item.points || 0;
  };

  // Get additional stats
  const getAdditionalStats = () => {
    if (scope === 'tribes') {
      return (
        <div className="text-xs text-gray-300">
          {item.members || 0} members
        </div>
      );
    } else {
      return (
        <div className="text-xs text-gray-300">
          {item.streak || 0} day streak
        </div>
      );
    }
  };

  // Handle share
  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const shareData = {
        scope: scope === 'tribes' ? 'tribes' : 'users',
        period,
        rank,
        points: getPoints(),
        name: getName(),
        tribe: scope === 'users' ? item.tribe?.name : null
      };

      await shareUserRank(shareData.scope, shareData.period, shareData.rank, shareData.points, shareData.name, shareData.tribe);
      
      // Show success feedback
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Animate points on mount
  useEffect(() => {
    setPointsAnimation(true);
    const timer = setTimeout(() => setPointsAnimation(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Card className={`p-4 transition-all duration-300 hover:bg-white/5 ${
        isCurrentUser ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''
      }`}>
        <div className="flex items-center justify-between">
          {/* Left side - Rank and Avatar */}
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {rankMedal}
              </div>
              <div className="text-xs text-gray-300">
                #{rank}
              </div>
            </div>

            {/* Avatar */}
            {getAvatar()}

            {/* Name and Stats */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-semibold">
                  {getName()}
                </h3>
                {isCurrentUser && (
                  <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-semibold">
                    YOU
                  </span>
                )}
              </div>
              
              {getTribeChip()}
              {getAdditionalStats()}
            </div>
          </div>

          {/* Right side - Points and Actions */}
          <div className="flex items-center space-x-4">
            {/* Points */}
            <div className="text-right">
              <div className={`text-xl font-bold text-white transition-all duration-500 ${
                pointsAnimation ? 'scale-110' : 'scale-100'
              }`}>
                {formatPoints(getPoints())}
              </div>
              <div className="text-xs text-gray-300">
                points
              </div>
            </div>

            {/* Share Button */}
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 px-3 py-2"
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '📤'
              )}
            </Button>
          </div>
        </div>

        {/* Delta indicator */}
        {item.delta && (
          <div className="mt-2 flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.delta > 0 
                ? 'bg-green-400/20 text-green-400' 
                : item.delta < 0 
                ? 'bg-red-400/20 text-red-400' 
                : 'bg-gray-400/20 text-gray-400'
            }`}>
              {item.delta > 0 ? '↑' : item.delta < 0 ? '↓' : '='} {Math.abs(item.delta)}
            </span>
            <span className="text-xs text-gray-300">
              {item.delta > 0 ? 'points gained' : item.delta < 0 ? 'points lost' : 'no change'}
            </span>
          </div>
        )}
      </Card>

      {/* Share Success Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rank Shared!
            </h3>
            <p className="text-gray-600">
              Your rank has been shared successfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaderboardRow;
