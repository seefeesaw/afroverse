import React, { useState, useEffect } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Toast from '../common/Toast';

const StyleSelector = ({ onStyleSelected }) => {
  const { 
    availableStyles, 
    isLoadingStyles, 
    selectedStyle, 
    selectedIntensity,
    setSelectedStyle, 
    setSelectedIntensity,
    isPremiumStyle,
    isStyleAvailable,
    getStyleInfo,
    error,
    clearError
  } = useTransform();
  
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (Object.keys(availableStyles).length === 0 && !isLoadingStyles) {
      // Styles will be loaded by the useTransform hook
    }
  }, [availableStyles, isLoadingStyles]);

  const handleStyleSelect = (style) => {
    const styleInfo = getStyleInfo(style);
    
    if (!styleInfo) return;
    
    if (styleInfo.isPremium && user?.subscription?.status !== 'warrior') {
      setShowUpgradeModal(true);
      return;
    }
    
    setSelectedStyle(style);
    onStyleSelected(style);
  };

  const handleIntensityChange = (intensity) => {
    setSelectedIntensity(intensity);
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow
    console.log('Upgrade to Warrior');
    setShowUpgradeModal(false);
  };

  const renderStyleCard = (styleKey, styleInfo) => {
    const isSelected = selectedStyle === styleKey;
    const isPremium = styleInfo.isPremium;
    const isAvailable = styleInfo.available;
    
    return (
      <div
        key={styleKey}
        className={`relative cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => isAvailable && handleStyleSelect(styleKey)}
      >
        <Card className="p-4 hover:bg-gray-800 transition-colors">
          <div className="text-center">
            <div className="text-4xl mb-3">{styleInfo.emoji}</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {styleInfo.name}
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              {styleInfo.description}
            </p>
            
            {isPremium && (
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-yellow-400 text-sm font-medium">Premium</span>
                <span className="text-gray-400">🔒</span>
              </div>
            )}
            
            {isSelected && (
              <div className="text-purple-400 text-sm font-medium">
                ✓ Selected
              </div>
            )}
          </div>
        </Card>
        
        {isPremium && !isAvailable && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl mb-2">🔒</div>
              <p className="text-white text-sm font-medium">Upgrade Required</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoadingStyles) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-gray-300">Loading styles...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Style</h2>
          <p className="text-gray-300 text-sm">
            Select a cultural style to transform your selfie
          </p>
        </div>

        {/* Free Styles */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="text-green-400 mr-2">🆓</span>
            Free Styles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(availableStyles)
              .filter(([_, styleInfo]) => !styleInfo.isPremium)
              .map(([styleKey, styleInfo]) => renderStyleCard(styleKey, styleInfo))
            }
          </div>
        </div>

        {/* Premium Styles */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="text-yellow-400 mr-2">⭐</span>
            Premium Styles
            {user?.subscription?.status === 'warrior' && (
              <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                UNLOCKED
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(availableStyles)
              .filter(([_, styleInfo]) => styleInfo.isPremium)
              .map(([styleKey, styleInfo]) => renderStyleCard(styleKey, styleInfo))
            }
          </div>
        </div>

        {/* Intensity Slider */}
        {selectedStyle && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Style Intensity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Subtle</span>
                <span className="text-white font-medium">
                  {Math.round(selectedIntensity * 100)}%
                </span>
                <span className="text-gray-300 text-sm">Intense</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.1"
                value={selectedIntensity}
                onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-gray-400 text-xs text-center">
                Higher intensity creates more dramatic transformations
              </p>
            </div>
          </div>
        )}

        {/* Selected Style Summary */}
        {selectedStyle && (
          <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStyleInfo(selectedStyle)?.emoji}</span>
                <div>
                  <h4 className="text-white font-semibold">
                    {getStyleInfo(selectedStyle)?.name}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Intensity: {Math.round(selectedIntensity * 100)}%
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onStyleSelected(selectedStyle)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Generate Transformation
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Toast
            message={error}
            type="error"
            onClose={clearError}
          />
        )}
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Upgrade to Warrior
              </h3>
              <p className="text-gray-300 mb-6">
                Unlock premium styles and unlimited daily transformations
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold"
                >
                  Upgrade Now
                </Button>
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
