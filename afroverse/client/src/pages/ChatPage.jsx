import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input, Select,
  useToast, Flex, Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TribeChat from '../components/chat/TribeChat';
import DirectMessage from '../components/chat/DirectMessage';
import ConversationsList from '../components/chat/ConversationsList';
import { selectCurrentTribeId } from '../store/slices/chatSlice';
import { selectUser } from '../store/slices/authSlice';

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('tribe'); // 'tribe' or 'dm'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const { isOpen: isNewChatOpen, onOpen: onNewChatOpen, onClose: onNewChatClose } = useDisclosure();
  const { isOpen: isUserSearchOpen, onOpen: onUserSearchOpen, onClose: onUserSearchClose } = useDisclosure();

  // Redux selectors
  const currentTribeId = useSelector(selectCurrentTribeId);
  const user = useSelector(selectUser);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'tribe') {
      setSelectedConversation(null);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setActiveTab('dm');
  };

  // Handle start new chat
  const handleStartNewChat = () => {
    onNewChatOpen();
  };

  // Handle user search
  const handleSearchUsers = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // This would call the search users API
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Failed to search for users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle start conversation with user
  const handleStartConversation = (user) => {
    const conversation = {
      _id: `temp-${user._id}`,
      otherParticipant: user,
      lastMessage: null,
      lastMessageAt: new Date(),
      unreadCount: 0,
    };
    handleSelectConversation(conversation);
    onNewChatClose();
    onUserSearchClose();
    setSearchUsers('');
    setSearchResults([]);
  };

  // Get tribe info (you'll need to fetch this)
  const tribeInfo = {
    _id: currentTribeId,
    name: user?.tribe?.displayName || 'Your Tribe',
  };

  return (
    <Box h="100vh" bg="gray.900">
      <VStack h="100%" spacing={0}>
        {/* Header */}
        <Box w="100%" p={4} bg="gray.800" borderBottom="1px" borderColor="gray.700">
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Chat
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<FaUserPlus />}
                onClick={handleStartNewChat}
              >
                New Chat
              </Button>
            </HStack>
          </HStack>

          {/* Tab navigation */}
          <HStack spacing={4} mt={4}>
            <Button
              variant={activeTab === 'tribe' ? 'solid' : 'ghost'}
              colorScheme="orange"
              onClick={() => handleTabChange('tribe')}
            >
              Tribe Chat
            </Button>
            <Button
              variant={activeTab === 'dm' ? 'solid' : 'ghost'}
              colorScheme="orange"
              onClick={() => handleTabChange('dm')}
            >
              Direct Messages
            </Button>
          </HStack>
        </Box>

        {/* Content */}
        <Box flex="1" w="100%" display="flex">
          {activeTab === 'tribe' ? (
            <Box flex="1">
              {currentTribeId ? (
                <TribeChat
                  tribeId={currentTribeId}
                  tribeName={tribeInfo.name}
                  userRole={user?.role || 'member'}
                />
              ) : (
                <Flex h="100%" align="center" justify="center">
                  <VStack spacing={4}>
                    <Text color="gray.400" textAlign="center">
                      You're not in a tribe yet
                    </Text>
                    <Button
                      colorScheme="orange"
                      onClick={() => navigate('/tribes')}
                    >
                      Join a Tribe
                    </Button>
                  </VStack>
                </Flex>
              )}
            </Box>
          ) : (
            <Box flex="1" display="flex">
              {/* Conversations list */}
              <Box w="300px" borderRight="1px" borderColor="gray.700">
                <ConversationsList
                  onSelectConversation={handleSelectConversation}
                  onStartNewChat={handleStartNewChat}
                />
              </Box>

              {/* Direct message */}
              <Box flex="1">
                {selectedConversation ? (
                  <DirectMessage
                    otherUserId={selectedConversation.otherParticipant._id}
                    otherUser={selectedConversation.otherParticipant}
                  />
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <VStack spacing={4}>
                      <Text color="gray.400" textAlign="center">
                        Select a conversation to start messaging
                      </Text>
                      <Button
                        colorScheme="orange"
                        onClick={handleStartNewChat}
                      >
                        Start New Chat
                      </Button>
                    </VStack>
                  </Flex>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </VStack>

      {/* New Chat Modal */}
      <Modal isOpen={isNewChatOpen} onClose={onNewChatClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color="gray.400" textAlign="center">
                Search for a user to start a conversation
              </Text>
              <Input
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => {
                  setSearchUsers(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                leftIcon={<FaSearch />}
              />
              
              {searchLoading && (
                <Flex justify="center" py={4}>
                  <Spinner color="orange.500" />
                </Flex>
              )}

              {searchResults.length > 0 && (
                <VStack spacing={2} w="100%" maxH="300px" overflowY="auto">
                  {searchResults.map((user) => (
                    <Box
                      key={user._id}
                      p={3}
                      bg="gray.100"
                      borderRadius="md"
                      w="100%"
                      cursor="pointer"
                      _hover={{ bg: 'gray.200' }}
                      onClick={() => handleStartConversation(user)}
                    >
                      <HStack>
                        <Text fontWeight="bold">{user.displayName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          @{user.username}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {user.tribe?.displayName || 'No tribe'}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}

              {searchUsers.length >= 2 && searchResults.length === 0 && !searchLoading && (
                <Text color="gray.400" textAlign="center">
                  No users found
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChatPage;
