import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const WowRevealScreen = ({ result, onNext }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Reveal animation
    const timer = setTimeout(() => {
      setIsRevealed(true);
      setShowConfetti(true);
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '✨', '🔥', '👑', '⭐', '💫'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Bot Reaction */}
        <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-500 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-2xl font-bold leading-relaxed">
                🔥 INCREDIBLE! You look absolutely LEGENDARY! 👑✨
              </p>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-300 ${
          isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Before */}
          <div className="space-y-3">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide text-center">Before</p>
            <div className="relative rounded-2xl overflow-hidden border-4 border-gray-600">
              <img
                src={result?.originalImage || '/placeholder.jpg'}
                alt="Before"
                className="w-full h-auto aspect-square object-cover"
              />
            </div>
          </div>

          {/* After */}
          <div className="space-y-3">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide text-center">After</p>
            <div className="relative rounded-2xl overflow-hidden border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
              <img
                src={result?.transformedImage || '/placeholder-transform.jpg'}
                alt="After"
                className="w-full h-auto aspect-square object-cover"
              />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-500 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {[
            { label: 'Epicness', value: '100%', icon: '🔥' },
            { label: 'Style', value: 'Legendary', icon: '⭐' },
            { label: 'Power', value: 'Maximum', icon: '💪' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className={`space-y-4 transition-all duration-700 delay-700 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Button
            onClick={() => onNext({ sharePrompt: true })}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-4 rounded-xl font-bold shadow-xl"
          >
            ⚔️ Challenge Someone
          </Button>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => onNext({ tryAnother: true })}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              🎨 Try Another Style
            </Button>
            
            <Button
              onClick={() => onNext()}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Continue →
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WowRevealScreen;


