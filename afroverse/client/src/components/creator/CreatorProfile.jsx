import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Avatar, Badge, Spinner, Alert,
  Flex, IconButton, Tooltip,
  Textarea, Image,
  SimpleGrid, Card, CardBody, CardHeader,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Heading,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { FaHeart, FaShare, FaComments, FaShieldAlt, FaTrophy, FaUsers, FaEye, FaFire } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  selectCurrentProfile,
  selectProfileLoading,
  selectProfileError,
  selectProfileFeed,
  selectFeedLoading,
  selectFeedHasMore,
  selectFeedNextCursor,
  selectFollowers,
  selectFollowersLoading,
  selectFollowing,
  selectFollowingLoading,
  selectCreatorStats,
  selectStatsLoading,
  getCreatorProfile,
  getCreatorFeed,
  followCreator,
  unfollowCreator,
  getFollowers,
  getFollowing,
  getCreatorStats,
  updateCreatorProfile,
  clearError,
} from '../../store/slices/creatorSlice';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';

const CreatorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editBio, setEditBio] = useState('');

  // Redux selectors
  const profile = useSelector(selectCurrentProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const profileError = useSelector(selectProfileError);
  const profileFeed = useSelector(selectProfileFeed);
  const feedLoading = useSelector(selectFeedLoading);
  const feedHasMore = useSelector(selectFeedHasMore);
  const feedNextCursor = useSelector(selectFeedNextCursor);
  const followers = useSelector(selectFollowers);
  const followersLoading = useSelector(selectFollowersLoading);
  const following = useSelector(selectFollowing);
  const followingLoading = useSelector(selectFollowingLoading);
  const creatorStats = useSelector(selectCreatorStats);
  const statsLoading = useSelector(selectStatsLoading);

  // Load profile data
  useEffect(() => {
    if (username) {
      dispatch(getCreatorProfile(username));
      dispatch(getCreatorStats(username));
    }
  }, [username, dispatch]);

  // Load feed data
  useEffect(() => {
    if (profile && activeTab === 0) {
      dispatch(getCreatorFeed({ username, limit: 20 }));
    }
  }, [profile, activeTab, username, dispatch]);

  // Load followers/following data
  useEffect(() => {
    if (profile && activeTab === 1) {
      dispatch(getFollowers({ userId: profile._id, limit: 20 }));
    } else if (profile && activeTab === 2) {
      dispatch(getFollowing({ userId: profile._id, limit: 20 }));
    }
  }, [profile, activeTab, dispatch]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowing) {
        await dispatch(unfollowCreator(profile._id)).unwrap();
        toast({
          title: 'Unfollowed',
          description: `You unfollowed ${profile.displayName}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await dispatch(followCreator(profile._id)).unwrap();
        toast({
          title: 'Following',
          description: `You're now following ${profile.displayName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to update follow status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle edit profile
  const handleEditProfile = async () => {
    try {
      await dispatch(updateCreatorProfile({ bio: editBio })).unwrap();
      onEditClose();
      toast({
        title: 'Profile Updated',
        description: 'Your bio has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle share profile
  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} - Afroverse Creator`,
          text: `Check out ${profile.displayName}'s amazing transformations on Afroverse!`,
          url: `${window.location.origin}/profile/${profile.username}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`);
      toast({
        title: 'Link Copied',
        description: 'Profile link copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle challenge creator
  const handleChallengeCreator = () => {
    navigate('/battles/create', { state: { challengeTarget: profile.username } });
  };

  // Handle message creator
  const handleMessageCreator = () => {
    navigate('/chat', { state: { startDmWith: profile._id } });
  };

  // Render rank badge
  const renderRankBadge = (rankTier) => {
    const badgeProps = {
      legend: { colorScheme: 'purple', icon: FaFire },
      gold: { colorScheme: 'yellow', icon: FaTrophy },
      silver: { colorScheme: 'gray', icon: FaTrophy },
      bronze: { colorScheme: 'orange', icon: FaTrophy },
      rising: { colorScheme: 'green', icon: FaFire },
      unranked: { colorScheme: 'gray', icon: FaUsers },
    };

    const props = badgeProps[rankTier] || badgeProps.unranked;
    return (
      <Badge {...props} size="lg" borderRadius="full" px={3} py={1}>
        <HStack spacing={1}>
          <props.icon />
          <Text textTransform="capitalize">{rankTier}</Text>
        </HStack>
      </Badge>
    );
  };

  // Render feed item
  const renderFeedItem = (item) => {
    if (item.type === 'battle') {
      const battle = item.data;
      return (
        <Card key={item._id} mb={4}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                Battle • {moment(item.createdAt).fromNow()}
              </Text>
              <Badge colorScheme={battle.winnerId === profile._id ? 'green' : 'red'}>
                {battle.winnerId === profile._id ? 'Won' : 'Lost'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <VStack>
                <Avatar src={battle.challengerId.avatar} size="md" />
                <Text fontSize="sm" fontWeight="bold">{battle.challengerId.displayName}</Text>
              </VStack>
              <Text fontSize="2xl" color="gray.400">VS</Text>
              <VStack>
                <Avatar src={battle.defenderId.avatar} size="md" />
                <Text fontSize="sm" fontWeight="bold">{battle.defenderId.displayName}</Text>
              </VStack>
            </HStack>
            <Text mt={4} fontSize="sm" color="gray.600">
              {battle.totalVotes} votes • {battle.challengerVotes} - {battle.defenderVotes}
            </Text>
          </CardBody>
        </Card>
      );
    } else if (item.type === 'transformation') {
      const transform = item.data;
      return (
        <Card key={item._id} mb={4}>
          <CardBody>
            <Image
              src={transform.imageUrl}
              alt="Transformation"
              borderRadius="lg"
              mb={3}
              maxH="300px"
              objectFit="cover"
            />
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {transform.style} • {moment(item.createdAt).fromNow()}
              </Text>
              <HStack spacing={2}>
                <HStack spacing={1}>
                  <FaEye />
                  <Text fontSize="sm">{transform.views || 0}</Text>
                </HStack>
                <HStack spacing={1}>
                  <FaShare />
                  <Text fontSize="sm">{transform.shares || 0}</Text>
                </HStack>
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      );
    }
    return null;
  };

  // Render follower/following item
  const renderUserItem = (user) => (
    <HStack key={user._id} p={3} bg="gray.800" borderRadius="md" mb={2}>
      <Avatar src={user.avatar} size="sm" />
      <VStack align="start" flex="1">
        <Text fontWeight="bold" color="white">{user.displayName}</Text>
        <Text fontSize="sm" color="gray.400">@{user.username}</Text>
        <Text fontSize="xs" color="gray.500">
          {user.followersCount} followers
        </Text>
      </VStack>
      <Button
        size="sm"
        variant="outline"
        colorScheme="orange"
        onClick={() => navigate(`/profile/${user.username}`)}
      >
        View Profile
      </Button>
    </HStack>
  );

  if (profileLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="orange.500" />
      </Flex>
    );
  }

  if (profileError) {
    return (
      <Alert status="error" borderRadius="lg">
        
        Error loading profile: {profileError}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert status="info" borderRadius="lg">
        
        Profile not found
      </Alert>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profile._id;

  return (
    <Box minH="100vh" bg="gray.900">
      {/* Banner */}
      <Box
        h="200px"
        bg={profile.bannerUrl ? `url(${profile.bannerUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
        bgSize="cover"
        bgPos="center"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
        />
      </Box>

      {/* Profile Content */}
      <Box maxW="4xl" mx="auto" px={4} pb={8}>
        {/* Profile Header */}
        <Box position="relative" mt="-75px" mb={8}>
          <HStack spacing={6} align="end">
            <Avatar
              src={profile.avatar}
              size="2xl"
              border="4px solid"
              borderColor="gray.900"
              bg="gray.700"
            />
            <VStack align="start" flex="1">
              <HStack spacing={3} mb={2}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {profile.displayName}
                </Text>
                {renderRankBadge(profile.rankTier)}
                {profile.tribe && (
                  <Badge colorScheme="purple" variant="solid">
                    {profile.tribe.displayName}
                  </Badge>
                )}
              </HStack>
              
              <Text color="gray.300" mb={4} maxW="md">
                {profile.bio || 'No bio yet'}
              </Text>

              {/* Stats */}
              <HStack spacing={6} mb={4}>
                <Stat>
                  <StatLabel color="gray.400">Followers</StatLabel>
                  <StatNumber color="white">{profile.followersCount.toLocaleString()}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Following</StatLabel>
                  <StatNumber color="white">{profile.followingCount.toLocaleString()}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Profile Views</StatLabel>
                  <StatNumber color="white">{profile.profileViews.toLocaleString()}</StatNumber>
                </Stat>
              </HStack>
            </VStack>

            {/* Action Buttons */}
            <VStack spacing={2}>
              {!isOwnProfile && (
                <>
                  <Button
                    colorScheme={profile.isFollowing ? 'gray' : 'orange'}
                    variant={profile.isFollowing ? 'outline' : 'solid'}
                    onClick={handleFollowToggle}
                    size="lg"
                    leftIcon={<FaHeart />}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<FaShieldAlt />}
                      onClick={handleChallengeCreator}
                    >
                      Challenge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                      leftIcon={<FaComments />}
                      onClick={handleMessageCreator}
                    >
                      Message
                    </Button>
                  </HStack>
                </>
              )}
              
              <IconButton
                icon={<FaShare />}
                variant="outline"
                colorScheme="gray"
                onClick={handleShareProfile}
                aria-label="Share profile"
              />
            </VStack>
          </HStack>
        </Box>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="orange">
          <TabList>
            <Tab>Content</Tab>
            <Tab>Followers ({profile.followersCount})</Tab>
            <Tab>Following ({profile.followingCount})</Tab>
            <Tab>Stats</Tab>
          </TabList>

          <TabPanels>
            {/* Content Tab */}
            <TabPanel px={0}>
              {feedLoading && profileFeed.length === 0 ? (
                <Flex justify="center" py={8}>
                  <Spinner color="orange.500" />
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch">
                  {profileFeed.map(renderFeedItem)}
                  {feedHasMore && (
                    <Button
                      variant="outline"
                      colorScheme="orange"
                      onClick={() => dispatch(getCreatorFeed({ username, cursor: feedNextCursor }))}
                      isLoading={feedLoading}
                      mt={4}
                    >
                      Load More
                    </Button>
                  )}
                </VStack>
              )}
            </TabPanel>

            {/* Followers Tab */}
            <TabPanel px={0}>
              {followersLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner color="orange.500" />
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch">
                  {followers.map(renderUserItem)}
                </VStack>
              )}
            </TabPanel>

            {/* Following Tab */}
            <TabPanel px={0}>
              {followingLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner color="orange.500" />
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch">
                  {following.map(renderUserItem)}
                </VStack>
              )}
            </TabPanel>

            {/* Stats Tab */}
            <TabPanel px={0}>
              {statsLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner color="orange.500" />
                </Flex>
              ) : creatorStats ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Battle Stats</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Stat>
                          <StatLabel>Total Battles</StatLabel>
                          <StatNumber>{creatorStats.totalBattles}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Battles Won</StatLabel>
                          <StatNumber color="green.400">{creatorStats.battleWins}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Win Rate</StatLabel>
                          <StatNumber>{creatorStats.winRate}%</StatNumber>
                          <StatHelpText>
                            <StatArrow type="increase" />
                            {creatorStats.winRate > 50 ? 'Above average' : 'Below average'}
                          </StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Total Votes</StatLabel>
                          <StatNumber>{creatorStats.totalVotes}</StatNumber>
                        </Stat>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="md">Content Stats</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Stat>
                          <StatLabel>Transformations</StatLabel>
                          <StatNumber>{creatorStats.totalTransformations}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Total Views</StatLabel>
                          <StatNumber color="blue.400">{creatorStats.totalViews}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Total Shares</StatLabel>
                          <StatNumber color="purple.400">{creatorStats.totalShares}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Creator Score</StatLabel>
                          <StatNumber color="orange.400">{Math.round(profile.creatorScore)}</StatNumber>
                        </Stat>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              ) : (
                <Text color="gray.400">No stats available</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Textarea
                placeholder="Tell us about yourself..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={160}
                rows={4}
              />
              <Text fontSize="sm" color="gray.500" align="self">
                {editBio.length}/160 characters
              </Text>
              <Button
                colorScheme="orange"
                onClick={handleEditProfile}
                isDisabled={editBio === profile.bio}
              >
                Save Changes
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreatorProfile;
