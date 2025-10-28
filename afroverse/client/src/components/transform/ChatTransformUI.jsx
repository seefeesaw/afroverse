import React, { useState, useEffect, useRef } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import EnhancedShareModal from '../common/EnhancedShareModal';

const STYLE_OPTIONS = [
  { id: 'masai-warrior', name: 'Maasai Warrior', emoji: '🗡️', preview: '/styles/masai.jpg' },
  { id: 'zulu-king', name: 'Zulu King', emoji: '👑', preview: '/styles/zulu.jpg' },
  { id: 'egyptian-pharaoh', name: 'Egyptian Pharaoh', emoji: '🏺', preview: '/styles/egyptian.jpg' },
  { id: 'yoruba-queen', name: 'Yoruba Queen', emoji: '👸', preview: '/styles/yoruba.jpg' },
  { id: 'tuareg-nomad', name: 'Tuareg Nomad', emoji: '🏜️', preview: '/styles/tuareg.jpg' },
  { id: 'ethiopian-emperor', name: 'Ethiopian Emperor', emoji: '⭐', preview: '/styles/ethiopian.jpg' }
];

const CULTURAL_FACTS = [
  "🌍 Did you know? The Maasai warriors jump as high as possible during their traditional dance!",
  "👑 Zulu kings wore leopard skins as symbols of power and status.",
  "🏺 Egyptian civilization lasted over 3,000 years - longer than any other!",
  "💎 Yoruba queens were both political leaders and spiritual guides.",
  "⭐ The Tuareg navigate the Sahara using stars - no GPS needed!",
  "🦁 Ethiopian emperors claimed descent from King Solomon himself."
];

