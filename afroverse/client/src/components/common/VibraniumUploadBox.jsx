/**
 * VibraniumUploadBox - Upload component with scan effect
 * 
 * Features:
 * - Dashed neon purple border
 * - Scan animation when processing
 * - Glow on hover
 * - Drag & drop support
 */

import React, { useState, useRef } from 'react';

const VibraniumUploadBox = ({ 
  onUpload, 
  isProcessing = false,
  acceptedFormats = 'image/*'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`
        upload-box
        cursor-pointer
        transition-all duration-300
        ${isDragging ? 'shadow-glow-purple-strong scale-[1.02]' : ''}
        ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={!isProcessing ? handleClick : undefined}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Upload Content */}
      <div className="relative">
        {/* Scan Effect Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-1 bg-vibranium animate-scan opacity-70"></div>
          </div>
        )}

        {/* Icon */}
        <div className="text-6xl mb-4 animate-float">
          {isProcessing ? '🔄' : '📸'}
        </div>

        {/* Text */}
        {isProcessing ? (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">
              Scanning your photo...
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="spinner w-5 h-5"></div>
              <p className="text-text-secondary text-sm">
                AI is analyzing your face
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-white font-semibold">
              Upload Your Photo
            </h3>
            <p className="text-text-secondary text-sm">
              Click or drag to upload
            </p>
            <p className="text-text-tertiary text-xs">
              Supports: JPG, PNG, WEBP
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibraniumUploadBox;


