import React, { useState, useEffect } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useMyRank } from '../../hooks/useMyRank';
import { useLbSocket } from '../../hooks/useLbSocket';
import LeaderboardList from './LeaderboardList';
import MyRankStrip from './MyRankStrip';
import WeeklyChampionsBanner from './WeeklyChampionsBanner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';

const LeaderboardsHub = () => {
  const {
    activeTab,
    activePeriod,
    selectedCountry,
    setActiveTab,
    setActivePeriod,
    setSelectedCountry,
    getCurrentData,
    formatPoints,
    getMotivationalMessage,
    isInitialized
  } = useLeaderboard();

  const { getMyUserRank, getMyTribeRank } = useMyRank();
  const { isConnected, realTimeEnabled } = useLbSocket();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current leaderboard data
  const currentData = getCurrentData();

  // Get my rank data
  const myUserRank = getMyUserRank(activePeriod);
  const myTribeRank = getMyTribeRank(activePeriod);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  // Handle country change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Search functionality would be implemented here
  };

  // Get tab display name
  const getTabDisplayName = (tab) => {
    const names = {
      tribes: 'Tribes',
      users: 'Individuals',
      country: 'Country'
    };
    return names[tab] || tab;
  };

  // Get period display name
  const getPeriodDisplayName = (period) => {
    const names = {
      weekly: 'Weekly',
      all: 'All-Time'
    };
    return names[period] || period;
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader size="large" />
          <p className="text-white mt-4">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Leaderboards</h1>
              <p className="text-gray-300 mt-1">See who's winning across Afroverse</p>
            </div>
            
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Champions Banner */}
      <WeeklyChampionsBanner />

      {/* My Rank Strip */}
      <MyRankStrip />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
            {['tribes', 'users', 'country'].map((tab) => (
              <Button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white text-black font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {getTabDisplayName(tab)}
              </Button>
            ))}
          </div>

          {/* Period Toggle */}
          {activeTab !== 'country' && (
            <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
              {['weekly', 'all'].map((period) => (
                <Button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    activePeriod === period
                      ? 'bg-white text-black font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {getPeriodDisplayName(period)}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Country Selector (for country tab) */}
        {activeTab === 'country' && (
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <label className="text-white font-medium">Country:</label>
                <select
                  value={selectedCountry || ''}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="bg-black/20 text-white border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select Country</option>
                  <option value="ZA">South Africa</option>
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                  <option value="EG">Egypt</option>
                </select>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowSearch(!showSearch)}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              🔍 Search
            </Button>
            
            {showSearch && (
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by username or tribe name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-black/20 text-white border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard List */}
        <LeaderboardList
          scope={activeTab}
          period={activePeriod}
          country={selectedCountry}
          data={currentData}
        />

        {/* Motivational Message */}
        {myUserRank && myUserRank.rank && (
          <div className="mt-8">
            <Card className="p-6 text-center">
              <p className="text-white text-lg">
                {getMotivationalMessage(myUserRank.rank, 'users')}
              </p>
              {myUserRank.rank && (
                <p className="text-gray-300 mt-2">
                  You're #{myUserRank.rank} with {formatPoints(myUserRank.points)} points
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardsHub;
