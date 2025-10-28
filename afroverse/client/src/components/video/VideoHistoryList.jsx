import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaPlay, FaShare, FaHeart, FaEye, FaDownload, FaVideo, FaClock } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';
import VideoPlayer from './VideoPlayer';
import ShareModal from '../common/ShareModal';

const VideoHistoryList = ({ userId, limit = 20 }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const { getVideoHistory, shareVideo, likeVideo } = useVideo();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, [userId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const result = await getVideoHistory(userId, {
        limit,
        cursor,
      });
      
      if (cursor) {
        setVideos(prev => [...prev, ...result.videos]);
      } else {
        setVideos(result.videos);
      }
      
      setHasMore(result.hasMore);
      setCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (video, platform) => {
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

  const handleLike = async (video) => {
    try {
      await likeVideo(video.id);
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id 
          ? { ...v, engagement: { ...v.engagement, likes: v.engagement.likes + 1 } }
          : v
      ));
      
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

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    onOpen();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        
        <Box>
          <AlertTitle fontSize="sm">Error Loading Videos</AlertTitle>
          <AlertDescription fontSize="xs">
            {error}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (loading && videos.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} color="gray.600">Loading your videos...</Text>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Icon as={FaVideo} boxSize={12} color="gray.400" />
        <Text mt={4} fontSize="lg" fontWeight="bold" color="gray.600">
          No Videos Yet
        </Text>
        <Text mt={2} color="gray.500">
          Create your first video from a transformation!
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {videos.map((video) => (
          <Box
            key={video.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            shadow="sm"
            _hover={{ shadow: 'md' }}
            transition="shadow 0.2s"
          >
            <Grid templateColumns="200px 1fr" gap={4}>
              {/* Video Thumbnail */}
              <GridItem>
                <Box position="relative" h="200px" bg="black">
                  <Image
                    src={video.urls?.thumb}
                    alt={`${video.style} ${video.variant}`}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="rgba(0,0,0,0.7)"
                    borderRadius="50%"
                    p={3}
                    cursor="pointer"
                    onClick={() => openVideoModal(video)}
                    _hover={{ bg: 'rgba(0,0,0,0.8)' }}
                  >
                    <Icon as={FaPlay} color="white" boxSize={6} />
                  </Box>

                  {/* Duration Badge */}
                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg="black"
                    color="white"
                    fontSize="xs"
                  >
                    {formatDuration(video.duration)}
                  </Badge>
                </Box>
              </GridItem>

              {/* Video Info */}
              <GridItem p={4}>
                <VStack align="stretch" spacing={3} h="100%">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" fontSize="xs">
                          {video.variant.toUpperCase()}
                        </Badge>
                        <Badge colorScheme="purple" fontSize="xs">
                          {video.style}
                        </Badge>
                      </HStack>
                      <Text fontSize="lg" fontWeight="bold">
                        {video.style.replace(/([A-Z])/g, ' $1').trim()} {video.variant}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Created {formatDate(video.createdAt)}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Engagement Stats */}
                  <HStack spacing={4}>
                    <HStack spacing={1}>
                      <Icon as={FaEye} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        {video.viewCount || 0} views
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaHeart} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        {video.engagement?.likes || 0} likes
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaShare} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        {video.shareCount || 0} shares
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Actions */}
                  <HStack spacing={2} mt="auto">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => openVideoModal(video)}
                      leftIcon={<FaPlay />}
                    >
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(video)}
                      leftIcon={<FaHeart />}
                    >
                      Like
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(video, 'copy')}
                      leftIcon={<FaShare />}
                    >
                      Share
                    </Button>
                  </HStack>
                </VStack>
              </GridItem>
            </Grid>
          </Box>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <Box textAlign="center" py={4}>
            <Button
              onClick={loadVideos}
              isLoading={loading}
              loadingText="Loading..."
              colorScheme="blue"
              variant="outline"
            >
              Load More Videos
            </Button>
          </Box>
        )}
      </VStack>

      {/* Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalHeader color="white">
            {selectedVideo?.style} {selectedVideo?.variant}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            {selectedVideo && (
              <VideoPlayer
                video={selectedVideo}
                autoPlay={true}
                showControls={true}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VideoHistoryList;
