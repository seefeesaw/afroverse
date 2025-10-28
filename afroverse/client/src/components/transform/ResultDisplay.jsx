import React, { useState, useRef, useEffect } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { useBattle } from '../../hooks/useBattle';
import { useVideo } from '../../hooks/useVideo';
import Button from '../common/Button';
import Card from '../common/Card';
import ShareButtons from './ShareButtons';
import BattleCreation from '../battle/BattleCreation';
import { VideoCreateModal, VideoProgress, FullBodyVideoCreateModal } from '../video';
import { ReferralCTA } from '../referral';

const ResultDisplay = ({ result, onTransformAgain }) => {
  const { 
    downloadImage, 
    shareToSocial, 
    copyToClipboard,
    getStyleInfo,
    setShowShareModal 
  } = useTransform();
  
  const { setShowBattleCreationModal } = useBattle();
  const { createVideo, createFullBodyVideo } = useVideo();
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModalLocal] = useState(false);
  const [showBattleCreation, setShowBattleCreation] = useState(false);
  const [showVideoCreate, setShowVideoCreate] = useState(false);
  const [showReferralCTA, setShowReferralCTA] = useState(false);
  const [videoJobId, setVideoJobId] = useState(null);
  const [copied, setCopied] = useState(false);
  const sliderRef = useRef(null);

  const styleInfo = getStyleInfo(result.style);

  const handleSliderChange = (e) => {
    setSliderPosition(parseInt(e.target.value));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `afroverse-${result.style}-${Date.now()}.jpg`;
      await downloadImage(result.afterUrl, filename);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = (platform) => {
    const shareText = `Check out my ${styleInfo?.name} transformation! 🔥`;
    shareToSocial(platform, result.shareUrl, shareText);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(result.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleBattle = () => {
    setShowBattleCreation(true);
  };

  const handleCreateVideo = () => {
    setShowVideoCreate(true);
  };

  const handleReferralCTA = () => {
    setShowReferralCTA(true);
  };

  const handleVideoCreated = async (videoData) => {
    try {
      const response = await createVideo({
        transformId: result.transformId,
        ...videoData
      });
      setVideoJobId(response.jobId);
      setShowVideoCreate(false);
    } catch (error) {
      console.error('Error creating video:', error);
    }
  };

  const handleFullBodyVideoCreated = async (videoData) => {
    try {
      const response = await createFullBodyVideo({
        transformId: result.transformId,
        ...videoData
      });
      setVideoJobId(response.jobId);
      setShowFullBodyVideoCreate(false);
    } catch (error) {
      console.error('Error creating full-body video:', error);
    }
  };

  const handleVideoComplete = (video) => {
    setVideoJobId(null);
    // Show success message or redirect to video
    console.log('Video completed:', video);
  };

  const handleVideoError = (error) => {
    setVideoJobId(null);
    console.error('Video creation failed:', error);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Transformation is Ready!
          </h2>
          <p className="text-gray-300 text-sm">
            {styleInfo?.name} • {Math.round(result.processingTime / 1000)}s processing time
          </p>
        </div>

        {/* Before/After Slider */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              {/* Before Image */}
              <img
                src={result.beforeUrl}
                alt="Original selfie"
                className="w-full h-auto"
              />
              
              {/* After Image Overlay */}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={result.afterUrl}
                  alt="Transformed selfie"
                  className="w-full h-auto"
                />
              </div>
              
              {/* Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  const handleMouseMove = (e) => {
                    if (sliderRef.current) {
                      const rect = sliderRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setSliderPosition(percentage);
                    }
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                After
              </div>
            </div>
            
            {/* Slider Input */}
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="w-full mt-4 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Downloading...
              </div>
            ) : (
              '📥 Download'
            )}
          </Button>
          
          <Button
            onClick={() => setShowShareModalLocal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            📤 Share
          </Button>
          
          <Button
            onClick={handleCreateVideo}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            🎬 Make Video
          </Button>
          
          <Button
            onClick={handleCreateFullBodyVideo}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            💃 Dance Video
          </Button>
          
          <Button
            onClick={handleReferralCTA}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            👥 Recruit
          </Button>
          
          <Button
            onClick={handleBattle}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            ⚔️ Battle
          </Button>
          
          <Button
            onClick={onTransformAgain}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            🔄 Try Another
          </Button>
        </div>

        {/* Share Link */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-2">Share Link</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={result.shareUrl}
              readOnly
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </Button>
          </div>
        </div>

        {/* Style Info */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{styleInfo?.emoji}</span>
            <div>
              <h4 className="text-white font-semibold">{styleInfo?.name}</h4>
              <p className="text-gray-300 text-sm">{styleInfo?.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Share Modal */}
      {showShareModalLocal && (
        <ShareButtons
          shareUrl={result.shareUrl}
          shareText={`Check out my ${styleInfo?.name} transformation! 🔥`}
          onClose={() => setShowShareModalLocal(false)}
        />
      )}

      {/* Battle Creation Modal */}
      {showBattleCreation && (
        <BattleCreation
          isOpen={showBattleCreation}
          onClose={() => setShowBattleCreation(false)}
          transformId={result.transformId}
        />
      )}

      {/* Video Creation Modal */}
      {showVideoCreate && (
        <VideoCreateModal
          isOpen={showVideoCreate}
          onClose={() => setShowVideoCreate(false)}
          transformId={result.transformId}
          imageUrl={result.afterUrl}
          style={result.style}
          onCreateVideo={handleVideoCreated}
        />
      )}

      {/* Full-Body Video Creation Modal */}
      {showFullBodyVideoCreate && (
        <FullBodyVideoCreateModal
          isOpen={showFullBodyVideoCreate}
          onClose={() => setShowFullBodyVideoCreate(false)}
          transformId={result.transformId}
          imageUrl={result.afterUrl}
          style={result.style}
          onCreateVideo={handleFullBodyVideoCreated}
        />
      )}

      {/* Referral CTA Modal */}
      {showReferralCTA && (
        <ReferralCTA
          isOpen={showReferralCTA}
          onClose={() => setShowReferralCTA(false)}
          onInviteClick={() => {
            setShowReferralCTA(false);
            // Navigate to referral dashboard or open invite modal
            window.location.href = '/app/referral';
          }}
        />
      )}

      {/* Video Progress */}
      {videoJobId && (
        <div className="mt-6">
          <VideoProgress
            jobId={videoJobId}
            onComplete={handleVideoComplete}
            onError={handleVideoError}
          />
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
