import React, { useState } from 'react';
import Button from '../common/Button';

const TRIBES = [
  {
    id: 'warriors',
    name: 'Warriors',
    emoji: '⚔️',
    color: 'from-red-500 to-orange-600',
    description: 'Fierce fighters who dominate the battlefield',
    traits: ['Aggressive', 'Competitive', 'Bold'],
    motto: 'Victory or nothing!'
  },
  {
    id: 'royals',
    name: 'Royals',
    emoji: '👑',
    color: 'from-purple-500 to-pink-600',
    description: 'Elegant rulers with unmatched style',
    traits: ['Sophisticated', 'Strategic', 'Prestigious'],
    motto: 'Rule with elegance'
  },
  {
    id: 'legends',
    name: 'Legends',
    emoji: '⭐',
    color: 'from-yellow-400 to-orange-500',
    description: 'Mythical champions who inspire awe',
    traits: ['Epic', 'Inspirational', 'Powerful'],
    motto: 'Born to be legendary'
  },
  {
    id: 'mystics',
    name: 'Mystics',
    emoji: '🔮',
    color: 'from-indigo-500 to-purple-600',
    description: 'Mysterious sages with ancient wisdom',
    traits: ['Wise', 'Mysterious', 'Spiritual'],
    motto: 'Knowledge is power'
  },
  {
    id: 'nomads',
    name: 'Nomads',
    emoji: '🏜️',
    color: 'from-amber-600 to-yellow-700',
    description: 'Free spirits who roam without limits',
    traits: ['Adventurous', 'Independent', 'Resilient'],
    motto: 'Freedom above all'
  },
  {
    id: 'guardians',
    name: 'Guardians',
    emoji: '🛡️',
    color: 'from-blue-500 to-cyan-600',
    description: 'Protectors who stand for justice',
    traits: ['Noble', 'Protective', 'Loyal'],
    motto: 'Defend and conquer'
  }
];

const TribeSelectionScreen = ({ onNext, onComplete }) => {
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleTribeSelect = (tribe) => {
    setSelectedTribe(tribe);
  };

  const handleConfirm = () => {
    if (selectedTribe) {
      setIsConfirming(true);
      setTimeout(() => {
        onComplete({ selectedTribe });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-6xl w-full space-y-8">
        {/* Bot Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-xl leading-relaxed">
                <span className="font-bold text-2xl block mb-2">Choose Your Tribe! 🏆</span>
                Join forces with like-minded warriors. Every vote you cast, every battle you win — helps your tribe dominate the leaderboard! 🔥
              </p>
            </div>
          </div>
        </div>

        {/* Tribe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRIBES.map((tribe) => (
            <button
              key={tribe.id}
              onClick={() => handleTribeSelect(tribe)}
              className={`relative group text-left bg-gradient-to-br ${tribe.color} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                selectedTribe?.id === tribe.id
                  ? 'ring-4 ring-white scale-105 shadow-2xl'
                  : 'hover:ring-2 hover:ring-white/50'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-6xl">{tribe.emoji}</div>
                  {selectedTribe?.id === tribe.id && (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-3xl font-bold text-white">{tribe.name}</h3>

                {/* Description */}
                <p className="text-white/90 text-sm leading-relaxed">{tribe.description}</p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2">
                  {tribe.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/30 rounded-full text-white text-xs font-semibold"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Motto */}
                <div className="pt-3 border-t border-white/20">
                  <p className="text-white/80 text-sm italic">"{tribe.motto}"</p>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Selected Tribe Info */}
        {selectedTribe && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${selectedTribe.color} rounded-full flex items-center justify-center text-3xl`}>
                {selectedTribe.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">
                  Welcome to the {selectedTribe.name}!
                </h3>
                <p className="text-gray-300 text-sm">
                  You're about to join {Math.floor(Math.random() * 10000) + 5000} active members
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Rank', value: `#${Math.floor(Math.random() * 6) + 1}`, icon: '🏆' },
                { label: 'Members', value: `${Math.floor(Math.random() * 10) + 5}K`, icon: '👥' },
                { label: 'Battles Won', value: `${Math.floor(Math.random() * 500) + 100}`, icon: '⚔️' }
              ].map((stat, index) => (
                <div key={index} className="bg-black/30 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Button */}
        {selectedTribe && (
          <div className="flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`bg-gradient-to-r ${selectedTribe.color} text-white text-lg px-12 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50`}
            >
              {isConfirming ? (
                <span className="flex items-center space-x-2">
                  <span className="animate-spin">⚡</span>
                  <span>Joining...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{selectedTribe.emoji}</span>
                  <span>Join {selectedTribe.name}</span>
                  <span>→</span>
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            💡 You can change your tribe later, but it will cost you your current rank
          </p>
        </div>
      </div>
    </div>
  );
};

export default TribeSelectionScreen;


