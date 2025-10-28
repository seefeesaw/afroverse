import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattle } from '../../hooks/useBattle';
import { useAuth } from '../../hooks/useAuth';
import BattleCard from './BattleCard';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Card from '../common/Card';

const BattleFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    activeBattles,
    isLoadingFeed,
    hasMoreBattles,
    feedCursor,
    listActiveBattles,
    voteOnBattle,
    error,
    clearError
  } = useBattle();
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showError, setShowError] = useState(false);

  // Load initial battles
  useEffect(() => {
    if (activeBattles.length === 0) {
      listActiveBattles();
    }
  }, [listActiveBattles, activeBattles.length]);

  // Show error toast
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreBattles) return;
    
    setIsLoadingMore(true);
    try {
      await listActiveBattles(feedCursor, 10);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleVote = async (battleId, choice) => {
    try {
      await voteOnBattle(battleId, choice);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleViewBattle = (shortCode) => {
    navigate(`/b/${shortCode}`);
  };

  const handleCreateBattle = () => {
    navigate('/transform');
  };

  if (isLoadingFeed && activeBattles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader size="xl" color="white" />
          <p className="text-white mt-4">Loading battles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚔️</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Active Battles</h1>
          </div>
          
          <p className="text-gray-300 text-lg mb-6">
            Vote on epic transformation battles happening right now!
          </p>
          
          <Button
            onClick={handleCreateBattle}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            ⚔️ Create New Battle
          </Button>
        </div>

        {/* Battles Grid */}
        {activeBattles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeBattles.map((battle) => (
              <BattleCard
                key={battle.battleId}
                battle={battle}
                onVote={handleVote}
                onView={handleViewBattle}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⚔️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Active Battles</h2>
            <p className="text-gray-300 mb-6">
              Be the first to create a transformation battle!
            </p>
            <Button
              onClick={handleCreateBattle}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              ⚔️ Create Battle
            </Button>
          </Card>
        )}

        {/* Load More Button */}
        {hasMoreBattles && activeBattles.length > 0 && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Battles'}
            </Button>
          </div>
        )}

        {/* Error Toast */}
        {showError && error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleFeed;
