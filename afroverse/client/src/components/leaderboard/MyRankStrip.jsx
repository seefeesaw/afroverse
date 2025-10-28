import React, { useState, useEffect } from 'react';
import { useMyRank } from '../../hooks/useMyRank';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

const MyRankStrip = () => {
  const { getMyUserRank, getMyTribeRank, getRankChange, getMotivationalMessage } = useMyRank();
  const { activeTab, activePeriod, formatPoints, getRankMedal } = useLeaderboard();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Get current rank data
  const myUserRank = getMyUserRank(activePeriod);
  const myTribeRank = getMyTribeRank(activePeriod);

  // Get rank change
  const userRankChange = getRankChange('users', activePeriod);
  const tribeRankChange = getRankChange('tribes', activePeriod);

  // Get motivational message
  const motivationalMessage = getMotivationalMessage('users', activePeriod);

  // Animate on mount
  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get rank display
  const getRankDisplay = (rank) => {
    if (!rank || rank.rank === null) return 'Unranked';
    return `#${rank.rank}`;
  };

  // Get points display
  const getPointsDisplay = (rank) => {
    if (!rank || !rank.points) return '0';
    return formatPoints(rank.points);
  };

  // Get change indicator
  const getChangeIndicator = (change) => {
    if (!change) return null;
    
    const { direction, change: changeValue } = change;
    
    if (direction === 'up') {
      return (
        <span className="text-green-400 text-sm">
          ↑ {changeValue}
        </span>
      );
    } else if (direction === 'down') {
      return (
        <span className="text-red-400 text-sm">
          ↓ {changeValue}
        </span>
      );
    } else {
      return (
        <span className="text-gray-400 text-sm">
          =
        </span>
      );
    }
  };

  // Get rank tier color
  const getRankTierColor = (rank) => {
    if (!rank || !rank.rank) return 'text-gray-400';
    
    const rankValue = rank.rank;
    
    if (rankValue === 1) return 'text-yellow-400';
    if (rankValue <= 3) return 'text-orange-400';
    if (rankValue <= 10) return 'text-blue-400';
    if (rankValue <= 50) return 'text-green-400';
    return 'text-gray-400';
  };

  if (!myUserRank && !myTribeRank) {
    return null;
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* User Rank */}
              {myUserRank && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                    {myUserRank.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {getRankDisplay(myUserRank)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {getPointsDisplay(myUserRank)} points
                    </div>
                  </div>
                  {getChangeIndicator(userRankChange)}
                </div>
              )}

              {/* Tribe Rank */}
              {myTribeRank && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {myTribeRank.tribe?.emblem?.icon || '🏛️'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {getRankDisplay(myTribeRank)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {getPointsDisplay(myTribeRank)} points
                    </div>
                  </div>
                  {getChangeIndicator(tribeRankChange)}
                </div>
              )}
            </div>

            {/* Expand Button */}
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-white/10 text-white hover:bg-white/20 px-3 py-2"
            >
              📊 View Details
            </Button>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Your Rankings</h3>
              <Button
                onClick={() => setIsExpanded(false)}
                className="bg-white/10 text-white hover:bg-white/20 px-3 py-2"
              >
                ✕
              </Button>
            </div>

            {/* Rank Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Rank Card */}
              {myUserRank && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                        {myUserRank.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Personal Rank</h4>
                        <p className="text-gray-300 text-sm">Individual leaderboard</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getRankTierColor(myUserRank)}`}>
                        {getRankDisplay(myUserRank)}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {getPointsDisplay(myUserRank)} points
                      </div>
                      {getChangeIndicator(userRankChange)}
                    </div>
                  </div>
                </Card>
              )}

              {/* Tribe Rank Card */}
              {myTribeRank && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {myTribeRank.tribe?.emblem?.icon || '🏛️'}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Tribe Rank</h4>
                        <p className="text-gray-300 text-sm">{myTribeRank.tribe?.name || 'No tribe'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getRankTierColor(myTribeRank)}`}>
                        {getRankDisplay(myTribeRank)}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {getPointsDisplay(myTribeRank)} points
                      </div>
                      {getChangeIndicator(tribeRankChange)}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Motivational Message */}
            {motivationalMessage && (
              <Card className="p-4 text-center">
                <p className="text-white text-lg">
                  {motivationalMessage}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRankStrip;
