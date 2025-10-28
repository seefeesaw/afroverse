import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Button, IconButton,
  Input, Textarea, Avatar, Badge, Flex, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Image, Tooltip, Menu, MenuButton, MenuList, MenuItem,
  Alert, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import {
  FaHeart, FaReply, FaFlag, FaCopy, FaTrash, FaShare, FaThumbtack,
  FaGrin, FaImage, FaHashtag, FaAt, FaCrown, FaUsers, FaFire
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import {
  selectComments,
  selectPinnedComment,
  selectTotalCommentCount,
  selectCommentsLoading,
  selectCurrentVideoId,
  getComments,
  createComment,
  toggleLike,
  deleteComment,
  reportComment,
  setCurrentVideoId,
  addComment,
  clearError,
} from '../../store/slices/commentSlice';

const CommentSheet = ({ isOpen, onClose, videoId, onCommentSubmitted }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [sort, setSort] = useState('top');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Redux selectors
  const comments = useSelector(state => selectComments(state, videoId));
  const pinnedComment = useSelector(state => selectPinnedComment(state, videoId));
  const totalCount = useSelector(state => selectTotalCommentCount(state, videoId));
  const loading = useSelector(state => selectCommentsLoading(state, videoId));
  const currentVideoId = useSelector(selectCurrentVideoId);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Set current video ID on mount
  useEffect(() => {
    if (videoId) {
      dispatch(setCurrentVideoId(videoId));
    }
  }, [videoId, dispatch]);

  // Load comments when video ID changes
  useEffect(() => {
    if (videoId && isOpen) {
      dispatch(getComments({ videoId, sort, limit: showAll ? 100 : 20, skip: 0 }));
    }
  }, [videoId, isOpen, sort, showAll, dispatch]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || newComment.length > 200) {
      toast({
        title: 'Invalid Comment',
        description: 'Comment must be between 1 and 200 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await dispatch(createComment({ 
        videoId, 
        text: newComment, 
        parentId: replyingTo 
      })).unwrap();

      setNewComment('');
      setReplyingTo(null);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      toast({
        title: 'Comment Posted!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      if (onCommentSubmitted) {
        onCommentSubmitted(result.comment);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to post comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like comment
  const handleLike = async (commentId) => {
    try {
      await dispatch(toggleLike(commentId)).unwrap();
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to like comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle report comment
  const handleReport = async (commentId) => {
    try {
      await dispatch(reportComment({ commentId, reason: 'inappropriate' })).unwrap();
      toast({
        title: 'Comment Reported',
        description: 'Thank you for reporting this comment',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to report comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      toast({
        title: 'Comment Deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error || 'Failed to delete comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle reply
  const handleReply = (comment) => {
    setReplyingTo(comment.id);
    inputRef.current?.focus();
  };

  // Handle copy comment
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Comment copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // Render comment item
  const renderComment = (comment) => {
    const isOwnComment = user && comment.user.id === user.id;
    const isLiked = comment.liked || false;
    const isPinned = pinnedComment && pinnedComment.id === comment.id;

    return (
      <Box key={comment.id} p={4} borderBottom="1px" borderColor={borderColor}>
        <HStack spacing={3} align="start">
          {/* Avatar */}
          <Avatar
            size="sm"
            src={comment.user.avatar}
            name={comment.user.displayName}
            cursor="pointer"
            onClick={() => {
              // Navigate to user profile
              window.location.href = `/profile/${comment.user.username}`;
            }}
          />

          {/* Comment Content */}
          <VStack flex="1" align="start" spacing={2}>
            {/* User Info & Pinned Badge */}
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="sm">
                {comment.user.displayName}
              </Text>
              {isPinned && (
                <Badge colorScheme="orange" size="sm">
                  <FaThumbtack size={8} /> Pinned
                </Badge>
              )}
              <Text fontSize="xs" color="gray.500">
                {timeAgo(comment.createdAt)}
              </Text>
            </HStack>

            {/* Comment Text */}
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {comment.text}
            </Text>

            {/* Actions */}
            <HStack spacing={4}>
              <Tooltip label={isLiked ? 'Unlike' : 'Like'}>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FaHeart color={isLiked ? 'red' : 'gray'} />}
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.likes}
                </Button>
              </Tooltip>

              {comment.replies > 0 && (
                <Tooltip label="Show Replies">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FaReply />}
                  >
                    {comment.replies}
                  </Button>
                </Tooltip>
              )}

              <Tooltip label="Reply">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReply(comment)}
                >
                  Reply
                </Button>
              </Tooltip>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaShare />}
                  size="sm"
                  variant="ghost"
                />
                <MenuList>
                  <MenuItem icon={<FaCopy />} onClick={() => handleCopy(comment.text)}>
                    Copy Comment
                  </MenuItem>
                  {isOwnComment ? (
                    <MenuItem
                      icon={<FaTrash />}
                      color="red"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete Comment
                    </MenuItem>
                  ) : (
                    <MenuItem
                      icon={<FaFlag />}
                      onClick={() => handleReport(comment.id)}
                    >
                      Report Comment
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent h="80vh" display="flex" flexDirection="column" bg={bg}>
        {/* Header */}
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">
              {totalCount.toLocaleString()} Comments {sort === 'top' && '🔥'}
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant={sort === 'top' ? 'solid' : 'ghost'}
                colorScheme="orange"
                onClick={() => setSort('top')}
              >
                Top
              </Button>
              <Button
                size="sm"
                variant={sort === 'newest' ? 'solid' : 'ghost'}
                colorScheme="orange"
                onClick={() => setSort('newest')}
              >
                Newest
              </Button>
            </HStack>
          </HStack>
        </ModalHeader>

        {/* Comments List */}
        <ModalBody flex="1" overflowY="auto" ref={scrollRef}>
          {loading ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner color="orange.500" />
            </Flex>
          ) : (
            <VStack spacing={0} align="stretch">
              {/* Pinned Comment */}
              {pinnedComment && (
                <Box
                  borderLeft="4px solid"
                  borderColor="orange.400"
                  bg="orange.50"
                  p={4}
                  mb={2}
                >
                  {renderComment(pinnedComment)}
                </Box>
              )}

              {/* Regular Comments */}
              {comments.map(renderComment)}

              {/* Load More */}
              {comments.length < totalCount && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAll(!showAll)}
                  width="full"
                >
                  {showAll ? 'Show Less' : `Show All ${totalCount} Comments`}
                </Button>
              )}
            </VStack>
          )}
        </ModalBody>

        {/* Reply Indicator */}
        {replyingTo && (
          <Box px={4} py={2} bg="orange.100" borderTop="1px" borderColor={borderColor}>
            <Text fontSize="sm" color="orange.600">
              Replying to comment...
            </Text>
          </Box>
        )}

        {/* Input */}
        <Box px={4} py={3} borderTop="1px" borderColor={borderColor}>
          <form onSubmit={handleSubmit}>
            <HStack spacing={2}>
              <Input
                ref={inputRef}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={200}
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                colorScheme="orange"
                isLoading={isSubmitting}
                isDisabled={!newComment.trim()}
              >
                Post
              </Button>
            </HStack>
            {newComment.length > 180 && (
              <Text fontSize="xs" color="red.500" mt={1}>
                {200 - newComment.length} characters left
              </Text>
            )}
          </form>
        </Box>

        <ModalCloseButton />
      </ModalContent>
    </Modal>
  );
};

export default CommentSheet;
