import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Badge,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Flex,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from '@chakra-ui/react';
import { FaTrophy, FaUsers, FaGift, FaFire, FaShare, FaCopy, FaWhatsapp, FaInstagram, FaTwitter, FaFacebook, FaCrown, FaMedal, FaStar } from 'react-icons/fa';
import { useReferral } from '../../hooks/useReferral';
import { useSelector } from 'react-redux';
import { useClipboard } from '@chakra-ui/react';

const RewardTierCard = ({ tier, currentCount, isUnlocked, isClaimed }) => {
  const getTierIcon = (tierNumber) => {
    if (tierNumber >= 25) return FaCrown;
    if (tierNumber >= 10) return FaMedal;
    if (tierNumber >= 5) return FaStar;
    return FaGift;
  };

  const getTierColor = (tierNumber) => {
    if (tierNumber >= 25) return 'purple';
    if (tierNumber >= 10) return 'gold';
    if (tierNumber >= 5) return 'orange';
    return 'green';
  };

  return (
    <Card
      bg={isUnlocked ? 'green.900' : 'gray.800'}
      borderColor={isUnlocked ? 'green.400' : 'gray.600'}
      borderWidth="2px"
      borderRadius="lg"
      p={4}
      position="relative"
    >
      {isClaimed && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="green"
          fontSize="xs"
        >
          CLAIMED
        </Badge>
      )}
      
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Icon 
            as={getTierIcon(tier.threshold)} 
            color={`${getTierColor(tier.threshold)}.400`}
            boxSize={6}
          />
          <Badge colorScheme={getTierColor(tier.threshold)} fontSize="xs">
            {tier.threshold} Referrals
          </Badge>
        </HStack>
        
        <Text fontWeight="bold" fontSize="sm" color="white">
          {tier.message}
        </Text>
        
        <VStack spacing={1} align="stretch">
          {tier.xp > 0 && (
            <HStack>
              <Text fontSize="xs" color="gray.400">XP:</Text>
              <Text fontSize="xs" color="yellow.300">+{tier.xp}</Text>
            </HStack>
          )}
          {tier.coins > 0 && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Coins:</Text>
              <Text fontSize="xs" color="yellow.300">+{tier.coins}</Text>
            </HStack>
          )}
          {tier.transformCredits > 0 && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Transforms:</Text>
              <Text fontSize="xs" color="green.300">+{tier.transformCredits}</Text>
            </HStack>
          )}
          {tier.premiumStyle && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Premium Style:</Text>
              <Text fontSize="xs" color="purple.300">24h Unlock</Text>
            </HStack>
          )}
          {tier.badge && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Badge:</Text>
              <Text fontSize="xs" color="blue.300">Rare Badge</Text>
            </HStack>
          )}
          {tier.warriorPassWeek && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Warrior Pass:</Text>
              <Text fontSize="xs" color="gold.300">Free Week</Text>
            </HStack>
          )}
          {tier.captainEligibility && (
            <HStack>
              <Text fontSize="xs" color="gray.400">Rank:</Text>
              <Text fontSize="xs" color="purple.300">Captain Eligible</Text>
            </HStack>
          )}
        </VStack>
        
        <Progress
          value={Math.min((currentCount / tier.threshold) * 100, 100)}
          colorScheme={getTierColor(tier.threshold)}
          size="sm"
          borderRadius="md"
        />
        
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {currentCount}/{tier.threshold} referrals
        </Text>
      </VStack>
    </Card>
  );
};

