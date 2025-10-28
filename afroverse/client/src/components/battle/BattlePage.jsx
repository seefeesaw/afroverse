import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattle } from '../../hooks/useBattle';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Toast from '../common/Toast';
import ShareButtons from './ShareButtons';

const BattlePage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    currentBattle,
    isLoadingBattle,
    isVoting,
    hasVoted,
    userVote,
    error,
    getBattle,
    voteOnBattle,
    formatTimeRemaining,
    calculateVotePercentage,
    isBattleActive,
    isBattleCompleted,
    isBattleExpired,
    getBattleProgress,
    shareToSocial,
    copyToClipboard,
    clearError
  } = useBattle();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Load battle on mount
  useEffect(() => {
    if (shortCode) {
      getBattle(shortCode);
    }
  }, [shortCode, getBattle]);

  // Update time remaining
  useEffect(() => {
    if (currentBattle && currentBattle.timeRemaining > 0) {
      setTimeRemaining(currentBattle.timeRemaining);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentBattle]);

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

  const handleVote = async (choice) => {
    if (!currentBattle || !isBattleActive(currentBattle) || isVoting) return;
    
    try {
      await voteOnBattle(currentBattle.battleId, choice);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleShare = (platform) => {
    const battleText = `Check out this epic transformation battle! ⚔️`;
    shareToSocial(platform, currentBattle.shareUrl, battleText);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(currentBattle.shareUrl);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleCreateBattle = () => {
    navigate('/transform');
  };

  if (isLoadingBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader size="xl" color="white" />
          <p className="text-white mt-4">Loading battle...</p>
        </div>
      </div>
    );
  }

  if (!currentBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Battle Not Found</h1>
          <p className="text-gray-300 mb-6">
            This battle doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate('/battles')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            View Active Battles
          </Button>
        </Card>
      </div>
    );
  }

  const challengerPercentage = calculateVotePercentage(currentBattle.votes, 'challenger');
  const defenderPercentage = calculateVotePercentage(currentBattle.votes, 'defender');
  const progress = getBattleProgress(currentBattle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Battle Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚔️</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Battle #{currentBattle.shortCode}</h1>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{currentBattle.votes.total} votes</span>
            </div>
            
            {isBattleActive(currentBattle) && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span>{formatTimeRemaining(timeRemaining)} left</span>
              </div>
            )}
            
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              📤 Share
            </Button>
          </div>
        </div>

        {/* Battle Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Challenger Card */}
          <Card className="relative overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentBattle.challenger.username}
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentBattle.challenger.tribe}
                </p>
              </div>
              
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4">
                <img
                  src={currentBattle.challenger.transformUrl}
                  alt={`${currentBattle.challenger.username}'s transformation`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {challengerPercentage}%
                </div>
                <div className="text-sm text-gray-300">
                  {currentBattle.votes.challenger} votes
                </div>
              </div>
              
              {/* Vote Button */}
              {isBattleActive(currentBattle) && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleVote('challenger')}
                    disabled={isVoting || hasVoted}
                    className={`w-full ${
                      hasVoted && userVote === 'challenger'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    } disabled:opacity-50`}
                  >
                    {isVoting ? 'Voting...' : 
                     hasVoted && userVote === 'challenger' ? '✓ Voted' : 
                     'Vote for Challenger'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Defender Card */}
          <Card className="relative overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentBattle.defender ? currentBattle.defender.username : 'Waiting...'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentBattle.defender ? currentBattle.defender.tribe : 'For acceptance'}
                </p>
              </div>
              
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4">
                {currentBattle.defender ? (
                  <img
                    src={currentBattle.defender.transformUrl}
                    alt={`${currentBattle.defender.username}'s transformation`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-400">Waiting for acceptance</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {defenderPercentage}%
                </div>
                <div className="text-sm text-gray-300">
                  {currentBattle.votes.defender} votes
                </div>
              </div>
              
              {/* Vote Button */}
              {isBattleActive(currentBattle) && currentBattle.defender && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleVote('defender')}
                    disabled={isVoting || hasVoted}
                    className={`w-full ${
                      hasVoted && userVote === 'defender'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                    } disabled:opacity-50`}
                  >
                    {isVoting ? 'Voting...' : 
                     hasVoted && userVote === 'defender' ? '✓ Voted' : 
                     'Vote for Defender'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        {isBattleActive(currentBattle) && currentBattle.votes.total > 0 && (
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>Challenger: {challengerPercentage}%</span>
                <span>Defender: {defenderPercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${challengerPercentage}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${defenderPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Battle Status */}
        {isBattleCompleted(currentBattle) && (
          <Card className="mb-8">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Battle Complete!</h2>
              <p className="text-gray-300 mb-4">
                Winner: {currentBattle.result?.winnerUsername || 'Unknown'}
              </p>
              {currentBattle.result?.marginPct && (
                <p className="text-gray-400 text-sm">
                  Won by {currentBattle.result.marginPct}%
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Expired State */}
        {isBattleExpired(currentBattle) && (
          <Card className="mb-8">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">⏰</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Battle Expired</h2>
              <p className="text-gray-300 mb-4">
                This battle has ended
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleCreateBattle}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            ⚔️ Create New Battle
          </Button>
          
          <Button
            onClick={() => navigate('/battles')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            View All Battles
          </Button>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <ShareButtons
            shareUrl={currentBattle.shareUrl}
            shareText="Check out this epic transformation battle! ⚔️"
            onClose={() => setShowShareModal(false)}
          />
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
    </div>
  );
};

export default BattlePage;
