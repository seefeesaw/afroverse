import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattle } from '../../hooks/useBattle';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';

const BattleCard = ({ battle, onVote, onView }) => {
  const navigate = useNavigate();
  const { 
    calculateVotePercentage, 
    formatTimeRemaining, 
    getBattleStatusColor,
    getBattleStatusText,
    isBattleActive,
    isBattleCompleted,
    isBattleExpired 
  } = useBattle();
  
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

  const handleUsernameClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleVote = async (choice) => {
    if (!isBattleActive(battle) || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(battle.battleId, choice);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleView = () => {
    onView(battle.shortCode);
  };

  const challengerPercentage = calculateVotePercentage(battle.votes, 'challenger');
  const defenderPercentage = calculateVotePercentage(battle.votes, 'defender');
  const statusColor = getBattleStatusColor(battle.status);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Battle Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400">#{battle.shortCode}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColor === 'green' ? 'bg-green-900 text-green-300' :
              statusColor === 'yellow' ? 'bg-yellow-900 text-yellow-300' :
              statusColor === 'blue' ? 'bg-blue-900 text-blue-300' :
              'bg-gray-700 text-gray-300'
            }`}>
              {getBattleStatusText(battle.status)}
            </span>
          </div>
          
          {isBattleActive(battle) && (
            <div className="text-sm text-gray-400">
              {formatTimeRemaining(battle.timeRemaining)}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {battle.votes.total} votes
          </div>
          
          <Button
            onClick={handleView}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            View Battle
          </Button>
        </div>
      </div>

      {/* Battle Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Challenger Card */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
              <img
                src={battle.cards.challenger.transformUrl}
                alt={`${battle.cards.challenger.username}'s transformation`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-2 text-center">
              <h4 
                className="text-sm font-semibold text-white cursor-pointer hover:text-orange-400 transition-colors"
                onClick={() => handleUsernameClick(battle.cards.challenger.username)}
              >
                {battle.cards.challenger.username}
              </h4>
              <p className="text-xs text-gray-400">
                {battle.cards.challenger.tribe}
              </p>
              <div className="text-xs text-gray-300 mt-1">
                {challengerPercentage}%
              </div>
            </div>
            
            {/* Vote Button */}
            {isBattleActive(battle) && (
              <Button
                onClick={() => handleVote('challenger')}
                disabled={isVoting}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
              >
                {isVoting ? '...' : '✓'}
              </Button>
            )}
          </div>

          {/* VS Divider */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          </div>

          {/* Defender Card */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
              {battle.cards.defender ? (
                <img
                  src={battle.cards.defender.transformUrl}
                  alt={`${battle.cards.defender.username}'s transformation`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⏳</div>
                    <p className="text-xs text-gray-400">Waiting...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-center">
              {battle.cards.defender ? (
                <>
                  <h4 
                    className="text-sm font-semibold text-white cursor-pointer hover:text-orange-400 transition-colors"
                    onClick={() => handleUsernameClick(battle.cards.defender.username)}
                  >
                    {battle.cards.defender.username}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {battle.cards.defender.tribe}
                  </p>
                  <div className="text-xs text-gray-300 mt-1">
                    {defenderPercentage}%
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400">
                  Waiting for acceptance
                </div>
              )}
            </div>
            
            {/* Vote Button */}
            {isBattleActive(battle) && battle.cards.defender && (
              <Button
                onClick={() => handleVote('defender')}
                disabled={isVoting}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
              >
                {isVoting ? '...' : '✓'}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isBattleActive(battle) && battle.votes.total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{challengerPercentage}%</span>
              <span>{defenderPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="flex h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${challengerPercentage}%` }}
                />
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: `${defenderPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Battle Result */}
        {isBattleCompleted(battle) && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg">
            <div className="text-center">
              <div className="text-yellow-400 text-sm font-semibold mb-1">
                Battle Complete!
              </div>
              <div className="text-gray-300 text-xs">
                Winner: {battle.result?.winnerUsername || 'Unknown'}
              </div>
              {battle.result?.marginPct && (
                <div className="text-gray-400 text-xs">
                  Won by {battle.result.marginPct}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expired State */}
        {isBattleExpired(battle) && (
          <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-sm">
                Battle expired
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BattleCard;
