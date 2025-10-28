/**
 * SCREEN 1 - LANDING / HERO (PUBLIC SCREEN)
 * Purpose: Drive first action fast (Upload → Transform → Share)
 * 
 * Features:
 * - Auto-carousel with 3 African transformations
 * - Live stats with count-up animation
 * - TikTok-like battle preview
 * - Primary CTAs with pulsing glow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [battlesToday, setBattlesToday] = useState(0);
  const [warriorsOnline, setWarriorsOnline] = useState(0);

  // Hero carousel images
  const heroSlides = [
    { image: '/images/hero-pharaoh.jpg', alt: 'Pharaoh Transformation' },
    { image: '/images/hero-zulu.jpg', alt: 'Zulu Warrior Transformation' },
    { image: '/images/hero-maasai.jpg', alt: 'Maasai Transformation' },
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Count-up animation for stats
  useEffect(() => {
    const battlesTarget = 2341;
    const warriorsTarget = 41557;
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setBattlesToday(Math.floor(battlesTarget * progress));
      setWarriorsOnline(Math.floor(warriorsTarget * progress));

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const liveBattles = [
    { id: 1, challenger: 'Kofi', defender: 'Amara', votes: 234, tribe1: '🦁', tribe2: '🐘' },
    { id: 2, challenger: 'Zuri', defender: 'Malik', votes: 189, tribe1: '⚔️', tribe2: '👑' },
    { id: 3, challenger: 'Nia', defender: 'Jabari', votes: 312, tribe1: '🔥', tribe2: '🌍' },
    { id: 4, challenger: 'Amani', defender: 'Tunde', votes: 267, tribe1: '🦅', tribe2: '🦁' },
    { id: 5, challenger: 'Zola', defender: 'Kwame', votes: 198, tribe1: '👑', tribe2: '⚔️' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`
                absolute inset-0 transition-opacity duration-1000
                ${index === currentSlide ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-bg-dark"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          {/* Headline */}
          <h1 className="text-gradient-vibranium font-headline text-5xl md:text-7xl font-black mb-6 animate-fade-in">
            Become Your Heritage<br />in 60 Seconds
          </h1>

          {/* Sub-headline */}
          <p className="text-white text-xl md:text-2xl mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Transform. Battle. Conquer.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/transform')}
            className="btn-primary text-xl px-12 py-5 mb-4 animate-vote-pulse"
          >
            🔥 Start Transformation
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate('/feed')}
            className="btn-secondary text-lg px-10 py-4"
          >
            👁️ Watch Battles
          </button>

          {/* Live Stats Bar */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
            <div className="card-glass flex items-center justify-center gap-8 py-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-white font-bold">{battlesToday.toLocaleString()}</span>
                <span className="text-text-secondary text-sm">Battles today</span>
              </div>
              <div className="w-px h-8 bg-divider"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span className="text-white font-bold">{warriorsOnline.toLocaleString()}</span>
                <span className="text-text-secondary text-sm">Warriors online</span>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentSlide ? 'bg-primary-purple w-8' : 'bg-white/30'}
                `}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-gradient-purple text-4xl font-headline font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-vibranium rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-purple text-4xl">
                📸
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">① Upload</h3>
              <p className="text-text-secondary">
                Take a selfie or upload your photo
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-vibranium rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-purple text-4xl">
                ✨
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">② Transform</h3>
              <p className="text-text-secondary">
                AI creates your heritage transformation
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-vibranium rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-purple text-4xl">
                ⚔️
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">③ Battle</h3>
              <p className="text-text-secondary">
                Challenge others and earn tribe glory
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Battle Feed Preview */}
      <section className="py-20 px-6 bg-dark-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-gradient-purple text-4xl font-headline font-bold text-center mb-4">
            Live Battles
          </h2>
          <p className="text-text-secondary text-center mb-12">
            Join thousands of warriors battling right now
          </p>

          {/* Battle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveBattles.slice(0, 3).map((battle) => (
              <div
                key={battle.id}
                className="card-battle cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/battle/${battle.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{battle.tribe1}</span>
                    <span className="text-white font-semibold">{battle.challenger}</span>
                  </div>
                  <span className="text-gold text-xl">⚡ VS</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{battle.defender}</span>
                    <span className="text-2xl">{battle.tribe2}</span>
                  </div>
                </div>

                <div className="bg-surface-hover h-32 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">⚔️</span>
                </div>

                <div className="text-center">
                  <p className="text-text-secondary text-sm mb-2">
                    {battle.votes} votes
                  </p>
                  <button className="btn-primary w-full py-2 text-sm">
                    Vote Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/feed')}
              className="btn-secondary px-8 py-3"
            >
              View All Battles →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-divider py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/auth')} className="text-text-secondary hover:text-white transition-colors">
              Login
            </button>
            <button className="text-text-secondary hover:text-white transition-colors">
              Terms
            </button>
            <button className="text-text-secondary hover:text-white transition-colors">
              Language
            </button>
          </div>

          <div className="text-text-tertiary text-sm">
            © 2025 AfroMoji. Rise, Warrior. Your Tribe Awaits. 👑
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHero;