const ChatTransformUI = () => {
  const { user } = useAuth();
  const { createTransformation } = useTransform();
  
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transformResult, setTransformResult] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    addBotMessage(
      `Hey ${user?.username || 'warrior'}! 👋 Ready to transform into something legendary? Let's create your African-inspired masterpiece! 🔥`,
      'welcome'
    );
  }, []);

  const addBotMessage = (text, type = 'text', data = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text,
          type,
          data,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 500);
  };

  const addUserMessage = (text, type = 'text', data = null) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text,
        type,
        data,
        timestamp: new Date()
      }
    ]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result;
        setImagePreview(preview);
        
        // Add user message with image
        addUserMessage('Here\'s my photo! 📸', 'image', { preview });
        
        // Bot responds
        setTimeout(() => {
          addBotMessage(
            '🔥 That\'s an amazing photo! Now, choose your transformation style. Which legendary look calls to you? 👑',
            'text'
          );
          setTimeout(() => {
            addBotMessage('', 'style-selector', { styles: STYLE_OPTIONS });
            setCurrentStep('style');
          }, 800);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleSelect = async (style) => {
    setSelectedStyle(style);
    addUserMessage(`I choose ${style.name}! ${style.emoji}`, 'text');
    
    setTimeout(() => {
      addBotMessage(
        `Excellent choice! ${style.emoji} Let me transform you into a legendary ${style.name}... ✨`,
        'text'
      );
      
      setTimeout(() => {
        startTransformation(style);
      }, 1000);
    }, 500);
  };

  const startTransformation = async (style) => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('processing');
    
    // Add processing message
    addBotMessage('', 'processing', { 
      style: style.name,
      facts: CULTURAL_FACTS 
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    try {
      // TODO: Replace with actual API call
      // const result = await createTransformation(selectedImage, style.id);
      
      // Simulate API call
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        const result = {
          originalImage: imagePreview,
          transformedImage: '/placeholder-transform.jpg', // Replace with actual result
          style: style,
          battleId: 'demo-battle-' + Date.now(),
          shareUrl: `${window.location.origin}/b/demo-${Date.now()}`
        };
        
        setTransformResult(result);
        setIsProcessing(false);
        
        // Show result
        setTimeout(() => {
          addBotMessage('', 'result', { result });
          setCurrentStep('result');
        }, 500);
      }, 10000); // 10 seconds simulation
      
    } catch (error) {
      console.error('Transformation error:', error);
      setIsProcessing(false);
      addBotMessage('Oops! Something went wrong. Let\'s try again! 🔄', 'error');
    }
  };

  const handleTryAnother = () => {
    setCurrentStep('style');
    addBotMessage('Let\'s create another masterpiece! Choose a different style 🎨', 'text');
    setTimeout(() => {
      addBotMessage('', 'style-selector', { styles: STYLE_OPTIONS });
    }, 500);
  };

  const handleNewTransform = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedStyle(null);
    setTransformResult(null);
    
    addBotMessage(
      'Ready for another transformation? Upload your photo and let\'s go! 🚀',
      'welcome'
    );
  };

  const renderMessage = (message) => {
    if (message.sender === 'bot') {
      return (
        <div key={message.id} className="flex items-start space-x-3 mb-4 animate-fade-in">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1 max-w-2xl">
            {message.type === 'text' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-white/20">
                <p className="text-white leading-relaxed">{message.text}</p>
              </div>
            )}
            
            {message.type === 'welcome' && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl rounded-tl-none p-6 border-2 border-purple-500/50">
                <p className="text-white text-lg leading-relaxed mb-4">{message.text}</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                >
                  📸 Upload Your Selfie
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
            
            {message.type === 'style-selector' && (
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-white/20">
                  <p className="text-white leading-relaxed">{message.text || 'Choose your style:'}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {message.data.styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleSelect(style)}
                      className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20 hover:border-purple-500 transition-all duration-300 hover:scale-105 text-center"
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                        {style.emoji}
                      </div>
                      <div className="text-white font-bold text-sm">{style.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {message.type === 'processing' && (
              <ProcessingMessage progress={progress} styleName={message.data.style} facts={message.data.facts} />
            )}
            
            {message.type === 'result' && (
              <ResultMessage 
                result={message.data.result} 
                onShare={() => setShowShareModal(true)}
                onTryAnother={handleTryAnother}
                onNewTransform={handleNewTransform}
              />
            )}
          </div>
        </div>
      );
    } else {
      // User message
      return (
        <div key={message.id} className="flex items-start space-x-3 mb-4 justify-end animate-fade-in">
          <div className="flex-1 max-w-2xl flex justify-end">
            {message.type === 'image' ? (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-2">
                <img
                  src={message.data.preview}
                  alt="Uploaded"
                  className="max-w-xs rounded-xl"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-4">
                <p className="text-white font-medium">{message.text}</p>
              </div>
            )}
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">👤</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h1 className="text-white font-bold">Afroverse Transform</h1>
              <p className="text-gray-400 text-xs">AI-powered transformations</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{user?.username}</p>
            <p className="text-gray-400 text-xs">
              {user?.subscription?.status === 'warrior' ? '∞' : '3'} transforms left
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(renderMessage)}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-white/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Share Modal */}
      <EnhancedShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        battleData={transformResult}
      />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Processing Message Component
const ProcessingMessage = ({ progress, styleName, facts }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % facts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [facts]);

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl rounded-tl-none p-6 border-2 border-purple-500/50 space-y-4">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-4xl">✨</span>
          </div>
        </div>
        
        <h3 className="text-white font-bold text-xl mb-2">
          Transforming you into a {styleName}...
        </h3>
        
        <div className="space-y-2">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white font-bold text-lg">{progress}%</p>
        </div>
        
        <div className="mt-4 min-h-[60px] flex items-center justify-center">
          <p className="text-purple-300 italic text-sm transition-opacity duration-500">
            {facts[currentFactIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

// Result Message Component
const ResultMessage = ({ result, onShare, onTryAnother, onNewTransform }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl rounded-tl-none p-6 border-2 border-green-500/50">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-2xl mb-2">
            🔥 INCREDIBLE! You look LEGENDARY! 👑
          </h3>
        </div>
        
        {/* Before/After */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-2 text-center">Before</p>
            <img
              src={result.originalImage}
              alt="Before"
              className="w-full rounded-xl border-2 border-gray-600"
            />
          </div>
          <div>
            <p className="text-purple-400 text-xs mb-2 text-center">After</p>
            <img
              src={result.transformedImage}
              alt="After"
              className="w-full rounded-xl border-2 border-purple-500 shadow-lg shadow-purple-500/50"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onShare}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
          >
            ⚔️ Challenge Someone
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onTryAnother}
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
            >
              🎨 Try Another Style
            </Button>
            <Button
              onClick={onNewTransform}
              variant="outline"
              className="border-pink-500 text-pink-300 hover:bg-pink-500/20"
            >
              📸 New Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTransformUI;


