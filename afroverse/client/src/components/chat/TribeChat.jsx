import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Input, Button, Avatar, Badge, Spinner,
  Alert, Flex, IconButton, Tooltip,
  Textarea, Select
} from '@chakra-ui/react';
import { FaPaperPlane, FaGrin, FaReply, FaHeart, FaFire, FaGrinBeam, FaThumbsUp } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTribeMessages,
  selectTribeMessagesLoading,
  selectTribeMessagesError,
  selectTribeHasMoreMessages,
  selectTribeNextCursor,
  selectIsSocketConnected,
  selectOnlineUsers,
  selectTypingUsers,
  selectCurrentTribeId,
  setCurrentTribe,
  addTribeMessage,
  updateTribeMessageReaction,
  addTypingUser,
  sendTribeMessage,
  getTribeMessages,
  toggleReaction,
  clearError,
} from '../../store/slices/chatSlice';
import { useSocket } from '../../hooks/useSocket';
import moment from 'moment';

const TribeChat = ({ tribeId, tribeName, userRole = 'member' }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { isOpen: isReplyOpen, onOpen: onReplyOpen, onClose: onReplyClose } = useDisclosure();
  const { isOpen: isReactionOpen, onOpen: onReactionOpen, onClose: onReactionClose } = useDisclosure();
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);

  // Redux selectors
  const messages = useSelector(selectTribeMessages);
  const loading = useSelector(selectTribeMessagesLoading);
  const error = useSelector(selectTribeMessagesError);
  const hasMore = useSelector(selectTribeHasMoreMessages);
  const nextCursor = useSelector(selectTribeNextCursor);
  const isConnected = useSelector(selectIsSocketConnected);
  const onlineUsers = useSelector(selectOnlineUsers);
  const typingUsers = useSelector(selectTypingUsers);
  const currentTribeId = useSelector(selectCurrentTribeId);

  // Socket hook
  const { socket, connectSocket, disconnectSocket } = useSocket();

  // Set current tribe when component mounts
  useEffect(() => {
    if (tribeId && tribeId !== currentTribeId) {
      dispatch(setCurrentTribe(tribeId));
    }
  }, [tribeId, currentTribeId, dispatch]);

  // Socket connection and event handlers
  useEffect(() => {
    if (socket && tribeId) {
      // Join tribe room
      socket.emit('join_tribe', { tribeId });

      // Listen for tribe messages
      socket.on('tribe_message', (data) => {
        dispatch(addTribeMessage(data.message));
        scrollToBottom();
      });

      // Listen for message reactions
      socket.on('message_reaction', (data) => {
        dispatch(updateTribeMessageReaction(data));
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        dispatch(addTypingUser(data));
      });

      // Listen for user status changes
      socket.on('user_status_change', (data) => {
        if (data.isOnline) {
          dispatch(addOnlineUser(data.userId));
        } else {
          dispatch(removeOnlineUser(data.userId));
        }
      });

      return () => {
        socket.emit('leave_tribe', { tribeId });
        socket.off('tribe_message');
        socket.off('message_reaction');
        socket.off('user_typing');
        socket.off('user_status_change');
      };
    }
  }, [socket, tribeId, dispatch]);

  // Load initial messages
  useEffect(() => {
    if (tribeId && messages.length === 0) {
      dispatch(getTribeMessages({ tribeId }));
    }
  }, [tribeId, messages.length, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !socket) return;

    try {
      const messageData = {
        tribeId,
        text: messageText.trim(),
        replyTo,
        type: userRole === 'captain' ? 'message' : 'message', // Captains can send announcements
      };

      await dispatch(sendTribeMessage(messageData)).unwrap();
      setMessageText('');
      setReplyTo(null);
      onReplyClose();
      
      // Stop typing indicator
      socket.emit('typing_stop', { tribeId, type: 'tribe' });
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
      socket?.emit('typing_start', { tribeId, type: 'tribe' });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing_stop', { tribeId, type: 'tribe' });
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

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message._id);
    onReplyOpen();
  };

  // Load more messages (pagination)
  const loadMoreMessages = () => {
    if (hasMore && nextCursor && !loading) {
      dispatch(getTribeMessages({ tribeId, cursor: nextCursor }));
    }
  };

  // Render message
  const renderMessage = (message) => {
    const isOwnMessage = message.senderId._id === 'current-user-id'; // You'll need to get current user ID
    const isAnnouncement = message.type === 'announcement';
    const isReply = message.replyTo;

    return (
      <Box
        key={message._id}
        maxW="80%"
        alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
        mb={3}
      >
        {/* Reply indicator */}
        {isReply && (
          <Box
            bg="gray.700"
            p={2}
            borderRadius="md"
            mb={2}
            borderLeft="3px solid"
            borderLeftColor="orange.400"
          >
            <Text fontSize="sm" color="gray.400">
              Replying to {message.replyTo.senderId.username}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {message.replyTo.text}
            </Text>
          </Box>
        )}

        {/* Message bubble */}
        <Box
          bg={isAnnouncement ? 'yellow.600' : isOwnMessage ? 'orange.500' : 'gray.700'}
          color="white"
          p={3}
          borderRadius="lg"
          position="relative"
        >
          {/* Sender info */}
          {!isOwnMessage && (
            <HStack mb={1}>
              <Avatar size="xs" src={message.senderId.avatar} />
              <Text fontSize="xs" fontWeight="bold">
                {message.senderId.displayName}
              </Text>
              {isAnnouncement && (
                <Badge colorScheme="yellow" size="sm">Announcement</Badge>
              )}
            </HStack>
          )}

          {/* Message text */}
          <Text fontSize="sm" mb={2}>
            {message.text}
          </Text>

          {/* Timestamp */}
          <Text fontSize="xs" color="gray.300" textAlign="right">
            {moment(message.createdAt).format('HH:mm')}
          </Text>

          {/* Action buttons */}
          <HStack spacing={1} mt={2}>
            <Tooltip label="Reply">
              <IconButton
                size="xs"
                icon={<FaReply />}
                variant="ghost"
                color="gray.300"
                onClick={() => handleReply(message)}
              />
            </Tooltip>
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
        
        Error loading chat: {error}
      </Alert>
    );
  }

  return (
    <VStack h="100%" spacing={0}>
      {/* Header */}
      <Box w="100%" p={4} bg="gray.800" borderBottom="1px" borderColor="gray.700">
        <HStack justify="space-between">
          <HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {tribeName}
            </Text>
            <Badge colorScheme={isConnected ? 'green' : 'red'}>
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </HStack>
          <HStack>
            <Text fontSize="sm" color="gray.400">
              {onlineUsers.size} online
            </Text>
          </HStack>
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
              {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box w="100%" p={4} bg="gray.800" borderTop="1px" borderColor="gray.700">
        {replyTo && (
          <Box bg="gray.700" p={2} borderRadius="md" mb={2}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.300">
                Replying to message
              </Text>
              <Button size="xs" variant="ghost" onClick={() => setReplyTo(null)}>
                Cancel
              </Button>
            </HStack>
          </Box>
        )}

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

export default TribeChat;
