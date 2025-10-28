import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Text, Button, Badge, Box, Flex, Icon, Alert
} from '@chakra-ui/react';
import { FaBolt, FaCheck, FaCoins } from 'react-icons/fa';
import boostService from '../../services/boostService';
import { useAuth } from '../../hooks/useAuth';

const BoostModal = ({ isOpen, onClose, videoId, onBoostSuccess }) => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isBoosting, setIsBoosting] = useState(false);

  const boostTiers = {
    bronze: { label: 'Bronze Boost', duration: '1 hour', multiplier: '2x visibility', cost: 20, price: 0.99, color: 'orange' },
    silver: { label: 'Silver Boost', duration: '6 hours', multiplier: '4x visibility', cost: 50, price: 2.49, color: 'blue' },
    gold: { label: 'Gold Boost', duration: '24 hours', multiplier: '8x visibility', cost: 100, price: 4.99, color: 'yellow' },
  };

  const handleBoost = async () => {
    if (!selectedTier) {
      toast({
        title: 'Select a tier',
        description: 'Please choose a boost tier',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsBoosting(true);

    try {
      await boostService.boostVideo(videoId, selectedTier);
      
      toast({
        title: 'Boost Activated!',
        description: `Your video will now have ${boostTiers[selectedTier].multiplier} visibility`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onBoostSuccess) {
        onBoostSuccess();
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Boost Failed',
        description: error.response?.data?.message || 'Failed to boost video',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Boost Your Video</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="lg">
              
              <Text fontSize="sm">
                Boost your video to reach more people and increase engagement!
              </Text>
            </Alert>

            {Object.entries(boostTiers).map(([tier, config]) => (
              <Box
                key={tier}
                p={4}
                border="2px solid"
                borderColor={selectedTier === tier ? `${config.color}.500` : 'gray.200'}
                borderRadius="lg"
                cursor="pointer"
                onClick={() => setSelectedTier(tier)}
                bg={selectedTier === tier ? `${config.color}.50` : 'white'}
                transition="all 0.2s"
                _hover={{ borderColor: `${config.color}.300` }}
              >
                <HStack justify="space-between" spacing={4}>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Icon as={FaBolt} color={`${config.color}.500`} />
                      <Text fontWeight="bold">{config.label}</Text>
                      {selectedTier === tier && (
                        <Badge colorScheme={config.color} variant="solid">
                          <Icon as={FaCheck} mr={1} />
                          Selected
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {config.duration} • {config.multiplier}
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="lg" fontWeight="bold" color={`${config.color}.600`}>
                      {config.cost}
                      <Icon as={FaCoins} ml={1} />
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      ${config.price}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}

            {!user?.wallet?.balance && (
              <Alert status="warning" borderRadius="lg">
                
                <Text fontSize="sm">
                  You don't have enough coins. Buy more coins to boost your video!
                </Text>
              </Alert>
            )}

            {user?.wallet?.balance && (
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Your balance: {user.wallet.balance} coins
              </Text>
            )}

            <HStack spacing={3} width="full">
              <Button
                flex="1"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                flex="2"
                colorScheme="orange"
                leftIcon={<FaBolt />}
                onClick={handleBoost}
                isLoading={isBoosting}
                loadingText="Boosting..."
                isDisabled={!selectedTier}
              >
                Activate Boost
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BoostModal;
