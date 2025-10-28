/**
 * VibraniumChatBubble - ChatGPT-style chat bubbles
 * 
 * Features:
 * - Bot bubbles with purple glow gradient
 * - User bubbles with surface background
 * - Slide-in animation
 * - Support for text, buttons, and images
 */

import React from 'react';

const VibraniumChatBubble = ({ 
  type = 'bot', // 'bot' or 'user'
  message,
  buttons = [],
  image = null,
  avatar = null
}) => {
  const isBot = type === 'bot';

  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} animate-slide-in`}>
      {/* Bot Avatar */}
      {isBot && avatar && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-vibranium flex items-center justify-center text-white">
            {avatar}
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className={`
        max-w-[80%]
        ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}
      `}>
        {/* Image (if provided) */}
        {image && (
          <div className="mb-3">
            <img 
              src={image} 
              alt="Message attachment" 
              className="rounded-lg max-w-full"
            />
          </div>
        )}

        {/* Text Message */}
        <p className="text-white text-sm leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs text-white transition-all duration-200"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isBot && avatar && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-white border border-primary-purple">
            {avatar}
          </div>
        </div>
      )}
    </div>
  );
};

export default VibraniumChatBubble;


