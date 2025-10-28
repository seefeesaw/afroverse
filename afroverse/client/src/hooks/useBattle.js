import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectBattle,
  selectCurrentBattle,
  selectActiveBattles,
  selectIsCreatingBattle,
  selectIsAcceptingBattle,
  selectIsVoting,
  selectHasVoted,
  selectUserVote,
  selectBattleError,
  selectShowBattleCreationModal,
  selectShowBattleAcceptanceModal,
  selectShowBattleResultModal,
  selectShowShareModal,
  selectBattleUpdates,
  createBattle,
  acceptBattle,
  getBattle,
  voteOnBattle,
  listActiveBattles,
  reportBattle,
  setChallengeMethod,
  setChallengeTarget,
  setChallengeMessage,
  setShowBattleCreationModal,
  setSelectedTransformForAcceptance,
  setShowBattleAcceptanceModal,
  setHasVoted,
  setUserVote,
  setShowBattleResultModal,
  setShowShareModal,
  updateBattleVotes,
  updateBattleStatus,
  updateBattleCompletion,
  clearError,
  setError,
  resetBattleState,
  clearBattleUpdates,
} from '../store/slices/battleSlice';
import battleService from '../services/battleService';
import { useChallenge } from './useChallenge';
import { useEvent } from './useEvent';

