import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ShareButtons = ({ shareUrl, shareText, onClose }) => {
  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
      tiktok: `https://www.tiktok.com/`, // TikTok doesn't support direct sharing
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could show a toast here
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const shareOptions = [
    {
      platform: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      platform: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400 hover:bg-blue-500'
    },
    {
      platform: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      platform: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      platform: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black hover:bg-gray-800'
    }
  ];

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Share Battle</h2>
          <p className="text-gray-300 text-sm">
            Share this epic battle with your friends!
          </p>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => (
            <Button
              key={option.platform}
              onClick={() => handleShare(option.platform)}
              className={`${option.color} text-white p-3 flex items-center justify-center space-x-2`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium">{option.name}</span>
            </Button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            📋 Copy Link
          </Button>
        </div>

        {/* Battle Link Preview */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">Battle Link:</div>
          <div className="text-sm text-gray-300 break-all">
            {shareUrl}
          </div>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ShareButtons;
