import React, { useEffect, useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Icon, Circle,
  Modal, ModalOverlay, ModalContent, ModalBody,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaTrophy, FaGift, FaShare, FaFire, FaStar, FaCrown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { selectRecentlyUnlocked, clearRecentlyUnlocked } from '../../store/slices/achievementSlice';

// Confetti animation
const confetti = keyframes`
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
`;

const AchievementPopup = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Redux selectors
  const recentlyUnlocked = useSelector(selectRecentlyUnlocked);

  // Show popup when new achievement is unlocked
  useEffect(() => {
    if (recentlyUnlocked.length > 0 && !isOpen) {
      const achievement = recentlyUnlocked[0];
      setCurrentAchievement(achievement);
      setShowConfetti(true);
      onOpen();

      // Play achievement sound (if available)
      try {
        const audio = new Audio('/sounds/achievement.mp3');
        audio.play().catch(() => {
          // Ignore if audio fails to play
        });
      } catch (error) {
        // Ignore if audio file doesn't exist
      }

      // Auto-hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [recentlyUnlocked, isOpen, onOpen]);

  // Handle popup close
  const handleClose = () => {
    onClose();
    dispatch(clearRecentlyUnlocked());
    setCurrentAchievement(null);
    setShowConfetti(false);
  };

  // Handle share achievement
  const handleShare = async () => {
    if (!currentAchievement) return;

    const shareText = `I just unlocked the "${currentAchievement.name}" achievement on Afroverse! 🏆`;
    const shareUrl = `${window.location.origin}/profile/${user.username}#achievements`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: 'Link Copied',
        description: 'Achievement link copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get rarity icon and color
  const getRarityProps = (rarity) => {
    const props = {
      common: { icon: FaStar, color: 'gray.500', bg: 'gray.100' },
      rare: { icon: FaFire, color: 'blue.500', bg: 'blue.100' },
      epic: { icon: FaStar, color: 'purple.500', bg: 'purple.100' },
      legendary: { icon: FaCrown, color: 'yellow.500', bg: 'yellow.100' },
    };
    return props[rarity] || props.common;
  };

  if (!currentAchievement) return null;

  const rarityProps = getRarityProps(currentAchievement.rarity);

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          pointerEvents="none"
          zIndex={9999}
        >
          {[...Array(50)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              top="-10px"
              left={`${Math.random() * 100}%`}
              width="10px"
              height="10px"
              bg={`hsl(${Math.random() * 360}, 70%, 50%)`}
              borderRadius="50%"
              animation={`${confetti} ${2 + Math.random() * 3}s linear forwards`}
              animationDelay={`${Math.random() * 2}s`}
            />
          ))}
        </Box>
      )}

      {/* Achievement Popup */}
      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalBody p={8}>
            <VStack spacing={6} textAlign="center">
              {/* Achievement Icon */}
              <Circle
                size="120px"
                bg={rarityProps.bg}
                color={rarityProps.color}
                border="4px solid"
                borderColor={rarityProps.color}
                animation="pulse 2s infinite"
              >
                <Text fontSize="4xl">{currentAchievement.icon}</Text>
              </Circle>

              {/* Achievement Details */}
              <VStack spacing={3}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  Achievement Unlocked!
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={rarityProps.color}>
                  {currentAchievement.name}
                </Text>
                <Text fontSize="md" color="gray.300" maxW="md">
                  {currentAchievement.description}
                </Text>
                <Badge
                  colorScheme={currentAchievement.rarity}
                  size="lg"
                  textTransform="capitalize"
                  px={4}
                  py={2}
                >
                  {currentAchievement.rarity}
                </Badge>
              </VStack>

              {/* Reward */}
              {currentAchievement.reward && (
                <Box
                  p={4}
                  bg="green.900"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="green.600"
                  width="full"
                >
                  <HStack spacing={3} justify="center">
                    <Icon as={FaGift} color="green.400" boxSize={5} />
                    <Text color="green.300" fontWeight="semibold">
                      {currentAchievement.reward.description}
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* XP Reward */}
              {currentAchievement.xpReward > 0 && (
                <HStack spacing={2}>
                  <Icon as={FaStar} color="yellow.400" />
                  <Text color="yellow.300" fontWeight="semibold">
                    +{currentAchievement.xpReward} XP
                  </Text>
                </HStack>
              )}

              {/* Action Buttons */}
              <HStack spacing={4} width="full">
                <Button
                  flex="1"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FaShare />}
                  onClick={handleShare}
                >
                  Share
                </Button>
                <Button
                  flex="1"
                  colorScheme="orange"
                  onClick={handleClose}
                >
                  Continue
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AchievementPopup;
