import React, { useState, useEffect } from 'react';
import { useBattle } from '../../hooks/useBattle';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';

const BattleResult = ({ isOpen, onClose, battleData }) => {
  const { shareToSocial, copyToClipboard } = useBattle();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Show confetti animation on mount
  useEffect(() => {
    if (isOpen && battleData?.result) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, battleData]);

  const handleShare = (platform) => {
    const battleText = `I ${battleData.result.isWinner ? 'won' : 'participated in'} an epic transformation battle! ⚔️`;
    shareToSocial(platform, battleData.shareUrl, battleText);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(battleData.shareUrl);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleCreateNewBattle = () => {
    onClose();
    // Navigate to transform page
    window.location.href = '/transform';
  };

  const handleViewBattle = () => {
    onClose();
    // Navigate to battle page
    window.location.href = `/b/${battleData.shortCode}`;
  };

  if (!battleData?.result) {
    return null;
  }

  const isWinner = battleData.result.isWinner;
  const marginPct = battleData.result.marginPct;
  const tribePoints = battleData.result.tribePointsAwarded;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 relative">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className={`confetti confetti-${i % 5}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5]
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          {/* Winner/Loser Icon */}
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isWinner 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <span className="text-4xl">
              {isWinner ? '🏆' : '💪'}
            </span>
          </div>

          {/* Result Text */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {isWinner ? 'Victory!' : 'Battle Complete!'}
          </h2>
          
          <p className="text-gray-300 text-lg mb-2">
            {isWinner 
              ? `You won by ${marginPct}%!` 
              : `You earned ${tribePoints} tribe points!`
            }
          </p>

          {/* Tribe Points */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg px-4 py-2">
            <span className="text-purple-400">⭐</span>
            <span className="text-purple-300 font-semibold">
              +{tribePoints} Tribe Points
            </span>
          </div>
        </div>

        {/* Battle Stats */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Battle Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {battleData.votes.challenger}
                </div>
                <div className="text-sm text-gray-400">Challenger Votes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {battleData.votes.defender}
                </div>
                <div className="text-sm text-gray-400">Defender Votes</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-lg font-bold text-white">
                {battleData.votes.total} Total Votes
              </div>
            </div>
          </div>
        </Card>

        {/* Share Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 text-center">
            Share Your {isWinner ? 'Victory' : 'Battle'}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare('whatsapp')}
              className="bg-green-500 hover:bg-green-600 text-white p-3 flex items-center justify-center space-x-2"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">WhatsApp</span>
            </Button>
            
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-blue-400 hover:bg-blue-500 text-white p-3 flex items-center justify-center space-x-2"
            >
              <span className="text-lg">🐦</span>
              <span className="text-sm font-medium">Twitter</span>
            </Button>
            
            <Button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 flex items-center justify-center space-x-2"
            >
              <span className="text-lg">📘</span>
              <span className="text-sm font-medium">Facebook</span>
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white p-3 flex items-center justify-center space-x-2"
            >
              <span className="text-lg">📋</span>
              <span className="text-sm font-medium">Copy Link</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleViewBattle}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            View Battle
          </Button>
          
          <Button
            onClick={handleCreateNewBattle}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            ⚔️ New Battle
          </Button>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Confetti Styles */}
      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Modal>
  );
};

export default BattleResult;
