import React, { useState, useEffect } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../hooks/useAuth';
import VoteButton from './VoteButton';
import ProgressBar from './ProgressBar';
import Timer from './Timer';
import Button from '../common/Button';
import ConfettiLayer from './ConfettiLayer';

const FeedBattleCard = ({ battle, onVote, onShare, onBoost }) => {
  const { 
    isVoting,
    hasVoted,
    userVotes,
    isBattleActive,
    isBattleCompleted,
    isBattleExpired,
    calculateVotePercentage,
    formatTimeRemaining
  } = useFeed();
  
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const battleId = battle.battleId;
  const hasUserVoted = hasVoted[battleId] || false;
  const userVote = userVotes[battleId] || null;

  const handleVote = async (choice) => {
    if (!isBattleActive(battle) || isVoting) return;
    
    setIsAnimating(true);
    setShowConfetti(true);
    
    try {
      await onVote(battleId, choice);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsAnimating(false);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleShare = () => {
    onShare(battle);
  };

  const handleBoost = () => {
    onBoost(battle);
  };

  const challengerPercentage = calculateVotePercentage(battle.votes, 'challenger');
  const defenderPercentage = calculateVotePercentage(battle.votes, 'defender');

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Confetti Layer */}
      <ConfettiLayer 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Timer 
              endsAt={battle.endsAt} 
              status={battle.status}
              className="text-white"
            />
            <span className="text-sm text-gray-300">
              #{battle.shortCode}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {battle.boost?.active && (
              <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                🔥 Promoted
              </div>
            )}
            <Button
              onClick={() => {/* Report functionality */}}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              🚩
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-full pt-16 pb-24">
        {/* Battle Cards */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Challenger Card */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
                <img
                  src={battle.cards.challenger.transformUrl}
                  alt={`${battle.cards.challenger.username}'s transformation`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">
                      {battle.cards.challenger.username}
                    </h3>
                    {battle.cards.challenger.userBadge && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {battle.cards.challenger.userBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {battle.cards.challenger.tribe}
                  </p>
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-xl">VS</span>
              </div>
            </div>

            {/* Defender Card */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
                {battle.cards.defender ? (
                  <img
                    src={battle.cards.defender.transformUrl}
                    alt={`${battle.cards.defender.username}'s transformation`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-400 text-lg">Waiting...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  {battle.cards.defender ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold text-lg">
                          {battle.cards.defender.username}
                        </h3>
                        {battle.cards.defender.userBadge && (
                          <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {battle.cards.defender.userBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">
                        {battle.cards.defender.tribe}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Waiting for acceptance
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isBattleActive(battle) && battle.votes.total > 0 && (
          <div className="px-4 mb-6">
            <ProgressBar
              challengerVotes={battle.votes.challenger}
              defenderVotes={battle.votes.defender}
              totalVotes={battle.votes.total}
              isAnimating={isAnimating}
            />
          </div>
        )}

        {/* Battle Result */}
        {isBattleCompleted(battle) && (
          <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-yellow-400 text-lg font-semibold mb-2">
                  🏆 Battle Complete!
                </div>
                <div className="text-gray-300 text-sm">
                  Winner: {battle.result?.winnerUsername || 'Unknown'}
                </div>
                {battle.result?.marginPct && (
                  <div className="text-gray-400 text-xs">
                    Won by {battle.result.marginPct}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          {/* Vote Buttons */}
          <div className="flex space-x-4">
            <VoteButton
              choice="challenger"
              onClick={handleVote}
              disabled={!isBattleActive(battle)}
              isVoting={isVoting}
              hasVoted={hasUserVoted}
              userVote={userVote}
              voteCount={battle.votes.challenger}
              totalVotes={battle.votes.total}
              className="min-w-[120px]"
            />
            
            {battle.cards.defender && (
              <VoteButton
                choice="defender"
                onClick={handleVote}
                disabled={!isBattleActive(battle)}
                isVoting={isVoting}
                hasVoted={hasUserVoted}
                userVote={userVote}
                voteCount={battle.votes.defender}
                totalVotes={battle.votes.total}
                className="min-w-[120px]"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              📤 Share
            </Button>
            
            {user && (battle.challenger?.userId === user.id || battle.defender?.userId === user.id) && (
              <Button
                onClick={handleBoost}
                variant="outline"
                size="sm"
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black"
              >
                🔥 Boost
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedBattleCard;
