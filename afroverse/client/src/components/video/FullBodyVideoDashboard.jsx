import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Badge,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Image,
  AspectRatio,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaShare, FaTrophy, FaUsers, FaClock, FaUserFriends } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';
import { useSelector } from 'react-redux';

const MotionPackCard = ({ pack, isSelected, onSelect, isRecommended = false }) => {
  return (
    <Box
      p={4}
      borderWidth="2px"
      borderRadius="lg"
      borderColor={isSelected ? 'purple.400' : 'gray.600'}
      bg={isSelected ? 'purple.900' : 'gray.800'}
      cursor="pointer"
      onClick={() => onSelect(pack.id)}
      _hover={{ borderColor: 'purple.300' }}
      position="relative"
    >
      {isRecommended && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="green"
          fontSize="xs"
        >
          Recommended
        </Badge>
      )}
      
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            {pack.name}
          </Text>
          <Badge colorScheme="blue" fontSize="xs">
            {pack.region}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color="gray.300">
          {pack.description}
        </Text>
        
        <HStack spacing={2}>
          <Badge colorScheme="green" fontSize="xs">
            {pack.metadata.complexity}
          </Badge>
          <Badge colorScheme="orange" fontSize="xs">
            {pack.bpmRange.min}-{pack.bpmRange.max} BPM
          </Badge>
          <Badge colorScheme="purple" fontSize="xs">
            {pack.metadata.durationSec}s
          </Badge>
        </HStack>
        
        {pack.previewGif && (
          <AspectRatio ratio={9/16} maxW="120px" mx="auto">
            <Image
              src={pack.previewGif}
              alt={`${pack.name} preview`}
              borderRadius="md"
            />
          </AspectRatio>
        )}
        
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {pack.culturalContext}
        </Text>
      </VStack>
    </Box>
  );
};

const FullBodyVideoDashboard = () => {
  const { getMotionPacks, getRecommendedMotionPacks, getFullBodyVideoStats, status } = useVideo();
  const [motionPacks, setMotionPacks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packs, recs, userStats] = await Promise.all([
          getMotionPacks(),
          getRecommendedMotionPacks({ style: user?.tribe?.name || 'maasai' }),
          getFullBodyVideoStats(),
        ]);
        
        setMotionPacks(packs);
        setRecommendations(recs);
        setStats(userStats);
        
        if (recs.length > 0) {
          setSelectedPack(recs[0]);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load motion packs',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [getMotionPacks, getRecommendedMotionPacks, getFullBodyVideoStats, user?.tribe?.name, toast]);

  if (status === 'loading') {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.600">Loading full-body video dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <HStack justify="center" mb={2}>
            <Icon as={FaUserFriends} color="purple.500" boxSize={6} />
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Full-Body Dance Videos
            </Text>
          </HStack>
          <Text color="gray.600">
            Create amazing dance videos with authentic African movements and cultural expressions.
          </Text>
        </Box>

        {/* Stats Overview */}
        {stats && (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            <GridItem>
              <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
                <StatLabel fontSize="sm" color="gray.600">
                  Total Videos
                </StatLabel>
                <StatNumber fontSize="2xl" color="purple.500">
                  {stats.totalVideos}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.completedVideos} completed
                </StatHelpText>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
                <StatLabel fontSize="sm" color="gray.600">
                  Total Views
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.500">
                  {stats.totalViews}
                </StatNumber>
                <StatHelpText>
                  Across all videos
                </StatHelpText>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
                <StatLabel fontSize="sm" color="gray.600">
                  Avg Processing
                </StatLabel>
                <StatNumber fontSize="2xl" color="blue.500">
                  {Math.round(stats.avgProcessingTime / 1000)}s
                </StatNumber>
                <StatHelpText>
                  Generation time
                </StatHelpText>
              </Stat>
            </GridItem>
          </Grid>
        )}

        {/* Recommended Motion Packs */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            Recommended for You
          </Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {recommendations.map((pack) => (
              <GridItem key={pack.id}>
                <MotionPackCard
                  pack={pack}
                  isSelected={selectedPack?.id === pack.id}
                  onSelect={(packId) => {
                    const pack = recommendations.find(p => p.id === packId);
                    setSelectedPack(pack);
                  }}
                  isRecommended={true}
                />
              </GridItem>
            ))}
          </Grid>
        </Box>

        {/* All Motion Packs */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            All Dance Styles
          </Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {motionPacks.map((pack) => (
              <GridItem key={pack.id}>
                <MotionPackCard
                  pack={pack}
                  isSelected={selectedPack?.id === pack.id}
                  onSelect={(packId) => {
                    const pack = motionPacks.find(p => p.id === packId);
                    setSelectedPack(pack);
                  }}
                />
              </GridItem>
            ))}
          </Grid>
        </Box>

        {/* Selected Pack Details */}
        {selectedPack && (
          <Box p={4} bg="gradient-to-r from-purple-50 to-blue-50" borderRadius="lg" border="1px solid" borderColor="purple.200">
            <VStack spacing={3}>
              <HStack>
                <Icon as={FaUserFriends} color="purple.500" />
                <Text fontWeight="bold" color="purple.700">
                  {selectedPack.name}
                </Text>
              </HStack>
              
              <Text fontSize="sm" color="purple.600" textAlign="center">
                {selectedPack.description}
              </Text>
              
              <HStack spacing={4}>
                <HStack>
                  <Icon as={FaClock} color="purple.500" />
                  <Text fontSize="sm" color="purple.600">
                    {selectedPack.metadata.durationSec}s duration
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FaUsers} color="purple.500" />
                  <Text fontSize="sm" color="purple.600">
                    {selectedPack.region}
                  </Text>
                </HStack>
              </HStack>
              
              <Text fontSize="xs" color="purple.500" textAlign="center">
                Cultural Context: {selectedPack.culturalContext}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Features */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            Full-Body Video Features
          </Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <GridItem>
              <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                <VStack spacing={2}>
                  <Icon as={FaUserFriends} color="purple.500" boxSize={6} />
                  <Text fontWeight="bold" fontSize="sm">
                    Authentic Movements
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Culturally accurate dance moves and poses from African traditions
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                <VStack spacing={2}>
                  <Icon as={FaMusic} color="green.500" boxSize={6} />
                  <Text fontWeight="bold" fontSize="sm">
                    Beat Synchronization
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Movements perfectly synced to African music beats and rhythms
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                <VStack spacing={2}>
                  <Icon as={FaGlobe} color="blue.500" boxSize={6} />
                  <Text fontWeight="bold" fontSize="sm">
                    Dynamic Backgrounds
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Immersive environments from savannas to futuristic cities
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                <VStack spacing={2}>
                  <Icon as={FaShare} color="orange.500" boxSize={6} />
                  <Text fontWeight="bold" fontSize="sm">
                    Social Ready
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Optimized for TikTok, Instagram Reels, and WhatsApp Status
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Box>

        {/* Usage Tips */}
        <Alert status="info" borderRadius="md">
          
          <Box>
            <AlertTitle fontSize="sm">Pro Tips</AlertTitle>
            <AlertDescription fontSize="xs">
              • Choose motion packs that match your style for best results<br/>
              • Higher intensity creates more dynamic movements<br/>
              • Use captions to tell your story and increase engagement<br/>
              • Share on social media to showcase your cultural pride
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default FullBodyVideoDashboard;
