import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Progress,
  Badge,
  Icon,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import { FaShare, FaWhatsapp, FaCopy, FaGift, FaTrophy, FaUsers, FaDollarSign, FaShieldAlt } from 'react-icons/fa';
import { useReferral } from '../../hooks/useReferral';
import { useSelector } from 'react-redux';

const ReferralLadder = ({ onInvite }) => {
  const { referralProgress, status } = useReferral();

  const rewardIcons = {
    extra_daily_transform: FaGift,
    premium_video_unlock: FaGift,
    coins: FaDollarSign,
    streak_shield: FaShieldAlt,
    tribe_power_buff: FaUsers,
  };

  const rewardColors = {
    extra_daily_transform: 'green',
    premium_video_unlock: 'purple',
    coins: 'yellow',
    streak_shield: 'blue',
    tribe_power_buff: 'orange',
  };

  if (status === 'loading') {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} color="gray.600">Loading referral rewards...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Invite Friends & Unlock Rewards
          </Text>
          <Text color="gray.600">
            Your tribe needs warriors! Invite friends to unlock amazing rewards.
          </Text>
        </Box>

        {/* Reward Ladder */}
        <VStack spacing={4} align="stretch">
          {referralProgress?.rewardProgress?.map((reward, index) => (
            <Box
              key={reward.type}
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={reward.unlocked ? `${rewardColors[reward.type]}.300` : 'gray.200'}
              bg={reward.unlocked ? `${rewardColors[reward.type]}.50` : 'gray.50'}
              position="relative"
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon
                    as={rewardIcons[reward.type]}
                    boxSize={6}
                    color={reward.unlocked ? `${rewardColors[reward.type]}.500` : 'gray.400'}
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color={reward.unlocked ? 'gray.800' : 'gray.600'}>
                      {reward.description}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Invite {reward.threshold} friends
                    </Text>
                  </VStack>
                </HStack>

                <VStack spacing={1}>
                  <Badge
                    colorScheme={reward.unlocked ? rewardColors[reward.type] : 'gray'}
                    fontSize="sm"
                  >
                    {reward.current}/{reward.threshold}
                  </Badge>
                  {reward.claimed && (
                    <Badge colorScheme="green" fontSize="xs">
                      Claimed
                    </Badge>
                  )}
                </VStack>
              </HStack>

              {/* Progress Bar */}
              <Box mt={3}>
                <Progress
                  value={reward.progress}
                  colorScheme={reward.unlocked ? rewardColors[reward.type] : 'gray'}
                  size="sm"
                  borderRadius="md"
                />
              </Box>

              {/* Unlock Status */}
              {reward.unlocked && !reward.claimed && (
                <Box mt={2}>
                  <Button
                    size="sm"
                    colorScheme={rewardColors[reward.type]}
                    onClick={() => {
                      toast({
                        title: 'Reward Claimed!',
                        description: `${reward.description} has been added to your account.`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Claim Reward
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </VStack>

        {/* Invite Button */}
        <Button
          size="lg"
          colorScheme="green"
          leftIcon={<FaWhatsapp />}
          onClick={onInvite}
          bg="linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
          _hover={{
            bg: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
          }}
        >
          Invite Friends on WhatsApp
        </Button>

        {/* Next Reward */}
        {referralProgress?.nextReward && (
          <Alert status="info" borderRadius="md">
            
            <Box>
              <AlertTitle fontSize="sm">Next Reward</AlertTitle>
              <AlertDescription fontSize="xs">
                Invite {referralProgress.nextReward.threshold - referralProgress.nextReward.current} more friends to unlock {referralProgress.nextReward.description}
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default ReferralLadder;
