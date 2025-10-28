import React from 'react';
import { Box, VStack, Text, Container } from '@chakra-ui/react';
import { EventDashboard } from '../components/event';

const EventsPage = () => {
  return (
    <Box minH="100vh" bg="gray.900" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="extrabold" color="white" mb={2}>
              Events Hub 🎉
            </Text>
            <Text fontSize="lg" color="gray.400">
              Join Clan Wars and Power Hours to earn rewards and compete with your tribe!
            </Text>
          </Box>
          
          <EventDashboard />
        </VStack>
      </Container>
    </Box>
  );
};

export default EventsPage;
