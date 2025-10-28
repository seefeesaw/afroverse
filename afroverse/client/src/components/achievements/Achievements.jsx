import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Spinner, Alert,
  Flex, IconButton, Tooltip, SimpleGrid, Card, CardBody, CardHeader,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Progress, Image,
  Circle, Icon, useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import { FaTrophy, FaLock, FaGift, FaShare, FaFire, FaStar, FaCrown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import {
  selectUserAchievements,
  selectUserStats,
  selectUserAchievementsLoading,
  selectUserAchievementsError,
  selectLeaderboard,
  selectLeaderboardLoading,
  selectRecentlyUnlocked,
  getUserAchievements,
  claimReward,
  getLeaderboard,
  addRecentlyUnlocked,
  clearRecentlyUnlocked,
  markRewardClaimed,
} from '../../store/slices/achievementSlice';

const Achievements = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const [shareAchievement, setShareAchievement] = useState(null);

  // Redux selectors
  const userAchievements = useSelector(selectUserAchievements);
  const userStats = useSelector(selectUserStats);
  const userAchievementsLoading = useSelector(selectUserAchievementsLoading);
  const userAchievementsError = useSelector(selectUserAchievementsError);
  const leaderboard = useSelector(selectLeaderboard);
  const leaderboardLoading = useSelector(selectLeaderboardLoading);
  const recentlyUnlocked = useSelector(selectRecentlyUnlocked);

  // Load user achievements
  useEffect(() => {
    dispatch(getUserAchievements());
  }, [dispatch]);

  // Load leaderboard
  useEffect(() => {
    if (activeTab === 2) {
      dispatch(getLeaderboard(10));
    }
  }, [dispatch, activeTab]);

  // Handle reward claim
  const handleClaimReward = async (achievementId) => {
    try {
      await dispatch(claimReward(achievementId)).unwrap();
      dispatch(markRewardClaimed({ achievementId }));
      toast({
        title: 'Reward Claimed!',
        description: 'Your reward has been added to your account',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to claim reward',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle share achievement
  const handleShareAchievement = (achievement) => {
    setShareAchievement(achievement);
    onShareOpen();
  };

  // Handle share
  const handleShare = async () => {
    if (!shareAchievement) return;

    const shareText = `I just unlocked the "${shareAchievement.name}" achievement on Afroverse! 🏆`;
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
    onShareClose();
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

  // Filter achievements by category
  const filteredAchievements = userAchievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  // Get categories from achievements
  const categories = ['all', ...new Set(userAchievements.map(a => a.category))];

  // Render achievement card
  const renderAchievementCard = (achievement) => {
    const rarityProps = getRarityProps(achievement.rarity);
    const isUnlocked = achievement.isUnlocked;
    const hasReward = achievement.reward && !achievement.rewardClaimed;

    return (
      <Card
        key={achievement._id}
        bg={isUnlocked ? 'gray.800' : 'gray.900'}
        border="1px solid"
        borderColor={isUnlocked ? 'gray.600' : 'gray.700'}
        opacity={isUnlocked ? 1 : 0.6}
        _hover={{ borderColor: isUnlocked ? 'orange.500' : 'gray.600' }}
        transition="all 0.2s"
      >
        <CardBody>
          <VStack spacing={3} align="stretch">
            {/* Achievement Header */}
            <HStack justify="space-between" align="start">
              <HStack spacing={3}>
                <Circle
                  size="50px"
                  bg={isUnlocked ? rarityProps.bg : 'gray.700'}
                  color={isUnlocked ? rarityProps.color : 'gray.500'}
                  border="2px solid"
                  borderColor={isUnlocked ? rarityProps.color : 'gray.600'}
                >
                  <Text fontSize="xl">
                    {isUnlocked ? achievement.icon : <Icon as={FaLock} />}
                  </Text>
                </Circle>
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="bold"
                    color={isUnlocked ? 'white' : 'gray.400'}
                    fontSize="md"
                  >
                    {achievement.name}
                  </Text>
                  <Badge
                    colorScheme={achievement.rarity}
                    size="sm"
                    textTransform="capitalize"
                  >
                    {achievement.rarity}
                  </Badge>
                </VStack>
              </HStack>
              
              {isUnlocked && (
                <HStack spacing={2}>
                  {hasReward && (
                    <Tooltip label="Claim Reward">
                      <IconButton
                        icon={<FaGift />}
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                        onClick={() => handleClaimReward(achievement._id)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip label="Share Achievement">
                    <IconButton
                      icon={<FaShare />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleShareAchievement(achievement)}
                    />
                  </Tooltip>
                </HStack>
              )}
            </HStack>

            {/* Description */}
            <Text
              fontSize="sm"
              color={isUnlocked ? 'gray.300' : 'gray.500'}
              noOfLines={2}
            >
              {achievement.description}
            </Text>

            {/* Progress */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.400">
                  Progress
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {achievement.progress} / {achievement.target}
                </Text>
              </HStack>
              <Progress
                value={achievement.progressPercentage}
                colorScheme={isUnlocked ? 'orange' : 'gray'}
                size="sm"
                borderRadius="full"
              />
            </VStack>

            {/* Reward */}
            {achievement.reward && (
              <Box
                p={2}
                bg={isUnlocked ? 'green.900' : 'gray.800'}
                borderRadius="md"
                border="1px solid"
                borderColor={isUnlocked ? 'green.600' : 'gray.600'}
              >
                <HStack spacing={2}>
                  <Icon as={FaGift} color={isUnlocked ? 'green.400' : 'gray.500'} />
                  <Text fontSize="xs" color={isUnlocked ? 'green.300' : 'gray.500'}>
                    {achievement.reward.description}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* XP Reward */}
            {achievement.xpReward > 0 && (
              <HStack spacing={2}>
                <Icon as={FaStar} color="yellow.400" />
                <Text fontSize="xs" color="yellow.300">
                  +{achievement.xpReward} XP
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Render leaderboard item
  const renderLeaderboardItem = (user, index) => (
    <HStack key={user.username} p={3} bg="gray.800" borderRadius="md" mb={2}>
      <Text
        fontSize="lg"
        fontWeight="bold"
        color="yellow.400"
        minW="30px"
      >
        {index + 1}
      </Text>
      <Circle size="40px" bg="gray.700">
        <Text fontSize="sm" color="white">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.displayName} borderRadius="full" />
          ) : (
            user.displayName.charAt(0).toUpperCase()
          )}
        </Text>
      </Circle>
      <VStack align="start" flex="1" spacing={0}>
        <Text fontWeight="bold" color="white" fontSize="sm">
          {user.displayName}
        </Text>
        <Text fontSize="xs" color="gray.400">@{user.username}</Text>
        <Text fontSize="xs" color="gray.500">
          {user.achievementsUnlocked} achievements
        </Text>
      </VStack>
      <VStack align="end" spacing={0}>
        <Text fontSize="sm" fontWeight="bold" color="yellow.400">
          {user.totalXp.toLocaleString()}
        </Text>
        <Text fontSize="xs" color="gray.400">XP</Text>
      </VStack>
    </HStack>
  );

  if (userAchievementsLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="orange.500" />
      </Flex>
    );
  }

  if (userAchievementsError) {
    return (
      <Alert status="error" borderRadius="lg">
        
        Error loading achievements: {userAchievementsError}
      </Alert>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900" p={4}>
      <Box maxW="6xl" mx="auto">
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <Heading size="xl" color="white" textAlign="center">
            Achievements
          </Heading>
          <Text color="gray.400" textAlign="center" maxW="2xl">
            Unlock badges, earn rewards, and climb the leaderboard by completing challenges
          </Text>
        </VStack>

        {/* Stats Summary */}
        {userStats && (
          <Card mb={8} bg="gray.800" border="1px solid" borderColor="gray.700">
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <Stat textAlign="center">
                  <StatLabel color="gray.400">Unlocked</StatLabel>
                  <StatNumber color="orange.400" fontSize="2xl">
                    {userStats.unlockedCount}
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    of {userStats.totalCount}
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel color="gray.400">Total XP</StatLabel>
                  <StatNumber color="yellow.400" fontSize="2xl">
                    {userStats.totalXp.toLocaleString()}
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    from achievements
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel color="gray.400">Legendary</StatLabel>
                  <StatNumber color="purple.400" fontSize="2xl">
                    {userStats.rarityBreakdown.legendary.unlocked}
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    rare badges
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel color="gray.400">Completion</StatLabel>
                  <StatNumber color="green.400" fontSize="2xl">
                    {Math.round((userStats.unlockedCount / userStats.totalCount) * 100)}%
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    complete
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="orange">
          <TabList>
            <Tab>My Achievements</Tab>
            <Tab>Rarity Breakdown</Tab>
            <Tab>Leaderboard</Tab>
          </TabList>

          <TabPanels>
            {/* My Achievements Tab */}
            <TabPanel px={0}>
              {/* Category Filter */}
              <HStack spacing={2} mb={6} flexWrap="wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'solid' : 'outline'}
                    colorScheme="orange"
                    onClick={() => setSelectedCategory(category)}
                    textTransform="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </HStack>

              {/* Achievements Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredAchievements.map(renderAchievementCard)}
              </SimpleGrid>
            </TabPanel>

            {/* Rarity Breakdown Tab */}
            <TabPanel px={0}>
              {userStats && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  {Object.entries(userStats.rarityBreakdown).map(([rarity, data]) => {
                    const rarityProps = getRarityProps(rarity);
                    const percentage = data.total > 0 ? Math.round((data.unlocked / data.total) * 100) : 0;
                    
                    return (
                      <Card key={rarity} bg="gray.800" border="1px solid" borderColor="gray.700">
                        <CardBody textAlign="center">
                          <VStack spacing={4}>
                            <Circle size="60px" bg={rarityProps.bg} color={rarityProps.color}>
                              <Icon as={rarityProps.icon} boxSize={6} />
                            </Circle>
                            <VStack spacing={1}>
                              <Text fontWeight="bold" color="white" textTransform="capitalize">
                                {rarity}
                              </Text>
                              <Text fontSize="sm" color="gray.400">
                                {data.unlocked} / {data.total}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {percentage}% complete
                              </Text>
                            </VStack>
                            <Progress
                              value={percentage}
                              colorScheme={rarity}
                              size="sm"
                              width="100%"
                              borderRadius="full"
                            />
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Leaderboard Tab */}
            <TabPanel px={0}>
              {leaderboardLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner color="orange.500" />
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch">
                  {leaderboard.map(renderLeaderboardItem)}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Achievement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {shareAchievement && (
              <VStack spacing={4}>
                <Circle size="80px" bg="orange.100" color="orange.500">
                  <Text fontSize="3xl">{shareAchievement.icon}</Text>
                </Circle>
                <VStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    {shareAchievement.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {shareAchievement.description}
                  </Text>
                  <Badge colorScheme={shareAchievement.rarity} textTransform="capitalize">
                    {shareAchievement.rarity}
                  </Badge>
                </VStack>
                <Button colorScheme="orange" onClick={handleShare} width="full">
                  Share Achievement
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Achievements;
