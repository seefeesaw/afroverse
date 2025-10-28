import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Progress, Button, Badge, Icon, 
  Spinner, Alert, Card, CardBody, CardHeader,
  Flex,
  SimpleGrid
} from '@chakra-ui/react';
import { FaTrophy, FaFire, FaCalendarWeek, FaUsers, FaStar, FaCrown, FaMedal, FaClock, FaBolt } from 'react-icons/fa';
import { useEvent } from '../../hooks/useEvent';

const ClanWarCard = ({ war, standings, userTribe, onContribute }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const bgColor = 'gray.800';
  const borderColor = 'gray.600';

  useEffect(() => {
    if (war && war.endAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const endTime = new Date(war.endAt).getTime();
        const timeRemaining = Math.max(0, endTime - now);
        setTimeLeft(timeRemaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [war]);

  const formatTimeLeft = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getObjectiveDescription = (objective) => {
    const descriptions = {
      most_battles_won: 'Win battles to earn points for your tribe',
      most_transformations: 'Create transformations to boost your tribe',
      most_votes_contributed: 'Vote on battles to support your tribe',
      most_active_members: 'Stay active daily to help your tribe',
      most_referrals: 'Invite friends to strengthen your tribe',
      most_engagement: 'Any activity counts toward victory',
    };
    return descriptions[objective] || 'Contribute to help your tribe win!';
  };

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="lg">
      <CardHeader pb={2}>
        <Flex align="center" justify="space-between">
          <HStack>
            <Text fontSize="2xl">{war?.emoji}</Text>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {war?.title}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {getObjectiveDescription(war?.objective)}
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme="red" textTransform="capitalize">
            Clan War
          </Badge>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Time Remaining */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={2}>Time Remaining</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.400">
              {formatTimeLeft(timeLeft)}
            </Text>
          </Box>

          {/* Tribe Rank */}
          {userTribe && (
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>Your Tribe Rank</Text>
              <HStack justify="center" spacing={4}>
                <VStack spacing={1}>
                  <Icon as={FaTrophy} color="yellow.400" boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    #{userTribe.rank || 'N/A'}
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Icon as={FaUsers} color="blue.400" boxSize={5} />
                  <Text fontSize="md" color="gray.300">
                    {userTribe.score || 0} pts
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Top 3 Standings */}
          {standings && standings.length > 0 && (
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>Top 3 Tribes</Text>
              <VStack spacing={2}>
                {standings.slice(0, 3).map((standing, index) => (
                  <HStack key={standing.tribe.id} w="full" justify="space-between" p={2} bg="gray.700" borderRadius="md">
                    <HStack spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color={index === 0 ? 'yellow.400' : index === 1 ? 'gray.400' : 'orange.400'}>
                        #{standing.rank}
                      </Text>
                      <Text fontSize="sm" color="gray.300">{standing.tribe.emblem.icon}</Text>
                      <Text fontSize="sm" color="white">{standing.tribe.displayName}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.300">{standing.score} pts</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Rewards Preview */}
          <Box>
            <Text fontSize="sm" color="gray.400" mb={2}>Victory Rewards</Text>
            <HStack spacing={2} flexWrap="wrap">
              {war?.rewards && Object.entries(war.rewards).map(([key, value]) => {
                if (!value) return null;
                return (
                  <HStack key={key} spacing={1}>
                    <Icon as={FaCrown} color="yellow.400" boxSize={3} />
                    <Text fontSize="xs" color="gray.300">
                      {key === 'clanBadge' ? 'Warrior Badge' :
                       key === 'premiumStyles' ? `${value} Premium Styles` :
                       key === 'doubleXPDuration' ? `${value}h Double XP` :
                       key === 'crownIcon' ? 'Crown Icon' : value}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>
          </Box>

          {/* Contribute Button */}
          <Button
            colorScheme="red"
            size="lg"
            onClick={onContribute}
            leftIcon={<Icon as={FaFire} />}
          >
            Contribute to Victory
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

const PowerHourCard = ({ powerHour, onJoin }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const bgColor = 'gray.800';
  const borderColor = 'gray.600';

  useEffect(() => {
    if (powerHour) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const startTime = new Date(powerHour.event.startAt).getTime();
        const endTime = new Date(powerHour.event.endAt).getTime();
        
        if (now >= startTime && now <= endTime) {
          setIsActive(true);
          setTimeLeft(endTime - now);
        } else if (now < startTime) {
          setIsActive(false);
          setTimeLeft(startTime - now);
        } else {
          setIsActive(false);
          setTimeLeft(0);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [powerHour]);

  const formatTimeLeft = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!powerHour) return null;

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="lg">
      <CardHeader pb={2}>
        <Flex align="center" justify="space-between">
          <HStack>
            <Text fontSize="2xl">{powerHour.event.emoji}</Text>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {powerHour.event.title}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {powerHour.event.description}
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme={isActive ? 'green' : 'blue'} textTransform="capitalize">
            {isActive ? 'Active' : 'Upcoming'}
          </Badge>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Timer */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={2}>
              {isActive ? 'Time Remaining' : 'Starts In'}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color={isActive ? 'green.400' : 'blue.400'}>
              {formatTimeLeft(timeLeft)}
            </Text>
          </Box>

          {/* Multipliers */}
          <Box>
            <Text fontSize="sm" color="gray.400" mb={2}>Active Multipliers</Text>
            <HStack spacing={4} justify="center">
              <VStack spacing={1}>
                <Icon as={FaStar} color="yellow.400" boxSize={5} />
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {powerHour.multipliers.xp}x XP
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FaUsers} color="blue.400" boxSize={5} />
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {powerHour.multipliers.clanPoints}x CP
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Action Button */}
          <Button
            colorScheme={isActive ? 'green' : 'blue'}
            size="lg"
            onClick={onJoin}
            leftIcon={<Icon as={isActive ? FaBolt : FaClock} />}
            isDisabled={!isActive && timeLeft > 0}
          >
            {isActive ? 'Join Power Hour' : 'Power Hour Starting Soon'}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

const EventDashboard = () => {
  const {
    currentEvent,
    upcomingEvent,
    clanWarStandings,
    powerHourStatus,
    userTribeWar,
    eventStats,
    status,
    error,
    getCurrentEvent,
    getUpcomingEvent,
    getClanWarStandings,
    getPowerHourStatus,
    getTribeWarStatus,
    getEventStats,
  } = useEvent();

  useEffect(() => {
    getCurrentEvent();
    getUpcomingEvent();
    getClanWarStandings();
    getPowerHourStatus();
    getTribeWarStatus();
    getEventStats();
  }, [getCurrentEvent, getUpcomingEvent, getClanWarStandings, getPowerHourStatus, getTribeWarStatus, getEventStats]);

  const handleContribute = () => {
    // Navigate to activities that contribute to clan war
    window.location.href = '/transform';
  };

  const handleJoinPowerHour = () => {
    // Navigate to activities during power hour
    window.location.href = '/transform';
  };

  if (status === 'loading' && !currentEvent && !upcomingEvent) {
    return (
      <VStack py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4} color="gray.400">Loading events...</Text>
      </VStack>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error" mt={4}>
        Error loading events: {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="stretch" p={5} maxW="container.lg" mx="auto">
      <Text fontSize="3xl" fontWeight="extrabold" color="white" textAlign="center">
        Events & Clan Wars ⚔️
      </Text>

      {/* Event Stats */}
      {eventStats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text fontSize="sm" color="gray.400" mb={2}>Events Participated</Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.300">
              {eventStats.totalEventsParticipated || 0}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Total events joined</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text fontSize="sm" color="gray.400" mb={2}>Total Actions</Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.300">
              {eventStats.totalActions || 0}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Actions during events</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text fontSize="sm" color="gray.400" mb={2}>Clan Wars</Text>
            <Text fontSize="3xl" fontWeight="bold" color="red.300">
              {eventStats.clanWarsParticipated || 0}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Wars participated</Text>
          </Box>

          <Box p={5} shadow="md" border="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
            <Text fontSize="sm" color="gray.400" mb={2}>Power Hours</Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.300">
              {eventStats.powerHoursParticipated || 0}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Power hours joined</Text>
          </Box>
        </SimpleGrid>
      )}

      {/* Current Clan War */}
      {currentEvent && currentEvent.type === 'clan_war' && (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            Current Clan War
          </Text>
          <ClanWarCard
            war={currentEvent}
            standings={clanWarStandings}
            userTribe={userTribeWar?.tribe}
            onContribute={handleContribute}
          />
        </Box>
      )}

      {/* Power Hour */}
      {powerHourStatus && (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            Power Hour
          </Text>
          <PowerHourCard
            powerHour={powerHourStatus}
            onJoin={handleJoinPowerHour}
          />
        </Box>
      )}

      {/* Upcoming Event */}
      {upcomingEvent && (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            Upcoming Event
          </Text>
          <Card bg="gray.800" borderColor="gray.600" shadow="lg">
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack>
                  <Text fontSize="2xl">{upcomingEvent.emoji}</Text>
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {upcomingEvent.title}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {upcomingEvent.description}
                    </Text>
                  </Box>
                </HStack>
                <Text fontSize="sm" color="gray.300">
                  Starts: {new Date(upcomingEvent.startAt).toLocaleString()}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      )}
    </VStack>
  );
};

export default EventDashboard;
