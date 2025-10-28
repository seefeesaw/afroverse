import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Avatar, Badge, Spinner, Alert,
  Flex, IconButton, Tooltip, SimpleGrid, Card, CardBody, CardHeader,
  Heading, Input, Select, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { FaSearch, FaHeart, FaFire, FaTrophy, FaUsers, FaEye } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectTopCreators,
  selectTopCreatorsLoading,
  selectTopCreatorsError,
  selectTopCreatorsHasMore,
  selectTopCreatorsNextCursor,
  getTopCreators,
  followCreator,
  unfollowCreator,
  clearError,
} from '../../store/slices/creatorSlice';
import { selectUser } from '../../store/slices/authSlice';
import moment from 'moment';

const CreatorDiscovery = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

  // Redux selectors
  const topCreators = useSelector(selectTopCreators);
  const topCreatorsLoading = useSelector(selectTopCreatorsLoading);
  const topCreatorsError = useSelector(selectTopCreatorsError);
  const topCreatorsHasMore = useSelector(selectTopCreatorsHasMore);
  const topCreatorsNextCursor = useSelector(selectTopCreatorsNextCursor);
  const currentUser = useSelector(selectUser);

  // Load initial creators
  useEffect(() => {
    dispatch(getTopCreators({ limit: 20 }));
  }, [dispatch]);

  // Handle follow/unfollow
  const handleFollowToggle = async (creator) => {
    try {
      if (creator.isFollowing) {
        await dispatch(unfollowCreator(creator._id)).unwrap();
        toast({
          title: 'Unfollowed',
          description: `You unfollowed ${creator.displayName}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await dispatch(followCreator(creator._id)).unwrap();
        toast({
          title: 'Following',
          description: `You're now following ${creator.displayName}`,
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

  // Handle search
  const handleSearch = () => {
    // This would typically filter the creators list
    // For now, we'll just log the search term
    console.log('Searching for:', searchTerm);
  };

  // Handle filter change
  const handleFilterChange = () => {
    dispatch(getTopCreators({ 
      limit: 20, 
      tribeId: selectedTribe || null 
    }));
    onFilterClose();
  };

  // Load more creators
  const loadMoreCreators = () => {
    if (topCreatorsHasMore && topCreatorsNextCursor) {
      dispatch(getTopCreators({ 
        cursor: topCreatorsNextCursor, 
        limit: 20,
        tribeId: selectedTribe || null 
      }));
    }
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
      <Badge {...props} size="sm" borderRadius="full" px={2} py={1}>
        <HStack spacing={1}>
          <props.icon size="10px" />
          <Text textTransform="capitalize" fontSize="xs">{rankTier}</Text>
        </HStack>
      </Badge>
    );
  };

  // Render creator card
  const renderCreatorCard = (creator) => {
    const isOwnProfile = currentUser && currentUser._id === creator._id;
    
    return (
      <Card key={creator._id} bg="gray.800" border="1px" borderColor="gray.700" _hover={{ borderColor: 'orange.500' }}>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {/* Creator Info */}
            <HStack spacing={3}>
              <Avatar
                src={creator.avatar}
                size="md"
                border="2px solid"
                borderColor={creator.rankTier === 'legend' ? 'purple.500' : 'gray.600'}
              />
              <VStack align="start" flex="1">
                <HStack spacing={2}>
                  <Text fontWeight="bold" color="white" fontSize="md">
                    {creator.displayName}
                  </Text>
                  {renderRankBadge(creator.rankTier)}
                </HStack>
                <Text fontSize="sm" color="gray.400">@{creator.username}</Text>
                {creator.tribe && (
                  <Badge colorScheme="purple" size="sm">
                    {creator.tribe.displayName}
                  </Badge>
                )}
              </VStack>
            </HStack>

            {/* Bio */}
            {creator.bio && (
              <Text fontSize="sm" color="gray.300" noOfLines={2}>
                {creator.bio}
              </Text>
            )}

            {/* Stats */}
            <HStack justify="space-between" fontSize="sm">
              <HStack spacing={4}>
                <HStack spacing={1}>
                  <FaUsers color="gray.400" />
                  <Text color="gray.400">{creator.followersCount.toLocaleString()}</Text>
                </HStack>
                <HStack spacing={1}>
                  <FaEye color="gray.400" />
                  <Text color="gray.400">{Math.round(creator.creatorScore)}</Text>
                </HStack>
              </HStack>
              <Text color="gray.500" fontSize="xs">
                Joined {moment(creator.createdAt).format('MMM YYYY')}
              </Text>
            </HStack>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme={creator.isFollowing ? 'gray' : 'orange'}
                  variant={creator.isFollowing ? 'outline' : 'solid'}
                  onClick={() => handleFollowToggle(creator)}
                  leftIcon={<FaHeart />}
                  flex="1"
                >
                  {creator.isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => navigate(`/profile/${creator.username}`)}
                >
                  View Profile
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (topCreatorsError) {
    return (
      <Alert status="error" borderRadius="lg">
        
        Error loading creators: {topCreatorsError}
      </Alert>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900" p={4}>
      <Box maxW="6xl" mx="auto">
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <Heading size="xl" color="white" textAlign="center">
            Discover Creators
          </Heading>
          <Text color="gray.400" textAlign="center" maxW="2xl">
            Find amazing creators, follow your favorites, and discover the best transformations and battles on Afroverse
          </Text>

          {/* Search and Filters */}
          <HStack spacing={4} w="100%" maxW="md">
            <Input
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FaSearch />}
              bg="gray.800"
              border="none"
              _focus={{ borderColor: 'orange.500' }}
            />
            <Button
              variant="outline"
              colorScheme="orange"
              onClick={onFilterOpen}
            >
              Filters
            </Button>
          </HStack>
        </VStack>

        {/* Creators Grid */}
        {topCreatorsLoading && topCreators.length === 0 ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="orange.500" />
          </Flex>
        ) : (
          <VStack spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
              {topCreators.map(renderCreatorCard)}
            </SimpleGrid>

            {/* Load More Button */}
            {topCreatorsHasMore && (
              <Button
                variant="outline"
                colorScheme="orange"
                onClick={loadMoreCreators}
                isLoading={topCreatorsLoading}
                size="lg"
              >
                Load More Creators
              </Button>
            )}

            {topCreators.length === 0 && !topCreatorsLoading && (
              <VStack py={12} spacing={4}>
                <Text color="gray.400" textAlign="center">
                  No creators found
                </Text>
                <Text color="gray.500" textAlign="center" fontSize="sm">
                  Try adjusting your search or filters
                </Text>
              </VStack>
            )}
          </VStack>
        )}
      </Box>

      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter Creators</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="100%">
                <Text mb={2} fontWeight="semibold">Sort By</Text>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  bg="gray.100"
                >
                  <option value="followers">Most Followers</option>
                  <option value="score">Creator Score</option>
                  <option value="recent">Recently Joined</option>
                  <option value="rank">Rank Tier</option>
                </Select>
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="semibold">Tribe</Text>
                <Select
                  value={selectedTribe}
                  onChange={(e) => setSelectedTribe(e.target.value)}
                  bg="gray.100"
                >
                  <option value="">All Tribes</option>
                  <option value="tribe1">Zulu Warriors</option>
                  <option value="tribe2">Yoruba Kings</option>
                  <option value="tribe3">Hausa Legends</option>
                  <option value="tribe4">Igbo Masters</option>
                </Select>
              </Box>

              <Divider />

              <HStack spacing={3} w="100%">
                <Button
                  variant="outline"
                  onClick={onFilterClose}
                  flex="1"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="orange"
                  onClick={handleFilterChange}
                  flex="1"
                >
                  Apply Filters
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreatorDiscovery;
