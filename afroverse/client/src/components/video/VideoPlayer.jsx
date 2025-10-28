import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Progress,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaShare, FaHeart, FaEye, FaDownload } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';
import ShareModal from '../common/ShareModal';

const VideoPlayer = ({ video, autoPlay = false, showControls = true, onVideoReady }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { shareVideo, viewVideo, likeVideo } = useVideo();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      
      const handleLoadedData = () => {
        setIsLoading(false);
        setDuration(videoElement.duration);
        if (onVideoReady) onVideoReady();
      };

      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = () => {
        setHasError(true);
        setIsLoading(false);
      };

      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('error', handleError);

      // Track view when video loads
      if (video?.id) {
        viewVideo(video.id);
      }

      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [video, viewVideo, onVideoReady]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleShare = async (platform) => {
    try {
      await shareVideo(video.id, platform);
      toast({
        title: 'Video Shared!',
        description: `Shared to ${platform}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: error.message || 'Failed to share video',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLike = async () => {
    try {
      await likeVideo(video.id);
      toast({
        title: 'Video Liked!',
        description: 'Thanks for the love!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Like Failed',
        description: error.message || 'Failed to like video',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <Alert status="error" borderRadius="md">
        
        <Box>
          <AlertTitle fontSize="sm">Video Error</AlertTitle>
          <AlertDescription fontSize="xs">
            Failed to load video. Please try refreshing the page.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box position="relative" borderRadius="lg" overflow="hidden" bg="black">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video?.urls?.mp4}
        poster={video?.urls?.thumb}
        autoPlay={autoPlay}
        muted={isMuted}
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
        >
          <Spinner size="xl" color="white" />
        </Box>
      )}

      {/* Play/Pause Overlay */}
      {showControls && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.3)"
          opacity={isPlaying ? 0 : 1}
          transition="opacity 0.3s"
          cursor="pointer"
          onClick={togglePlayPause}
          zIndex={1}
        >
          <Icon as={isPlaying ? FaPause : FaPlay} boxSize={12} color="white" />
        </Box>
      )}

      {/* Video Controls */}
      {showControls && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
          p={4}
          zIndex={2}
        >
          <VStack spacing={3} align="stretch">
            {/* Progress Bar */}
            <Box>
              <Box
                bg="rgba(255,255,255,0.3)"
                h="4px"
                borderRadius="2px"
                cursor="pointer"
                onClick={(e) => {
                  if (videoRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    videoRef.current.currentTime = percentage * duration;
                  }
                }}
              >
                <Box
                  bg="white"
                  h="100%"
                  borderRadius="2px"
                  width={`${(currentTime / duration) * 100}%`}
                  transition="width 0.1s"
                />
              </Box>
            </Box>

            {/* Control Buttons */}
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={togglePlayPause}
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon as={isPlaying ? FaPause : FaPlay} />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={toggleMute}
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon as={isMuted ? FaVolumeMute : FaVolumeUp} />
                </Button>

                <Text color="white" fontSize="sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={handleLike}
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon as={FaHeart} />
                  <Text ml={1} fontSize="sm">{video?.engagement?.likes || 0}</Text>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={onOpen}
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon as={FaShare} />
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Video Info Overlay */}
      {showControls && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bg="linear-gradient(rgba(0,0,0,0.8), transparent)"
          p={4}
          zIndex={2}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Badge colorScheme="blue" fontSize="xs">
                {video?.variant?.toUpperCase()}
              </Badge>
              <Text color="white" fontSize="sm" fontWeight="bold">
                {video?.style?.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
            </VStack>

            <HStack spacing={2}>
              <HStack spacing={1}>
                <Icon as={FaEye} color="white" boxSize={3} />
                <Text color="white" fontSize="xs">
                  {video?.engagement?.views || 0}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaShare} color="white" boxSize={3} />
                <Text color="white" fontSize="xs">
                  {video?.shareCount || 0}
                </Text>
              </HStack>
            </HStack>
          </HStack>
        </Box>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isOpen}
        onClose={onClose}
        onShare={handleShare}
        title="Share Video"
        content={{
          title: `${video?.style} ${video?.variant}`,
          description: `Check out this amazing ${video?.style} transformation!`,
          url: `${window.location.origin}/video/${video?.id}`,
          image: video?.urls?.og,
        }}
      />
    </Box>
  );
};

export default VideoPlayer;
