import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Input, Button, Avatar, Badge, Spinner,
  Alert, Flex, IconButton, Tooltip,
  Textarea
} from '@chakra-ui/react';
import { FaPaperPlane, FaGrin, FaReply, FaHeart, FaFire, FaGrinBeam, FaThumbsUp } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectDirectMessages,
  selectDirectMessagesLoading,
  selectDirectMessagesError,
  selectDirectHasMoreMessages,
  selectDirectNextCursor,
  selectIsSocketConnected,
  selectTypingUsers,
  selectCurrentDmUserId,
  setCurrentDmUser,
  addDirectMessage,
  markDirectMessagesAsRead,
  sendDirectMessage,
  getDirectMessages,
  toggleReaction,
  clearError,
} from '../../store/slices/chatSlice';
import { useSocket } from '../../hooks/useSocket';
import moment from 'moment';

const DirectMessage = ({ otherUserId, otherUser }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { isOpen: isReactionOpen, onOpen: onReactionOpen, onClose: onReactionClose } = useDisclosure();
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);

  // Redux selectors
  const messages = useSelector(selectDirectMessages);
  const loading = useSelector(selectDirectMessagesLoading);
  const error = useSelector(selectDirectMessagesError);
  const hasMore = useSelector(selectDirectHasMoreMessages);
  const nextCursor = useSelector(selectDirectNextCursor);
  const isConnected = useSelector(selectIsSocketConnected);
  const typingUsers = useSelector(selectTypingUsers);
  const currentDmUserId = useSelector(selectCurrentDmUserId);

  // Socket hook
  const { socket, connectSocket, disconnectSocket } = useSocket();

  // Set current DM user when component mounts
  useEffect(() => {
    if (otherUserId && otherUserId !== currentDmUserId) {
      dispatch(setCurrentDmUser(otherUserId));
    }
  }, [otherUserId, currentDmUserId, dispatch]);

  // Socket connection and event handlers
  useEffect(() => {
    if (socket && otherUserId) {
      // Join DM room
      socket.emit('join_dm', { otherUserId });

      // Listen for DM messages
      socket.on('dm_message', (data) => {
        dispatch(addDirectMessage(data.message));
        scrollToBottom();
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        dispatch(addTypingUser(data));
      });

      // Listen for read receipts
      socket.on('messages_read', (data) => {
        dispatch(markDirectMessagesAsRead(data.conversationId));
      });

      return () => {
        socket.emit('leave_dm', { otherUserId });
        socket.off('dm_message');
        socket.off('user_typing');
        socket.off('messages_read');
      };
    }
  }, [socket, otherUserId, dispatch]);

  // Load initial messages
  useEffect(() => {
    if (otherUserId && messages.length === 0) {
      dispatch(getDirectMessages({ userId: otherUserId }));
    }
  }, [otherUserId, messages.length, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && isConnected) {
      const conversationId = messages[0]?.conversationId;
      if (conversationId) {
        dispatch(markMessagesAsRead(conversationId));
      }
    }
  }, [messages.length, isConnected, dispatch]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !socket) return;

    try {
      const messageData = {
        userId: otherUserId,
        text: messageText.trim(),
      };

      await dispatch(sendDirectMessage(messageData)).unwrap();
      setMessageText('');
      
      // Stop typing indicator
      socket.emit('typing_stop', { otherUserId, type: 'dm' });
      setIsTyping(false);
      
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle typing indicator
  const handleTyping = (text) => {
    setMessageText(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket?.emit('typing_start', { otherUserId, type: 'dm' });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing_stop', { otherUserId, type: 'dm' });
    }, 1000);
  };

  // Handle reaction
  const handleReaction = async (messageId, emoji) => {
    try {
      await dispatch(toggleReaction({ messageId, emoji })).unwrap();
      onReactionClose();
    } catch (error) {
      toast({
        title: 'Failed to add reaction',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = () => {
    if (hasMore && nextCursor && !loading) {
      dispatch(getDirectMessages({ userId: otherUserId, cursor: nextCursor }));
    }
  };

  // Render message
  const renderMessage = (message) => {
    const isOwnMessage = message.senderId._id === 'current-user-id'; // You'll need to get current user ID
    const isRead = message.isRead;

    return (
      <Box
        key={message._id}
        maxW="80%"
        alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
        mb={3}
      >
        {/* Message bubble */}
        <Box
          bg={isOwnMessage ? 'orange.500' : 'gray.700'}
          color="white"
          p={3}
          borderRadius="lg"
          position="relative"
        >
          {/* Sender info for received messages */}
          {!isOwnMessage && (
            <HStack mb={1}>
              <Avatar size="xs" src={message.senderId.avatar} />
              <Text fontSize="xs" fontWeight="bold">
                {message.senderId.displayName}
              </Text>
            </HStack>
          )}

          {/* Message text */}
          <Text fontSize="sm" mb={2}>
            {message.text}
          </Text>

          {/* Timestamp and read status */}
          <HStack justify="space-between" align="center">
            <Text fontSize="xs" color="gray.300">
              {moment(message.createdAt).format('HH:mm')}
            </Text>
            {isOwnMessage && (
              <Text fontSize="xs" color={isRead ? 'green.300' : 'gray.400'}>
                {isRead ? '✓✓' : '✓'}
              </Text>
            )}
          </HStack>

          {/* Action buttons */}
          <HStack spacing={1} mt={2}>
            <Tooltip label="React">
              <IconButton
                size="xs"
                icon={<FaGrin />}
                variant="ghost"
                color="gray.300"
                onClick={() => {
                  setSelectedMessageForReaction(message._id);
                  onReactionOpen();
                }}
              />
            </Tooltip>
          </HStack>
        </Box>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <HStack mt={1} spacing={1}>
            {Object.entries(message.reactionCounts || {}).map(([emoji, count]) => (
              <Button
                key={emoji}
                size="xs"
                variant="ghost"
                leftIcon={<Text>{emoji}</Text>}
                onClick={() => handleReaction(message._id, emoji)}
              >
                {count}
              </Button>
            ))}
          </HStack>
        )}
      </Box>
    );
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        
        Error loading messages: {error}
      </Alert>
    );
  }

  return (
    <VStack h="100%" spacing={0}>
      {/* Header */}
      <Box w="100%" p={4} bg="gray.800" borderBottom="1px" borderColor="gray.700">
        <HStack justify="space-between">
          <HStack>
            <Avatar size="sm" src={otherUser?.avatar} />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {otherUser?.displayName || otherUser?.username}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {otherUser?.tribe?.displayName || 'No tribe'}
              </Text>
            </VStack>
          </HStack>
          <Badge colorScheme={isConnected ? 'green' : 'red'}>
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </HStack>
      </Box>

      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        flex="1"
        w="100%"
        overflowY="auto"
        p={4}
        onScroll={(e) => {
          if (e.target.scrollTop === 0 && hasMore) {
            loadMoreMessages();
          }
        }}
      >
        {loading && messages.length === 0 && (
          <Flex justify="center" py={8}>
            <Spinner color="orange.500" />
          </Flex>
        )}

        <VStack spacing={0} align="stretch">
          {messages.map(renderMessage)}
        </VStack>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box bg="gray.700" p={2} borderRadius="md" mt={2}>
            <Text fontSize="sm" color="gray.400">
              {otherUser?.displayName} is typing...
            </Text>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box w="100%" p={4} bg="gray.800" borderTop="1px" borderColor="gray.700">
        <HStack spacing={2}>
          <Input
            value={messageText}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            maxLength={280}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <IconButton
            icon={<FaPaperPlane />}
            colorScheme="orange"
            onClick={handleSendMessage}
            isDisabled={!messageText.trim() || !isConnected}
          />
        </HStack>
      </Box>

      {/* Reaction Modal */}
      <Modal isOpen={isReactionOpen} onClose={onReactionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Reaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HStack spacing={4} justify="center">
              {['❤️', '🔥', '😂', '👍'].map(emoji => (
                <Button
                  key={emoji}
                  size="lg"
                  variant="ghost"
                  onClick={() => handleReaction(selectedMessageForReaction, emoji)}
                >
                  <Text fontSize="2xl">{emoji}</Text>
                </Button>
              ))}
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DirectMessage;
