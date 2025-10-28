import React, { useState } from 'react';
import Button from '../common/Button';

const ChallengePromptScreen = ({ result, onNext, onSkip }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = `${window.location.origin}/b/example-battle-code`;
  const shareText = `🔥 Check out my epic ${result?.style?.name || 'transformation'}! Think you can beat this? ⚔️ Join the battle!`;

  const sharePlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💚',
      color: 'from-green-500 to-green-600',
      primary: true,
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'from-blue-400 to-blue-500',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'from-blue-600 to-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'from-pink-500 to-purple-600',
      action: () => {
        // Instagram doesn't support direct sharing via URL, so copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Link copied! Share it on Instagram Stories or Posts 📸');
      }
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '🔗',
      color: 'from-gray-500 to-gray-600',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard! 📋');
      }
    }
  ];

  const handleShare = (platform) => {
    setSelectedPlatform(platform.id);
    setIsSharing(true);
    platform.action();
    
    setTimeout(() => {
      onNext({ challengeSent: true, platform: platform.id });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Bot Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-xl leading-relaxed">
                <span className="font-bold text-2xl block mb-2">🔥 You look INCREDIBLE!</span>
                Now challenge your friends to beat your transformation! Who dares to compete? ⚔️
              </p>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border-2 border-purple-500/50">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/30">
              <img
                src={result?.transformedImage || '/placeholder-transform.jpg'}
                alt="Your transformation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">Your {result?.style?.name}</h3>
              <p className="text-gray-300 text-sm">Ready to dominate the battlefield! 👑</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg text-center">Choose where to share:</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {sharePlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform)}
                disabled={isSharing}
                className={`relative group ${
                  platform.primary ? 'col-span-2' : ''
                } bg-gradient-to-r ${platform.color} rounded-xl p-6 text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <span>{platform.name}</span>
                  {platform.primary && <span className="text-sm">👈 Best for challenges!</span>}
                </div>
                
                {selectedPlatform === platform.id && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            💡 Sharing your transformation gets you more votes and helps your tribe!
          </p>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Skip for now →
          </Button>
        </div>

        {/* Virality Stats */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-purple-400 font-bold text-2xl">10x</div>
              <div className="text-gray-400 text-xs">More Visibility</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <div className="text-pink-400 font-bold text-2xl">5x</div>
              <div className="text-gray-400 text-xs">More Votes</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <div className="text-yellow-400 font-bold text-2xl">3x</div>
              <div className="text-gray-400 text-xs">Tribe Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePromptScreen;


