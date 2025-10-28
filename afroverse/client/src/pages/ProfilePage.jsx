import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'transformations', 'battles'

  // Mock user stats
  const stats = {
    level: 12,
    xp: 2847,
    xpToNext: 3500,
    wins: 45,
    losses: 23,
    streak: 7,
    totalTransformations: 68,
    totalVotes: 234,
    tribeContribution: 420
  };

  // Mock transformations
  const transformations = [
    { id: 1, image: '/trans/1.jpg', style: 'Maasai Warrior', date: '2 days ago', votes: 234 },
    { id: 2, image: '/trans/2.jpg', style: 'Zulu King', date: '5 days ago', votes: 189 },
    { id: 3, image: '/trans/3.jpg', style: 'Egyptian Pharaoh', date: '1 week ago', votes: 456 },
    { id: 4, image: '/trans/4.jpg', style: 'Yoruba Queen', date: '2 weeks ago', votes: 312 },
  ];

  // Mock battles
  const battles = [
    { id: 1, opponent: 'Warrior_23', status: 'won', votes: '234 vs 189', date: '1 day ago' },
    { id: 2, opponent: 'King_Boss', status: 'active', votes: '145 vs 132', date: '2 days ago' },
    { id: 3, opponent: 'Queen_Fire', status: 'lost', votes: '198 vs 245', date: '5 days ago' },
  ];

  const xpPercentage = (stats.xp / stats.xpToNext) * 100;

  return (
    <div className="min-h-screen bg-gradient-tribe pb-20">
      {/* Profile Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-heritage-orange to-heritage-gold p-1">
                <div className="w-full h-full rounded-full bg-dark-card flex items-center justify-center text-4xl">
                  👤
                </div>
              </div>
              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-heritage-gold rounded-full flex items-center justify-center border-4 border-dark-card">
                <span className="font-bold text-heritage-brown text-sm">{stats.level}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="font-headline text-3xl text-white mb-1">
                @{user?.username || 'Warrior'}
              </h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className="badge-tribe">
                  🦁 Lagos Lions
                </span>
                <span className="badge-fire">
                  🔥 {stats.streak} Day Streak
                </span>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              ⚙️
            </button>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Level {stats.level}</span>
              <span className="text-white font-semibold">{stats.xp} / {stats.xpToNext} XP</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-heritage-orange to-heritage-gold transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-card border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center space-x-1">
            {[
              { id: 'stats', label: 'Stats', icon: '📊' },
              { id: 'transformations', label: 'Transformations', icon: '🎨' },
              { id: 'battles', label: 'Battles', icon: '⚔️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-heritage-orange'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-glass text-center p-4">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-white font-bold text-2xl">{stats.wins}</div>
                <div className="text-gray-400 text-sm">Wins</div>
              </div>
              <div className="card-glass text-center p-4">
                <div className="text-3xl mb-2">💔</div>
                <div className="text-white font-bold text-2xl">{stats.losses}</div>
                <div className="text-gray-400 text-sm">Losses</div>
              </div>
              <div className="card-glass text-center p-4">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-heritage-gold font-bold text-2xl">{stats.streak}</div>
                <div className="text-gray-400 text-sm">Day Streak</div>
              </div>
              <div className="card-glass text-center p-4">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-white font-bold text-2xl">{stats.totalTransformations}</div>
                <div className="text-gray-400 text-sm">Transforms</div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="card-glass">
              <h3 className="font-headline text-xl text-white mb-4">📈 Battle Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white font-bold">
                      {Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-savannah-green to-emerald-500"
                      style={{ width: `${(stats.wins / (stats.wins + stats.losses)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/transform')}
                className="btn-primary"
              >
                🎨 Create Transformation
              </Button>
              <Button
                onClick={() => navigate('/feed')}
                className="btn-secondary"
              >
                ⚔️ Battle Now
              </Button>
              <Button
                onClick={() => navigate('/tribe')}
                className="btn-outline"
              >
                🦁 View Tribe
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'transformations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl text-white">Your Transformations</h2>
              <Button
                onClick={() => navigate('/transform')}
                className="btn-primary"
              >
                + New
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {transformations.map((trans) => (
                <div
                  key={trans.id}
                  className="card-glass group cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {/* TODO: Open fullscreen */}}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={trans.image}
                      alt={trans.style}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{trans.style}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{trans.date}</span>
                    <span>👍 {trans.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'battles' && (
          <div className="space-y-4">
            <h2 className="font-headline text-2xl text-white mb-6">Battle History</h2>

            <div className="space-y-3">
              {battles.map((battle) => (
                <div
                  key={battle.id}
                  className="card-glass flex items-center justify-between p-4 hover:bg-white/15 transition-all cursor-pointer"
                  onClick={() => navigate(`/battle/${battle.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl ${
                      battle.status === 'won' ? '🏆' :
                      battle.status === 'lost' ? '💔' :
                      '⚔️'
                    }`}>
                      {battle.status === 'won' ? '🏆' :
                       battle.status === 'lost' ? '💔' :
                       '⚔️'}
                    </div>
                    <div>
                      <div className="text-white font-bold">vs @{battle.opponent}</div>
                      <div className="text-gray-400 text-sm">{battle.votes}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${
                      battle.status === 'won' ? 'text-savannah-green' :
                      battle.status === 'lost' ? 'text-masai-red' :
                      'text-heritage-gold'
                    }`}>
                      {battle.status.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-xs">{battle.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;


