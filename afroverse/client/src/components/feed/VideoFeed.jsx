import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Button, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Spinner, Alert, Flex, Badge, Circle,
  Image, useBreakpointValue, Tooltip, Progress
} from '@chakra-ui/react';
import { 
  FaHeart, FaShare, FaComment, FaPlay, FaPause, FaVolumeUp, FaVolumeMute,
  FaShieldAlt, FaFlag, FaUserPlus, FaCrown, FaFire, FaTrophy, FaUsers, FaBolt
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import CommentSheet from '../comment/CommentSheet';
import {
  selectActiveTab,
  selectFeedVideos,
  selectFeedLoading,
  selectFeedError,
  selectFeedNextCursor,
  selectCurrentVideo,
  selectCurrentVideoIndex,
  selectVideoInteractions,
  selectSessionId,
  setActiveTab,
  setCurrentVideo,
  updateVideoStats,
  updateVideoInteraction,
  setSessionId,
  getFeed,
  likeVideo,
  shareVideo,
  trackView,
  followCreator,
  voteOnBattle,
  startChallenge,
  clearError,
} from '../../store/slices/feedSlice';
import feedService from '../../services/feedService';
import boostService from '../../services/boostService';

const VideoFeed = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Start autoplaying
  const [isMuted, setIsMuted] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const watchTimeRef = useRef(0);
  const lastScrollTime = useRef(0);
  
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const { isOpen: isChallengeOpen, onOpen: onChallengeOpen, onClose: onChallengeClose } = useDisclosure();
  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const { isOpen: isBoostOpen, onOpen: onBoostOpen, onClose: onBoostClose } = useDisclosure();
  const [shareVideo, setShareVideo] = useState(null);
  const [challengeVideo, setChallengeVideo] = useState(null);
  const [currentCommentVideoId, setCurrentCommentVideoId] = useState(null);
  const [boostVideo, setBoostVideo] = useState(null);

  // Redux selectors
  const activeTab = useSelector(selectActiveTab);
  const videos = useSelector(state => selectFeedVideos(state, activeTab));
  const loading = useSelector(state => selectFeedLoading(state, activeTab));
  const error = useSelector(state => selectFeedError(state, activeTab));
  const nextCursor = useSelector(state => selectFeedNextCursor(state, activeTab));
  const currentVideo = useSelector(selectCurrentVideo);
  const currentVideoIndex = useSelector(selectCurrentVideoIndex);
  const videoInteractions = useSelector(state => selectVideoInteractions(state, videos[currentIndex]?.id));
  const sessionId = useSelector(selectSessionId);

  // Generate session ID on mount
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = feedService.generateSessionId();
      dispatch(setSessionId(newSessionId));
    }
  }, [sessionId, dispatch]);

  // Load initial feed
  useEffect(() => {
    if (videos.length === 0 && !loading) {
      dispatch(getFeed({ tab: activeTab, limit: 10, region: 'ZA' }));
    }
  }, [activeTab, videos.length, loading, dispatch]);

  // Set current video when videos change
  useEffect(() => {
    if (videos.length > 0 && currentIndex < videos.length) {
      dispatch(setCurrentVideo({ video: videos[currentIndex], index: currentIndex }));
    }
  }, [videos, currentIndex, dispatch]);

  // Handle scroll to next/previous video
  const handleScroll = useCallback((direction) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    lastScrollTime.current = Date.now();
    
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // Load more videos if near end
      if (currentIndex >= videos.length - 3 && nextCursor && !isLoadingMore) {
        setIsLoadingMore(true);
        dispatch(getFeed({ tab: activeTab, cursor: nextCursor, limit: 10, region: 'ZA' }))
          .finally(() => setIsLoadingMore(false));
      }
    }
    
    setTimeout(() => setIsScrolling(false), 300);
  }, [currentIndex, videos.length, nextCursor, isLoadingMore, activeTab, dispatch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleScroll('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleScroll('down');
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(!isMuted);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleScroll, isPlaying, isMuted]);

  // Enhanced TikTok-style touch gestures
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe up
      handleScroll('down');
    } else if (distance < -minSwipeDistance) {
      // Swipe down
      handleScroll('up');
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, handleScroll]);

  // Double tap to like
  const handleDoubleTap = useCallback(() => {
    if (!currentVideo) return;
    
    setDoubleTapLike(true);
    handleLike();
    
    setTimeout(() => setDoubleTapLike(false), 800);
  }, [currentVideo]);

  // Long press to show action menu
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  const handleLongPressStart = useCallback(() => {
    const timer = setTimeout(() => {
      setIsPlaying(false);
      // TODO: Open action menu
    }, 500);
    setLongPressTimer(timer);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsPlaying(true);
  }, [longPressTimer]);

  // Track watch time
  useEffect(() => {
    if (!currentVideo) return;
    
    const interval = setInterval(() => {
      if (isPlaying) {
        watchTimeRef.current += 1000;
        setWatchTime(watchTimeRef.current);
        
        // Track view every 5 seconds
        if (watchTimeRef.current % 5000 === 0) {
          dispatch(trackView({
            videoId: currentVideo.id,
            viewData: {
              watchedMs: watchTimeRef.current,
              completed: watchTimeRef.current >= (currentVideo.duration * 1000 * 0.8), // 80% completion
              replayed: 0,
              sessionId,
              tab: activeTab,
              position: currentIndex,
            }
          }));
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentVideo, isPlaying, sessionId, activeTab, currentIndex, dispatch]);

  // Handle video interactions
  const handleLike = async () => {
    if (!currentVideo) return;
    
    const isLiked = videoInteractions.liked || false;
    dispatch(likeVideo({ videoId: currentVideo.id, on: !isLiked }));
    
    if (!isLiked) {
      toast({
        title: 'Liked!',
        description: 'Video added to your liked videos',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleShare = () => {
    if (!currentVideo) return;
    setShareVideo(currentVideo);
    onShareOpen();
  };

  const handleFollow = async () => {
    if (!currentVideo) return;
    
    try {
      await dispatch(followCreator({ videoId: currentVideo.id })).unwrap();
      toast({
        title: 'Following!',
        description: `Now following ${currentVideo.owner.displayName}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to follow creator',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVote = async (side) => {
    if (!currentVideo || !currentVideo.battle) return;
    
    try {
      await dispatch(voteOnBattle({ battleId: currentVideo.battle.id, side })).unwrap();
      toast({
        title: 'Vote Cast!',
        description: `Voted for ${side}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to cast vote',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChallenge = () => {
    if (!currentVideo) return;
    setChallengeVideo(currentVideo);
    onChallengeOpen();
  };

  const handleComment = () => {
    if (!currentVideo) return;
    setCurrentCommentVideoId(currentVideo.id);
    onCommentOpen();
  };

  const handleBoost = () => {
    if (!currentVideo) return;
    setBoostVideo(currentVideo);
    onBoostOpen();
  };

  const handleShareToExternal = async (channel) => {
    if (!shareVideo) return;
    
    try {
      await feedService.shareToExternal(shareVideo.id, channel, user.username);
      await dispatch(shareVideo({ videoId: shareVideo.id, channel })).unwrap();
      
      toast({
        title: 'Shared!',
        description: `Video shared to ${channel}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      onShareClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to share video',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStartChallenge = async (opponentId) => {
    if (!challengeVideo) return;
    
    try {
      const result = await dispatch(startChallenge({ videoId: challengeVideo.id, opponentId })).unwrap();
      
      toast({
        title: 'Challenge Started!',
        description: 'Battle created successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      onChallengeClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to start challenge',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'foryou', label: 'For You', icon: FaFire },
    { id: 'following', label: 'Following', icon: FaUserPlus },
    { id: 'tribe', label: 'Tribe', icon: FaUsers },
    { id: 'battles', label: 'Battles', icon: FaShieldAlt },
  ];

  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
    setCurrentIndex(0);
    watchTimeRef.current = 0;
    setWatchTime(0);
  };

  if (loading && videos.length === 0) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="orange.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg" m={4}>
        
        Error loading feed: {error}
      </Alert>
    );
  }

  if (videos.length === 0) {
    return (
      <VStack spacing={4} justify="center" h="100vh">
        <Text fontSize="xl" color="gray.500">No videos available</Text>
        <Button onClick={() => dispatch(getFeed({ tab: activeTab, limit: 10, region: 'ZA' }))}>
          Refresh
        </Button>
      </VStack>
    );
  }

  return (
    <Box h="100vh" bg="black" position="relative" overflow="hidden">
      {/* Tab Navigation */}
      <Box position="absolute" top={0} left={0} right={0} zIndex={10} bg="rgba(0,0,0,0.8)">
        <HStack spacing={0} justify="center" p={2}>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              color={activeTab === tab.id ? 'orange.400' : 'gray.400'}
              size="sm"
              onClick={() => handleTabChange(tab.id)}
              leftIcon={<tab.icon />}
            >
              {tab.label}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Video Container */}
      <Box
        ref={containerRef}
        h="100vh"
        position="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onDoubleClick={handleDoubleTap}
        cursor="pointer"
        userSelect="none"
      >
        {videos.map((video, index) => (
          <Box
            key={video.id}
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            transform={`translateY(${(index - currentIndex) * 100}vh)`}
            transition="transform 0.3s ease-out"
            bg="black"
          >
            {/* Video Player */}
            <Box position="relative" h="100%" w="100%">
              <video
                ref={index === currentIndex ? videoRef : null}
                src={video.cdn.mp4Url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                muted={isMuted}
                autoPlay={index === currentIndex && isPlaying}
                loop
                playsInline
                onLoadedData={() => {
                  if (index === currentIndex) {
                    setIsPlaying(true);
                  }
                }}
              />
              
              {/* Video Overlay */}
              {index === currentIndex && (
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
                    >
                      <FaPlay size={32} color="white" />
                    </Box>
                  )}
                  
                  {/* Mute Button */}
                  <IconButton
                    position="absolute"
                    top={4}
                    right={4}
                    icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    bg="rgba(0,0,0,0.5)"
                    color="white"
                    _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                  />
                  
                  {/* Video Info */}
                  <Box position="absolute" bottom={0} left={0} right={0} p={4} bg="linear-gradient(transparent, rgba(0,0,0,0.8))">
                    <VStack align="start" spacing={2}>
                      <Text color="white" fontSize="lg" fontWeight="bold">
                        {video.owner.displayName}
                      </Text>
                      <Text color="gray.300" fontSize="sm">
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
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Right Action Bar */}
      {currentVideo && (
        <Box position="absolute" right={4} bottom="50%" transform="translateY(50%)" zIndex={10}>
          <VStack spacing={4}>
            {/* Avatar */}
            <Circle size="50px" border="2px solid" borderColor="orange.400">
              <Image
                src={currentVideo.owner.avatar || '/default-avatar.png'}
                alt={currentVideo.owner.displayName}
                borderRadius="full"
                boxSize="46px"
                objectFit="cover"
              />
            </Circle>
            
            {/* Like Button */}
            <Tooltip label={videoInteractions.liked ? 'Unlike' : 'Like'}>
              <IconButton
                icon={<FaHeart />}
                color={videoInteractions.liked ? 'red.500' : 'white'}
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
              />
            </Tooltip>
            
            {/* Comment Button */}
            <Tooltip label="Comments">
              <IconButton
                icon={<FaComment />}
                color="white"
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleComment();
                }}
              />
            </Tooltip>
            
            {/* Boost Button */}
            {currentVideo && (
              <Tooltip label="Boost">
                <IconButton
                  icon={<FaBolt />}
                  color="white"
                  bg={currentVideo.boost?.status !== 'none' ? 'orange.500' : 'rgba(0,0,0,0.5)'}
                  _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBoost();
                  }}
                />
              </Tooltip>
            )}
            
            {/* Share Button */}
            <Tooltip label="Share">
              <IconButton
                icon={<FaShare />}
                color="white"
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              />
            </Tooltip>
            
            {/* Challenge Button */}
            <Tooltip label="Challenge">
              <IconButton
                icon={<FaShieldAlt />}
                color="white"
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleChallenge();
                }}
              />
            </Tooltip>
            
            {/* Follow Button */}
            {!videoInteractions.followed && (
              <Tooltip label="Follow">
                <IconButton
                  icon={<FaUserPlus />}
                  color="white"
                  bg="rgba(0,0,0,0.5)"
                  _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow();
                  }}
                />
              </Tooltip>
            )}
          </VStack>
        </Box>
      )}

      {/* Battle Vote Overlay */}
      {currentVideo && currentVideo.battle && (
        <Box position="absolute" bottom={20} left={0} right={0} p={4} zIndex={10}>
          <HStack spacing={4} justify="center">
            <Button
              colorScheme="blue"
              leftIcon={<FaTrophy />}
              onClick={(e) => {
                e.stopPropagation();
                handleVote('challenger');
              }}
              disabled={videoInteractions.voted}
            >
              Vote Challenger
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FaCrown />}
              onClick={(e) => {
                e.stopPropagation();
                handleVote('defender');
              }}
              disabled={videoInteractions.voted}
            >
              Vote Defender
            </Button>
          </HStack>
        </Box>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <Box position="absolute" bottom={4} left="50%" transform="translateX(-50%)" zIndex={10}>
          <Spinner color="orange.500" />
        </Box>
      )}

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Video</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {shareVideo && (
              <VStack spacing={4}>
                <Text>Share this video to:</Text>
                <HStack spacing={4}>
                  <Button colorScheme="green" onClick={() => handleShareToExternal('wa')}>
                    WhatsApp
                  </Button>
                  <Button colorScheme="pink" onClick={() => handleShareToExternal('ig')}>
                    Instagram
                  </Button>
                  <Button colorScheme="black" onClick={() => handleShareToExternal('tt')}>
                    TikTok
                  </Button>
                  <Button colorScheme="gray" onClick={() => handleShareToExternal('copy')}>
                    Copy Link
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Challenge Modal */}
      <Modal isOpen={isChallengeOpen} onClose={onChallengeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {challengeVideo && (
              <VStack spacing={4}>
                <Text>Challenge someone with this style:</Text>
                <Text fontWeight="bold" color="orange.400">
                  {challengeVideo.style}
                </Text>
                <Button
                  colorScheme="orange"
                  onClick={() => handleStartChallenge('random')}
                  width="full"
                >
                  Challenge Random Opponent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStartChallenge('friend')}
                  width="full"
                >
                  Challenge a Friend
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Comment Sheet */}
      <CommentSheet
        isOpen={isCommentOpen}
        onClose={onCommentClose}
        videoId={currentCommentVideoId}
        onCommentSubmitted={(comment) => {
          console.log('Comment submitted:', comment);
        }}
      />
    </Box>
  );
};

export default VideoFeed;
