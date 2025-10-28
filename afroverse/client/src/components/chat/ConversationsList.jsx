import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Avatar, Badge, Spinner, Alert,
  Flex, IconButton, Tooltip,
  Button, Input, Select
} from '@chakra-ui/react';
import { FaSearch, FaEllipsisV, FaTrash, FaBan, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectConversations,
  selectConversationsLoading,
  selectConversationsError,
  selectConversationsHasMore,
  selectConversationsNextCursor,
  addConversation,
  updateConversationUnreadCount,
  getConversations,
  clearError,
} from '../../store/slices/chatSlice';
import moment from 'moment';

const ConversationsList = ({ onSelectConversation, onStartNewChat }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { isOpen: isOptionsOpen, onOpen: onOptionsOpen, onClose: onOptionsClose } = useDisclosure();

  // Redux selectors
  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectConversationsLoading);
  const error = useSelector(selectConversationsError);
  const hasMore = useSelector(selectConversationsHasMore);
  const nextCursor = useSelector(selectConversationsNextCursor);

  // Load initial conversations
  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(getConversations({}));
    }
  }, [conversations.length, dispatch]);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    onSelectConversation(conversation);
  };

  // Handle search
  const filteredConversations = conversations.filter(conv =>
    conv.otherParticipant.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle load more
  const loadMoreConversations = () => {
    if (hasMore && nextCursor && !loading) {
      dispatch(getConversations({ cursor: nextCursor }));
    }
  };

  // Handle block user
  const handleBlockUser = async (conversationId, userId) => {
    try {
      // This would call the block user API
      toast({
        title: 'User blocked',
        description: 'This user has been blocked and can no longer message you.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onOptionsClose();
    } catch (error) {
      toast({
        title: 'Failed to block user',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      // This would call the delete conversation API
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onOptionsClose();
    } catch (error) {
      toast({
        title: 'Failed to delete conversation',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render conversation item
  const renderConversation = (conversation) => {
    const isSelected = selectedConversation?._id === conversation._id;
    const hasUnread = conversation.unreadCount > 0;

    return (
      <Box
        key={conversation._id}
        p={4}
        bg={isSelected ? 'orange.600' : 'gray.800'}
        borderRadius="lg"
        cursor="pointer"
        _hover={{ bg: isSelected ? 'orange.700' : 'gray.700' }}
        onClick={() => handleSelectConversation(conversation)}
        position="relative"
      >
        <HStack spacing={3}>
          {/* Avatar */}
          <Avatar
            size="md"
            src={conversation.otherParticipant.avatar}
            name={conversation.otherParticipant.displayName}
          />

          {/* Conversation info */}
          <VStack align="start" flex="1" spacing={1}>
            <HStack justify="space-between" w="100%">
              <Text
                fontSize="md"
                fontWeight="bold"
                color="white"
                noOfLines={1}
              >
                {conversation.otherParticipant.displayName}
              </Text>
              <HStack spacing={2}>
                {hasUnread && (
                  <Badge colorScheme="orange" borderRadius="full">
                    {conversation.unreadCount}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.400">
                  {moment(conversation.lastMessageAt).format('HH:mm')}
                </Text>
              </HStack>
            </HStack>

            <Text fontSize="sm" color="gray.300" noOfLines={1}>
              {conversation.lastMessage?.text || 'No messages yet'}
            </Text>

            <Text fontSize="xs" color="gray.500">
              {conversation.otherParticipant.tribe?.displayName || 'No tribe'}
            </Text>
          </VStack>

          {/* Options button */}
          <IconButton
            size="sm"
            icon={<FaEllipsisV />}
            variant="ghost"
            color="gray.400"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConversation(conversation);
              onOptionsOpen();
            }}
          />
        </HStack>
      </Box>
    );
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        
        Error loading conversations: {error}
      </Alert>
    );
  }

  return (
    <VStack h="100%" spacing={0}>
      {/* Header */}
      <Box w="100%" p={4} bg="gray.800" borderBottom="1px" borderColor="gray.700">
        <HStack justify="space-between" mb={3}>
          <Text fontSize="xl" fontWeight="bold" color="white">
            Messages
          </Text>
          <Button
            size="sm"
            colorScheme="orange"
            onClick={onStartNewChat}
          >
            New Chat
          </Button>
        </HStack>

        {/* Search */}
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<FaSearch />}
          bg="gray.700"
          border="none"
          _focus={{ borderColor: 'orange.500' }}
        />
      </Box>

      {/* Conversations list */}
      <Box flex="1" w="100%" overflowY="auto" p={4}>
        {loading && conversations.length === 0 && (
          <Flex justify="center" py={8}>
            <Spinner color="orange.500" />
          </Flex>
        )}

        {filteredConversations.length === 0 && !loading && (
          <VStack py={8} spacing={4}>
            <Text color="gray.400" textAlign="center">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </Text>
            {!searchTerm && (
              <Button colorScheme="orange" onClick={onStartNewChat}>
                Start your first conversation
              </Button>
            )}
          </VStack>
        )}

        <VStack spacing={3} align="stretch">
          {filteredConversations.map(renderConversation)}
        </VStack>

        {/* Load more button */}
        {hasMore && (
          <Flex justify="center" mt={4}>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreConversations}
              isLoading={loading}
            >
              Load more conversations
            </Button>
          </Flex>
        )}
      </Box>

      {/* Options Modal */}
      {isOptionsOpen && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1000}
          bg="gray.800"
          borderColor="gray.600"
          borderWidth="1px"
          borderRadius="md"
          p={6}
          maxW="md"
          w="90%"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">Conversation Options</Text>
            <IconButton
              aria-label="Close"
              icon={<FaTimes />}
              size="sm"
              onClick={onOptionsClose}
            />
          </Flex>
          <VStack spacing={3}>
            <Button
              leftIcon={<FaBan />}
              colorScheme="red"
              variant="outline"
              w="100%"
              onClick={() => handleBlockUser(selectedConversation?._id, selectedConversation?.otherParticipant._id)}
            >
              Block User
            </Button>
            <Button
              leftIcon={<FaTrash />}
              colorScheme="red"
              variant="outline"
              w="100%"
              onClick={() => handleDeleteConversation(selectedConversation?._id)}
            >
              Delete Conversation
            </Button>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default ConversationsList;
