import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, VStack, HStack, Text, Button, IconButton, useToast, Spinner,
  Alert, AlertIcon, Image, Badge, Circle, useColorModeValue, Flex
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload, FaShare } from 'react-icons/fa';
import feedService from '../services/feedService';

const PublicVideoPlayer = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [ref, setRef] = useState(null);
  
  const videoRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const response = await feedService.getPublicVideo(videoId);
        setVideo(response.data.video);
      } catch (error) {
        setError(error.response?.data?.message || 'Video not found');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (video && video.cdn.mp4Url) {
      const link = document.createElement('a');
      link.href = video.cdn.mp4Url;
      link.download = `afroverse-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/v/${videoId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this Afroverse video!',
          text: `Check out this amazing transformation by ${video.owner.displayName}!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Video link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleInstallApp = () => {
    // This would trigger PWA installation or redirect to app store
    window.open('https://afroverse.com/download', '_blank');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh" bg="black">
        <Spinner size="xl" color="orange.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg" m={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!video) {
    return (
      <Alert status="warning" borderRadius="lg" m={4}>
        <AlertIcon />
        Video not found
      </Alert>
    );
  }

  return (
    <Box h="100vh" bg="black" position="relative">
      {/* Video Player */}
      <Box position="relative" h="100%" w="100%">
        <video
          ref={videoRef}
          src={video.cdn.mp4Url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted={isMuted}
          autoPlay
          loop
          playsInline
          onLoadedData={() => setIsPlaying(true)}
        />
        
        {/* Video Overlay */}
        <Box position="absolute" top={0} left={0} right={0} bottom={0}>
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="rgba(0,0,0,0.5)"
              borderRadius="full"
              p={4}
              cursor="pointer"
              onClick={handlePlayPause}
            >
              <FaPlay size={32} color="white" />
            </Box>
          )}
          
          {/* Control Buttons */}
          <HStack position="absolute" top={4} right={4} spacing={2}>
            <IconButton
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              onClick={handleMuteToggle}
              bg="rgba(0,0,0,0.5)"
              color="white"
              _hover={{ bg: 'rgba(0,0,0,0.7)' }}
            />
            <IconButton
              icon={<FaDownload />}
              onClick={handleDownload}
              bg="rgba(0,0,0,0.5)"
              color="white"
              _hover={{ bg: 'rgba(0,0,0,0.7)' }}
            />
            <IconButton
              icon={<FaShare />}
              onClick={handleShare}
              bg="rgba(0,0,0,0.5)"
              color="white"
              _hover={{ bg: 'rgba(0,0,0,0.7)' }}
            />
          </HStack>
          
          {/* Video Info */}
          <Box position="absolute" bottom={0} left={0} right={0} p={6} bg="linear-gradient(transparent, rgba(0,0,0,0.8))">
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Circle size="50px" border="2px solid" borderColor="orange.400">
                  <Image
                    src={video.owner.avatar || '/default-avatar.png'}
                    alt={video.owner.displayName}
                    borderRadius="full"
                    boxSize="46px"
                    objectFit="cover"
                  />
                </Circle>
                <VStack align="start" spacing={1}>
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {video.owner.displayName}
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    @{video.owner.username}
                  </Text>
                </VStack>
              </HStack>
              
              <Text color="white" fontSize="md">
                {video.metadata.caption}
              </Text>
              
              <HStack spacing={2}>
                <Badge colorScheme="orange">{video.style}</Badge>
                <Badge colorScheme="blue">{video.tribe}</Badge>
                {video.type === 'battle_clip' && (
                  <Badge colorScheme="red">Battle</Badge>
                )}
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Bottom CTA */}
      <Box position="absolute" bottom={0} left={0} right={0} p={4} bg="rgba(0,0,0,0.9)">
        <VStack spacing={3}>
          <Text color="white" fontSize="sm" textAlign="center">
            Create your own transformation and join the battle!
          </Text>
          <HStack spacing={4}>
            <Button
              colorScheme="orange"
              size="lg"
              onClick={handleInstallApp}
              flex="1"
            >
              Install Afroverse
            </Button>
            <Button
              variant="outline"
              colorScheme="orange"
              size="lg"
              onClick={handleShare}
              flex="1"
            >
              Share Video
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PublicVideoPlayer;
