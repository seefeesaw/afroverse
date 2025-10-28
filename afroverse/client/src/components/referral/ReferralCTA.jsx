import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  Box,
  Divider,
  Icon,
  Badge,
  useClipboard,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Flex,
  Image,
} from '@chakra-ui/react';
import { FaShare, FaCopy, FaWhatsapp, FaInstagram, FaTwitter, FaFacebook, FaTrophy, FaUsers, FaGift, FaFire } from 'react-icons/fa';
import { useReferral } from '../../hooks/useReferral';
import { useSelector } from 'react-redux';

const ShareOptions = ({ referralLink, onShare }) => {
  const shareOptions = [
    {
      platform: 'whatsapp',
      icon: FaWhatsapp,
      color: 'whatsapp',
      label: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`Join me on Afroverse! Transform your selfies into amazing AI art: ${referralLink}`)}`,
    },
    {
      platform: 'instagram',
      icon: FaInstagram,
      color: 'pink',
      label: 'Instagram',
      url: `https://www.instagram.com/`,
    },
    {
      platform: 'twitter',
      icon: FaTwitter,
      color: 'twitter',
      label: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Afroverse! ${referralLink}`)}`,
    },
    {
      platform: 'facebook',
      icon: FaFacebook,
      color: 'facebook',
      label: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
    {
      platform: 'sms',
      icon: FaShare,
      color: 'blue',
      label: 'SMS',
      url: `sms:?body=${encodeURIComponent(`Join me on Afroverse! ${referralLink}`)}`,
    },
  ];

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
      {shareOptions.map((option) => (
        <GridItem key={option.platform}>
          <Button
            leftIcon={<Icon as={option.icon} />}
            colorScheme={option.color}
            variant="outline"
            size="sm"
            width="full"
            onClick={() => {
              if (option.platform === 'sms') {
                window.location.href = option.url;
              } else {
                window.open(option.url, '_blank');
              }
              onShare(option.platform);
            }}
          >
            {option.label}
          </Button>
        </GridItem>
      ))}
    </Grid>
  );
};

const ReferralCTA = ({ isOpen, onClose, transformResult }) => {
  const { getReferralCode, shareReferral, status } = useReferral();
  const [referralData, setReferralData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { hasCopied, onCopy } = useClipboard(referralData?.link || '');

  useEffect(() => {
    if (isOpen && !referralData) {
      loadReferralData();
    }
  }, [isOpen]);

  const loadReferralData = async () => {
    try {
      const data = await getReferralCode();
      setReferralData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = async (platform) => {
    try {
      await shareReferral(platform, referralData.code);
      toast({
        title: 'Shared!',
        description: `Referral link shared on ${platform}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to track share',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [hasCopied, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white" borderRadius="lg">
        <ModalHeader borderBottom="1px" borderColor="gray.700" pb={3}>
          <HStack>
            <Icon as={FaFire} color="orange.400" />
            <Text>Share & Recruit Warriors! 🔥</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              
              <Box>
                <AlertTitle fontSize="sm">Recruit & Earn!</AlertTitle>
                <AlertDescription fontSize="xs">
                  Share this amazing transformation and recruit warriors for your tribe. Earn rewards for every friend who joins!
                </AlertDescription>
              </Box>
            </Alert>

            {referralData && (
              <>
                <Box>
                  <Text fontWeight="bold" mb={2}>Your Referral Link</Text>
                  <InputGroup size="md">
                    <Input
                      pr="4.5rem"
                      type="text"
                      value={referralData.link}
                      isReadOnly
                      bg="gray.800"
                      borderColor="gray.700"
                      color="gray.200"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={onCopy}
                        colorScheme={hasCopied ? 'green' : 'purple'}
                      >
                        {hasCopied ? 'Copied!' : 'Copy'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={3}>Share on Social Media</Text>
                  <ShareOptions 
                    referralLink={referralData.link} 
                    onShare={handleShare}
                  />
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={3}>Your Recruitment Progress</Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Stat textAlign="center" p={3} bg="gray.800" borderRadius="md">
                        <StatLabel fontSize="sm" color="gray.400">Total Referrals</StatLabel>
                        <StatNumber fontSize="lg" color="purple.300">
                          {referralData.stats?.completedReferrals || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          <StatArrow type="increase" />
                          {referralData.stats?.totalReferrals || 0} sent
                        </StatHelpText>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat textAlign="center" p={3} bg="gray.800" borderRadius="md">
                        <StatLabel fontSize="sm" color="gray.400">Recruitment Rank</StatLabel>
                        <StatNumber fontSize="lg" color="yellow.300">
                          {referralData.stats?.recruitmentRank || 'Scout'}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {referralData.stats?.nextRewardThreshold ? 
                            `${referralData.stats.nextRewardThreshold.referralsNeeded} more for next reward` :
                            'Max rank achieved!'
                          }
                        </StatHelpText>
                      </Stat>
                    </GridItem>
                  </Grid>
                </Box>

                {referralData.stats?.nextRewardThreshold && (
                  <Alert status="success" borderRadius="md">
                    
                    <Box>
                      <AlertTitle fontSize="sm">Next Reward Unlock!</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Recruit {referralData.stats.nextRewardThreshold.referralsNeeded} more friends to unlock: {referralData.stats.nextRewardThreshold.reward.message}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </>
            )}

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Every friend you recruit strengthens your tribe and earns you rewards!
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.700" pt={3}>
          <Button variant="ghost" onClick={onClose} mr={3} colorScheme="whiteAlpha">
            Close
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => {
              // Open full referral dashboard
              onClose();
              // You could navigate to a full dashboard here
            }}
            leftIcon={<Icon as={FaUsers} />}
          >
            View Full Dashboard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReferralCTA;
