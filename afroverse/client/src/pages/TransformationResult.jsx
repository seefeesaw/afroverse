/**
 * SCREEN 3 - TRANSFORMATION RESULT (WOW MOMENT)
 * Purpose: WOW → SHARE → BATTLE (the most important viral moment)
 * 
 * Features:
 * - Before/After slider with Ken Burns effect
 * - Confetti celebration animation
 * - Primary CTAs: Challenge, Share, Try Another
 * - Tribe joining prompt
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransformationResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Get data from navigation state
  const { image: beforeImage, style } = location.state || {};

  // Simulate after image (in real app, this comes from AI API)
  const afterImage = beforeImage; // Replace with actual transformed image

  // Trigger confetti on mount
  useEffect(() => {
    setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 500);

    setTimeout(() => setIsRevealed(true), 1000);
  }, []);

  const handleChallenge = () => {
    navigate('/create-battle', {
      state: { transformationImage: afterImage, style }
    });
  };

  const handleShare = () => {
    // In real app, this would open native share or WhatsApp
    if (navigator.share) {
      navigator.share({
        title: 'Check out my Heritage Transformation!',
        text: `I just transformed into a ${style?.label}! Vote for me!`,
        url: window.location.href,
      });
    } else {
      navigate('/share', {
        state: { image: afterImage, style }
      });
    }
  };

  const handleDownload = () => {
    // Download functionality
    const link = document.createElement('a');
    link.href = afterImage;
    link.download = `afromoji-${style?.id}-transformation.jpg`;
    link.click();
  };

  const handleTryAnother = () => {
    navigate('/transform');
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                width: '10px',
                height: '10px',
                background: ['#6F2CFF', '#F5B63F', '#FF4D6D', '#2AB9FF', '#3CCF4E'][i % 5],
                borderRadius: i % 2 === 0 ? '50%' : '0',
                animationDelay: `${i * 0.02}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-lg border-b border-divider py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/transform')}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-gradient-vibranium text-xl font-headline font-bold">
            Your Transformation
          </h1>
          <button
            onClick={handleDownload}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ⬇ Save
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Title */}
          <h1 className={`
            text-gradient-gold text-4xl md:text-5xl font-headline font-black text-center mb-8
            ${isRevealed ? 'animate-bounce-in' : 'opacity-0'}
          `}>
            Your Heritage Awaits 👑
          </h1>

          {/* Before/After Slider */}
          <div className="relative w-full aspect-[9/16] max-h-[600px] mx-auto mb-12 rounded-lg overflow-hidden shadow-neon-purple">
            {/* After Image (Full) */}
            <div className="absolute inset-0">
              <img
                src={afterImage}
                alt="After transformation"
                className="w-full h-full object-cover"
                style={{
                  animation: isRevealed ? 'kenBurns 20s ease-in-out infinite alternate' : 'none',
                }}
              />
            </div>

            {/* Before Image (Clipped) */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <img
                src={beforeImage}
                alt="Before transformation"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                const handleMouseMove = (moveEvent) => {
                  const rect = e.currentTarget.parentElement.getBoundingClientRect();
                  const x = moveEvent.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  setSliderPosition(Math.max(0, Math.min(100, percentage)));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                setSliderPosition(Math.max(0, Math.min(100, percentage)));
              }}
            >
              {/* Handle Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-vibranium rounded-full shadow-glow-purple flex items-center justify-center">
                <span className="text-white">⟷</span>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 badge-purple">Before</div>
            <div className="absolute top-4 right-4 badge-gold">After</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary CTA - Challenge */}
            <button
              onClick={handleChallenge}
              className="btn-primary w-full text-xl py-5 animate-vote-pulse"
            >
              🔥 Challenge Someone
            </button>

            {/* Share on WhatsApp */}
            <button
              onClick={handleShare}
              className="bg-green-success text-white w-full text-lg py-4 rounded-lg font-bold shadow-glow-green hover:scale-105 transition-transform"
            >
              ▶ Share on WhatsApp
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleTryAnother}
                className="btn-secondary py-3"
              >
                ✨ Try Another
              </button>
              <button
                onClick={handleDownload}
                className="btn-secondary py-3"
              >
                ⬇ Download
              </button>
            </div>
          </div>

          {/* Tribe Prompt */}
          <div className="mt-12 card-tribe text-center p-6">
            <h3 className="text-white text-xl font-bold mb-2">
              Earn Tribe Points by Battling
            </h3>
            <p className="text-text-secondary mb-4">
              Join a tribe and fight for glory
            </p>
            <button
              onClick={() => navigate('/tribe-selection')}
              className="btn-primary px-8 py-3"
            >
              👑 Join a Tribe
            </button>
          </div>
        </div>
      </div>

      {/* Ken Burns Effect Keyframes */}
      <style>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.1) translate(-2%, -2%);
          }
          100% {
            transform: scale(1) translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default TransformationResult;


