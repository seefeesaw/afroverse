import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const StreakSaveModal = ({ isOpen, onClose, onSave, currentStreak = 7 }) => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-orange-900 to-red-900 rounded-3xl shadow-2xl border-4 border-orange-500 overflow-hidden animate-shake">
        {/* Warning Pulse */}
        <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>

        <div className="relative p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            ✕
          </button>

          {/* Icon */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-2xl animate-pulse">
                <span className="text-5xl">🔥</span>
              </div>
              {/* Streak Badge */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-orange-900 shadow-xl">
                <span className="text-lg font-bold">{currentStreak}</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              🚨 Your Streak is at Risk!
            </h2>
            <p className="text-orange-200">
              Don't lose your {currentStreak}-day streak! 
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-orange-500/50">
            <div className="text-center mb-3">
              <p className="text-orange-300 text-sm font-semibold mb-2">Time to save your streak:</p>
              <div className="flex items-center justify-center space-x-2">
                <TimeUnit value={hours} label="H" />
                <span className="text-white text-2xl">:</span>
                <TimeUnit value={minutes} label="M" />
                <span className="text-white text-2xl">:</span>
                <TimeUnit value={seconds} label="S" />
              </div>
            </div>
          </div>

          {/* What You'll Lose */}
          <div className="bg-red-500/20 rounded-xl p-4 mb-6 border border-red-500/50">
            <h3 className="text-white font-bold mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              If you don't save your streak:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-white/80">
                <span>❌</span>
                <span>Lose {currentStreak}-day streak</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <span>❌</span>
                <span>Lose streak multiplier ({currentStreak}x bonus)</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <span>❌</span>
                <span>Drop in leaderboard rankings</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <span>❌</span>
                <span>Lose tribe contribution points</span>
              </div>
            </div>
          </div>

          {/* Streak Save Option */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 mb-6 text-center">
            <div className="text-white font-bold text-lg mb-1">One-Time Streak Save</div>
            <div className="text-white/90 text-sm mb-3">Protect your hard-earned streak!</div>
            <div className="text-white text-4xl font-bold">$0.99</div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onSave();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg py-4 rounded-xl font-bold shadow-xl"
            >
              🔥 Save My Streak - $0.99
            </Button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              Let it expire (lose streak)
            </button>
          </div>

          {/* Social Pressure */}
          <div className="mt-6 pt-6 border-t border-orange-500/30">
            <p className="text-center text-orange-300 text-sm">
              💬 <strong>347 users</strong> saved their streaks today!
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Time Unit Component
const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
      <span className="text-white text-2xl font-bold">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-orange-300 text-xs mt-1">{label}</span>
  </div>
);

export default StreakSaveModal;


