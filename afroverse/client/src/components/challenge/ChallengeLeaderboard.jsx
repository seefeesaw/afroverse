import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Icon, Spinner,
  Alert, Card, CardBody, CardHeader, Flex, Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { FaTrophy, FaFire, FaCalendarWeek, FaUsers, FaStar, FaCrown, FaMedal, FaGift } from 'react-icons/fa';
import { useChallenge } from '../../hooks/useChallenge';

const ChallengeCompletionModal = ({ isOpen, onClose, challenge, challengeType }) => {
  const bgColor = 'gray.800';

  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
      case 'xp': return FaStar;
      case 'clanPoints': return FaUsers;
      case 'transformationCredits': return FaGift;
      case 'streakSaver': return FaFire;
      case 'multiplier': return FaCrown;
      case 'totemUnlocked': return FaTrophy;
      case 'badgeUnlocked': return FaMedal;
      default: return FaGift;
    }
  };

  const getRewardText = (key, value) => {
    switch (key) {
      case 'xp': return `+${value} XP`;
      case 'clanPoints': return `+${value} Clan Points`;
      case 'transformationCredits': return `+${value} Free Transform`;
      case 'streakSaver': return 'Streak Saver';
      case 'multiplier': return `${value}x Points Multiplier`;
      case 'totemUnlocked': return 'Tribe Totem Unlocked';
      case 'badgeUnlocked': return 'Special Badge Unlocked';
      default: return value;
    }
  };

  if (!isOpen) return null;

  return (
    <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1000}
        bg={bgColor}
        borderColor="gray.600"
        borderWidth="1px"
        borderRadius="md"
        p={6}
        maxW="md"
        w="90%"
      >
        <VStack spacing={2} mb={6} textAlign="center">
          <Text fontSize="4xl">🎉</Text>
          <Text fontSize="xl" fontWeight="bold" color="white">
            Challenge Complete!
          </Text>
          <Text fontSize="md" color="gray.400">
            {challenge?.title}
          </Text>
        </VStack>
        
        <Box pb={6}>
          <VStack spacing={6}>
            {/* Rewards */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" color="white" mb={4} textAlign="center">
                Rewards Earned
              </Text>
              <VStack spacing={3}>
                {challenge?.rewards && Object.entries(challenge.rewards).map(([key, value]) => {
                  if (!value) return null;
                  const IconComponent = getRewardIcon(key);
                  return (
                    <HStack key={key} spacing={3} w="full" justify="center">
                      <Icon as={IconComponent} color="yellow.400" boxSize={5} />
                      <Text fontSize="md" color="gray.300">
                        {getRewardText(key, value)}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>
            </Box>

            {/* Streak Update */}
            <Box w="full" textAlign="center">
              <Text fontSize="md" color="gray.400" mb={2}>
                Streak Updated
              </Text>
              <HStack justify="center" spacing={6}>
                <VStack spacing={1}>
                  <Icon as={FaFire} color="orange.400" boxSize={4} />
                  <Text fontSize="sm" color="gray.300">
                    Daily: {challenge?.streak?.daily || 0}
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Icon as={FaCalendarWeek} color="blue.400" boxSize={4} />
                  <Text fontSize="sm" color="gray.300">
                    Weekly: {challenge?.streak?.weekly || 0}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Action Buttons */}
            <HStack spacing={4} w="full">
              <Button
                colorScheme="purple"
                flex={1}
                onClick={onClose}
              >
                Awesome!
              </Button>
              <Button
                colorScheme="blue"
                variant="outline"
                flex={1}
                onClick={() => {
                  onClose();
                  // Navigate to challenges page
                  window.location.href = '/app/challenges';
                }}
              >
                View All Challenges
              </Button>
            </HStack>
          </VStack>
        </Box>
        <Button onClick={onClose} position="absolute" top={2} right={2} size="sm">
          ×
        </Button>
      </Box>
  );
};

const ChallengeLeaderboard = () => {
  const {
    challengeLeaderboard,
    status,
    error,
    getChallengeLeaderboard,
  } = useChallenge();

  useEffect(() => {
    getChallengeLeaderboard('daily', 'week');
  }, [getChallengeLeaderboard]);

  if (status === 'loading') {
    return (
      <VStack py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4} color="gray.400">Loading leaderboard...</Text>
      </VStack>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error" mt={4}>
        Error loading leaderboard: {error}
      </Alert>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Icon as={FaTrophy} color="yellow.400" boxSize={5} />;
    if (rank === 2) return <Icon as={FaMedal} color="gray.400" boxSize={5} />;
    if (rank === 3) return <Icon as={FaMedal} color="orange.400" boxSize={5} />;
    return <Text fontSize="lg" fontWeight="bold" color="gray.400">#{rank}</Text>;
  };

  return (
    <VStack spacing={6} align="stretch" p={5} maxW="container.lg" mx="auto">
      <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
        Challenge Leaderboard 🏆
      </Text>

      {/* Leaderboard */}
      <VStack spacing={3} align="stretch">
        {challengeLeaderboard?.map((user, index) => (
          <Card key={user.username} bg="gray.800" borderColor="gray.600" shadow="md">
            <CardBody p={4}>
              <Flex align="center" justify="space-between">
                <HStack spacing={4}>
                  {getRankIcon(user.rank)}
                  <Box>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {user.username}
                    </Text>
                    {user.tribe && (
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.400">{user.tribe.emblem.icon}</Text>
                        <Text fontSize="xs" color="gray.400">{user.tribe.displayName}</Text>
                      </HStack>
                    )}
                  </Box>
                </HStack>
                
                <HStack spacing={6}>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="gray.400">Daily</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.300">
                      {user.stats.dailyCompleted}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="gray.400">Weekly</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.300">
                      {user.stats.weeklyCompleted}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="gray.400">Streak</Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.300">
                      {user.stats.dailyStreak}
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Stats Summary */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Box p={4} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
          <Text fontSize="sm" color="gray.400" mb={2}>Total Players</Text>
          <Text fontSize="2xl" color="purple.300" fontWeight="bold">
            {challengeLeaderboard?.length || 0}
          </Text>
        </Box>

        <Box p={4} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
          <Text fontSize="sm" color="gray.400" mb={2}>Avg Daily</Text>
          <Text fontSize="2xl" color="green.300" fontWeight="bold">
            {challengeLeaderboard?.length > 0 
              ? Math.round(challengeLeaderboard.reduce((sum, user) => sum + user.stats.dailyCompleted, 0) / challengeLeaderboard.length)
              : 0}
          </Text>
        </Box>

        <Box p={4} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
          <Text fontSize="sm" color="gray.400" mb={2}>Avg Weekly</Text>
          <Text fontSize="2xl" color="blue.300" fontWeight="bold">
            {challengeLeaderboard?.length > 0 
              ? Math.round(challengeLeaderboard.reduce((sum, user) => sum + user.stats.weeklyCompleted, 0) / challengeLeaderboard.length)
              : 0}
          </Text>
        </Box>

        <Box p={4} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
          <Text fontSize="sm" color="gray.400" mb={2}>Avg Streak</Text>
          <Text fontSize="2xl" color="orange.300" fontWeight="bold">
            {challengeLeaderboard?.length > 0 
              ? Math.round(challengeLeaderboard.reduce((sum, user) => sum + user.stats.dailyStreak, 0) / challengeLeaderboard.length)
              : 0}
          </Text>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export { ChallengeCompletionModal, ChallengeLeaderboard };
