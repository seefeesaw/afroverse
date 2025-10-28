import React, { useState, useEffect } from 'react';
import Button from './Button';

const EnhancedShareModal = ({ 
  isOpen, 
  onClose, 
  battleData,
  title = "Challenge Your Friends!",
  description = "Share your transformation and see who dares to compete! 🔥"
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const shareUrl = battleData?.shareUrl || `${window.location.origin}/b/${battleData?.shortCode || 'demo'}`;
  const shareText = battleData?.shareText || `🔥 Check out my epic transformation! Think you can beat this? ⚔️ Join the battle at Afroverse!`;
  const imageUrl = battleData?.imageUrl || battleData?.transformedImage;

  const sharePlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💚',
      gradient: 'from-green-500 to-green-600',
      description: 'Instant challenge',
      isPrimary: true,
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(url, '_blank');
        setSelectedPlatform('whatsapp');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      gradient: 'from-blue-400 to-blue-500',
      description: 'Tweet it',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Afroverse,Transformation,Battle`;
        window.open(url, '_blank');
        setSelectedPlatform('twitter');
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      gradient: 'from-blue-600 to-blue-700',
      description: 'Post it',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        setSelectedPlatform('facebook');
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      gradient: 'from-pink-500 via-purple-500 to-orange-500',
      description: 'Story it',
      action: () => {
        // Copy to clipboard for Instagram
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setSelectedPlatform('instagram');
        // Show instructions
        alert('✨ Link copied! \n\n1. Open Instagram\n2. Create a Story\n3. Paste the link\n4. Add your transformation screenshot');
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      gradient: 'from-blue-400 to-blue-600',
      description: 'Send it',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        setSelectedPlatform('telegram');
      }
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '🔗',
      gradient: 'from-gray-600 to-gray-700',
      description: 'Copy & paste',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setSelectedPlatform('copy');
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 mb-4 sm:mb-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 animate-slide-up">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            ✕
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
        </div>

        {/* Preview Card */}
        {imageUrl && (
          <div className="p-6 border-b border-white/10">
            <div className="bg-black/30 rounded-xl p-4 flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg truncate">Your Epic Transformation 🔥</h3>
                <p className="text-gray-400 text-sm truncate">{shareUrl}</p>
              </div>
            </div>
          </div>
        )}

        {/* Share Options */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold text-lg mb-4">Share via:</h3>
          
          {/* Primary Option (WhatsApp) - Prominent */}
          {sharePlatforms
            .filter(p => p.isPrimary)
            .map((platform) => (
              <button
                key={platform.id}
                onClick={platform.action}
                className={`w-full bg-gradient-to-r ${platform.gradient} rounded-xl p-6 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group relative overflow-hidden`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{platform.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-xl">{platform.name}</div>
                      <div className="text-sm opacity-90">{platform.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-300 font-bold text-sm">👈 Recommended</span>
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </button>
            ))}

          {/* Other Options - Grid */}
          <div className="grid grid-cols-2 gap-3">
            {sharePlatforms
              .filter(p => !p.isPrimary)
              .map((platform) => (
                <button
                  key={platform.id}
                  onClick={platform.action}
                  className={`relative bg-gradient-to-r ${platform.gradient} rounded-xl p-4 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 group overflow-hidden`}
                >
                  {/* Check mark if selected */}
                  {selectedPlatform === platform.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{platform.name}</div>
                      <div className="text-xs opacity-80">{platform.description}</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-6 bg-black/30 border-t border-white/10 rounded-b-3xl">
          <div className="flex items-center justify-around text-center text-sm">
            <div>
              <div className="text-purple-400 font-bold text-xl">3x</div>
              <div className="text-gray-400 text-xs">More Votes</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <div className="text-pink-400 font-bold text-xl">5x</div>
              <div className="text-gray-400 text-xs">More Views</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <div className="text-yellow-400 font-bold text-xl">10x</div>
              <div className="text-gray-400 text-xs">Tribe Points</div>
            </div>
          </div>
        </div>

        {/* Copy Success Toast */}
        {copied && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl animate-bounce">
            ✓ Copied to clipboard!
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnhancedShareModal;


