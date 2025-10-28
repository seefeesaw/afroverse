import React, { useState, useEffect } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';

const WeeklyChampionsBanner = () => {
  const { weeklyChampions = {}, fetchWeeklyChampions, fetchRecentChampions } = useLeaderboard();
  const [showPastWinners, setShowPastWinners] = useState(false);

  // Load champions data
  useEffect(() => {
    if (!weeklyChampions?.current) {
      fetchWeeklyChampions?.();
    }
    if (!weeklyChampions?.recent || weeklyChampions.recent.length === 0) {
      fetchRecentChampions?.();
    }
  }, [fetchWeeklyChampions, fetchRecentChampions, weeklyChampions]);

  // Get week string
  const getWeekString = (weekStart, weekEnd) => {
    if (!weekStart || !weekEnd) return 'This Week';
    
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr}–${endStr}`;
  };

  // Get time until reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + (1 + 7 - now.getUTCDay()) % 7);
    nextMonday.setUTCHours(0, 0, 0, 0);
    
    if (nextMonday <= now) {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    }
    
    const diff = nextMonday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get champion avatar
  const getChampionAvatar = (champion, type) => {
    if (type === 'tribe') {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {champion.emblem?.icon || '🏛️'}
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
          {champion.avatar ? (
            <img
              src={champion.avatar}
              alt={champion.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            champion.username?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
      );
    }
  };

  // Get champion name
  const getChampionName = (champion, type) => {
    if (type === 'tribe') {
      return champion.displayName || champion.name;
    } else {
      return champion.username;
    }
  };

  if (weeklyChampions?.loading) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <Loader size="small" />
            <span className="text-white ml-2">Loading champions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!weeklyChampions?.current) {
    return null;
  }

  const { current: champions } = weeklyChampions;
  
  // Safely extract arrays with defaults
  const tribesTop = champions?.tribesTop || [];
  const usersTop = champions?.usersTop || [];

  return (
    <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              🏆 Weekly Champions
            </h2>
            <p className="text-gray-300">
              {getWeekString(champions.weekStart, champions.weekEnd)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-white font-semibold">
              Reset in {getTimeUntilReset()}
            </p>
            <p className="text-gray-300 text-sm">
              Next Monday 00:00 UTC
            </p>
          </div>
        </div>

        {/* Champions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tribe Champions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              🏛️ Tribe Champions
            </h3>
            
            <div className="space-y-3">
              {tribesTop.slice(0, 3).map((tribe, index) => (
                <div key={tribe?.tribeId || index} className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-white">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  {getChampionAvatar(tribe, 'tribe')}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">
                      {getChampionName(tribe, 'tribe')}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {tribe?.points?.toLocaleString() || '0'} points • {tribe?.members || 0} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Champions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              👤 Individual Champions
            </h3>
            
            <div className="space-y-3">
              {usersTop.slice(0, 3).map((user, index) => (
                <div key={user?.userId || index} className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-white">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  {getChampionAvatar(user, 'user')}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">
                      {getChampionName(user, 'user')}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {user?.points?.toLocaleString() || '0'} points • {user?.streak || 0} day streak
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Past Winners Button */}
        <div className="text-center mt-6">
          <Button
            onClick={() => setShowPastWinners(true)}
            className="bg-white/10 text-white hover:bg-white/20 px-6 py-3"
          >
            📜 View Past Winners
          </Button>
        </div>

        {/* Past Winners Modal */}
        {showPastWinners && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Past Weekly Champions
                </h3>
                <Button
                  onClick={() => setShowPastWinners(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-2"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {(weeklyChampions.recent || []).map((week, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {getWeekString(week?.weekStart, week?.weekEnd)}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Tribe Champions</h5>
                        <div className="space-y-1">
                          {(week?.tribesTop || []).slice(0, 3).map((tribe, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <span className="text-sm">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {getChampionName(tribe, 'tribe')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">User Champions</h5>
                        <div className="space-y-1">
                          {(week?.usersTop || []).slice(0, 3).map((user, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <span className="text-sm">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {getChampionName(user, 'user')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyChampionsBanner;
