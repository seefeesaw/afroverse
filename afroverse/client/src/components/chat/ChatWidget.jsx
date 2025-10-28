import React, { useEffect } from 'react';
import { Box, Flex, Text, Icon, Spinner, Button, Badge } from '@chakra-ui/react';
import { FaComments, FaUsers, FaArrowRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectConversations, selectIsSocketConnected } from '../../store/slices/chatSlice';
import { selectUser } from '../../store/slices/authSlice';

const ChatWidget = ({ onViewChat }) => {
  const conversations = useSelector(selectConversations);
  const isConnected = useSelector(selectIsSocketConnected);
  const user = useSelector(selectUser);

  // Calculate unread count
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Get recent conversations
  const recentConversations = conversations.slice(0, 3);

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
          <Icon as={FaComments} w={6} h={6} color="blue.400" mr={2} />
          <Text fontSize="lg" fontWeight="bold" color="white">
            Chat
          </Text>
          <Badge
            ml={3}
            colorScheme={isConnected ? 'green' : 'red'}
            variant="solid"
          >
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </Flex>
        {totalUnreadCount > 0 && (
          <Badge colorScheme="orange" borderRadius="full">
            {totalUnreadCount}
          </Badge>
        )}
      </Flex>

      {conversations.length === 0 ? (
        <VStack spacing={3} py={4}>
          <Text color="gray.400" textAlign="center">
            No conversations yet
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Start chatting with your tribe members or other users
          </Text>
        </VStack>
      ) : (
        <VStack spacing={2} align="stretch" mb={3}>
          {recentConversations.map((conversation) => (
            <Flex
              key={conversation._id}
              align="center"
              justify="space-between"
              p={2}
              bg="gray.700"
              borderRadius="md"
              _hover={{ bg: 'gray.600' }}
              cursor="pointer"
              onClick={onViewChat}
            >
              <Flex align="center">
                <Text fontSize="sm" color="white" fontWeight="semibold">
                  {conversation.otherParticipant.displayName}
                </Text>
                {conversation.unreadCount > 0 && (
                  <Badge ml={2} colorScheme="orange" size="sm">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </Flex>
              <Text fontSize="xs" color="gray.400">
                {conversation.lastMessage?.text?.substring(0, 20) || 'No messages'}...
              </Text>
            </Flex>
          ))}
        </VStack>
      )}

      <Button
        size="sm"
        colorScheme="blue"
        width="full"
        rightIcon={<FaArrowRight />}
        onClick={onViewChat}
      >
        {conversations.length === 0 ? 'Start Chatting' : 'View All Messages'}
      </Button>

      {/* Tribe chat quick access */}
      {user?.tribe && (
        <Box mt={3} p={2} bg="gray.700" borderRadius="md">
          <Flex align="center" justify="space-between">
            <Flex align="center">
              <Icon as={FaUsers} mr={2} color="purple.400" />
              <Text fontSize="sm" color="white">
                {user.tribe.displayName}
              </Text>
            </Flex>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="purple"
              onClick={onViewChat}
            >
              Chat
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ChatWidget;
