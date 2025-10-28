/**
 * VibraniumBattleCard - Enhanced Battle Card with Neon Purple Edge
 * 
 * Features:
 * - Neon purple edge
 * - VS lightning animation
 * - Vote buttons with confetti
 * - Smooth hover effects
 */

import React from 'react';
import VibraniumVoteButton from './VibraniumVoteButton';

const VibraniumBattleCard = ({ 
  battle,
  onVote,
  showVoteButtons = true 
}) => {
  const { challenger, defender, timeLeft, totalVotes } = battle;

  return (
    <div className="card-battle relative">
      {/* Timer Badge */}
      {timeLeft && (
        <div className="absolute top-4 right-4 badge-purple animate-glow-purple">
          ⏱️ {timeLeft}
        </div>
      )}

      {/* Battle Content */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Challenger */}
        <div className="text-center">
          <div className="relative mb-3">
            <img 
              src={challenger.imageUrl} 
              alt={challenger.name}
              className="img-battle mx-auto"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge-tribe">
              {challenger.tribe}
            </div>
          </div>
          <h3 className="text-white font-semibold">{challenger.name}</h3>
          <p className="text-gold text-lg font-bold">{challenger.votes} votes</p>
        </div>

        {/* VS Divider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-vibranium text-white font-black text-2xl px-4 py-2 rounded-lg shadow-neon-purple">
            ⚡ VS
          </div>
        </div>

        {/* Defender */}
        <div className="text-center">
          <div className="relative mb-3">
            <img 
              src={defender.imageUrl} 
              alt={defender.name}
              className="img-battle mx-auto"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge-tribe">
              {defender.tribe}
            </div>
          </div>
          <h3 className="text-white font-semibold">{defender.name}</h3>
          <p className="text-gold text-lg font-bold">{defender.votes} votes</p>
        </div>
      </div>

      {/* Vote Buttons */}
      {showVoteButtons && (
        <div className="grid grid-cols-2 gap-4">
          <VibraniumVoteButton 
            onVote={() => onVote('challenger')}
            side="challenger"
            label={`Vote ${challenger.name}`}
          />
          <VibraniumVoteButton 
            onVote={() => onVote('defender')}
            side="defender"
            label={`Vote ${defender.name}`}
          />
        </div>
      )}

      {/* Total Votes */}
      {totalVotes && (
        <div className="text-center mt-4">
          <p className="text-text-secondary text-sm">
            {totalVotes} total votes
          </p>
        </div>
      )}
    </div>
  );
};

export default VibraniumBattleCard;


