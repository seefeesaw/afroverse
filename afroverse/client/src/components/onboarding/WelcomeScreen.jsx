import React, { useEffect, useState } from 'react';
import Button from '../common/Button';

const WelcomeScreen = ({ onNext }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="animate-bounce-slow">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-6xl">👑</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Afroverse
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Transform. Battle. Conquer.
          </p>
        </div>

        {/* Value Props */}
        <div className="space-y-4 text-left max-w-md mx-auto">
          {[
            { icon: '🎨', text: 'AI-powered cultural transformations' },
            { icon: '⚔️', text: 'Battle in epic tribe wars' },
            { icon: '🏆', text: 'Climb the leaderboard' },
            { icon: '🔥', text: 'Share & challenge friends' }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-white font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-6">
          <Button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-4 rounded-xl font-bold shadow-xl transform transition-all duration-200 hover:scale-105"
          >
            🚀 Let's Begin
          </Button>
          <p className="text-sm text-gray-400">
            Your first transformation is FREE
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;