export const useBattle = () => {
  const dispatch = useDispatch();
  const { updateProgress } = useChallenge();
  const { updateClanWarScore } = useEvent();
  
  // Selectors
  const battle = useSelector(selectBattle);
  const currentBattle = useSelector(selectCurrentBattle);
  const activeBattles = useSelector(selectActiveBattles);
  const isCreatingBattle = useSelector(selectIsCreatingBattle);
  const isAcceptingBattle = useSelector(selectIsAcceptingBattle);
  const isVoting = useSelector(selectIsVoting);
  const hasVoted = useSelector(selectHasVoted);
  const userVote = useSelector(selectUserVote);
  const error = useSelector(selectBattleError);
  const showBattleCreationModal = useSelector(selectShowBattleCreationModal);
  const showBattleAcceptanceModal = useSelector(selectShowBattleAcceptanceModal);
  const showBattleResultModal = useSelector(selectShowBattleResultModal);
  const showShareModal = useSelector(selectShowShareModal);
  const battleUpdates = useSelector(selectBattleUpdates);

  // Action creators
  const handleCreateBattle = useCallback(async (transformId, challengeMethod, challengeTarget, message) => {
    try {
      const result = await dispatch(createBattle({
        transformId,
        challengeMethod,
        challengeTarget,
        message
      })).unwrap();
      
      // Update challenge progress for battle creation
      try {
        await updateProgress('battle_created', 1, {
          transformId,
          challengeMethod,
          challengeTarget,
          timestamp: new Date().toISOString(),
        });
      } catch (challengeError) {
        console.warn('Failed to update challenge progress:', challengeError);
      }
      
      // Update clan war score for battle creation
      try {
        await updateClanWarScore('battle_created', 1, {
          transformId,
          challengeMethod,
          challengeTarget,
          timestamp: new Date().toISOString(),
        });
      } catch (eventError) {
        console.warn('Failed to update clan war score:', eventError);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, updateProgress, updateClanWarScore]);

  const handleAcceptBattle = useCallback(async (battleId, transformId) => {
    try {
      const result = await dispatch(acceptBattle({
        battleId,
        transformId
      })).unwrap();
      
      // Update challenge progress for battle participation
      try {
        await updateProgress('battle_participated', 1, {
          battleId,
          timestamp: new Date().toISOString(),
        });
      } catch (challengeError) {
        console.warn('Failed to update challenge progress:', challengeError);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, updateProgress]);

  const handleGetBattle = useCallback(async (shortCode) => {
    try {
      const result = await dispatch(getBattle(shortCode)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleVoteOnBattle = useCallback(async (battleId, votedFor) => {
    try {
      const result = await dispatch(voteOnBattle({
        battleId,
        votedFor
      })).unwrap();
      
      // Update challenge progress for battle voting
      try {
        await updateProgress('battle_voted', 1, {
          battleId,
          votedFor,
          timestamp: new Date().toISOString(),
        });
      } catch (challengeError) {
        console.warn('Failed to update challenge progress:', challengeError);
      }
      
      // Update clan war score for battle voting
      try {
        await updateClanWarScore('battle_voted', 1, {
          battleId,
          votedFor,
          timestamp: new Date().toISOString(),
        });
      } catch (eventError) {
        console.warn('Failed to update clan war score:', eventError);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, updateProgress, updateClanWarScore]);

  const handleListActiveBattles = useCallback(async (cursor = null, limit = 10) => {
    try {
      const result = await dispatch(listActiveBattles({
        cursor,
        limit
      })).unwrap();
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleReportBattle = useCallback(async (battleId, reason, details) => {
    try {
      const result = await dispatch(reportBattle({
        battleId,
        reason,
        details
      })).unwrap();
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // UI state management
  const handleSetChallengeMethod = useCallback((method) => {
    dispatch(setChallengeMethod(method));
  }, [dispatch]);

  const handleSetChallengeTarget = useCallback((target) => {
    dispatch(setChallengeTarget(target));
  }, [dispatch]);

  const handleSetChallengeMessage = useCallback((message) => {
    dispatch(setChallengeMessage(message));
  }, [dispatch]);

  const handleSetShowBattleCreationModal = useCallback((show) => {
    dispatch(setShowBattleCreationModal(show));
  }, [dispatch]);

  const handleSetSelectedTransformForAcceptance = useCallback((transform) => {
    dispatch(setSelectedTransformForAcceptance(transform));
  }, [dispatch]);

  const handleSetShowBattleAcceptanceModal = useCallback((show) => {
    dispatch(setShowBattleAcceptanceModal(show));
  }, [dispatch]);

  const handleSetShowBattleResultModal = useCallback((show) => {
    dispatch(setShowBattleResultModal(show));
  }, [dispatch]);

  const handleSetShowShareModal = useCallback((show) => {
    dispatch(setShowShareModal(show));
  }, [dispatch]);

  // Error management
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSetError = useCallback((error) => {
    dispatch(setError(error));
  }, [dispatch]);

  // State management
  const handleResetBattleState = useCallback(() => {
    dispatch(resetBattleState());
  }, [dispatch]);

  const handleClearBattleUpdates = useCallback(() => {
    dispatch(clearBattleUpdates());
  }, [dispatch]);

  // Real-time updates
  const handleUpdateBattleVotes = useCallback((battleId, votes) => {
    dispatch(updateBattleVotes({ battleId, votes }));
  }, [dispatch]);

  const handleUpdateBattleStatus = useCallback((battleId, status, endsAt, defender) => {
    dispatch(updateBattleStatus({ battleId, status, endsAt, defender }));
  }, [dispatch]);

  const handleUpdateBattleCompletion = useCallback((battleId, result) => {
    dispatch(updateBattleCompletion({ battleId, result }));
  }, [dispatch]);

  // Utility functions
  const formatTimeRemaining = useCallback((milliseconds) => {
    return battleService.formatTimeRemaining(milliseconds);
  }, []);

  const calculateVotePercentage = useCallback((votes, choice) => {
    return battleService.calculateVotePercentage(votes, choice);
  }, []);

  const getBattleStatusColor = useCallback((status) => {
    return battleService.getBattleStatusColor(status);
  }, []);

  const getBattleStatusText = useCallback((status) => {
    return battleService.getBattleStatusText(status);
  }, []);

  const shareToSocial = useCallback((platform, battleUrl, battleText) => {
    battleService.shareToSocial(platform, battleUrl, battleText);
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await battleService.copyToClipboard(text);
    } catch (error) {
      throw error;
    }
  }, []);

  // Check if battle is active
  const isBattleActive = useCallback((battle) => {
    return battle && battle.status === 'active' && battle.timeRemaining > 0;
  }, []);

  // Check if battle is pending
  const isBattlePending = useCallback((battle) => {
    return battle && battle.status === 'pending';
  }, []);

  // Check if battle is completed
  const isBattleCompleted = useCallback((battle) => {
    return battle && battle.status === 'completed';
  }, []);

  // Check if battle is expired
  const isBattleExpired = useCallback((battle) => {
    return battle && battle.status === 'expired';
  }, []);

  // Get battle progress percentage
  const getBattleProgress = useCallback((battle) => {
    if (!battle || !battle.timeRemaining) return 0;
    
    const totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const remainingTime = battle.timeRemaining;
    const elapsedTime = totalTime - remainingTime;
    
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  }, []);

  // Load initial battle feed
  useEffect(() => {
    if (activeBattles.length === 0) {
      handleListActiveBattles();
    }
  }, [handleListActiveBattles, activeBattles.length]);

  return {
    // State
    battle,
    currentBattle,
    activeBattles,
    isCreatingBattle,
    isAcceptingBattle,
    isVoting,
    hasVoted,
    userVote,
    error,
    showBattleCreationModal,
    showBattleAcceptanceModal,
    showBattleResultModal,
    showShareModal,
    battleUpdates,
    
    // Actions
    createBattle: handleCreateBattle,
    acceptBattle: handleAcceptBattle,
    getBattle: handleGetBattle,
    voteOnBattle: handleVoteOnBattle,
    listActiveBattles: handleListActiveBattles,
    reportBattle: handleReportBattle,
    
    // UI state management
    setChallengeMethod: handleSetChallengeMethod,
    setChallengeTarget: handleSetChallengeTarget,
    setChallengeMessage: handleSetChallengeMessage,
    setShowBattleCreationModal: handleSetShowBattleCreationModal,
    setSelectedTransformForAcceptance: handleSetSelectedTransformForAcceptance,
    setShowBattleAcceptanceModal: handleSetShowBattleAcceptanceModal,
    setShowBattleResultModal: handleSetShowBattleResultModal,
    setShowShareModal: handleSetShowShareModal,
    
    // Error management
    clearError: handleClearError,
    setError: handleSetError,
    
    // State management
    resetBattleState: handleResetBattleState,
    clearBattleUpdates: handleClearBattleUpdates,
    
    // Real-time updates
    updateBattleVotes: handleUpdateBattleVotes,
    updateBattleStatus: handleUpdateBattleStatus,
    updateBattleCompletion: handleUpdateBattleCompletion,
    
    // Utilities
    formatTimeRemaining,
    calculateVotePercentage,
    getBattleStatusColor,
    getBattleStatusText,
    shareToSocial,
    copyToClipboard,
    isBattleActive,
    isBattlePending,
    isBattleCompleted,
    isBattleExpired,
    getBattleProgress,
  };
};
