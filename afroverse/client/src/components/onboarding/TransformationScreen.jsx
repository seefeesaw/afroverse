import React, { useState, useEffect } from 'react';
import { useTransform } from '../../hooks/useTransform';
import Button from '../common/Button';

const STYLE_OPTIONS = [
  { id: 'masai-warrior', name: 'Maasai Warrior', emoji: '🗡️', description: 'Bold and fearless' },
  { id: 'zulu-king', name: 'Zulu King', emoji: '👑', description: 'Regal and powerful' },
  { id: 'egyptian-pharaoh', name: 'Egyptian Pharaoh', emoji: '🏺', description: 'Ancient royalty' },
  { id: 'yoruba-queen', name: 'Yoruba Queen', emoji: '👸', description: 'Elegant and fierce' },
  { id: 'tuareg-nomad', name: 'Tuareg Nomad', emoji: '🏜️', description: 'Desert wanderer' },
  { id: 'ethiopian-emperor', name: 'Ethiopian Emperor', emoji: '⭐', description: 'Legendary ruler' }
];

const CULTURAL_FACTS = [
  "The Maasai warriors are known for their jumping dance called 'Adamu'",
  "Zulu kings wore leopard skins as a symbol of power and status",
  "Egyptian pharaohs ruled for over 3,000 years of civilization",
  "Yoruba queens were powerful political and spiritual leaders",
  "Tuareg people navigate the Sahara using star constellations",
  "Ethiopian emperors claimed descent from King Solomon and Queen of Sheba"
];

const TransformationScreen = ({ uploadedImage, onNext }) => {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const { createTransformation } = useTransform();

  // Rotate cultural facts during processing
  useEffect(() => {
    if (isProcessing) {
      const factInterval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % CULTURAL_FACTS.length);
      }, 3000);
      return () => clearInterval(factInterval);
    }
  }, [isProcessing]);

  // Simulate progress
  useEffect(() => {
    if (isProcessing && progress < 100) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 300);
      return () => clearInterval(progressInterval);
    }
    
    if (progress >= 100) {
      setTimeout(() => {
        onNext({ 
          selectedStyle, 
          transformationResult: {
            originalImage: uploadedImage,
            transformedImage: '/placeholder-transform.jpg', // TODO: Replace with actual result
            style: selectedStyle
          }
        });
      }, 500);
    }
  }, [isProcessing, progress, onNext, selectedStyle, uploadedImage]);

  const handleStyleSelect = async (style) => {
    setSelectedStyle(style);
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // TODO: Replace with actual transformation API call
      // const result = await createTransformation(uploadedImage, style.id);
    } catch (error) {
      console.error('Transformation error:', error);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          {/* Bot Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-lg leading-relaxed">
                  Hold tight! Your {selectedStyle?.name} transformation is in progress... ✨
                </p>
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
            <div className="text-center space-y-8">
              {/* Animated Icon */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-6xl animate-bounce">{selectedStyle?.emoji}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white font-bold text-xl">{progress}%</p>
              </div>

              {/* Cultural Facts */}
              <div className="min-h-[60px] flex items-center justify-center">
                <p className="text-purple-300 text-lg italic transition-opacity duration-500">
                  💡 {CULTURAL_FACTS[currentFact]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Bot Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-lg leading-relaxed">
                Now pick your transformation style! Each one tells a powerful story of African heritage. 👑🌍
              </p>
            </div>
          </div>
        </div>

        {/* Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style)}
              className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {style.emoji}
                </div>
                <h3 className="text-xl font-bold text-white">{style.name}</h3>
                <p className="text-gray-300 text-sm">{style.description}</p>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransformationScreen;


