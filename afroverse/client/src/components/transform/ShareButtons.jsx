import React, { useState } from 'react';
import { useTransform } from '../../hooks/useTransform';
import Button from '../common/Button';
import Card from '../common/Card';

const ShareButtons = ({ shareUrl, shareText, onClose }) => {
  const { shareToSocial, copyToClipboard } = useTransform();
  const [copied, setCopied] = useState(false);

  const handleShare = (platform) => {
    shareToSocial(platform, shareUrl, shareText);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const shareOptions = [
    {
      platform: 'whatsapp',
      name: 'WhatsApp',
      emoji: '💬',
      color: 'from-green-500 to-green-600'
    },
    {
      platform: 'twitter',
      name: 'Twitter',
      emoji: '🐦',
      color: 'from-blue-400 to-blue-500'
    },
    {
      platform: 'facebook',
      name: 'Facebook',
      emoji: '📘',
      color: 'from-blue-600 to-blue-700'
    },
    {
      platform: 'instagram',
      name: 'Instagram',
      emoji: '📷',
      color: 'from-pink-500 to-purple-600'
    },
    {
      platform: 'tiktok',
      name: 'TikTok',
      emoji: '🎵',
      color: 'from-gray-800 to-gray-900'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Share Your Transformation
          </h3>
          <p className="text-gray-300 text-sm">
            Show off your amazing cultural transformation!
          </p>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => (
            <Button
              key={option.platform}
              onClick={() => handleShare(option.platform)}
              className={`bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{option.emoji}</span>
                <span className="text-sm">{option.name}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full bg-transparent text-white text-sm border-none outline-none"
            />
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            {copied ? '✓ Link Copied!' : '📋 Copy Link'}
          </Button>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Close
        </Button>

        {/* Share Text Preview */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-xs mb-1">Preview:</p>
          <p className="text-white text-sm">{shareText}</p>
        </div>
      </Card>
    </div>
  );
};

export default ShareButtons;
