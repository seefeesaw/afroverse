/**
 * SCREEN 8 - LEADERBOARD
 * Purpose: Show rankings and motivate competition
 * 
 * Features:
 * - Tabs: Top Warriors, Top Tribes, Country Rankings
 * - Rank display with avatars
 * - Tribe badges
 * - Points and streaks
 * - Top 3 highlighted
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('warriors'); // 'warriors', 'tribes', 'countries'

  // Mock data
  const topWarriors = [
    { rank: 1, avatar: '👑', username: 'KofiKing', tribe: '🦁 Zulu', points: 15420, streak: 34, wins: 142 },
    { rank: 2, avatar: '⚔️', username: 'AmaraQueen', tribe: '🐘 Ndebele', points: 14890, streak: 28, wins: 138 },
    { rank: 3, avatar: '👸', username: 'ZuriWarrior', tribe: '👑 Pharaoh', points: 13567, streak: 25, wins: 129 },
    { rank: 4, avatar: '🦅', username: 'MalikChief', tribe: '⚔️ Maasai', points: 12340, streak: 22, wins: 115 },
    { rank: 5, avatar: '🔥', username: 'NiaRoyalty', tribe: '⚡ Wakanda', points: 11890, streak: 20, wins: 108 },
    { rank: 6, avatar: '⚡', username: 'JabariPrince', tribe: '🦁 Zulu', points: 10567, streak: 18, wins: 98 },
    { rank: 7, avatar: '🌟', username: 'AmaniKing', tribe: '🐘 Ndebele', points: 9834, streak: 15, wins: 92 },
    { rank: 8, avatar: '💎', username: 'TundeChampion', tribe: '👑 Pharaoh', points: 9123, streak: 14, wins: 87 },
    { rank: 9, avatar: '🏆', username: 'ZolaHero', tribe: '⚔️ Maasai', points: 8756, streak: 12, wins: 81 },
    { rank: 10, avatar: '👤', username: 'KwameWarrior', tribe: '⚡ Wakanda', points: 8234, streak: 10, wins: 76 },
  ];

  const topTribes = [
    { rank: 1, emblem: '🦁', name: 'Zulu Nation', members: 12453, points: 1542000, battles: 4532 },
    { rank: 2, emblem: '👑', name: 'Pharaoh Dynasty', members: 11290, points: 1489000, battles: 4201 },
    { rank: 3, emblem: '🐘', name: 'Ndebele Tribe', members: 9834, points: 1356700, battles: 3987 },
    { rank: 4, emblem: '⚔️', name: 'Maasai Warriors', members: 8756, points: 1234000, battles: 3654 },
    { rank: 5, emblem: '⚡', name: 'Wakanda Vision', members: 10567, points: 1189000, battles: 3421 },
  ];

  const topCountries = [
    { rank: 1, flag: '🇿🇦', name: 'South Africa', warriors: 45231, points: 5678900 },
    { rank: 2, flag: '🇳🇬', name: 'Nigeria', warriors: 42890, points: 5234100 },
    { rank: 3, flag: '🇰🇪', name: 'Kenya', warriors: 38567, points: 4891200 },
    { rank: 4, flag: '🇪🇬', name: 'Egypt', warriors: 35421, points: 4567800 },
    { rank: 5, flag: '🇬🇭', name: 'Ghana', warriors: 32890, points: 4234500 },
  ];

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <span className="badge-gold">🥇 #{rank}</span>;
      case 2:
        return <span className="badge-gold" style={{ opacity: 0.8 }}>🥈 #{rank}</span>;
      case 3:
        return <span className="badge-gold" style={{ opacity: 0.6 }}>🥉 #{rank}</span>;
      default:
        return <span className="badge-purple">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <header className="bg-surface border-b border-divider py-4 px-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-gradient-vibranium text-xl font-headline font-bold">
            Leaderboard
          </h1>
          <button className="text-text-secondary hover:text-white transition-colors">
            🔄
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-surface/50 backdrop-blur-lg border-b border-divider sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto flex">
          <button
            onClick={() => setActiveTab('warriors')}
            className={`
              flex-1 py-4 font-semibold transition-all
              ${activeTab === 'warriors'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            👑 Top Warriors
          </button>
          <button
            onClick={() => setActiveTab('tribes')}
            className={`
              flex-1 py-4 font-semibold transition-all
              ${activeTab === 'tribes'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            🦁 Top Tribes
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`
              flex-1 py-4 font-semibold transition-all
              ${activeTab === 'countries'
                ? 'text-primary-purple border-b-2 border-primary-purple'
                : 'text-text-secondary hover:text-white'
              }
            `}
          >
            🌍 Countries
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Warriors */}
        {activeTab === 'warriors' && (
          <div className="space-y-3">
            {topWarriors.map((warrior) => (
              <div
                key={warrior.rank}
                className={`
                  card-glass flex items-center gap-4 p-4 cursor-pointer hover:bg-white/15 transition-all
                  ${warrior.rank <= 3 ? 'border-2 border-gold shadow-glow-gold' : ''}
                `}
                onClick={() => navigate(`/profile/${warrior.username}`)}
              >
                {/* Rank */}
                <div className="w-16 text-center">
                  {getRankBadge(warrior.rank)}
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-3xl border-2 border-primary-purple">
                  {warrior.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{warrior.username}</h3>
                  <span className="badge-tribe text-xs">{warrior.tribe}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-gold font-bold text-lg">{warrior.points.toLocaleString()}</p>
                    <p className="text-text-tertiary text-xs">Points</p>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{warrior.wins}</p>
                    <p className="text-text-tertiary text-xs">Wins</p>
                  </div>
                  <div>
                    <p className="text-red font-bold text-lg flex items-center justify-center gap-1">
                      🔥 {warrior.streak}
                    </p>
                    <p className="text-text-tertiary text-xs">Streak</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Tribes */}
        {activeTab === 'tribes' && (
          <div className="space-y-3">
            {topTribes.map((tribe) => (
              <div
                key={tribe.rank}
                className={`
                  card-tribe flex items-center gap-4 p-6 cursor-pointer hover:scale-[1.02] transition-all
                  ${tribe.rank <= 3 ? 'border-2 border-gold shadow-glow-gold' : ''}
                `}
                onClick={() => navigate('/tribe', { state: { tribeId: tribe.name } })}
              >
                {/* Rank */}
                <div className="w-16 text-center">
                  {getRankBadge(tribe.rank)}
                </div>

                {/* Emblem */}
                <div className="text-5xl">{tribe.emblem}</div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-white font-headline font-bold text-2xl mb-1">{tribe.name}</h3>
                  <p className="text-text-secondary text-sm">
                    {tribe.members.toLocaleString()} warriors
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-gold font-bold text-xl">{tribe.points.toLocaleString()}</p>
                    <p className="text-text-tertiary text-xs">Total Points</p>
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">{tribe.battles.toLocaleString()}</p>
                    <p className="text-text-tertiary text-xs">Battles</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Countries */}
        {activeTab === 'countries' && (
          <div className="space-y-3">
            {topCountries.map((country) => (
              <div
                key={country.rank}
                className={`
                  card-glass flex items-center gap-4 p-4 cursor-pointer hover:bg-white/15 transition-all
                  ${country.rank <= 3 ? 'border-2 border-gold shadow-glow-gold' : ''}
                `}
              >
                {/* Rank */}
                <div className="w-16 text-center">
                  {getRankBadge(country.rank)}
                </div>

                {/* Flag */}
                <div className="text-5xl">{country.flag}</div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl">{country.name}</h3>
                  <p className="text-text-secondary text-sm">
                    {country.warriors.toLocaleString()} warriors
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-gold font-bold text-2xl">{country.points.toLocaleString()}</p>
                  <p className="text-text-tertiary text-xs">Total Points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;


