import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, VStack, HStack, Text, Button, Textarea, Input,
  IconButton, Badge, Image, Switch, Spinner,
  Alert, Flex, Tag, TagLabel, TagCloseButton,
  Tooltip, Avatar, Menu, MenuButton, MenuList, MenuItem,
  FormControl, FormLabel, FormHelperText
} from '@chakra-ui/react';
import {
  FaUpload, FaCamera, FaImage, FaVideo, FaHashtag, FaAt,
  FaUsers, FaUsers, FaGlobe, FaLock, FaUnlock, FaCheck, FaCheck,
  FaGrin, FaLightbulb, FaTrash
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { createVideo } from '../../store/slices/feedSlice';

const CreateModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [step, setStep] = useState('select'); // 'select', 'edit', 'preview'
  const [contentType, setContentType] = useState(null); // 'image', 'video', 'ai'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [selectedTribe, setSelectedTribe] = useState(user?.tribe?.id || null);
  const [settings, setSettings] = useState({
    allowRemix: true,
    allowDuet: true,
    allowBattle: true,
    hideOriginal: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setContentType(null);
      setFile(null);
      setPreviewUrl(null);
      setCaption('');
      setHashtags([]);
      setMentions([]);
      setUploadProgress(0);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid image or video file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check file size
    const maxSize = contentType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for image
    if (selectedFile.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File must be less than ${contentType === 'video' ? '50MB' : '10MB'}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStep('edit');
  };

  // Handle content type selection
  const handleSelectType = (type) => {
    setContentType(type);
    
    if (type === 'ai') {
      // Use latest AI transformation
      setStep('edit');
      // TODO: Load latest transformation
    } else {
      // Trigger file picker
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Extract hashtags from caption
  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(h => h.substring(1)) : [];
  };

  // Handle caption change
  const handleCaptionChange = (e) => {
    const value = e.target.value;
    setCaption(value);

    // Extract and update hashtags
    const extractedHashtags = extractHashtags(value);
    setHashtags(extractedHashtags);
  };

  // Handle hashtag removal
  const handleHashtagRemove = (hashtag) => {
    setCaption(caption.replace(`#${hashtag}`, ''));
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  // Handle publish
  const handlePublish = async () => {
    if (!file && !previewUrl) {
      toast({
        title: 'No content selected',
        description: 'Please select an image or video to publish',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: 'Caption required',
        description: 'Please add a caption to your content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedTribe) {
      toast({
        title: 'Tribe required',
        description: 'Please select a tribe for your content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption);
      formData.append('hashtags', JSON.stringify(hashtags));
      formData.append('mentions', JSON.stringify(mentions));
      formData.append('tribeId', selectedTribe);
      formData.append('settings', JSON.stringify(settings));
      formData.append('contentType', contentType);

      // TODO: Implement actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload

      toast({
        title: 'Content Published!',
        description: 'Your content is now live on Afroverse',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to publish content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Render select step
  const renderSelectStep = () => (
    <VStack spacing={6} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        What would you like to create?
      </Text>

      <VStack spacing={3} align="stretch">
        <Button
          size="lg"
          leftIcon={<FaUpload />}
          onClick={() => handleSelectType('image')}
        >
          Upload Image
        </Button>

        <Button
          size="lg"
          leftIcon={<FaVideo />}
          onClick={() => handleSelectType('video')}
        >
          Upload Video
        </Button>

        <Button
          size="lg"
          leftIcon={<FaImage />}
          onClick={() => handleSelectType('ai')}
        >
          Use Latest AI Transformation
        </Button>
      </VStack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </VStack>
  );

  // Render edit step
  const renderEditStep = () => (
    <VStack spacing={6} align="stretch">
      {/* Preview */}
      {previewUrl && (
        <Box position="relative" bg="black" borderRadius="lg" overflow="hidden">
          {contentType === 'video' ? (
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          ) : (
            <Image src={previewUrl} alt="Preview" maxH="400px" mx="auto" />
          )}
        </Box>
      )}

      {/* Caption */}
      <Textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={handleCaptionChange}
        maxLength={220}
        rows={3}
        resize="none"
      />
      <Text fontSize="xs" color="gray.500" textAlign="right">
        {caption.length}/220
      </Text>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="bold">
            Hashtags
          </Text>
          <HStack flexWrap="wrap" spacing={2}>
            {hashtags.map(hashtag => (
              <Tag key={hashtag} colorScheme="orange">
                <TagLabel>#{hashtag}</TagLabel>
                <TagCloseButton onClick={() => handleHashtagRemove(hashtag)} />
              </Tag>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Tribe Selection */}
      <FormControl>
        <FormLabel>Tribe</FormLabel>
        <Menu>
          <MenuButton as={Button} width="full" rightIcon={<FaUsers />}>
            {selectedTribe || 'Select Tribe'}
          </MenuButton>
          <MenuList>
            {/* TODO: Load actual tribes */}
            <MenuItem onClick={() => setSelectedTribe('lagos_lions')}>Lagos Lions</MenuItem>
            <MenuItem onClick={() => setSelectedTribe('zulu_nation')}>Zulu Nation</MenuItem>
            <MenuItem onClick={() => setSelectedTribe('yoruba_warriors')}>Yoruba Warriors</MenuItem>
          </MenuList>
        </Menu>
        <FormHelperText>Required - Helps boost your tribe rankings</FormHelperText>
      </FormControl>

      {/* Settings */}
      <Divider />
      <VStack align="start" spacing={4}>
        <Text fontSize="md" fontWeight="bold">
          Settings
        </Text>

        <Flex width="full" justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Allow Remixes</Text>
            <Text fontSize="xs" color="gray.500">
              Others can recreate your content
            </Text>
          </VStack>
          <Switch
            isChecked={settings.allowRemix}
            onChange={(e) => setSettings({ ...settings, allowRemix: e.target.checked })}
          />
        </Flex>

        <Flex width="full" justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Allow Duet Battles</Text>
            <Text fontSize="xs" color="gray.500">
              Others can challenge your content
            </Text>
          </VStack>
          <Switch
            isChecked={settings.allowDuet}
            onChange={(e) => setSettings({ ...settings, allowDuet: e.target.checked })}
          />
        </Flex>

        <Flex width="full" justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Allow Battles</Text>
            <Text fontSize="xs" color="gray.500">
              Content can be used in battles
            </Text>
          </VStack>
          <Switch
            isChecked={settings.allowBattle}
            onChange={(e) => setSettings({ ...settings, allowBattle: e.target.checked })}
          />
        </Flex>

        <Flex width="full" justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Hide Original Transform</Text>
            <Text fontSize="xs" color="gray.500">
              Keep your creation private
            </Text>
          </VStack>
          <Switch
            isChecked={settings.hideOriginal}
            onChange={(e) => setSettings({ ...settings, hideOriginal: e.target.checked })}
          />
        </Flex>
      </VStack>

      {/* Action Buttons */}
      <HStack spacing={3} width="full">
        <Button
          flex="1"
          onClick={() => setStep('select')}
        >
          Back
        </Button>
        <Button
          flex="2"
          colorScheme="orange"
          onClick={handlePublish}
          isLoading={isUploading}
          loadingText="Publishing..."
        >
          Publish
        </Button>
      </HStack>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress value={uploadProgress} colorScheme="orange" />
      )}
    </VStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bg}>
        <ModalHeader>
          {step === 'select' ? 'Create Content' : 'Edit Content'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {step === 'select' ? renderSelectStep() : renderEditStep()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateModal;
