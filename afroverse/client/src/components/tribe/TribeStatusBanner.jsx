import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TribeStatusBanner = ({ tribe }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('23:45:12');

  // Simulate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      // This would be calculated from actual server time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const tribeColors = {
    warriors: 'from-red-500 to-orange-600',
    royals: 'from-purple-500 to-pink-600',
    legends: 'from-yellow-400 to-orange-500',
    mystics: 'from-indigo-500 to-purple-600',
    nomads: 'from-amber-600 to-yellow-700',
    guardians: 'from-blue-500 to-cyan-600'
  };

  const tribeEmojis = {
    warriors: '⚔️',
    royals: '👑',
    legends: '⭐',
    mystics: '🔮',
    nomads: '🏜️',
    guardians: '🛡️'
  };

  const tribeColor = tribeColors[tribe?.id] || 'from-purple-500 to-pink-600';
  const tribeEmoji = tribeEmojis[tribe?.id] || '⚔️';
  const currentRank = tribe?.rank || Math.floor(Math.random() * 6) + 1;
  const isWinning = currentRank === 1;
  const isLosing = currentRank > 3;

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${tribeColor} opacity-20`}></div>
      
      {/* Banner Content */}
      <div className="relative px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left: Tribe Info */}
          <button
            onClick={() => navigate('/tribe')}
            className="flex items-center space-x-3 group"
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${tribeColor} rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
              {tribeEmoji}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-sm">{tribe?.name || 'Your Tribe'}</span>
                {isWinning && <span className="text-xs">🔥</span>}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-300">
                  Rank #{currentRank}
                </span>
                {isWinning && (
                  <span className="text-xs text-green-400 font-semibold">Leading! 👑</span>
                )}
                {isLosing && (
                  <span className="text-xs text-red-400 font-semibold">Need help! 🚨</span>
                )}
              </div>
            </div>
          </button>

          {/* Center: Progress/Urgency Message */}
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-white text-xs font-medium">
              {isWinning
                ? '🎯 Defend your position!'
                : isLosing
                ? '⚡ Help your tribe climb!'
                : '💪 Push for #1!'}
            </span>
          </div>

          {/* Right: Timer & Actions */}
          <div className="flex items-center space-x-3">
            {/* Countdown */}
            <div className="flex items-center space-x-2 bg-black/30 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-300">⏰</span>
              <span className="text-white font-mono text-xs font-bold">{timeLeft}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 max-w-screen-xl mx-auto">
          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tribeColor} transition-all duration-500`}
              style={{ width: `${Math.max(20, 100 - (currentRank - 1) * 20)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribeStatusBanner;


