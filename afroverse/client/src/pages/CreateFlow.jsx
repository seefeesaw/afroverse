/**
 * SCREEN 2 - CREATE FLOW (CHATGPT STYLE)
 * Purpose: Friendly conversational UX → lowers anxiety + increases completion
 * 
 * Features:
 * - ChatGPT-style conversational interface
 * - Upload zone with drag & drop
 * - Heritage style selector (horizontal chips)
 * - AI scanning animation with cultural facts
 * - Typing indicator for bot messages
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VibraniumChatBubble from '../components/common/VibraniumChatBubble';
import VibraniumUploadBox from '../components/common/VibraniumUploadBox';

const CreateFlow = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);

  const heritageStyles = [
    { id: 'maasai', label: '🦁 Maasai', fact: 'The Maasai are known for their distinctive customs and fierce warrior culture.' },
    { id: 'zulu', label: '⚔️ Zulu', fact: 'Zulu warriors were among the most feared in African history.' },
    { id: 'pharaoh', label: '👑 Pharaoh', fact: 'Ancient Egyptian pharaohs ruled for over 3,000 years.' },
    { id: 'wakanda', label: '⚡ Wakanda', fact: 'Inspired by Pan-African pride and futuristic vision.' },
    { id: 'ndebele', label: '🎨 Ndebele', fact: 'Famous for their vibrant geometric art and beadwork.' },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial welcome message
  useEffect(() => {
    setTimeout(() => {
      addBotMessage('Welcome Warrior 👑 Ready for your transformation?');
      setTimeout(() => {
        addBotMessage('Upload a selfie. Front-facing. Good lighting works best.');
        setCurrentStep('upload');
      }, 1000);
    }, 500);
  }, []);

  const addBotMessage = (message, buttons = []) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        message,
        buttons,
        avatar: '🤖'
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      message,
      avatar: '👤'
    }]);
  };

  const handleFileUpload = async (file) => {
    setUploadedImage(URL.createObjectURL(file));
    addUserMessage('📸 Photo uploaded!');
    
    setTimeout(() => {
      addBotMessage(
        'Perfect! Now choose your heritage style:',
        heritageStyles.map(style => ({
          label: style.label,
          onClick: () => handleStyleSelect(style)
        }))
      );
      setCurrentStep('style');
    }, 800);
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    addUserMessage(`Selected ${style.label}`);
    
    setTimeout(() => {
      addBotMessage(`Great choice! ${style.fact}`);
      setTimeout(() => {
        addBotMessage('Starting your transformation... ✨');
        startTransformation();
      }, 1500);
    }, 500);
  };

  const startTransformation = () => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Simulate AI processing (in real app, this would be an API call)
    setTimeout(() => {
      navigate('/transformation-result', {
        state: { image: uploadedImage, style: selectedStyle }
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
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
            AfroMoji
          </h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Messages */}
          {messages.map((msg) => (
            <VibraniumChatBubble
              key={msg.id}
              type={msg.type}
              message={msg.message}
              buttons={msg.buttons}
              avatar={msg.avatar}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble-bot max-w-[80%]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Zone (shown when ready) */}
          {currentStep === 'upload' && !uploadedImage && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <VibraniumUploadBox
                  onUpload={handleFileUpload}
                  isProcessing={false}
                />
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-6">
                {/* AI Scan Animation */}
                <div className="relative w-64 h-64 mx-auto">
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Uploading"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute w-full h-2 bg-vibranium animate-scan opacity-70"></div>
                  </div>
                  
                  {/* Particle Effects */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-primary-purple rounded-full animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: `${2 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="spinner w-12 h-12 mx-auto"></div>
                  <h3 className="text-white text-xl font-semibold">
                    Transforming Your Heritage
                  </h3>
                  <p className="text-text-secondary">
                    {selectedStyle?.fact}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area (if needed for future features) */}
      <div className="bg-surface border-t border-divider py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            className="input-primary flex-1"
            placeholder="Type a message..."
            disabled
          />
          <button className="btn-primary px-6 py-3" disabled>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFlow;


