import React, { useState, useEffect, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../hooks/useAuth';
import FeedBattleCard from './FeedBattleCard';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Toast from '../common/Toast';
import ShareButtons from '../battle/ShareButtons';

const FeedScreen = () => {
  const { user } = useAuth();
  
  const {
    videos = [],
    loading,
    error,
    getFeed,
    voteOnBattle,
    clearError,
    currentVideoIndex = 0,
    navigateToNextVideo,
    navigateToPreviousVideo,
    navigateToVideo
  } = useFeed();
  
  const [showError, setShowError] = useState(false);
  const [showShareModal, setShowShareModalLocal] = useState(false);
  const [showBoostModal, setShowBoostModalLocal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

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

  // Load initial feed
  useEffect(() => {
    if (videos.length === 0 && !loading) {
      getFeed('battles', null, 10);
    }
  }, [getFeed, videos.length, loading]);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentVideoIndex < videos.length - 1) {
      navigateToNextVideo();
    }
    if (isDownSwipe && currentVideoIndex > 0) {
      navigateToPreviousVideo();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (currentVideoIndex < videos.length - 1) {
            navigateToNextVideo();
          }
          break;
        case 'ArrowDown':
          if (currentVideoIndex > 0) {
            navigateToPreviousVideo();
          }
          break;
        case 'Escape':
          setShowShareModalLocal(false);
          setShowBoostModalLocal(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length, navigateToNextVideo, navigateToPreviousVideo]);

  const handleVote = async (battleId, choice) => {
    try {
      await voteOnBattle(battleId, choice);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleShare = (battle) => {
    setSelectedBattle(battle);
    setShowShareModalLocal(true);
  };

  const handleBoost = (battle) => {
    setSelectedBattle(battle);
    setShowBoostModalLocal(true);
  };

  const handleCreateBattle = () => {
    window.location.href = '/transform';
  };

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader size="xl" color="white" />
          <p className="text-white mt-4">Loading battles...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚔️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">No Active Battles</h1>
          <p className="text-gray-300 mb-6">
            Be the first to create a transformation battle!
          </p>
          <Button
            onClick={handleCreateBattle}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            ⚔️ Create Battle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Main Feed Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Battle Card */}
        {videos[currentVideoIndex] && (
          <div className="absolute inset-0">
            <FeedBattleCard
              battle={videos[currentVideoIndex]}
              onVote={handleVote}
              onShare={handleShare}
              onBoost={handleBoost}
            />
          </div>
        )}

        {/* Navigation Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <div className="flex flex-col space-y-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToVideo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentVideoIndex
                    ? 'bg-white scale-125'
                    : 'bg-gray-500 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Swipe Instructions */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div className="text-white text-xs">
              <div className="flex items-center space-x-2">
                <span>👆</span>
                <span>Swipe up/down to navigate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Counter */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-semibold">
              {currentVideoIndex + 1} / {videos.length}
            </span>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedBattle && (
        <ShareButtons
          shareUrl={selectedBattle.shareUrl}
          shareText="Check out this epic transformation battle! ⚔️"
          onClose={() => {
            setShowShareModalLocal(false);
            setSelectedBattle(null);
          }}
        />
      )}

      {/* Boost Modal */}
      {showBoostModal && selectedBattle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Boost Battle</h2>
              <p className="text-gray-300 text-sm">
                Make your battle more visible in the feed for 2 hours
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Boost Benefits</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Higher ranking in feed</li>
                  <li>• "Promoted" badge visible</li>
                  <li>• 2 hours of increased visibility</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">$0.99</div>
                <div className="text-gray-400 text-sm">2 hours boost</div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowBoostModalLocal(false);
                  setSelectedBattle(null);
                }}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement boost purchase
                  console.log('Boost purchase:', selectedBattle.battleId);
                  setShowBoostModalLocal(false);
                  setSelectedBattle(null);
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                🔥 Boost Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && error && (
        <Toast
          message={error}
          type="error"
          onClose={() => {
            setShowError(false);
            clearError();
          }}
        />
      )}
    </div>
  );
};

export default FeedScreen;
