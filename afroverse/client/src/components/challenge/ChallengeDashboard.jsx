import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Progress, Button, Badge, Icon, 
  Spinner, Alert, Card, CardBody, CardHeader,
  Flex, 
  SimpleGrid
} from '@chakra-ui/react';
import { FaTrophy, FaFire, FaCalendarWeek, FaUsers, FaStar, FaGift } from 'react-icons/fa';
import { useChallenge } from '../../hooks/useChallenge';

const DailyChallengeCard = ({ challenge, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const bgColor = 'gray.800';
  const borderColor = 'gray.600';

  const handleComplete = async () => {
    if (challenge.progress.isCompleted) return;
    
    setIsCompleting(true);
    try {
      await onComplete(challenge.userChallengeId, 'daily');
      toast({
        title: 'Challenge Complete! 🎉',
        description: 'You earned rewards and increased your streak!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete challenge.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
      case 'xp': return FaStar;
      case 'clanPoints': return FaUsers;
      case 'transformationCredits': return FaGift;
      case 'streakSaver': return FaFire;
      default: return FaGift;
    }
  };

  const getRewardText = (rewards) => {
    const rewardTexts = [];
    if (rewards.xp) rewardTexts.push(`+${rewards.xp} XP`);
    if (rewards.clanPoints) rewardTexts.push(`+${rewards.clanPoints} Clan Points`);
    if (rewards.transformationCredits) rewardTexts.push(`+${rewards.transformationCredits} Free Transform`);
    if (rewards.streakSaver) rewardTexts.push('Streak Saver');
    return rewardTexts.join(', ');
  };

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="lg">
      <CardHeader pb={2}>
        <Flex align="center" justify="space-between">
          <HStack>
            <Text fontSize="2xl">{challenge.emoji}</Text>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {challenge.title}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {challenge.description}
              </Text>
            </Box>
          </HStack>
          <Badge 
            colorScheme={challenge.difficulty === 'easy' ? 'green' : challenge.difficulty === 'medium' ? 'yellow' : 'red'}
            textTransform="capitalize"
          >
            {challenge.difficulty}
          </Badge>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Progress */}
          <Box>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.400">Progress</Text>
              <Text fontSize="sm" color="gray.400">
                {challenge.progress.current}/{challenge.progress.target}
              </Text>
            </Flex>
            <Progress
              value={challenge.progress.percentage}
              colorScheme={challenge.progress.isCompleted ? 'green' : 'purple'}
              size="lg"
              borderRadius="md"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {challenge.progress.percentage}% complete
            </Text>
          </Box>

          {/* Rewards */}
          <Box>
            <Text fontSize="sm" color="gray.400" mb={2}>Rewards</Text>
            <HStack spacing={2} flexWrap="wrap">
              {Object.entries(challenge.rewards).map(([key, value]) => {
                if (!value) return null;
                const IconComponent = getRewardIcon(key);
                return (
                  <HStack key={key} spacing={1}>
                    <Icon as={IconComponent} color="yellow.400" boxSize={3} />
                    <Text fontSize="xs" color="gray.300">
                      {key === 'xp' ? `+${value} XP` :
                       key === 'clanPoints' ? `+${value} CP` :
                       key === 'transformationCredits' ? `+${value} Transform` :
                       key === 'streakSaver' ? 'Streak Saver' : value}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>
          </Box>

          {/* Complete Button */}
          {challenge.progress.isCompleted ? (
            <Button
              colorScheme="green"
              size="sm"
              leftIcon={<Icon as={FaTrophy} />}
              isDisabled
            >
              Completed! 🎉
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              size="sm"
              onClick={handleComplete}
              isLoading={isCompleting}
              isDisabled={challenge.progress.current < challenge.progress.target}
            >
              Complete Challenge
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const WeeklyChallengeCard = ({ challenge, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const bgColor = 'gray.800';
  const borderColor = 'gray.600';

  const handleComplete = async () => {
    if (challenge.progress.isCompleted) return;
    
    setIsCompleting(true);
    try {
      await onComplete(challenge.userChallengeId, 'weekly');
      toast({
        title: 'Weekly Challenge Complete! 🏆',
        description: 'You earned rewards and increased your weekly streak!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete challenge.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="lg">
      <CardHeader pb={2}>
        <Flex align="center" justify="space-between">
          <HStack>
            <Text fontSize="2xl">{challenge.emoji}</Text>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {challenge.title}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {challenge.description}
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme="blue" textTransform="capitalize">
            Weekly
          </Badge>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Progress */}
          <Box>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.400">Progress</Text>
              <Text fontSize="sm" color="gray.400">
                {challenge.progress.current}/{challenge.progress.target}
              </Text>
            </Flex>
            <Progress
              value={challenge.progress.percentage}
              colorScheme={challenge.progress.isCompleted ? 'green' : 'blue'}
              size="lg"
              borderRadius="md"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {challenge.progress.percentage}% complete
            </Text>
          </Box>

          {/* Rewards */}
          <Box>
            <Text fontSize="sm" color="gray.400" mb={2}>Rewards</Text>
            <HStack spacing={2} flexWrap="wrap">
              {Object.entries(challenge.rewards).map(([key, value]) => {
                if (!value) return null;
                return (
                  <HStack key={key} spacing={1}>
                    <Icon as={FaGift} color="blue.400" boxSize={3} />
                    <Text fontSize="xs" color="gray.300">
                      {key === 'multiplier' ? `${value}x Points` :
                       key === 'totemUnlocked' ? 'Tribe Totem' :
                       key === 'badgeUnlocked' ? 'Special Badge' : value}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>
          </Box>

          {/* Complete Button */}
          {challenge.progress.isCompleted ? (
            <Button
              colorScheme="green"
              size="sm"
              leftIcon={<Icon as={FaTrophy} />}
              isDisabled
            >
              Completed! 🏆
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleComplete}
              isLoading={isCompleting}
              isDisabled={challenge.progress.current < challenge.progress.target}
            >
              Complete Challenge
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const ChallengeDashboard = () => {
  const {
    dailyChallenge,
    weeklyChallenge,
    challengeStats,
    status,
    error,
    getDailyChallenge,
    getWeeklyChallenge,
    getChallengeStats,
    completeChallenge,
  } = useChallenge();

  useEffect(() => {
    getDailyChallenge();
    getWeeklyChallenge();
    getChallengeStats();
  }, [getDailyChallenge, getWeeklyChallenge, getChallengeStats]);

  const handleCompleteChallenge = async (userChallengeId, challengeType) => {
    try {
      await completeChallenge(userChallengeId, challengeType);
    } catch (error) {
      throw error;
    }
  };

  if (status === 'loading' && !dailyChallenge && !weeklyChallenge) {
    return (
      <VStack py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4} color="gray.400">Loading your challenges...</Text>
      </VStack>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error" mt={4}>
        Error loading challenges: {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="stretch" p={5} maxW="container.lg" mx="auto">
      <Text fontSize="3xl" fontWeight="extrabold" color="white" textAlign="center">
        Daily & Weekly Challenges 🔥
      </Text>

      {/* Streak Stats */}
      {challengeStats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text color="gray.400" fontSize="sm" mb={2}>Daily Streak</Text>
            <Text fontSize="3xl" color="orange.300" fontWeight="bold">
              {challengeStats.dailyStreak?.current || 0}
            </Text>
            <Text color="gray.500" fontSize="xs" mt={1}>Current streak</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text color="gray.400" fontSize="sm" mb={2}>Weekly Streak</Text>
            <Text fontSize="3xl" color="blue.300" fontWeight="bold">
              {challengeStats.weeklyStreak?.current || 0}
            </Text>
            <Text color="gray.500" fontSize="xs" mt={1}>Current streak</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text color="gray.400" fontSize="sm" mb={2}>Daily Completed</Text>
            <Text fontSize="3xl" color="green.300" fontWeight="bold">
              {challengeStats.totalCompleted?.daily || 0}
            </Text>
            <Text color="gray.500" fontSize="xs" mt={1}>Total completed</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text color="gray.400" fontSize="sm" mb={2}>Weekly Completed</Text>
            <Text fontSize="3xl" color="purple.300" fontWeight="bold">
              {challengeStats.totalCompleted?.weekly || 0}
            </Text>
            <Text color="gray.500" fontSize="xs" mt={1}>Total completed</Text>
          </Box>
        </SimpleGrid>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            Today's Challenge
          </Text>
          <DailyChallengeCard
            challenge={dailyChallenge}
            onComplete={handleCompleteChallenge}
          />
        </Box>
      )}

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            This Week's Challenge
          </Text>
          <WeeklyChallengeCard
            challenge={weeklyChallenge}
            onComplete={handleCompleteChallenge}
          />
        </Box>
      )}

      {/* Streak Freezes */}
      {challengeStats && challengeStats.streakFreezes > 0 && (
        <Box bg="gray.800" p={6} borderRadius="lg" shadow="md" border="1px" borderColor="gray.700">
          <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
            Streak Protection
          </Text>
          <Text color="gray.300" mb={4}>
            You have {challengeStats.streakFreezes} streak freeze(s) available to protect your daily streak.
          </Text>
          <Button colorScheme="yellow" size="sm">
            Use Streak Freeze
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default ChallengeDashboard;
