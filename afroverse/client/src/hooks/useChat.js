import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectTribeMessages,
  selectTribeMessagesLoading,
  selectTribeMessagesError,
  selectTribeHasMoreMessages,
  selectTribeNextCursor,
  selectDirectMessages,
  selectDirectMessagesLoading,
  selectDirectMessagesError,
  selectDirectHasMoreMessages,
  selectDirectNextCursor,
  selectConversations,
  selectConversationsLoading,
  selectConversationsError,
  selectConversationsHasMore,
  selectConversationsNextCursor,
  selectIsSocketConnected,
  selectOnlineUsers,
  selectTypingUsers,
  selectCurrentTribeId,
  selectCurrentDmUserId,
  selectCurrentConversationId,
  selectIsTyping,
  selectChatStatus,
  selectChatError,
  setCurrentTribe,
  addTribeMessage,
  updateTribeMessageReaction,
  setCurrentDmUser,
  addDirectMessage,
  markDirectMessagesAsRead,
  addConversation,
  updateConversationUnreadCount,
  setTyping,
  addTypingUser,
  setSocketConnected,
  addOnlineUser,
  removeOnlineUser,
  clearError,
  resetChatState,
  sendTribeMessage,
  getTribeMessages,
  sendDirectMessage,
  getDirectMessages,
  toggleReaction,
  markMessagesAsRead,
  getConversations,
} from '../store/slices/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch();

  // Selectors
  const tribeMessages = useSelector(selectTribeMessages);
  const tribeMessagesLoading = useSelector(selectTribeMessagesLoading);
  const tribeMessagesError = useSelector(selectTribeMessagesError);
  const tribeHasMoreMessages = useSelector(selectTribeHasMoreMessages);
  const tribeNextCursor = useSelector(selectTribeNextCursor);

  const directMessages = useSelector(selectDirectMessages);
  const directMessagesLoading = useSelector(selectDirectMessagesLoading);
  const directMessagesError = useSelector(selectDirectMessagesError);
  const directHasMoreMessages = useSelector(selectDirectHasMoreMessages);
  const directNextCursor = useSelector(selectDirectNextCursor);

  const conversations = useSelector(selectConversations);
  const conversationsLoading = useSelector(selectConversationsLoading);
  const conversationsError = useSelector(selectConversationsError);
  const conversationsHasMore = useSelector(selectConversationsHasMore);
  const conversationsNextCursor = useSelector(selectConversationsNextCursor);

  const isConnected = useSelector(selectIsSocketConnected);
  const onlineUsers = useSelector(selectOnlineUsers);
  const typingUsers = useSelector(selectTypingUsers);
  const currentTribeId = useSelector(selectCurrentTribeId);
  const currentDmUserId = useSelector(selectCurrentDmUserId);
  const currentConversationId = useSelector(selectCurrentConversationId);
  const isTyping = useSelector(selectIsTyping);
  const status = useSelector(selectChatStatus);
  const error = useSelector(selectChatError);

  // Tribe chat actions
  const handleSetCurrentTribe = useCallback((tribeId) => {
    dispatch(setCurrentTribe(tribeId));
  }, [dispatch]);

  const handleSendTribeMessage = useCallback(async (messageData) => {
    try {
      const result = await dispatch(sendTribeMessage(messageData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetTribeMessages = useCallback(async (params) => {
    try {
      const result = await dispatch(getTribeMessages(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleToggleReaction = useCallback(async (reactionData) => {
    try {
      const result = await dispatch(toggleReaction(reactionData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Direct message actions
  const handleSetCurrentDmUser = useCallback((userId) => {
    dispatch(setCurrentDmUser(userId));
  }, [dispatch]);

  const handleSendDirectMessage = useCallback(async (messageData) => {
    try {
      const result = await dispatch(sendDirectMessage(messageData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleGetDirectMessages = useCallback(async (params) => {
    try {
      const result = await dispatch(getDirectMessages(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleMarkMessagesAsRead = useCallback(async (conversationId) => {
    try {
      const result = await dispatch(markMessagesAsRead(conversationId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Conversations actions
  const handleGetConversations = useCallback(async (params) => {
    try {
      const result = await dispatch(getConversations(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Real-time actions
  const handleAddTribeMessage = useCallback((message) => {
    dispatch(addTribeMessage(message));
  }, [dispatch]);

  const handleUpdateTribeMessageReaction = useCallback((reactionData) => {
    dispatch(updateTribeMessageReaction(reactionData));
  }, [dispatch]);

  const handleAddDirectMessage = useCallback((message) => {
    dispatch(addDirectMessage(message));
  }, [dispatch]);

  const handleMarkDirectMessagesAsRead = useCallback((conversationId) => {
    dispatch(markDirectMessagesAsRead(conversationId));
  }, [dispatch]);

  const handleAddConversation = useCallback((conversation) => {
    dispatch(addConversation(conversation));
  }, [dispatch]);

  const handleUpdateConversationUnreadCount = useCallback((data) => {
    dispatch(updateConversationUnreadCount(data));
  }, [dispatch]);

  const handleSetTyping = useCallback((typing) => {
    dispatch(setTyping(typing));
  }, [dispatch]);

  const handleAddTypingUser = useCallback((userData) => {
    dispatch(addTypingUser(userData));
  }, [dispatch]);

  const handleSetSocketConnected = useCallback((connected) => {
    dispatch(setSocketConnected(connected));
  }, [dispatch]);

  const handleAddOnlineUser = useCallback((userId) => {
    dispatch(addOnlineUser(userId));
  }, [dispatch]);

  const handleRemoveOnlineUser = useCallback((userId) => {
    dispatch(removeOnlineUser(userId));
  }, [dispatch]);

  // Utility actions
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetChatState = useCallback(() => {
    dispatch(resetChatState());
  }, [dispatch]);

  return {
    // Tribe chat state
    tribeMessages,
    tribeMessagesLoading,
    tribeMessagesError,
    tribeHasMoreMessages,
    tribeNextCursor,
    
    // Direct messages state
    directMessages,
    directMessagesLoading,
    directMessagesError,
    directHasMoreMessages,
    directNextCursor,
    
    // Conversations state
    conversations,
    conversationsLoading,
    conversationsError,
    conversationsHasMore,
    conversationsNextCursor,
    
    // UI state
    currentTribeId,
    currentDmUserId,
    currentConversationId,
    isTyping,
    typingUsers,
    
    // Socket state
    isConnected,
    onlineUsers,
    
    // General state
    status,
    error,
    
    // Tribe chat actions
    setCurrentTribe: handleSetCurrentTribe,
    sendTribeMessage: handleSendTribeMessage,
    getTribeMessages: handleGetTribeMessages,
    toggleReaction: handleToggleReaction,
    
    // Direct message actions
    setCurrentDmUser: handleSetCurrentDmUser,
    sendDirectMessage: handleSendDirectMessage,
    getDirectMessages: handleGetDirectMessages,
    markMessagesAsRead: handleMarkMessagesAsRead,
    
    // Conversations actions
    getConversations: handleGetConversations,
    
    // Real-time actions
    addTribeMessage: handleAddTribeMessage,
    updateTribeMessageReaction: handleUpdateTribeMessageReaction,
    addDirectMessage: handleAddDirectMessage,
    markDirectMessagesAsRead: handleMarkDirectMessagesAsRead,
    addConversation: handleAddConversation,
    updateConversationUnreadCount: handleUpdateConversationUnreadCount,
    setTyping: handleSetTyping,
    addTypingUser: handleAddTypingUser,
    setSocketConnected: handleSetSocketConnected,
    addOnlineUser: handleAddOnlineUser,
    removeOnlineUser: handleRemoveOnlineUser,
    
    // Utility actions
    clearError: handleClearError,
    resetChatState: handleResetChatState,
  };
};

export default useChat;
