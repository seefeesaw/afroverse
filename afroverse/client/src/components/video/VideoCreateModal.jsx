import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Box,
  Progress,
  Icon,
  Badge,
  Image,
  Divider,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaShare, FaHeart, FaEye } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';
import { useSelector } from 'react-redux';

const VideoCreateModal = ({ isOpen, onClose, transformId, imageUrl, style }) => {
  const { createVideo, status, error } = useVideo();
  const [variant, setVariant] = useState('loop');
  const [selectedStyle, setSelectedStyle] = useState(style || 'maasai');
  const [vibe, setVibe] = useState('afrobeats');
  const [captions, setCaptions] = useState('');
  const [intensity, setIntensity] = useState(0.6);
  const [isCreating, setIsCreating] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const handleCreateVideo = async () => {
    if (!variant || !selectedStyle) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please select a variant and style',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreating(true);

    try {
      const result = await createVideo({
        transformId,
        variant,
        style: selectedStyle,
        vibe: variant === 'clip' ? vibe : null,
        captions: variant === 'clip' ? captions : null,
        intensity,
      });

      toast({
        title: 'Video Creation Started',
        description: `Your ${variant} video is being generated. You'll be notified when it's ready!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Video Creation Failed',
        description: error.message || 'Failed to create video',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const styles = [
    { id: 'maasai', name: 'Maasai Warrior', description: 'Traditional Maasai warrior' },
    { id: 'zulu', name: 'Zulu Royalty', description: 'Zulu royal attire' },
    { id: 'pharaoh', name: 'Ancient Pharaoh', description: 'Egyptian pharaoh' },
    { id: 'afrofuturistic', name: 'Afrofuturistic', description: 'Futuristic African warrior' },
  ];

  const vibes = [
    { id: 'afrobeats', name: 'Afrobeats', description: 'Upbeat African rhythms' },
    { id: 'amapiano', name: 'Amapiano', description: 'South African house music' },
    { id: 'highlife', name: 'Highlife', description: 'Classic West African sound' },
    { id: 'epic', name: 'Epic', description: 'Cinematic and dramatic' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Video</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Preview Image */}
            {imageUrl && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Creating video from this transformation:
                </Text>
                <Image
                  src={imageUrl}
                  alt="Transformation preview"
                  maxH="200px"
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>
            )}

            {/* Video Variant Selection */}
            <FormControl isRequired>
              <FormLabel>Video Type</FormLabel>
              <Select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder="Select video type"
              >
                <option value="loop">Loop (3-5s) - Perfect for Stories & Status</option>
                <option value="clip">Clip (9-15s) - Perfect for TikTok & Reels</option>
              </Select>
            </FormControl>

            {/* Style Selection */}
            <FormControl isRequired>
              <FormLabel>Style</FormLabel>
              <Select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                placeholder="Select style"
              >
                {styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name} - {style.description}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Clip-specific options */}
            {variant === 'clip' && (
              <>
                <FormControl>
                  <FormLabel>Music Vibe</FormLabel>
                  <Select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder="Select music vibe"
                  >
                    {vibes.map((vibeOption) => (
                      <option key={vibeOption.id} value={vibeOption.id}>
                        {vibeOption.name} - {vibeOption.description}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Captions (Optional)</FormLabel>
                  <Textarea
                    value={captions}
                    onChange={(e) => setCaptions(e.target.value)}
                    placeholder="Add a caption that will appear in your video..."
                    maxLength={200}
                    resize="vertical"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {captions.length}/200 characters
                  </Text>
                </FormControl>
              </>
            )}

            {/* Intensity Slider */}
            <FormControl>
              <FormLabel>Motion Intensity: {Math.round(intensity * 100)}%</FormLabel>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Lower = subtle movement, Higher = more dramatic motion
              </Text>
            </FormControl>

            {/* User Limits Info */}
            {!user?.entitlements?.warriorPass && (
              <Alert status="info" borderRadius="md">
                
                <Box>
                  <AlertTitle fontSize="sm">Free Account Limits</AlertTitle>
                  <AlertDescription fontSize="xs">
                    You can create 2 videos per day. Upgrade to Warrior Pass for unlimited videos and priority processing.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleCreateVideo}
            isLoading={isCreating}
            loadingText="Creating..."
          >
            Create {variant === 'loop' ? 'Loop' : 'Clip'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VideoCreateModal;
