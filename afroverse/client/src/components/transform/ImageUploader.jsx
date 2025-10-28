import React, { useState, useRef, useCallback } from 'react';
import { useTransform } from '../../hooks/useTransform';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Toast from '../common/Toast';

const ImageUploader = ({ onImageSelected }) => {
  const { validateImageFile, createImagePreview, setSelectedImage, clearError, error } = useTransform();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (file) => {
    setIsUploading(true);
    setValidationErrors([]);
    clearError();

    try {
      // Validate file
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsUploading(false);
        return;
      }

      // Create preview
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      
      // Trigger AI scan animation
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1200);
      
      // Set selected image
      setSelectedImage(file);
      
      // Call parent callback
      onImageSelected(file);
      
    } catch (error) {
      console.error('File processing error:', error);
      setValidationErrors(['Failed to process image file']);
    } finally {
      setIsUploading(false);
    }
  }, [validateImageFile, createImagePreview, setSelectedImage, clearError, onImageSelected]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleCameraClick = useCallback(() => {
    // For mobile devices, trigger camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setSelectedImage(null);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setSelectedImage]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <Card 
        className="rounded-2xl border border-opacity-10 shadow-2xl"
        style={{
          backgroundColor: '#1B1528',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 60px rgba(111, 44, 255, 0.25)'
        }}
      >
        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-10">
            {/* Icon with Glow */}
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 100%)',
                boxShadow: '0 0 30px rgba(111, 44, 255, 0.5), 0 0 60px rgba(111, 44, 255, 0.25)'
              }}
            >
              <span className="text-4xl">📸</span>
              {/* Pulse Ring Animation */}
              <div 
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{
                  border: '2px solid rgba(111, 44, 255, 0.5)'
                }}
              />
            </div>

            {/* Title - Montserrat Bold */}
            <h2 
              className="text-3xl font-bold mb-3 tracking-tight"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: '#FFFFFF',
                fontWeight: 700
              }}
            >
              Show Your Face, Warrior
            </h2>

            {/* Subtitle - Inter Regular */}
            <p 
              className="text-base"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400
              }}
            >
              Upload your selfie to begin transformation
            </p>
          </div>

          {!preview ? (
            /* Upload Zone */
            <div
              className="relative rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer"
              style={{
                border: `2px dashed ${isDragOver ? '#6F2CFF' : 'rgba(111, 44, 255, 0.4)'}`,
                backgroundColor: isDragOver ? 'rgba(111, 44, 255, 0.1)' : 'rgba(14, 11, 22, 0.5)',
                boxShadow: isDragOver ? '0 0 40px rgba(111, 44, 255, 0.3)' : 'none'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleCameraClick}
            >
              {isUploading ? (
                /* Uploading State */
                <div className="flex flex-col items-center py-8">
                  <div className="relative mb-6">
                    <Loader size="lg" />
                    {/* Scanning Pulse */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        backgroundColor: 'rgba(111, 44, 255, 0.3)'
                      }}
                    />
                  </div>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#6F2CFF',
                      fontWeight: 600
                    }}
                  >
                    Scanning Your Face...
                  </p>
                  <p 
                    className="text-sm mt-2"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 400
                    }}
                  >
                    Preparing for transformation
                  </p>
                </div>
              ) : (
                /* Empty State */
                <div className="space-y-6 py-4">
                  {/* Icon */}
                  <div 
                    className="text-7xl mb-6 animate-float"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(111, 44, 255, 0.5))'
                    }}
                  >
                    📷
                  </div>

                  {/* Instructions */}
                  <div>
                    <p 
                      className="text-lg mb-2"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}
                    >
                      Drop your selfie here or{' '}
                      <span 
                        className="font-semibold underline cursor-pointer"
                        style={{ color: '#6F2CFF' }}
                      >
                        click to upload
                      </span>
                    </p>
                    <p 
                      className="text-xs"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontWeight: 400
                      }}
                    >
                      Max 5MB • JPG, PNG, WebP
                    </p>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCameraClick();
                      }}
                      className="px-8 py-3 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-103"
                      style={{
                        background: 'rgba(111, 44, 255, 0.2)',
                        border: '2px solid #6F2CFF',
                        color: '#FFFFFF',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600
                      }}
                    >
                      Choose Your Photo 🖼️
                    </Button>
                  </div>
                </div>
              )}

              {/* Neon Glow Border Effect on Hover */}
              {isDragOver && (
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: '0 0 60px rgba(111, 44, 255, 0.6) inset',
                    animation: 'glowPulse 1500ms ease-in-out infinite'
                  }}
                />
              )}
            </div>
          ) : (
            /* Preview State */
            <div className="space-y-6 animate-fade-in">
              <div className="relative">
                {/* Image Container with Scanning Effect */}
                <div 
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: '3px solid #6F2CFF',
                    boxShadow: '0 0 40px rgba(111, 44, 255, 0.4)'
                  }}
                >
                  <img
                    src={preview}
                    alt="Selected selfie"
                    className="w-full max-w-md mx-auto"
                  />
                  
                  {/* AI Scan Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning Line */}
                      <div 
                        className="absolute w-full h-1 animate-scan"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, #6F2CFF 50%, transparent 100%)',
                          boxShadow: '0 0 20px rgba(111, 44, 255, 0.8)',
                          top: 0
                        }}
                      />
                      {/* Grid Overlay */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `
                            linear-gradient(0deg, transparent 24%, rgba(111, 44, 255, 0.3) 25%, rgba(111, 44, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(111, 44, 255, 0.3) 75%, rgba(111, 44, 255, 0.3) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(111, 44, 255, 0.3) 25%, rgba(111, 44, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(111, 44, 255, 0.3) 75%, rgba(111, 44, 255, 0.3) 76%, transparent 77%, transparent)
                          `,
                          backgroundSize: '50px 50px'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    backgroundColor: '#FF4D6D',
                    boxShadow: '0 4px 15px rgba(255, 77, 109, 0.4)',
                    color: '#FFFFFF',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Success Message */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">✨</span>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#3CCF4E',
                      fontWeight: 600
                    }}
                  >
                    Face Detected! Ready to Transform
                  </p>
                  <span className="text-2xl">✨</span>
                </div>
                
                {/* Secondary Action */}
                <Button
                  onClick={handleRemoveImage}
                  className="px-6 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-103"
                  style={{
                    background: 'rgba(111, 44, 255, 0.15)',
                    border: '1px solid rgba(111, 44, 255, 0.4)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div 
              className="mt-6 p-5 rounded-2xl animate-shake"
              style={{
                backgroundColor: 'rgba(255, 77, 109, 0.1)',
                border: '2px solid #FF4D6D'
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 
                    className="font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#FF4D6D',
                      fontWeight: 600
                    }}
                  >
                    Fix These Issues:
                  </h4>
                  <ul 
                    className="space-y-1"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 77, 109, 0.9)',
                      fontSize: '14px'
                    }}
                  >
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {!preview && !isUploading && (
            <div 
              className="mt-8 p-5 rounded-2xl"
              style={{
                backgroundColor: 'rgba(111, 44, 255, 0.08)',
                border: '1px solid rgba(111, 44, 255, 0.2)'
              }}
            >
              <p 
                className="text-sm font-semibold mb-2"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#F5B63F',
                  fontWeight: 600
                }}
              >
                💡 Pro Tips for Best Results:
              </p>
              <ul 
                className="text-xs space-y-1"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}
              >
                <li>• Face the camera directly with good lighting</li>
                <li>• Remove sunglasses or face coverings</li>
                <li>• Use a clear, high-quality photo</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Toast Error Notification */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={clearError}
        />
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fadeSlideIn 300ms ease-out;
        }

        .animate-pulse-ring {
          animation: pulseRing 1500ms ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-scan {
          animation: scan 1200ms ease;
        }

        .animate-shake {
          animation: shake 400ms ease;
        }

        .hover\:scale-103:hover {
          transform: scale(1.03);
        }

        .hover\:scale-110:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;