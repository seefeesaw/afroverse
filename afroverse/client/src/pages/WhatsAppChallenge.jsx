/**
 * SCREEN 10 - WHATSAPP BATTLE CTA (DEEP LINK PAGE)
 * Purpose: Convert WhatsApp viewers to users/voters
 * 
 * Features:
 * - Challenge preview
 * - Clear value proposition
 * - Two CTAs: Accept & Transform / Just Vote
 * - Trust indicators
 * - Fast loading for mobile
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const WhatsAppChallenge = () => {
  const navigate = useNavigate();
  const { shortCode } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [challengeData, setChallengeData] = useState(null);

  // Fetch challenge data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChallengeData({
        challengerName: 'KofiKing',
        challengerAvatar: '👑',
        challengerTribe: '🦁 Zulu',
        challengerImage: '/images/challenger.jpg',
        message: 'Beat me if you can! 🔥',
        totalVotes: 1234,
        timeLeft: '23h 45m',
      });
      setIsLoading(false);
    }, 1000);
  }, [shortCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pattern-overlay"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-gradient-vibranium text-3xl font-headline font-black mb-2">
            AfroMoji
          </h1>
          <p className="text-text-secondary text-sm">Heritage Transformation Battles</p>
        </div>

        {/* Challenge Card */}
        <div className="card-battle mb-8">
          {/* Challenge Header */}
          <div className="text-center mb-6">
            <span className="text-6xl mb-4 block animate-bounce">🔥</span>
            <h2 className="text-white text-2xl font-bold mb-2">
              You've Been Challenged!
            </h2>
            <p className="text-text-secondary">
              <strong className="text-gold">@{challengeData.challengerName}</strong> has called you to a Heritage Battle
            </p>
          </div>

          {/* Challenger Preview */}
          <div className="relative mb-6">
            <img
              src={challengeData.challengerImage}
              alt={challengeData.challengerName}
              className="img-battle mx-auto"
            />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{challengeData.challengerAvatar}</span>
                  <div>
                    <p className="text-white font-bold">@{challengeData.challengerName}</p>
                    <span className="badge-tribe text-xs">{challengeData.challengerTribe}</span>
                  </div>
                </div>
                <span className="badge-purple">⏱️ {challengeData.timeLeft}</span>
              </div>
            </div>
          </div>

          {/* Challenge Message */}
          {challengeData.message && (
            <div className="bg-surface/50 rounded-lg p-4 mb-6 text-center">
              <p className="text-white italic">"{challengeData.message}"</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-6 text-sm text-text-secondary">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{challengeData.totalVotes}</p>
              <p>Votes</p>
            </div>
            <div className="w-px h-12 bg-divider"></div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">{challengeData.timeLeft}</p>
              <p>Time Left</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-4 mb-8">
          {/* Primary CTA - Accept & Transform */}
          <button
            onClick={() => navigate('/transform', {
              state: { challengeId: shortCode, challenger: challengeData.challengerName }
            })}
            className="btn-primary w-full text-xl py-6 animate-vote-pulse"
          >
            🔥 Accept & Transform
          </button>

          {/* Secondary CTA - Just Vote */}
          <button
            onClick={() => navigate(`/battle/${shortCode}`)}
            className="btn-secondary w-full py-4"
          >
            👁️ Just Vote
          </button>
        </div>

        {/* How It Works */}
        <div className="card-glass p-6 mb-8">
          <h3 className="text-white text-lg font-bold mb-4 text-center">
            How It Works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <p className="text-white font-semibold">1. Upload Your Selfie</p>
                <p className="text-text-secondary text-sm">Take a quick photo or upload one</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-white font-semibold">2. AI Transforms You</p>
                <p className="text-text-secondary text-sm">Become your heritage in 60 seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="text-white font-semibold">3. Battle for Glory</p>
                <p className="text-text-secondary text-sm">Compete and earn tribe points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 mb-8 text-text-secondary text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Safe & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>60 Seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎨</span>
            <span>AI Powered</span>
          </div>
        </div>

        {/* Live Stats Banner */}
        <div className="card-glass text-center p-4">
          <p className="text-text-secondary text-sm mb-2">Join the community</p>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-gold font-bold text-lg">41,557</p>
              <p className="text-text-tertiary text-xs">Warriors</p>
            </div>
            <div className="w-px h-8 bg-divider"></div>
            <div>
              <p className="text-gold font-bold text-lg">2,341</p>
              <p className="text-text-tertiary text-xs">Battles Today</p>
            </div>
            <div className="w-px h-8 bg-divider"></div>
            <div>
              <p className="text-gold font-bold text-lg">156k</p>
              <p className="text-text-tertiary text-xs">Transformations</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-4 text-text-tertiary text-xs">
            <button className="hover:text-white transition-colors">Terms</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Privacy</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Help</button>
          </div>
          <p className="text-text-tertiary text-xs">
            © 2025 AfroMoji • Made with pride for Africa 🌍
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChallenge;


