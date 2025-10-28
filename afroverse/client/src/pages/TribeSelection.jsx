/**
 * SCREEN 7 - TRIBE SELECTION (EMOTIONAL BOND SCREEN)
 * Purpose: Create emotional connection and belonging
 * 
 * Features:
 * - Grid of tribe cards with details
 * - Tribe stats and rankings
 * - Cinematic welcome animation after join
 * - Cultural pride messaging
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TribeSelection = () => {
  const navigate = useNavigate();
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const tribes = [
    {
      id: 'zulu',
      name: 'Zulu Nation',
      emblem: '🦁',
      description: 'Fierce warriors with unmatched bravery',
      membersOnline: 12453,
      rank: 1,
      color: '#FF6B35',
      motto: 'Strength in Unity'
    },
    {
      id: 'ndebele',
      name: 'Ndebele Tribe',
      emblem: '🐘',
      description: 'Masters of art and vibrant culture',
      membersOnline: 9834,
      rank: 3,
      color: '#2AB9FF',
      motto: 'Beauty in Tradition'
    },
    {
      id: 'pharaoh',
      name: 'Pharaoh Dynasty',
      emblem: '👑',
      description: 'Ancient royalty and wisdom',
      membersOnline: 11290,
      rank: 2,
      color: '#F5B63F',
      motto: 'Reign Supreme'
    },
    {
      id: 'maasai',
      name: 'Maasai Warriors',
      emblem: '⚔️',
      description: 'Proud defenders of heritage',
      membersOnline: 8756,
      rank: 4,
      color: '#C22026',
      motto: 'Honor Above All'
    },
    {
      id: 'wakanda',
      name: 'Wakanda Vision',
      emblem: '⚡',
      description: 'Futuristic Afro-pride',
      membersOnline: 10567,
      rank: 5,
      color: '#6F2CFF',
      motto: 'Forever Forward'
    },
  ];

  const handleJoinTribe = (tribe) => {
    setSelectedTribe(tribe);
    setShowWelcome(true);

    // After animation, navigate to feed
    setTimeout(() => {
      navigate('/feed', {
        state: { newTribe: tribe }
      });
    }, 4000);
  };

  if (showWelcome && selectedTribe) {
    return (
      <div className="fixed inset-0 bg-dark-bg z-50 flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${selectedTribe.color} 0%, transparent 70%)`,
            }}
          ></div>
        </div>

        {/* Welcome Content */}
        <div className="relative z-10 text-center px-6 animate-bounce-in">
          <div className="text-9xl mb-8 animate-float">
            {selectedTribe.emblem}
          </div>
          
          <h1 className="text-gradient-gold text-5xl md:text-7xl font-headline font-black mb-6">
            Welcome, Warrior
          </h1>
          
          <p className="text-white text-2xl md:text-3xl font-semibold mb-4">
            You are now
          </p>
          
          <h2 className="text-gradient-vibranium text-4xl md:text-6xl font-headline font-black mb-8">
            {selectedTribe.name.toUpperCase()}
          </h2>
          
          <p className="text-gold text-xl md:text-2xl font-semibold mb-12">
            "{selectedTribe.motto}"
          </p>
          
          <div className="flex items-center justify-center gap-12 text-text-secondary">
            <div>
              <p className="text-4xl font-bold text-white mb-2">
                {selectedTribe.membersOnline.toLocaleString()}
              </p>
              <p className="text-sm">Warriors Online</p>
            </div>
            <div className="w-px h-16 bg-divider"></div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">
                #{selectedTribe.rank}
              </p>
              <p className="text-sm">Global Rank</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Choose Your Tribe
          </h1>
          <button
            onClick={() => navigate('/feed')}
            className="text-text-secondary hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-gradient-gold text-4xl md:text-5xl font-headline font-black mb-4">
            Choose Your Tribe
          </h2>
          <p className="text-text-secondary text-lg md:text-xl">
            Fight with your clan. Earn the crown. 👑
          </p>
        </div>

        {/* Tribe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tribes.map((tribe) => (
            <div
              key={tribe.id}
              className="card-tribe relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 badge-gold z-10">
                #{tribe.rank}
              </div>

              {/* Emblem */}
              <div className="text-7xl text-center mb-6 animate-float">
                {tribe.emblem}
              </div>

              {/* Tribe Info */}
              <h3 className="text-white text-2xl font-headline font-bold text-center mb-2">
                {tribe.name}
              </h3>
              
              <p className="text-text-secondary text-center mb-6 px-4">
                {tribe.description}
              </p>

              {/* Stats */}
              <div className="bg-surface/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Members Online</span>
                  <span className="text-white font-bold">
                    {tribe.membersOnline.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Rank This Week</span>
                  <span className="text-gold font-bold">#{tribe.rank}</span>
                </div>
              </div>

              {/* Motto */}
              <p className="text-gold text-center text-sm italic mb-6">
                "{tribe.motto}"
              </p>

              {/* Join Button */}
              <button
                onClick={() => handleJoinTribe(tribe)}
                className="btn-primary w-full py-3"
              >
                Join {tribe.emblem}
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 card-glass text-center p-8">
          <h3 className="text-white text-2xl font-bold mb-4">
            Why Join a Tribe?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <span className="text-4xl mb-3 block">⚔️</span>
              <h4 className="text-white font-semibold mb-2">Battle Together</h4>
              <p className="text-text-secondary text-sm">
                Fight for your tribe's glory in epic battles
              </p>
            </div>
            <div>
              <span className="text-4xl mb-3 block">🏆</span>
              <h4 className="text-white font-semibold mb-2">Earn Rewards</h4>
              <p className="text-text-secondary text-sm">
                Get exclusive badges and tribe points
              </p>
            </div>
            <div>
              <span className="text-4xl mb-3 block">👥</span>
              <h4 className="text-white font-semibold mb-2">Find Your People</h4>
              <p className="text-text-secondary text-sm">
                Connect with warriors who share your heritage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribeSelection;


