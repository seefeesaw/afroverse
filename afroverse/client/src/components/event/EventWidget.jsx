import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Icon, Spinner,
  Alert, Card, CardBody, CardHeader, Flex, Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { FaTrophy, FaFire, FaCalendarWeek, FaUsers, FaStar, FaCrown, FaMedal, FaClock, FaBolt } from 'react-icons/fa';
import { useEvent } from '../../hooks/useEvent';

const EventWidget = ({ onViewAll }) => {
  const {
    currentEvent,
    powerHourStatus,
    userTribeWar,
    status,
    error,
    getCurrentEvent,
    getPowerHourStatus,
    getTribeWarStatus,
  } = useEvent();

  useEffect(() => {
    getCurrentEvent();
    getPowerHourStatus();
    getTribeWarStatus();
  }, [getCurrentEvent, getPowerHourStatus, getTribeWarStatus]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isPowerHourActive, setIsPowerHourActive] = useState(false);

  useEffect(() => {
    if (powerHourStatus) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const startTime = new Date(powerHourStatus.event.startAt).getTime();
        const endTime = new Date(powerHourStatus.event.endAt).getTime();
        
        if (now >= startTime && now <= endTime) {
          setIsPowerHourActive(true);
          setTimeLeft(endTime - now);
        } else if (now < startTime) {
          setIsPowerHourActive(false);
          setTimeLeft(startTime - now);
        } else {
          setIsPowerHourActive(false);
          setTimeLeft(0);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [powerHourStatus]);

  const formatTimeLeft = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (status === 'loading' && !currentEvent && !powerHourStatus) {
    return (
      <Box p={4} bg="gray.800" borderRadius="lg" shadow="md">
        <HStack justify="center">
          <Spinner size="sm" color="purple.500" />
          <Text color="gray.400">Loading events...</Text>
        </HStack>
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error" size="sm">
        Error loading events
      </Alert>
    );
  }

  return (
    <Box>
      {/* Clan War Widget */}
      {currentEvent && currentEvent.type === 'clan_war' && (
        <Card bg="gray.800" borderColor="gray.600" shadow="lg" mb={4}>
          <CardBody p={4}>
            <VStack spacing={3} align="stretch">
              <Flex align="center" justify="space-between">
                <HStack>
                  <Text fontSize="lg">{currentEvent.emoji}</Text>
                  <Box>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {currentEvent.title}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {currentEvent.description}
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme="red" size="sm">
                  Clan War
                </Badge>
              </Flex>

              {/* Tribe Rank */}
              {userTribeWar && (
                <HStack justify="center" spacing={4}>
                  <VStack spacing={1}>
                    <Icon as={FaTrophy} color="yellow.400" boxSize={4} />
                    <Text fontSize="sm" color="white">
                      #{userTribeWar.tribe.rank || 'N/A'}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Icon as={FaUsers} color="blue.400" boxSize={4} />
                    <Text fontSize="sm" color="gray.300">
                      {userTribeWar.tribe.score || 0} pts
                    </Text>
                  </VStack>
                </HStack>
              )}

              <Button
                colorScheme="red"
                size="sm"
                onClick={onViewAll}
                leftIcon={<Icon as={FaFire} />}
              >
                Contribute Now
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Power Hour Widget */}
      {powerHourStatus && (
        <Card bg="gray.800" borderColor="gray.600" shadow="lg">
          <CardBody p={4}>
            <VStack spacing={3} align="stretch">
              <Flex align="center" justify="space-between">
                <HStack>
                  <Text fontSize="lg">{powerHourStatus.event.emoji}</Text>
                  <Box>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {powerHourStatus.event.title}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {powerHourStatus.event.description}
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme={isPowerHourActive ? 'green' : 'blue'} size="sm">
                  {isPowerHourActive ? 'Active' : 'Upcoming'}
                </Badge>
              </Flex>

              {/* Timer */}
              <Box textAlign="center">
                <Text fontSize="sm" color={isPowerHourActive ? 'green.400' : 'blue.400'} fontWeight="bold">
                  {isPowerHourActive ? formatTimeLeft(timeLeft) : `Starts in ${formatTimeLeft(timeLeft)}`}
                </Text>
              </Box>

              {/* Multipliers */}
              <HStack justify="center" spacing={4}>
                <VStack spacing={1}>
                  <Icon as={FaStar} color="yellow.400" boxSize={3} />
                  <Text fontSize="xs" color="gray.300">
                    {powerHourStatus.multipliers.xp}x XP
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Icon as={FaUsers} color="blue.400" boxSize={3} />
                  <Text fontSize="xs" color="gray.300">
                    {powerHourStatus.multipliers.clanPoints}x CP
                  </Text>
                </VStack>
              </HStack>

              <Button
                colorScheme={isPowerHourActive ? 'green' : 'blue'}
                size="sm"
                onClick={onViewAll}
                leftIcon={<Icon as={isPowerHourActive ? FaBolt : FaClock} />}
                isDisabled={!isPowerHourActive && timeLeft > 0}
              >
                {isPowerHourActive ? 'Join Now' : 'View Details'}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default EventWidget;
