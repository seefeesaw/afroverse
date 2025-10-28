import React, { useState, useRef } from 'react';
import Button from '../common/Button';

const UploadSelfieScreen = ({ onNext, onSkip }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleNext = () => {
    if (selectedImage) {
      onNext({ uploadedImage: selectedImage, imagePreview });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Bot Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-lg leading-relaxed">
                Hey there! 👋 Upload your best selfie to begin your transformation.
                <br />
                <span className="text-purple-300 font-semibold">Make it clear, make it fierce! 🔥</span>
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!imagePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-pink-500 bg-pink-500/20 scale-105'
                : 'border-gray-500 hover:border-purple-500 bg-white/5 hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-5xl">📸</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Upload Your Selfie
                </h3>
                <p className="text-gray-300">
                  Drag & drop or click to browse
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>📱 Camera</span>
                <span>•</span>
                <span>🖼️ Gallery</span>
                <span>•</span>
                <span>PNG, JPG</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-black/50 border-4 border-purple-500/50">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Bot Reaction */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed">
                    Perfect! 🔥 That's a great photo. Now let's transform you into something legendary! 👑
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between space-x-4">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Skip for now →
          </Button>
          
          {imagePreview && (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl"
            >
              Continue 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSelfieScreen;


