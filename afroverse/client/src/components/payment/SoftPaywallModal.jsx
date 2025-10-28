import React from 'react';
import Button from '../common/Button';

const SoftPaywallModal = ({ isOpen, onClose, onUpgrade, reason = 'transform_limit' }) => {
  if (!isOpen) return null;

  const paywallContent = {
    transform_limit: {
      title: 'Transform Limit Reached! 🎨',
      subtitle: 'You\'ve used your 3 free daily transformations',
      benefits: [
        '🔥 Unlimited daily transformations',
        '⚡ Priority processing (2x faster)',
        '👑 Exclusive premium styles',
        '🎯 Advanced editing features',
        '📤 Remove watermarks',
        '🏆 Double tribe points'
      ],
      cta: 'Upgrade to Warrior',
      price: '$4.99/month'
    },
    battle_limit: {
      title: 'Battle Limit Reached! ⚔️',
      subtitle: 'Free users can create 3 battles per day',
      benefits: [
        '⚔️ Unlimited battle creation',
        '🔥 Priority in battle feed',
        '🏆 2x points for wins',
        '📊 Advanced battle analytics',
        '🎯 Target specific tribes',
        '👑 Exclusive battle badges'
      ],
      cta: 'Go Warrior',
      price: '$4.99/month'
    },
    premium_feature: {
      title: 'Premium Feature 👑',
      subtitle: 'This feature is only available to Warriors',
      benefits: [
        '🔥 All premium features unlocked',
        '⚡ Unlimited everything',
        '👑 Exclusive content',
        '🎯 Advanced tools',
        '📊 Detailed analytics',
        '🏆 Priority support'
      ],
      cta: 'Become a Warrior',
      price: '$4.99/month'
    }
  };

  const content = paywallContent[reason] || paywallContent.transform_limit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border-2 border-purple-500/50 overflow-hidden animate-scale-in">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse-slow"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          ✕
        </button>

        <div className="relative p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-2xl animate-bounce-slow">
              <span className="text-4xl">👑</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{content.title}</h2>
            <p className="text-gray-300">{content.subtitle}</p>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-center">
            <div className="text-white text-5xl font-bold mb-2">{content.price}</div>
            <div className="text-white/80 text-sm">Billed monthly • Cancel anytime</div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Warrior Benefits:</h3>
            {content.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-4 rounded-xl font-bold shadow-xl"
            >
              {content.cta} 🚀
            </Button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Instant Access</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💳</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SoftPaywallModal;


