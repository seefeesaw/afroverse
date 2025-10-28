import React from 'react';
import CulturalPattern from './CulturalPattern';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-tribe">
      <CulturalPattern variant="ndebele" opacity={0.1} />
      
      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-heritage-orange to-heritage-gold rounded-full animate-ping opacity-75" />
          <div className="relative w-32 h-32 bg-gradient-to-r from-heritage-orange to-heritage-gold rounded-full flex items-center justify-center shadow-glow-orange">
            <span className="text-6xl animate-pulse">👑</span>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="font-headline text-2xl text-white mb-4">{message}</h2>

        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-heritage-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-heritage-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-heritage-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;


