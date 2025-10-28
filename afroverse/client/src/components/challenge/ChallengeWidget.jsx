import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Progress, Button, Badge, Icon, 
  Spinner, Alert, Card, CardBody, CardHeader,
  Flex, 
  SimpleGrid
} from '@chakra-ui/react';
import { FaTrophy, FaFire, FaCalendarWeek, FaUsers, FaStar, FaGift, FaCrown } from 'react-icons/fa';
import { useChallenge } from '../../hooks/useChallenge';

const ChallengeWidget = ({ onViewAll }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const {
    dailyChallenge,
    weeklyChallenge,
    challengeStats,
    status,
    error,
    getDailyChallenge,
    getWeeklyChallenge,
  } = useChallenge();

  useEffect(() => {
    getDailyChallenge();
    getWeeklyChallenge();
  }, [getDailyChallenge, getWeeklyChallenge]);

  if (status === 'loading' && !dailyChallenge && !weeklyChallenge) {
    return (
      <Box p={4} bg="gray.800" borderRadius="lg" shadow="md">
        <HStack justify="center">
          <Spinner size="sm" color="purple.500" />
          <Text color="gray.400">Loading challenges...</Text>
        </HStack>
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error" size="sm">
        Error loading challenges
      </Alert>
    );
  }

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'red.400';
    if (streak >= 3) return 'orange.400';
    return 'yellow.400';
  };

  return (
    <Box>
      {/* Daily Challenge Widget */}
      {dailyChallenge && (
        <Card bg="gray.800" borderColor="gray.600" shadow="lg" mb={4}>
          <CardBody p={4}>
            <VStack spacing={3} align="stretch">
              <Flex align="center" justify="space-between">
                <HStack>
                  <Text fontSize="lg">{dailyChallenge.emoji}</Text>
                  <Box>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {dailyChallenge.title}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {dailyChallenge.description}
                    </Text>
                  </Box>
                </HStack>
                <Badge 
                  colorScheme={dailyChallenge.difficulty === 'easy' ? 'green' : dailyChallenge.difficulty === 'medium' ? 'yellow' : 'red'}
                  size="sm"
                >
                  {dailyChallenge.difficulty}
                </Badge>
              </Flex>

              {/* Progress */}
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.400">Progress</Text>
                  <Text fontSize="xs" color="gray.400">
                    {dailyChallenge.progress.current}/{dailyChallenge.progress.target}
                  </Text>
                </Flex>
                <Progress
                  value={dailyChallenge.progress.percentage}
                  colorScheme={dailyChallenge.progress.isCompleted ? 'green' : 'purple'}
                  size="sm"
                  borderRadius="md"
                />
              </Box>

              {/* Rewards Preview */}
              <HStack spacing={2} flexWrap="wrap">
                {Object.entries(dailyChallenge.rewards).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <HStack key={key} spacing={1}>
                      <Icon as={FaStar} color="yellow.400" boxSize={2} />
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

              {/* Streak Display */}
              {challengeStats && (
                <HStack justify="center" spacing={4}>
                  <HStack spacing={1}>
                    <Icon as={FaFire} color={getStreakColor(challengeStats.dailyStreak?.current || 0)} />
                    <Text fontSize="sm" color="gray.300">
                      {challengeStats.dailyStreak?.current || 0} day streak
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={FaCalendarWeek} color="blue.400" />
                    <Text fontSize="sm" color="gray.300">
                      {challengeStats.weeklyStreak?.current || 0} week streak
                    </Text>
                  </HStack>
                </HStack>
              )}

              <Button
                colorScheme="purple"
                size="sm"
                onClick={onViewAll}
                isDisabled={dailyChallenge.progress.current < dailyChallenge.progress.target}
              >
                {dailyChallenge.progress.isCompleted ? 'View Rewards' : 'Complete Challenge'}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Weekly Challenge Preview */}
      {weeklyChallenge && (
        <Card bg="gray.800" borderColor="gray.600" shadow="lg">
          <CardBody p={4}>
            <VStack spacing={3} align="stretch">
              <Flex align="center" justify="space-between">
                <HStack>
                  <Text fontSize="lg">{weeklyChallenge.emoji}</Text>
                  <Box>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {weeklyChallenge.title}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {weeklyChallenge.description}
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme="blue" size="sm">
                  Weekly
                </Badge>
              </Flex>

              {/* Progress */}
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.400">Progress</Text>
                  <Text fontSize="xs" color="gray.400">
                    {weeklyChallenge.progress.current}/{weeklyChallenge.progress.target}
                  </Text>
                </Flex>
                <Progress
                  value={weeklyChallenge.progress.percentage}
                  colorScheme={weeklyChallenge.progress.isCompleted ? 'green' : 'blue'}
                  size="sm"
                  borderRadius="md"
                />
              </Box>

              {/* Rewards Preview */}
              <HStack spacing={2} flexWrap="wrap">
                {Object.entries(weeklyChallenge.rewards).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <HStack key={key} spacing={1}>
                      <Icon as={FaCrown} color="blue.400" boxSize={2} />
                      <Text fontSize="xs" color="gray.300">
                        {key === 'multiplier' ? `${value}x Points` :
                         key === 'totemUnlocked' ? 'Tribe Totem' :
                         key === 'badgeUnlocked' ? 'Special Badge' : value}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>

              <Button
                colorScheme="blue"
                size="sm"
                onClick={onViewAll}
                isDisabled={weeklyChallenge.progress.current < weeklyChallenge.progress.target}
              >
                {weeklyChallenge.progress.isCompleted ? 'View Rewards' : 'Complete Challenge'}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default ChallengeWidget;
