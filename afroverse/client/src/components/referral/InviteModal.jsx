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
  FormControl,
  FormLabel,
  useToast,
  Box,
  Divider,
  Icon,
  Badge,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
} from '@chakra-ui/react';
import { FaWhatsapp, FaCopy, FaShare, FaQrcode, FaLink } from 'react-icons/fa';
import { useReferral } from '../../hooks/useReferral';

const InviteModal = ({ isOpen, onClose }) => {
  const { referralCode, shareReferralLink, inviteViaWhatsApp, status } = useReferral();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const defaultMessage = `🔥 Join me on Afroverse! 

Create amazing AI transformations of yourself as a Maasai warrior, Zulu royalty, or Ancient Pharaoh!

Battle with friends and climb the leaderboards. Your tribe needs warriors like you!

Get started: ${referralCode?.link || ''}

#Afroverse #AI #Transformation #Battle`;

  useEffect(() => {
    if (referralCode?.link) {
      setCustomMessage(defaultMessage);
    }
  }, [referralCode?.link]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralCode?.link || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Link Copied!',
        description: 'Referral link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleWhatsAppInvite = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a phone number',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await inviteViaWhatsApp(phoneNumber, customMessage);
      
      toast({
        title: 'Invitation Sent!',
        description: `WhatsApp invitation sent to ${phoneNumber}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Invitation Failed',
        description: error.message || 'Failed to send WhatsApp invitation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = async (platform) => {
    const shareData = {
      title: 'Join me on Afroverse!',
      text: customMessage,
      url: referralCode?.link || '',
    };

    try {
      if (navigator.share && platform === 'native') {
        await navigator.share(shareData);
      } else {
        // Fallback for other platforms
        await shareReferralLink(platform, customMessage);
      }
      
      toast({
        title: 'Shared Successfully!',
        description: `Shared on ${platform}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite Friends to Afroverse</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Referral Link */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Your Referral Link
              </Text>
              <HStack spacing={2}>
                <Input
                  value={referralCode?.link || ''}
                  readOnly
                  bg="gray.50"
                  fontSize="sm"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  leftIcon={<FaCopy />}
                  colorScheme={copied ? 'green' : 'blue'}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </HStack>
            </Box>

            {/* QR Code */}
            {referralCode?.qrCode && (
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  QR Code
                </Text>
                <Image
                  src={referralCode.qrCode}
                  alt="Referral QR Code"
                  maxW="200px"
                  mx="auto"
                />
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Scan to join Afroverse
                </Text>
              </Box>
            )}

            <Divider />

            {/* WhatsApp Invitation */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={3}>
                Send WhatsApp Invitation
              </Text>
              
              <FormControl mb={3}>
                <FormLabel fontSize="sm">Phone Number</FormLabel>
                <Input
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel fontSize="sm">Message (Optional)</FormLabel>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  fontSize="sm"
                />
              </FormControl>

              <Button
                size="lg"
                colorScheme="green"
                leftIcon={<FaWhatsapp />}
                onClick={handleWhatsAppInvite}
                isLoading={status === 'loading'}
                bg="linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                _hover={{
                  bg: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                }}
                w="full"
              >
                Send WhatsApp Invitation
              </Button>
            </Box>

            <Divider />

            {/* Other Sharing Options */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={3}>
                Share via Other Platforms
              </Text>
              
              <HStack spacing={2} wrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FaShare />}
                  onClick={() => handleShare('native')}
                >
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FaLink />}
                  onClick={handleCopyLink}
                >
                  Copy Link
                </Button>
              </HStack>
            </Box>

            {/* Benefits */}
            <Alert status="info" borderRadius="md">
              
              <Box>
                <AlertTitle fontSize="sm">Invite Benefits</AlertTitle>
                <AlertDescription fontSize="xs">
                  • You earn rewards for each successful referral
                  • Your tribe gets power boosts
                  • Your friends get a warm welcome bonus
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InviteModal;
