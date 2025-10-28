import React, { useState, useEffect, useRef } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import LeaderboardRow from './LeaderboardRow';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';

const LeaderboardList = ({ scope, period, country, data = {} }) => {
  const { loadMore, formatPoints } = useLeaderboard();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef(null);

  // Safely extract data with defaults
  const {
    items = [],
    loading = false,
    error = null,
    nextCursor = null
  } = data;

  // Handle load more
  const handleLoadMore = async () => {
    if (isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      await loadMore(scope, period);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle scroll to load more
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && nextCursor && !isLoadingMore) {
      handleLoadMore();
    }
  };

  // Get empty state message
  const getEmptyMessage = () => {
    if (scope === 'tribes') {
      return 'No tribes found. Start a battle to enter the leaderboard!';
    } else if (scope === 'users') {
      return 'No users found. Start a battle to enter the leaderboard!';
    } else if (scope === 'country') {
      return 'No users found in this country. Start a battle to enter the leaderboard!';
    }
    return 'No data found.';
  };

  // Get loading message
  const getLoadingMessage = () => {
    if (scope === 'tribes') {
      return 'Loading tribes...';
    } else if (scope === 'users') {
      return 'Loading users...';
    } else if (scope === 'country') {
      return 'Loading country leaderboard...';
    }
    return 'Loading...';
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader size="large" />
          <p className="text-white mt-4">{getLoadingMessage()}</p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-4">⚠️</div>
        <p className="text-white text-lg mb-4">Failed to load leaderboard</p>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <p className="text-white text-lg mb-4">No data yet</p>
        <p className="text-gray-300">{getEmptyMessage()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {scope === 'tribes' ? 'Tribe' : 'Individual'} Leaderboard
            </h2>
            <p className="text-gray-300">
              {period === 'weekly' ? 'This week' : 'All time'}
              {country && ` • ${country}`}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-white font-semibold">
              {items.length} {scope === 'tribes' ? 'tribes' : 'users'}
            </p>
            <p className="text-gray-300 text-sm">
              {nextCursor ? 'More available' : 'All loaded'}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="max-h-96 overflow-y-auto space-y-2"
      >
        {items.map((item, index) => (
          <LeaderboardRow
            key={item.tribeId || item.userId || index}
            item={item}
            scope={scope}
            period={period}
            rank={item.rank}
            index={index}
          />
        ))}
      </div>

      {/* Load More Button */}
      {nextCursor && (
        <div className="text-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Loading...</span>
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Footer Stats */}
      <div className="bg-black/20 rounded-lg p-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-white font-semibold">
              {items.length}
            </p>
            <p className="text-gray-300 text-sm">
              {scope === 'tribes' ? 'Tribes' : 'Users'}
            </p>
          </div>
          
          <div>
            <p className="text-white font-semibold">
              {items.length > 0 && items[0]?.points ? formatPoints(items[0].points) : '0'}
            </p>
            <p className="text-gray-300 text-sm">Top Score</p>
          </div>
          
          <div>
            <p className="text-white font-semibold">
              {items.length > 0 && items[0]?.rank ? items[0].rank : '0'}
            </p>
            <p className="text-gray-300 text-sm">#1 Rank</p>
          </div>
          
          <div>
            <p className="text-white font-semibold">
              {period === 'weekly' ? '7' : '∞'}
            </p>
            <p className="text-gray-300 text-sm">Days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardList;