const ReferralDashboard = () => {
  const { getReferralStats, getTopRecruiters, getTopRecruitingTribes, getReferralRewards, status } = useReferral();
  const [stats, setStats] = useState(null);
  const [topRecruiters, setTopRecruiters] = useState([]);
  const [topTribes, setTopTribes] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, recruitersData, tribesData, rewardsData] = await Promise.all([
        getReferralStats(),
        getTopRecruiters(10),
        getTopRecruitingTribes(10),
        getReferralRewards(),
      ]);
      
      setStats(statsData);
      setTopRecruiters(recruitersData);
      setTopTribes(tribesData);
      setRewards(rewardsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load referral dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4} color="gray.400">Loading referral dashboard...</Text>
      </Box>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'warlord': return FaCrown;
      case 'captain': return FaMedal;
      default: return FaStar;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'warlord': return 'purple';
      case 'captain': return 'gold';
      default: return 'green';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <HStack justify="center" mb={2}>
            <Icon as={FaUsers} color="purple.500" boxSize={8} />
            <Text fontSize="4xl" fontWeight="bold" color="gray.800">
              Recruitment Hub
            </Text>
          </HStack>
          <Text color="gray.600" fontSize="lg">
            Grow your tribe, earn rewards, and become a legendary recruiter!
          </Text>
        </Box>

        {/* Stats Overview */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel fontSize="sm" color="gray.600">Total Referrals</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {stats?.completedReferrals || 0}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats?.totalReferrals || 0} sent
              </StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel fontSize="sm" color="gray.600">Recruitment Rank</StatLabel>
              <StatNumber fontSize="2xl" color="gold.500">
                {stats?.recruitmentRank || 'Scout'}
              </StatNumber>
              <StatHelpText>
                <Icon as={getRankIcon(stats?.recruitmentRank)} color={`${getRankColor(stats?.recruitmentRank)}.400`} />
              </StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel fontSize="sm" color="gray.600">XP Earned</StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                {stats?.totalXpEarned || 0}
              </StatNumber>
              <StatHelpText>
                From referrals
              </StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat textAlign="center" p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel fontSize="sm" color="gray.600">Coins Earned</StatLabel>
              <StatNumber fontSize="2xl" color="yellow.500">
                {stats?.totalCoinsEarned || 0}
              </StatNumber>
              <StatHelpText>
                From referrals
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Referral Link */}
        {stats?.code && (
          <Card bg="gradient-to-r from-purple-50 to-blue-50" borderRadius="lg" border="1px solid" borderColor="purple.200">
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <Icon as={FaShare} color="purple.500" />
                  <Text fontWeight="bold" color="purple.700">Your Referral Link</Text>
                </HStack>
                
                <Box width="full">
                  <Text fontSize="sm" color="purple.600" mb={2}>Share this link to recruit warriors:</Text>
                  <HStack>
                    <Text 
                      fontSize="sm" 
                      color="purple.600" 
                      bg="white" 
                      p={2} 
                      borderRadius="md" 
                      border="1px solid" 
                      borderColor="purple.200"
                      flex={1}
                    >
                      {`${window.location.origin}/invite/${stats.code}`}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      leftIcon={<Icon as={FaCopy} />}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invite/${stats.code}`);
                        toast({
                          title: 'Copied!',
                          description: 'Referral link copied to clipboard',
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Tabs for different sections */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Reward Tiers</Tab>
            <Tab>Top Recruiters</Tab>
            <Tab>Top Tribes</Tab>
          </TabList>

          <TabPanels>
            {/* Reward Tiers */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Recruitment Reward Tiers
                </Text>
                
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  {rewards?.tiers && Object.entries(rewards.tiers).map(([threshold, tier]) => (
                    <GridItem key={threshold}>
                      <RewardTierCard
                        tier={{ threshold: parseInt(threshold), ...tier }}
                        currentCount={stats?.completedReferrals || 0}
                        isUnlocked={(stats?.completedReferrals || 0) >= parseInt(threshold)}
                        isClaimed={stats?.rewardsClaimed?.includes(tier.rewardType)}
                      />
                    </GridItem>
                  ))}
                </Grid>

                {stats?.nextRewardThreshold && (
                  <Alert status="info" borderRadius="md">
                    
                    <Box>
                      <AlertTitle fontSize="sm">Next Reward Unlock!</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Recruit {stats.nextRewardThreshold.referralsNeeded} more friends to unlock: {stats.nextRewardThreshold.reward.message}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Top Recruiters */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Top Recruiters
                </Text>
                
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Rank</Th>
                        <Th>Recruiter</Th>
                        <Th>Tribe</Th>
                        <Th>Referrals</Th>
                        <Th>Rank</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topRecruiters.map((recruiter, index) => (
                        <Tr key={recruiter.userId}>
                          <Td>
                            <Badge colorScheme="purple" fontSize="xs">
                              #{index + 1}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">
                              {recruiter.displayName || recruiter.username}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {recruiter.tribe?.name || 'No Tribe'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm" color="purple.500">
                              {recruiter.totalReferrals}
                            </Text>
                          </Td>
                          <Td>
                            <HStack>
                              <Icon 
                                as={getRankIcon(recruiter.recruitmentRank)} 
                                color={`${getRankColor(recruiter.recruitmentRank)}.400`}
                                boxSize={4}
                              />
                              <Text fontSize="sm" color="gray.600">
                                {recruiter.recruitmentRank || 'Scout'}
                              </Text>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </TabPanel>

            {/* Top Tribes */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Top Recruiting Tribes
                </Text>
                
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Rank</Th>
                        <Th>Tribe</Th>
                        <Th>Total Recruits</Th>
                        <Th>This Week</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topTribes.map((tribe, index) => (
                        <Tr key={tribe.tribeId}>
                          <Td>
                            <Badge colorScheme="gold" fontSize="xs">
                              #{index + 1}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Text fontSize="lg">{tribe.tribeEmoji}</Text>
                              <Text fontWeight="bold" fontSize="sm">
                                {tribe.tribeName}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm" color="purple.500">
                              {tribe.totalRecruits}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="green.500">
                              {tribe.thisWeekRecruits}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Tribe Rewards */}
        {rewards?.tribeRewards && (
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
              Tribe-Level Rewards
            </Text>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {Object.entries(rewards.tribeRewards).map(([threshold, reward]) => (
                <GridItem key={threshold}>
                  <Card bg="gradient-to-r from-blue-50 to-purple-50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <CardBody>
                      <VStack spacing={2}>
                        <HStack>
                          <Icon as={FaTrophy} color="blue.500" />
                          <Text fontWeight="bold" color="blue.700">
                            {threshold} Recruits
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="blue.600" textAlign="center">
                          {reward.message}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {/* Call to Action */}
        <Alert status="success" borderRadius="md">
          
          <Box>
            <AlertTitle fontSize="sm">Ready to Recruit?</AlertTitle>
            <AlertDescription fontSize="xs">
              Share your referral link with friends and family. Every warrior you recruit strengthens your tribe and earns you amazing rewards!
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default ReferralDashboard;