/**
 * SCREEN 5 - BATTLE LOBBY (ACCEPT / VOTE VIEW)
 * Purpose: Convert viewers → participants (WhatsApp entry point)
 * 
 * Features:
 * - Side-by-side battle cards
 * - Timer countdown
 * - Vote buttons
 * - Join & Transform CTA
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VibraniumProgressRing from '../components/common/VibraniumProgressRing';

const BattleLobby = () => {
  const navigate = useNavigate();
  const { battleId } = useParams();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);

  // Mock battle data
  const battle = {
    id: battleId,
    title: 'Heritage Battle',
    challenger: {
      username: 'Kofi',
      tribe: '🦁 Zulu',
      image: '/images/battle-challenger.jpg',
      votes: 1204,
    },
    defender: {
      username: 'Amara',
      tribe: '🐘 Ndebele',
      image: '/images/battle-defender.jpg',
      votes: 892,
    },
    timeLeftSeconds: 83520, // 23h 12m
  };

  const totalVotes = battle.challenger.votes + battle.defender.votes;
  const challengerPercentage = (battle.challenger.votes / totalVotes) * 100;

  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleVote = (side) => {
    setSelectedSide(side);
    setHasVoted(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // TODO: Send vote to backend
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-surface border-b border-divider py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-gradient-vibranium text-xl font-headline font-bold">
            {battle.title}
          </h1>
          <button className="text-text-secondary hover:text-white transition-colors">
            📤 Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Timer */}
        <div className="flex flex-col items-center mb-12">
          <VibraniumProgressRing
            duration={battle.timeLeftSeconds}
            size={160}
            strokeWidth={10}
            onComplete={() => console.log('Battle ended')}
          />
          <p className="text-text-secondary mt-4">
            ⏳ {formatTimeLeft(battle.timeLeftSeconds)} left
          </p>
        </div>

        {/* Battle Cards - Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Challenger Card */}
          <div className="card-battle text-center">
            <div className="relative mb-6">
              <img
                src={battle.challenger.image}
                alt={battle.challenger.username}
                className="img-battle mx-auto"
              />
              {selectedSide === 'challenger' && (
                <div className="absolute inset-0 bg-success-green/20 border-4 border-success-green rounded-lg flex items-center justify-center">
                  <span className="text-6xl">✅</span>
                </div>
              )}
            </div>
            
            <h3 className="text-white text-2xl font-bold mb-2">
              {battle.challenger.username}
            </h3>
            <span className="badge-tribe mb-4 inline-block">
              {battle.challenger.tribe}
            </span>
            
            <div className="space-y-2">
              <p className="text-gold text-3xl font-bold">
                {battle.challenger.votes}
              </p>
              <p className="text-text-secondary text-sm">votes</p>
            </div>
          </div>

          {/* VS Divider */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-vibranium text-white font-black text-4xl px-8 py-4 rounded-lg shadow-neon-purple">
              ⚡ VS
            </div>
          </div>

          {/* Defender Card */}
          <div className="card-battle text-center">
            <div className="relative mb-6">
              <img
                src={battle.defender.image}
                alt={battle.defender.username}
                className="img-battle mx-auto"
              />
              {selectedSide === 'defender' && (
                <div className="absolute inset-0 bg-success-green/20 border-4 border-success-green rounded-lg flex items-center justify-center">
                  <span className="text-6xl">✅</span>
                </div>
              )}
            </div>
            
            <h3 className="text-white text-2xl font-bold mb-2">
              {battle.defender.username}
            </h3>
            <span className="badge-tribe mb-4 inline-block">
              {battle.defender.tribe}
            </span>
            
            <div className="space-y-2">
              <p className="text-gold text-3xl font-bold">
                {battle.defender.votes}
              </p>
              <p className="text-text-secondary text-sm">votes</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative h-4 bg-surface rounded-full overflow-hidden shadow-neon-purple">
            <div
              className="absolute top-0 left-0 h-full bg-vibranium transition-all duration-500"
              style={{ width: `${challengerPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
            <span>{challengerPercentage.toFixed(1)}%</span>
            <span>{totalVotes.toLocaleString()} total votes</span>
            <span>{(100 - challengerPercentage).toFixed(1)}%</span>
          </div>
        </div>

        {/* Vote / Result Section */}
        {!hasVoted ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-white text-2xl font-bold text-center mb-6">
              Who has the better transformation?
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleVote('challenger')}
                className="btn-primary py-6 text-lg animate-vote-pulse"
              >
                🔥 Vote {battle.challenger.username}
              </button>
              <button
                onClick={() => handleVote('defender')}
                className="btn-primary py-6 text-lg animate-vote-pulse"
              >
                🔥 Vote {battle.defender.username}
              </button>
            </div>

            {/* CTA to Join */}
            <div className="card-glass text-center p-6">
              <h3 className="text-white text-xl font-bold mb-2">
                Create Your Own Transformation
              </h3>
              <p className="text-text-secondary mb-4">
                Join the battle and show your heritage
              </p>
              <button
                onClick={() => navigate('/transform')}
                className="btn-secondary w-full py-3"
              >
                ✨ Join & Transform
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <div className="bg-success-green/20 border-2 border-success-green text-success-green rounded-lg p-8 text-center mb-8">
              <span className="text-6xl mb-4 block">✅</span>
              <h2 className="text-2xl font-bold mb-2">Vote Recorded!</h2>
              <p>
                You voted for{' '}
                <strong>
                  {selectedSide === 'challenger'
                    ? battle.challenger.username
                    : battle.defender.username}
                </strong>
              </p>
            </div>

            {/* Share & Create CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/share', { state: { battleId } })}
                className="btn-primary py-4"
              >
                📤 Share This Battle
              </button>
              <button
                onClick={() => navigate('/transform')}
                className="btn-secondary py-4"
              >
                ✨ Create Your Own
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLobby;


