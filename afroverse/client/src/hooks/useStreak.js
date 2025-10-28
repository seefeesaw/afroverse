import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProgression } from './useProgression';
import { useAuth } from './useAuth';

export const useStreak = () => {
  const { user } = useAuth();
  const { 
    getStreakStatus, 
    getQualifyingActionsStatus, 
    isStreakAtRisk, 
    getTimeUntilMidnight,
    getStreakEmoji,
    getMotivationalMessage,
    getAtRiskMessage,
    getQuickActionSuggestions,
    useFreezeAction,
    setShowStreakPanel,
    setShowFreezeModal
  } = useProgression();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get streak data
  const streak = getStreakStatus();
  const qualifyingActions = getQualifyingActionsStatus();
  const isAtRisk = isStreakAtRisk();
  const timeToMidnight = getTimeUntilMidnight();
  const streakEmoji = getStreakEmoji();
  const motivationalMessage = getMotivationalMessage();
  const atRiskMessage = getAtRiskMessage();
  const quickActionSuggestions = getQuickActionSuggestions();

  // Use freeze
  const useFreeze = useCallback(async (confirm = true) => {
    if (isLoading) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await useFreezeAction(confirm);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to use freeze');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [useFreezeAction, isLoading]);

  // Open streak panel
  const openStreakPanel = useCallback(() => {
    setShowStreakPanel(true);
  }, [setShowStreakPanel]);

  // Close streak panel
  const closeStreakPanel = useCallback(() => {
    setShowStreakPanel(false);
  }, [setShowStreakPanel]);

  // Open freeze modal
  const openFreezeModal = useCallback(() => {
    setShowFreezeModal(true);
  }, [setShowFreezeModal]);

  // Close freeze modal
  const closeFreezeModal = useCallback(() => {
    setShowFreezeModal(false);
  }, [setShowFreezeModal]);

  // Get streak display text
  const getStreakDisplayText = useCallback(() => {
    const current = streak.current;
    
    if (current === 0) {
      return 'Start your streak!';
    } else if (current === 1) {
      return '1 day streak';
    } else {
      return `${current} day streak`;
    }
  }, [streak.current]);

  // Get streak status text
  const getStreakStatusText = useCallback(() => {
    if (streak.safeToday) {
      return 'You\'re safe today! ✅';
    } else {
      return atRiskMessage;
    }
  }, [streak.safeToday, atRiskMessage]);

  // Get streak color
  const getStreakColor = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'text-purple-400';
    if (current >= 100) return 'text-blue-400';
    if (current >= 30) return 'text-yellow-400';
    if (current >= 7) return 'text-gray-300';
    if (current >= 3) return 'text-orange-400';
    return 'text-red-400';
  }, [streak.current]);

  // Get streak background color
  const getStreakBackgroundColor = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'bg-purple-500/20';
    if (current >= 100) return 'bg-blue-500/20';
    if (current >= 30) return 'bg-yellow-500/20';
    if (current >= 7) return 'bg-gray-500/20';
    if (current >= 3) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  }, [streak.current]);

  // Get streak border color
  const getStreakBorderColor = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'border-purple-400';
    if (current >= 100) return 'border-blue-400';
    if (current >= 30) return 'border-yellow-400';
    if (current >= 7) return 'border-gray-400';
    if (current >= 3) return 'border-orange-400';
    return 'border-red-400';
  }, [streak.current]);

  // Get streak glow effect
  const getStreakGlowEffect = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'shadow-purple-400/50';
    if (current >= 100) return 'shadow-blue-400/50';
    if (current >= 30) return 'shadow-yellow-400/50';
    if (current >= 7) return 'shadow-gray-400/50';
    if (current >= 3) return 'shadow-orange-400/50';
    return 'shadow-red-400/50';
  }, [streak.current]);

  // Get streak pulse effect
  const getStreakPulseEffect = useCallback(() => {
    if (isAtRisk) {
      return 'animate-pulse';
    } else if (streak.safeToday) {
      return 'animate-pulse';
    }
    return '';
  }, [isAtRisk, streak.safeToday]);

  // Get streak size
  const getStreakSize = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'text-3xl';
    if (current >= 100) return 'text-2xl';
    if (current >= 30) return 'text-xl';
    if (current >= 7) return 'text-lg';
    return 'text-base';
  }, [streak.current]);

  // Get streak weight
  const getStreakWeight = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 'font-black';
    if (current >= 100) return 'font-bold';
    if (current >= 30) return 'font-semibold';
    if (current >= 7) return 'font-medium';
    return 'font-normal';
  }, [streak.current]);

  // Get streak animation
  const getStreakAnimation = useCallback(() => {
    if (isAtRisk) {
      return 'animate-bounce';
    } else if (streak.safeToday) {
      return 'animate-pulse';
    }
    return '';
  }, [isAtRisk, streak.safeToday]);

  // Get streak tooltip
  const getStreakTooltip = useCallback(() => {
    if (streak.safeToday) {
      return `Your ${streak.current} day streak is safe today!`;
    } else {
      return `Don't lose your ${streak.current} day streak! Complete any action today.`;
    }
  }, [streak.current, streak.safeToday]);

  // Get streak progress
  const getStreakProgress = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return 100;
    if (current >= 100) return (current / 365) * 100;
    if (current >= 30) return (current / 100) * 100;
    if (current >= 7) return (current / 30) * 100;
    if (current >= 3) return (current / 7) * 100;
    return (current / 3) * 100;
  }, [streak.current]);

  // Get streak milestone
  const getStreakMilestone = useCallback(() => {
    const current = streak.current;
    
    if (current >= 365) return { name: 'Mythic', threshold: 365, emoji: '🏆' };
    if (current >= 100) return { name: 'Diamond', threshold: 100, emoji: '💎' };
    if (current >= 30) return { name: 'Gold', threshold: 30, emoji: '🥇' };
    if (current >= 7) return { name: 'Silver', threshold: 7, emoji: '🥈' };
    if (current >= 3) return { name: 'Bronze', threshold: 3, emoji: '🥉' };
    return { name: 'Starter', threshold: 1, emoji: '🔥' };
  }, [streak.current]);

  // Get streak next milestone
  const getStreakNextMilestone = useCallback(() => {
    const current = streak.current;
    
    if (current < 3) return { name: 'Bronze', threshold: 3, emoji: '🥉', remaining: 3 - current };
    if (current < 7) return { name: 'Silver', threshold: 7, emoji: '🥈', remaining: 7 - current };
    if (current < 30) return { name: 'Gold', threshold: 30, emoji: '🥇', remaining: 30 - current };
    if (current < 100) return { name: 'Diamond', threshold: 100, emoji: '💎', remaining: 100 - current };
    if (current < 365) return { name: 'Mythic', threshold: 365, emoji: '🏆', remaining: 365 - current };
    return null;
  }, [streak.current]);

  // Get streak stats
  const getStreakStats = useCallback(() => {
    return {
      current: streak.current,
      longest: streak.longest,
      safeToday: streak.safeToday,
      timeToMidnight,
      freezeAvailable: streak.freeze.available,
      isAtRisk,
      progress: getStreakProgress(),
      milestone: getStreakMilestone(),
      nextMilestone: getStreakNextMilestone()
    };
  }, [streak, timeToMidnight, isAtRisk, getStreakProgress, getStreakMilestone, getStreakNextMilestone]);

  // Get streak actions
  const getStreakActions = useCallback(() => {
    return {
      openStreakPanel,
      closeStreakPanel,
      openFreezeModal,
      closeFreezeModal,
      useFreeze
    };
  }, [openStreakPanel, closeStreakPanel, openFreezeModal, closeFreezeModal, useFreeze]);

  // Get streak display
  const getStreakDisplay = useCallback(() => {
    return {
      text: getStreakDisplayText(),
      statusText: getStreakStatusText(),
      emoji: streakEmoji,
      color: getStreakColor(),
      backgroundColor: getStreakBackgroundColor(),
      borderColor: getStreakBorderColor(),
      glowEffect: getStreakGlowEffect(),
      pulseEffect: getStreakPulseEffect(),
      size: getStreakSize(),
      weight: getStreakWeight(),
      animation: getStreakAnimation(),
      tooltip: getStreakTooltip()
    };
  }, [
    getStreakDisplayText,
    getStreakStatusText,
    streakEmoji,
    getStreakColor,
    getStreakBackgroundColor,
    getStreakBorderColor,
    getStreakGlowEffect,
    getStreakPulseEffect,
    getStreakSize,
    getStreakWeight,
    getStreakAnimation,
    getStreakTooltip
  ]);

  return {
    // State
    streak,
    qualifyingActions,
    isAtRisk,
    timeToMidnight,
    isLoading,
    error,
    
    // Actions
    useFreeze,
    openStreakPanel,
    closeStreakPanel,
    openFreezeModal,
    closeFreezeModal,
    
    // Getters
    getStreakStats,
    getStreakActions,
    getStreakDisplay,
    getMotivationalMessage,
    getAtRiskMessage,
    getQuickActionSuggestions
  };
};

export default useStreak;
