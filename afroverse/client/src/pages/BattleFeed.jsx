/**
 * SCREEN 4 - BATTLE FEED (TIKTOK STYLE)
 * Purpose: Endless viral consumption loop → dopamine → habit
 * 
 * Features:
 * - Full-screen vertical swipe feed
 * - TikTok-style UI with overlays
 * - Giant vote buttons
 * - Real-time vote progress bar
 * - Confetti on vote
 * - Bottom navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BattleFeed = () => {
  const navigate = useNavigate();
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [votedBattles, setVotedBattles] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef(null);
  const startYRef = useRef(0);

  // Mock battle data
  const battles = [
    {
      id: 1,
      challenger: {
        username: '@kofi_warrior',
        tribe: '🦁 Zulu',
        tribeBadge: '🦁',
        image: '/images/battle1-left.jpg',
        votes: 1204,
      },
      defender: {
        username: '@amara_queen',
        tribe: '🐘 Ndebele',
        tribeBadge: '🐘',
        image: '/images/battle1-right.jpg',
        votes: 892,
      },
      title: 'Zulu vs Ndebele',
      timeLeft: '2h 30m',
    },
    {
      id: 2,
      challenger: {
        username: '@zuri_pharaoh',
        tribe: '👑 Pharaoh',
        tribeBadge: '👑',
        image: '/images/battle2-left.jpg',
        votes: 2341,
      },
      defender: {
        username: '@malik_maasai',
        tribe: '⚔️ Maasai',
        tribeBadge: '⚔️',
        image: '/images/battle2-right.jpg',
        votes: 1987,
      },
      title: 'Pharaoh vs Maasai',
      timeLeft: '4h 15m',
    },
    {
      id: 3,
      challenger: {
        username: '@nia_royalty',
        tribe: '👸 Royalty',
        tribeBadge: '👸',
        image: '/images/battle3-left.jpg',
        votes: 567,
      },
      defender: {
        username: '@jabari_king',
        tribe: '🦅 King',
        tribeBadge: '🦅',
        image: '/images/battle3-right.jpg',
        votes: 432,
      },
      title: 'Royalty vs King',
      timeLeft: '1h 45m',
    },
  ];

  const currentBattle = battles[currentBattleIndex];
  const totalVotes = currentBattle.challenger.votes + currentBattle.defender.votes;
  const challengerPercentage = (currentBattle.challenger.votes / totalVotes) * 100;

  // Swipe handling
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startYRef.current - endY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentBattleIndex < battles.length - 1) {
        // Swipe up - next battle
        setCurrentBattleIndex(prev => prev + 1);
      } else if (diff < 0 && currentBattleIndex > 0) {
        // Swipe down - previous battle
        setCurrentBattleIndex(prev => prev - 1);
      }
    }
  };

  const handleVote = (side) => {
    if (votedBattles[currentBattle.id]) return;

    // Mark as voted
    setVotedBattles(prev => ({ ...prev, [currentBattle.id]: side }));

    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // TODO: Send vote to backend
  };

  const hasVoted = votedBattles[currentBattle.id];

  return (
    <div
      ref={containerRef}
      className="relative h-screen bg-dark-bg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                width: '8px',
                height: '8px',
                background: ['#6F2CFF', '#F5B63F', '#FF4D6D', '#2AB9FF'][i % 4],
                borderRadius: i % 2 === 0 ? '50%' : '0',
                animationDelay: `${i * 0.03}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Battle Content - Full Screen */}
      <div className="relative h-full w-full">
        {/* Split Battle Images */}
        <div className="absolute inset-0 flex">
          {/* Left Side - Challenger */}
          <div
            className="w-1/2 h-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${currentBattle.challenger.image})`,
              filter: hasVoted && hasVoted === 'defender' ? 'grayscale(50%)' : 'none',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"></div>
          </div>

          {/* Right Side - Defender */}
          <div
            className="w-1/2 h-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${currentBattle.defender.image})`,
              filter: hasVoted && hasVoted === 'challenger' ? 'grayscale(50%)' : 'none',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/50"></div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-vibranium text-white font-black text-3xl px-6 py-3 rounded-lg shadow-neon-purple animate-glow-purple">
            ⚡ VS
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-3">
          <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            📤
          </button>
          <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            🚩
          </button>
        </div>

        {/* Bottom Overlay - TikTok Style */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-32 pb-24 px-6">
          {/* Battle Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentBattle.challenger.tribeBadge}</span>
                <span className="text-white font-semibold">
                  {currentBattle.challenger.username}
                </span>
                <span className="badge-tribe text-xs">
                  {currentBattle.challenger.tribe}
                </span>
              </div>
              
              <span className="badge-purple">⏱️ {currentBattle.timeLeft}</span>
              
              <div className="flex items-center gap-2">
                <span className="badge-tribe text-xs">
                  {currentBattle.defender.tribe}
                </span>
                <span className="text-white font-semibold">
                  {currentBattle.defender.username}
                </span>
                <span className="text-2xl">{currentBattle.defender.tribeBadge}</span>
              </div>
            </div>

            {/* Vote Progress Bar */}
            <div className="relative h-3 bg-surface rounded-full overflow-hidden shadow-neon-purple mb-2">
              <div
                className="absolute top-0 left-0 h-full bg-vibranium transition-all duration-500"
                style={{ width: `${challengerPercentage}%` }}
              ></div>
            </div>

            {/* Vote Counts */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gold font-bold">
                {currentBattle.challenger.votes} votes
              </span>
              <span className="text-text-secondary">
                {totalVotes.toLocaleString()} total
              </span>
              <span className="text-gold font-bold">
                {currentBattle.defender.votes} votes
              </span>
            </div>
          </div>

          {/* Vote Buttons */}
          {!hasVoted ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVote('challenger')}
                className="btn-primary py-6 text-lg font-bold animate-vote-pulse"
              >
                🔥 Vote {currentBattle.challenger.tribeBadge}
              </button>
              <button
                onClick={() => handleVote('defender')}
                className="btn-primary py-6 text-lg font-bold animate-vote-pulse"
              >
                🔥 Vote {currentBattle.defender.tribeBadge}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="bg-success-green/20 border-2 border-success-green text-success-green py-4 rounded-lg">
                ✅ Vote Recorded! You voted for{' '}
                <strong>
                  {hasVoted === 'challenger'
                    ? currentBattle.challenger.username
                    : currentBattle.defender.username}
                </strong>
              </div>
              <p className="text-text-secondary text-sm">
                Swipe up for next battle
              </p>
            </div>
          )}
        </div>

        {/* Swipe Indicator */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs animate-bounce">
          ↑ Swipe for next
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-divider">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => navigate('/feed')}
            className="flex flex-col items-center gap-1 text-primary-purple"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/battles')}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
          >
            <span className="text-2xl">⚔️</span>
            <span className="text-xs font-medium">Battles</span>
          </button>

          {/* FAB Create Button */}
          <button
            onClick={() => navigate('/transform')}
            className="relative -mt-8 w-16 h-16 bg-vibranium rounded-full shadow-glow-purple flex items-center justify-center text-3xl hover:scale-110 transition-transform"
          >
            🔥
          </button>
          
          <button
            onClick={() => navigate('/tribe')}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
          >
            <span className="text-2xl">🦁</span>
            <span className="text-xs font-medium">Tribe</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleFeed;


