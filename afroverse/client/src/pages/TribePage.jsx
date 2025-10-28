import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import CulturalPattern from '../components/common/CulturalPattern';

const TribePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'leaderboard'

  // Mock tribe data
  const tribeData = {
    name: 'Lagos Lions',
    icon: '🦁',
    color: 'from-heritage-orange to-heritage-gold',
    rank: 2,
    points: 12847,
    members: 5234,
    weeklyChange: '+247',
    motto: 'Strength in Unity',
    userContribution: 420
  };

  // Mock top warriors
  const topWarriors = [
    { rank: 1, username: 'Lion_King_23', points: 2847, streak: 42, avatar: '/avatars/1.jpg' },
    { rank: 2, username: 'Warrior_Queen', points: 2156, streak: 28, avatar: '/avatars/2.jpg' },
    { rank: 3, username: 'Battle_Chief', points: 1923, streak: 35, avatar: '/avatars/3.jpg' },
    { rank: 4, username: 'Storm_Rider', points: 1687, streak: 21, avatar: '/avatars/4.jpg' },
    { rank: 5, username: 'Thunder_Bolt', points: 1543, streak: 19, avatar: '/avatars/5.jpg' },
    { rank: 6, username: 'Fire_Starter', points: 1398, streak: 17, avatar: '/avatars/6.jpg' },
    { rank: 7, username: 'Ice_Breaker', points: 1245, streak: 14, avatar: '/avatars/7.jpg' },
    { rank: 8, username: 'Night_Hawk', points: 1187, streak: 12, avatar: '/avatars/8.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gradient-tribe pb-20">
      {/* Tribe Header Banner */}
      <div className="relative bg-black/30 backdrop-blur-sm border-b border-white/10">
        <CulturalPattern variant="tribal" opacity={0.1} />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 bg-gradient-to-r ${tribeData.color} rounded-full flex items-center justify-center text-4xl shadow-glow-orange`}>
                {tribeData.icon}
              </div>
              <div>
                <h1 className="font-headline text-3xl text-white">{tribeData.name}</h1>
                <p className="text-gray-300 text-sm italic">"{tribeData.motto}"</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient-sunset">#{tribeData.rank}</div>
              <div className="text-gray-400 text-sm">This Week</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-glass text-center p-4">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-white font-bold text-xl">{tribeData.points.toLocaleString()}</div>
              <div className="text-gray-400 text-xs">Tribe Points</div>
            </div>
            <div className="card-glass text-center p-4">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-white font-bold text-xl">{tribeData.members.toLocaleString()}</div>
              <div className="text-gray-400 text-xs">Members</div>
            </div>
            <div className="card-glass text-center p-4">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-green-400 font-bold text-xl">{tribeData.weeklyChange}</div>
              <div className="text-gray-400 text-xs">This Week</div>
            </div>
            <div className="card-glass text-center p-4">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-heritage-gold font-bold text-xl">{tribeData.userContribution}</div>
              <div className="text-gray-400 text-xs">Your Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-card border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'home'
                  ? 'text-white border-b-2 border-heritage-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-white border-b-2 border-heritage-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Call to Action */}
            <div className={`card-tribe text-center py-8`}>
              <h2 className="font-headline text-3xl text-white mb-3">
                Help Your Tribe Climb! 🚀
              </h2>
              <p className="text-white/90 mb-6">
                Every transformation and vote counts towards your tribe's weekly rank
              </p>
              <Button
                onClick={() => navigate('/transform')}
                className="btn-primary text-lg px-8 py-4"
              >
                🎨 Create Transformation Now
              </Button>
            </div>

            {/* Top 3 Warriors Preview */}
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-2xl text-white">👑 Top Warriors</h3>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-heritage-orange hover:text-heritage-gold transition-colors font-semibold"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {topWarriors.slice(0, 3).map((warrior) => (
                  <div
                    key={warrior.rank}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl ${
                        warrior.rank === 1 ? 'text-heritage-gold' :
                        warrior.rank === 2 ? 'text-gray-400' :
                        'text-heritage-brown'
                      }`}>
                        {warrior.rank === 1 ? '🥇' : warrior.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-heritage-orange to-heritage-gold" />
                      <div>
                        <div className="text-white font-bold">@{warrior.username}</div>
                        <div className="text-gray-400 text-sm flex items-center space-x-2">
                          <span>🔥 {warrior.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-heritage-gold font-bold text-lg">
                        {warrior.points.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-glass">
                <h3 className="font-headline text-xl text-white mb-4">📊 This Week's Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">To Rank #1</span>
                      <span className="text-white font-bold">1,250 points</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-heritage-orange to-heritage-gold w-[73%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-glass">
                <h3 className="font-headline text-xl text-white mb-4">🎯 Your Impact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transformations</span>
                    <span className="text-white font-bold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Battle Votes</span>
                    <span className="text-white font-bold">147</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tribe Contribution</span>
                    <span className="text-heritage-gold font-bold">3.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-3xl text-white">🏆 Tribe Leaderboard</h2>
              <div className="text-sm text-gray-400">Resets every Monday</div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {topWarriors.map((warrior) => (
                <div
                  key={warrior.rank}
                  className={`card-glass flex items-center justify-between p-4 hover:bg-white/15 transition-all ${
                    warrior.rank <= 3 ? 'ring-2 ring-heritage-gold/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 text-center font-bold ${
                      warrior.rank === 1 ? 'text-heritage-gold text-2xl' :
                      warrior.rank === 2 ? 'text-gray-400 text-xl' :
                      warrior.rank === 3 ? 'text-heritage-brown text-xl' :
                      'text-white text-lg'
                    }`}>
                      {warrior.rank <= 3 ? 
                        (warrior.rank === 1 ? '🥇' : warrior.rank === 2 ? '🥈' : '🥉') :
                        `#${warrior.rank}`
                      }
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-heritage-orange to-heritage-gold" />
                    <div>
                      <div className="text-white font-bold">@{warrior.username}</div>
                      <div className="text-gray-400 text-sm flex items-center space-x-2">
                        <span>🔥 {warrior.streak} days</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-heritage-gold font-bold text-lg">
                      {warrior.points.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-xs">points</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center pt-6">
              <Button variant="outline" className="btn-outline">
                Load More Warriors
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TribePage;


