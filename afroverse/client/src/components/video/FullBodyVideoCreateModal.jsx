import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Box,
  Divider,
  Icon,
  Badge,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { FaPlay, FaMusic, FaUserFriends, FaClock, FaGlobe, FaShieldAlt } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';

const FullBodyVideoCreateModal = ({ isOpen, onClose, transformId, imageUrl, style, onCreateVideo }) => {
  const { getMotionPacks, getRecommendedMotionPacks, status } = useVideo();
  const [motionPacks, setMotionPacks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMotionPack, setSelectedMotionPack] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('afrobeats');
  const [durationSec, setDurationSec] = useState(12);
  const [intensity, setIntensity] = useState(0.6);
  const [background, setBackground] = useState('auto');
  const [captions, setCaptions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const musicVibes = [
    { value: 'afrobeats', label: 'Afrobeats 🥁', bpm: 120 },
    { value: 'amapiano', label: 'Amapiano 🎹', bpm: 112 },
    { value: 'highlife', label: 'Highlife 🎷', bpm: 100 },
    { value: 'epic', label: 'Epic 🚀', bpm: 140 },
  ];

  const backgrounds = [
    { value: 'auto', label: 'Auto (Style-based)', icon: FaShieldAlt },
    { value: 'savanna', label: 'Savanna', icon: FaGlobe },
    { value: 'temple', label: 'Ancient Temple', icon: FaShieldAlt },
    { value: 'neon_city', label: 'Neon City', icon: FaGlobe },
  ];

  useEffect(() => {
    const fetchMotionPacks = async () => {
      try {
        const [packs, recs] = await Promise.all([
          getMotionPacks(),
          getRecommendedMotionPacks({ style, vibe: selectedVibe }),
        ]);
        setMotionPacks(packs);
        setRecommendations(recs);
        
        // Set default motion pack from recommendations
        if (recs.length > 0 && !selectedMotionPack) {
          setSelectedMotionPack(recs[0].id);
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

    if (isOpen) {
      fetchMotionPacks();
    }
  }, [isOpen, style, selectedVibe, getMotionPacks, getRecommendedMotionPacks, toast]);

  const handleSubmit = async () => {
    if (!selectedMotionPack) {
      toast({
        title: 'Motion Pack Required',
        description: 'Please select a motion pack',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const videoData = {
        transformId,
        style,
        motionPack: selectedMotionPack,
        vibe: selectedVibe,
        durationSec,
        intensity,
        background,
        captions: captions.trim() || undefined,
        clothHints: { sway: intensity, wind: intensity * 0.5 },
      };

      await onCreateVideo(videoData);
      
      toast({
        title: 'Full-Body Video Started',
        description: 'Your dance video is being generated. This may take 45-75 seconds.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Video Creation Failed',
        description: error.message || 'An error occurred while creating your video.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPack = motionPacks.find(pack => pack.id === selectedMotionPack);
  const selectedVibeData = musicVibes.find(vibe => vibe.value === selectedVibe);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white" borderRadius="lg">
        <ModalHeader borderBottom="1px" borderColor="gray.700" pb={3}>
          <HStack>
            <Icon as={FaUserFriends} color="purple.400" />
            <Text>Create Full-Body Dance Video</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Text fontSize="md" color="gray.300">
              Turn your **{style}** transformation into an amazing dance video with authentic African movements.
            </Text>

            {/* Motion Pack Selection */}
            <FormControl>
              <FormLabel fontWeight="bold">Choose Dance Style</FormLabel>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                {recommendations.map((pack) => (
                  <GridItem key={pack.id}>
                    <Box
                      p={3}
                      borderWidth="2px"
                      borderRadius="lg"
                      borderColor={selectedMotionPack === pack.id ? 'purple.400' : 'gray.600'}
                      bg={selectedMotionPack === pack.id ? 'purple.900' : 'gray.800'}
                      cursor="pointer"
                      onClick={() => setSelectedMotionPack(pack.id)}
                      _hover={{ borderColor: 'purple.300' }}
                    >
                      <VStack spacing={2}>
                        <Text fontWeight="bold" fontSize="sm">
                          {pack.name}
                        </Text>
                        <Text fontSize="xs" color="gray.400" textAlign="center">
                          {pack.description}
                        </Text>
                        <HStack spacing={1}>
                          <Badge colorScheme="blue" fontSize="xs">
                            {pack.region}
                          </Badge>
                          <Badge colorScheme="green" fontSize="xs">
                            {pack.metadata.complexity}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          BPM: {pack.bpmRange.min}-{pack.bpmRange.max}
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </FormControl>

            {/* Music Vibe */}
            <FormControl>
              <FormLabel fontWeight="bold">Music Vibe</FormLabel>
              <Select
                placeholder="Select music vibe"
                value={selectedVibe}
                onChange={(e) => setSelectedVibe(e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
              >
                {musicVibes.map((vibe) => (
                  <option key={vibe.value} value={vibe.value}>
                    {vibe.label} ({vibe.bpm} BPM)
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Duration */}
            <FormControl>
              <FormLabel fontWeight="bold">Duration: {durationSec} seconds</FormLabel>
              <Slider
                value={durationSec}
                onChange={setDurationSec}
                min={6}
                max={15}
                step={1}
                colorScheme="purple"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="sm" color="gray.400">6s (Quick)</Text>
                <Text fontSize="sm" color="gray.400">15s (Epic)</Text>
              </HStack>
            </FormControl>

            {/* Intensity */}
            <FormControl>
              <FormLabel fontWeight="bold">Motion Intensity: {intensity}</FormLabel>
              <Slider
                value={intensity}
                onChange={setIntensity}
                min={0.1}
                max={1.0}
                step={0.1}
                colorScheme="purple"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="sm" color="gray.400">Subtle</Text>
                <Text fontSize="sm" color="gray.400">Dynamic</Text>
              </HStack>
            </FormControl>

            {/* Background */}
            <FormControl>
              <FormLabel fontWeight="bold">Background Scene</FormLabel>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {backgrounds.map((bg) => (
                  <GridItem key={bg.value}>
                    <Button
                      size="sm"
                      variant={background === bg.value ? 'solid' : 'outline'}
                      colorScheme={background === bg.value ? 'purple' : 'gray'}
                      leftIcon={<Icon as={bg.icon} />}
                      onClick={() => setBackground(bg.value)}
                      width="full"
                    >
                      {bg.label}
                    </Button>
                  </GridItem>
                ))}
              </Grid>
            </FormControl>

            {/* Captions */}
            <FormControl>
              <FormLabel fontWeight="bold">Captions (Optional)</FormLabel>
              <Textarea
                placeholder="Add a catchy caption for your dance video..."
                value={captions}
                onChange={(e) => setCaptions(e.target.value)}
                maxLength={100}
                bg="gray.800"
                borderColor="gray.700"
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {captions.length}/100 characters
              </Text>
            </FormControl>

            {/* Preview Info */}
            {selectedPack && (
              <Alert status="info" borderRadius="md">
                
                <Box>
                  <AlertTitle fontSize="sm">Preview</AlertTitle>
                  <AlertDescription fontSize="xs">
                    {selectedPack.name} • {selectedVibeData?.label} • {durationSec}s • {background} background
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <Text fontSize="sm" color="gray.500">
              Full-body video generation takes 45-75 seconds. You'll get a notification when it's ready!
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.700" pt={3}>
          <Button variant="ghost" onClick={onClose} mr={3} colorScheme="whiteAlpha">
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating Dance Video..."
            leftIcon={<Icon as={FaUserFriends} />}
            isDisabled={!selectedMotionPack}
          >
            Create Dance Video
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FullBodyVideoCreateModal;
