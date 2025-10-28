import React, { useState } from 'react';
import { FaCopy, FaCheck, FaFacebook, FaTwitter, FaWhatsapp, FaShareAlt } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const ShareModal = ({ isOpen, onClose, shareUrl, title = "Share" }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = shareUrl || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check this out: ${title}`,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Share</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Social Media Icons */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all group"
            >
              <FaFacebook className="text-3xl text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm text-gray-600">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <FaTwitter className="text-3xl text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm text-gray-600">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all group"
            >
              <FaWhatsapp className="text-3xl text-green-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm text-gray-600">WhatsApp</span>
            </button>
          </div>

          {/* Link Copy Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copy Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={fullUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <FaCheck className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Share Button */}
          {navigator.share && (
            <button
              onClick={nativeShare}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaShareAlt className="w-4 h-4" />
              <span>Share via...</span>
            </button>
          )}
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default ShareModal;


