/**
 * SCREEN 6 - SHARE FLOW (WHATSAPP-FIRST VIRAL LOOP)
 * Purpose: Maximize viral sharing with WhatsApp-first approach
 * 
 * Features:
 * - Share card preview
 * - WhatsApp primary CTA
 * - Copy link option
 * - Download share card (1:1 or 9:16)
 * - Auto-generated message
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ShareFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { image, style, battleId } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' or '9:16'

  const shareUrl = battleId
    ? `${window.location.origin}/battle/${battleId}`
    : `${window.location.origin}/challenge/${Math.random().toString(36).substr(2, 9)}`;

  const shareMessage = battleId
    ? `🔥 Vote for me in this Heritage Battle! Representing ${style?.label || 'my tribe'}. 10 seconds to vote. ${shareUrl}`
    : `✨ Check out my AfroMoji transformation! I became ${style?.label || 'a warrior'}! Create yours: ${shareUrl}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // In real app, this would generate a proper share card with branding
    const link = document.createElement('a');
    link.href = image;
    link.download = `afromoji-share-${aspectRatio.replace(':', 'x')}.jpg`;
    link.click();
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AfroMoji Transformation',
        text: shareMessage,
        url: shareUrl,
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-surface border-b border-divider py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-gradient-vibranium text-xl font-headline font-bold">
            Share Your Power
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Share Header */}
        <div className="text-center mb-12">
          <h2 className="text-gradient-gold text-3xl font-headline font-black mb-3">
            Help Your Tribe Win! 👑
          </h2>
          <p className="text-text-secondary">
            Share with friends and earn tribe points
          </p>
        </div>

        {/* Share Card Preview */}
        <div className="card-glass mb-8">
          <div className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden shadow-neon-purple mb-4">
            {image && (
              <img
                src={image}
                alt="Share preview"
                className="w-full h-full object-cover"
              />
            )}
            {/* AfroMoji Watermark */}
            <div className="absolute bottom-4 right-4 text-white/30 text-xs">
              AfroMoji.ai
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all
                ${aspectRatio === '1:1'
                  ? 'bg-vibranium text-white shadow-glow-purple'
                  : 'bg-surface text-text-secondary hover:text-white'
                }
              `}
            >
              1:1 (WhatsApp)
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all
                ${aspectRatio === '9:16'
                  ? 'bg-vibranium text-white shadow-glow-purple'
                  : 'bg-surface text-text-secondary hover:text-white'
                }
              `}
            >
              9:16 (Stories)
            </button>
          </div>

          {/* Message Preview */}
          <div className="bg-surface rounded-lg p-4">
            <p className="text-text-secondary text-sm mb-2">Your message:</p>
            <p className="text-white">{shareMessage}</p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-4">
          {/* WhatsApp - Primary */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full bg-green-success text-white py-5 rounded-lg font-bold text-lg shadow-glow-green hover:scale-105 transition-transform flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📱</span>
            Share on WhatsApp
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">{copied ? '✅' : '📋'}</span>
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">⬇️</span>
            Download Share Card
          </button>

          {/* Native Share (if available) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="btn-ghost w-full py-4 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📤</span>
              More Options
            </button>
          )}
        </div>

        {/* Incentive Card */}
        <div className="card-tribe text-center p-6 mt-12">
          <span className="text-5xl mb-4 block">🎁</span>
          <h3 className="text-white text-xl font-bold mb-2">
            Earn Rewards!
          </h3>
          <p className="text-text-secondary mb-4">
            Get 50 tribe points for every friend who joins through your link
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div>
              <p className="text-gold font-bold text-2xl">0</p>
              <p className="text-text-tertiary">Friends joined</p>
            </div>
            <div className="w-px h-12 bg-divider"></div>
            <div>
              <p className="text-gold font-bold text-2xl">0</p>
              <p className="text-text-tertiary">Points earned</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/feed')}
            className="text-text-secondary hover:text-white transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareFlow;


