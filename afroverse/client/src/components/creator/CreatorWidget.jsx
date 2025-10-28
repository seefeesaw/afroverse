import React, { useEffect } from 'react';
import { Box, Flex, Text, Icon, Spinner, Button, Badge, Avatar, HStack, VStack } from '@chakra-ui/react';
import { FaStar, FaFire, FaTrophy, FaUsers, FaArrowRight } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectTopCreators, selectTopCreatorsLoading, getTopCreators } from '../../store/slices/creatorSlice';

const CreatorWidget = ({ onViewCreators }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const topCreators = useSelector(selectTopCreators);
  const topCreatorsLoading = useSelector(selectTopCreatorsLoading);

  // Load top creators
  useEffect(() => {
    if (topCreators.length === 0) {
      dispatch(getTopCreators({ limit: 3 }));
    }
  }, [dispatch, topCreators.length]);

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
          <props.icon size="8px" />
          <Text textTransform="capitalize" fontSize="xs">{rankTier}</Text>
        </HStack>
      </Badge>
    );
  };

  // Handle creator click
  const handleCreatorClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <Box
      p={4}
      bg="gray.800"
      borderRadius="lg"
      shadow="lg"
      border="1px solid"
      borderColor="gray.700"
    >
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center">
          <Icon as={FaStar} w={6} h={6} color="yellow.400" mr={2} />
          <Text fontSize="lg" fontWeight="bold" color="white">
            Top Creators
          </Text>
        </Flex>
        <Button
          size="sm"
          colorScheme="yellow"
          variant="outline"
          onClick={onViewCreators}
        >
          View All
        </Button>
      </Flex>

      {topCreatorsLoading ? (
        <Flex justify="center" py={4}>
          <Spinner color="yellow.500" />
        </Flex>
      ) : topCreators.length === 0 ? (
        <VStack spacing={3} py={4}>
          <Text color="gray.400" textAlign="center">
            No creators yet
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Be the first to create amazing transformations!
          </Text>
        </VStack>
      ) : (
        <VStack spacing={3} align="stretch">
          {topCreators.slice(0, 3).map((creator, index) => (
            <Box
              key={creator._id}
              p={3}
              bg="gray.700"
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: 'gray.600' }}
              onClick={() => handleCreatorClick(creator.username)}
            >
              <HStack spacing={3}>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="yellow.400"
                  minW="20px"
                >
                  {index + 1}
                </Text>
                <Avatar
                  src={creator.avatar}
                  size="sm"
                  border="2px solid"
                  borderColor={creator.rankTier === 'legend' ? 'purple.500' : 'gray.600'}
                />
                <VStack align="start" flex="1" spacing={0}>
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="white">
                      {creator.displayName}
                    </Text>
                    {renderRankBadge(creator.rankTier)}
                  </HStack>
                  <Text fontSize="xs" color="gray.400">@{creator.username}</Text>
                  <HStack spacing={2}>
                    <Text fontSize="xs" color="gray.500">
                      {creator.followersCount.toLocaleString()} followers
                    </Text>
                    {creator.tribe && (
                      <Badge colorScheme="purple" size="xs">
                        {creator.tribe.displayName}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
                <Icon as={FaArrowRight} color="gray.400" />
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      <Button
        size="sm"
        colorScheme="yellow"
        width="full"
        rightIcon={<FaArrowRight />}
        onClick={onViewCreators}
        mt={3}
      >
        Discover More Creators
      </Button>
    </Box>
  );
};

export default CreatorWidget;
