import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FaVideo, FaClock, FaCheckCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { useVideo } from '../../hooks/useVideo';

const VideoProgress = ({ jobId, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('queued');
  const [message, setMessage] = useState('Video creation queued...');
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const { getVideoStatus } = useVideo();

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const result = await getVideoStatus(jobId);
        
        setProgress(result.progress);
        setStatus(result.status);
        setMessage(result.message || getStatusMessage(result.status));
        
        if (result.video) {
          setVideo(result.video);
          if (onComplete) onComplete(result.video);
        }
        
        if (result.error) {
          setError(result.error);
          if (onError) onError(result.error);
        }
        
        // Continue polling if not completed or failed
        if (result.status === 'queued' || result.status === 'processing') {
          setTimeout(pollStatus, 2000); // Poll every 2 seconds
        }
        
      } catch (error) {
        console.error('Error polling video status:', error);
        setError(error.message);
        if (onError) onError(error.message);
      }
    };

    // Start polling immediately
    pollStatus();
  }, [jobId, getVideoStatus, onComplete, onError]);

  const getStatusMessage = (status) => {
    switch (status) {
      case 'queued':
        return 'Your video is in the queue...';
      case 'processing':
        return 'Generating your video...';
      case 'completed':
        return 'Video ready!';
      case 'failed':
        return 'Video creation failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
        return FaClock;
      case 'processing':
        return FaVideo;
      case 'completed':
        return FaCheckCircle;
      case 'failed':
        return FaExclamationTriangle;
      default:
        return FaVideo;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus('queued');
    setProgress(0);
    setMessage('Retrying video creation...');
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        
        <Box flex="1">
          <AlertTitle fontSize="sm">Video Creation Failed</AlertTitle>
          <AlertDescription fontSize="xs" mb={2}>
            {error}
          </AlertDescription>
          <Button size="sm" colorScheme="red" onClick={handleRetry}>
            <Icon as={FaRedo} mr={1} />
            Retry
          </Button>
        </Box>
      </Alert>
    );
  }

  if (video) {
    return (
      <Alert status="success" borderRadius="md">
        
        <Box flex="1">
          <AlertTitle fontSize="sm">Video Ready!</AlertTitle>
          <AlertDescription fontSize="xs">
            Your {video.variant} video is ready to share.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <VStack spacing={4} align="stretch">
        {/* Status Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon 
              as={getStatusIcon(status)} 
              color={`${getStatusColor(status)}.500`}
              boxSize={5}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold">
                {getStatusMessage(status)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {message}
              </Text>
            </VStack>
          </HStack>
          
          <Badge colorScheme={getStatusColor(status)} fontSize="xs">
            {status.toUpperCase()}
          </Badge>
        </HStack>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progress}
            colorScheme={getStatusColor(status)}
            size="sm"
            borderRadius="md"
          />
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
            {progress}% complete
          </Text>
        </Box>

        {/* Processing Steps */}
        {status === 'processing' && (
          <Box>
            <Text fontSize="xs" color="gray.600" mb={2}>
              Processing steps:
            </Text>
            <VStack spacing={1} align="stretch">
              <HStack spacing={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="50%"
                  bg={progress >= 20 ? 'green.500' : 'gray.300'}
                />
                <Text fontSize="xs" color="gray.600">
                  Analyzing image
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="50%"
                  bg={progress >= 40 ? 'green.500' : 'gray.300'}
                />
                <Text fontSize="xs" color="gray.600">
                  Generating motion frames
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="50%"
                  bg={progress >= 60 ? 'green.500' : 'gray.300'}
                />
                <Text fontSize="xs" color="gray.600">
                  Adding effects and audio
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="50%"
                  bg={progress >= 80 ? 'green.500' : 'gray.300'}
                />
                <Text fontSize="xs" color="gray.600">
                  Finalizing video
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Estimated Time */}
        {status === 'processing' && (
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.500">
              Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 10))} seconds
            </Text>
          </Box>
        )}

        {/* Cultural Facts (while processing) */}
        {status === 'processing' && progress > 0 && (
          <Box>
            <Divider my={2} />
            <Text fontSize="xs" color="gray.600" textAlign="center" fontStyle="italic">
              "Did you know? The Maasai people are known for their distinctive red shuka cloth and intricate beadwork."
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default VideoProgress;
