import React, { useEffect, useState } from 'react';
import Button from '../common/Button';

const OnboardingCompleteScreen = ({ tribe, onComplete }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            <span className="text-4xl opacity-20">
              {['⚔️', '👑', '🔥', '⭐', '💫', '🏆'][Math.floor(Math.random() * 6)]}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse-slow">
            <span className="text-6xl">✓</span>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white leading-tight">
            You're All Set! 🎉
          </h1>
          <p className="text-2xl text-gray-300">
            Welcome to the {tribe?.name || 'tribe'}! {tribe?.emoji}
          </p>
        </div>

        {/* Quick Tips */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-6">
          <h2 className="text-white font-bold text-2xl text-center mb-6">
            Your Mission Starts Now! 🚀
          </h2>
          
          <div className="space-y-4">
            {[
              {
                icon: '📱',
                title: 'Swipe & Vote',
                description: 'Help your tribe by voting on battles in the feed'
              },
              {
                icon: '🎨',
                title: 'Create Transformations',
                description: 'Transform your selfies and challenge others'
              },
              {
                icon: '📤',
                title: 'Share & Recruit',
                description: 'Invite friends to join your tribe for bonus points'
              },
              {
                icon: '🏆',
                title: 'Climb the Ranks',
                description: 'Win battles to increase your personal and tribe rank'
              }
            ].map((tip, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-black/30 rounded-xl p-4"
              >
                <div className="text-3xl flex-shrink-0">{tip.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">{tip.title}</h3>
                  <p className="text-gray-300 text-sm">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Your Rank', value: 'Recruit', icon: '🎖️' },
            { label: 'Tribe Rank', value: `#${Math.floor(Math.random() * 6) + 1}`, icon: '🏆' },
            { label: 'Ready to', value: 'Battle!', icon: '⚔️' }
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center border border-purple-500/30">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="text-center">
          <div className="inline-block bg-black/50 backdrop-blur-sm rounded-full px-8 py-4 border-2 border-purple-500">
            <p className="text-white text-lg">
              Entering the battle feed in{' '}
              <span className="text-4xl font-bold text-purple-400 animate-pulse">
                {countdown}
              </span>
            </p>
          </div>
        </div>

        {/* Manual Entry Button */}
        <div className="text-center">
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-3 rounded-xl font-bold"
          >
            Enter Now →
          </Button>
        </div>
      </div>

      {/* Custom CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OnboardingCompleteScreen;


