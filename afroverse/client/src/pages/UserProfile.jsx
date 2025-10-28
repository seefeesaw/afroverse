/**
 * SCREEN 9 - PROFILE
 * Purpose: Show user stats, transformations, battles, and upsell
 * 
 * Features:
 * - Avatar and tribe display
 * - Stats (Won/Lost/Streak/Points)
 * - Transformations gallery
 * - Battle history
 * - Subscription status with upsell
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transformations'); // 'transformations', 'battles', 'achievements'

  // Mock user data
  const user = {
    avatar: '👑',
    username: 'KofiKing',
    tribe: {
      name: 'Zulu Nation',
      emblem: '🦁',
    },
    level: 24,
    rank: 156,
    stats: {
      won: 142,
      lost: 38,
      winRate: 78.9,
      streak: 34,
      points: 15420,
      totalBattles: 180,
    },
    subscription: {
      isPremium: false,
      plan: 'Free',
    },
    transformations: [
      { id: 1, image: '/images/transform1.jpg', style: 'Pharaoh', likes: 234, date: '2 days ago' },
      { id: 2, image: '/images/transform2.jpg', style: 'Maasai', likes: 189, date: '4 days ago' },
      { id: 3, image: '/images/transform3.jpg', style: 'Zulu', likes: 312, date: '1 week ago' },
      { id: 4, image: '/images/transform4.jpg', style: 'Wakanda', likes: 267, date: '1 week ago' },
      { id: 5, image: '/images/transform5.jpg', style: 'Ndebele', likes: 198, date: '2 weeks ago' },
      { id: 6, image: '/images/transform6.jpg', style: 'Pharaoh', likes: 421, date: '2 weeks ago' },
    ],
    recentBattles: [
      { id: 1, opponent: 'AmaraQueen', result: 'won', votes: '124 vs 98', date: '1 hour ago' },
      { id: 2, opponent: 'ZuriWarrior', result: 'won', votes: '156 vs 142', date: '3 hours ago' },
      { id: 3, opponent: 'MalikChief', result: 'lost', votes: '89 vs 112', date: '5 hours ago' },
      { id: 4, opponent: 'NiaRoyalty', result: 'won', votes: '178 vs 145', date: '1 day ago' },
    ],
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
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
            Profile
          </h1>
          <button
            onClick={() => navigate('/settings')}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-surface-card border-b border-divider">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-vibranium flex items-center justify-center text-6xl shadow-glow-purple border-4 border-gold">
                {user.avatar}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge-gold whitespace-nowrap">
                Level {user.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-white text-3xl font-headline font-bold mb-2">
                @{user.username}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="badge-tribe">
                  {user.tribe.emblem} {user.tribe.name}
                </span>
                <span className="badge-purple">
                  Rank #{user.rank}
                </span>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-gold font-bold text-2xl">{user.stats.won}</p>
                  <p className="text-text-secondary text-sm">Won</p>
                </div>
                <div>
                  <p className="text-text-primary font-bold text-2xl">{user.stats.lost}</p>
                  <p className="text-text-secondary text-sm">Lost</p>
                </div>
                <div>
                  <p className="text-red font-bold text-2xl flex items-center justify-center gap-1">
                    🔥 {user.stats.streak}
                  </p>
                  <p className="text-text-secondary text-sm">Streak</p>
                </div>
                <div>
                  <p className="text-success-green font-bold text-2xl">{user.stats.winRate}%</p>
                  <p className="text-text-secondary text-sm">Win Rate</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/transform')}
                className="btn-primary px-6 py-3"
              >
                🔥 Create Battle
              </button>
              <button
                onClick={() => navigate('/share')}
                className="btn-secondary px-6 py-3"
              >
                📤 Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upsell (if not premium) */}
      {!user.subscription.isPremium && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="card-glass bg-vibranium p-6 text-center">
            <span className="text-5xl mb-4 block">👑</span>
            <h3 className="text-white text-2xl font-bold mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-white/80 mb-6">
              Unlimited transformations • No ads • Exclusive styles
            </p>
            <button
              onClick={() => navigate('/upgrade')}
              className="bg-gold text-dark font-bold px-8 py-3 rounded-lg shadow-glow-gold hover:scale-105 transition-transform"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-divider">
          <button
            onClick={() => setActiveTab('transformations')}
            className={`
              pb-4 px-2 font-semibold transition-all
              ${activeTab === 'transformations'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            ✨ My Transformations ({user.transformations.length})
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`
              pb-4 px-2 font-semibold transition-all
              ${activeTab === 'battles'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            ⚔️ My Battles ({user.recentBattles.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`
              pb-4 px-2 font-semibold transition-all
              ${activeTab === 'achievements'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            🏆 Achievements
          </button>
        </div>

        {/* Transformations Gallery */}
        {activeTab === 'transformations' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.transformations.map((transformation) => (
              <div
                key={transformation.id}
                className="relative group cursor-pointer"
                onClick={() => navigate(`/transformation/${transformation.id}`)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-surface shadow-neon-purple">
                  <img
                    src={transformation.image}
                    alt={transformation.style}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-4 flex flex-col justify-end">
                  <span className="badge-purple text-xs mb-2">{transformation.style}</span>
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>❤️ {transformation.likes}</span>
                    <span>{transformation.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Battle History */}
        {activeTab === 'battles' && (
          <div className="space-y-3">
            {user.recentBattles.map((battle) => (
              <div
                key={battle.id}
                className="card-glass flex items-center justify-between p-4 cursor-pointer hover:bg-white/15 transition-all"
                onClick={() => navigate(`/battle/${battle.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    ${battle.result === 'won'
                      ? 'bg-success-green/20 text-success-green'
                      : 'bg-red/20 text-red'
                    }
                  `}>
                    {battle.result === 'won' ? '✓' : '✗'}
                  </div>
                  
                  <div>
                    <p className="text-white font-semibold">
                      vs @{battle.opponent}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {battle.votes}
                    </p>
                  </div>
                </div>

                <span className="text-text-tertiary text-sm">
                  {battle.date}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏆', title: 'First Win', unlocked: true },
              { icon: '🔥', title: '10 Win Streak', unlocked: true },
              { icon: '👑', title: 'Top 100', unlocked: true },
              { icon: '⚔️', title: '100 Battles', unlocked: true },
              { icon: '✨', title: '50 Transformations', unlocked: false },
              { icon: '🎯', title: '90% Win Rate', unlocked: false },
              { icon: '💎', title: 'Premium Member', unlocked: false },
              { icon: '🌍', title: 'Global Top 10', unlocked: false },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`
                  card-glass text-center p-6
                  ${!achievement.unlocked ? 'opacity-40' : ''}
                `}
              >
                <span className="text-5xl mb-3 block">{achievement.icon}</span>
                <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                {!achievement.unlocked && (
                  <p className="text-text-tertiary text-xs mt-2">🔒 Locked</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;


