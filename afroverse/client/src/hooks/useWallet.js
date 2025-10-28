import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  getWallet,
  earnCoins,
  spendCoins,
  purchaseCoins,
  getTransactionHistory,
  getEarningOpportunities,
  getSpendingOptions,
  getCoinPacks,
  checkAction,
  saveStreak,
  battleBoost,
  priorityTransformation,
  retryTransformation,
  tribeSupport,
  clearError,
  showRewardPopup,
  hideRewardPopup,
  showSpendModal,
  hideSpendModal,
  showCoinStore,
  hideCoinStore,
  showEarnMore,
  hideEarnMore,
  updateBalance,
  addTransaction,
  resetWallet
} from '../store/slices/walletSlice';
import walletService from '../services/walletService';

export const useWallet = () => {
  const dispatch = useDispatch();
  const walletState = useSelector((state) => state.wallet);

  // Load wallet data on mount
  useEffect(() => {
    if (walletState.balance === 0 && !walletState.isLoading) {
      dispatch(getWallet());
    }
  }, [dispatch, walletState.balance, walletState.isLoading]);

  // Wallet operations
  const loadWallet = useCallback(async () => {
    try {
      const result = await dispatch(getWallet()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const earnCoinsAction = useCallback(async (reason, metadata, amount) => {
    try {
      const result = await dispatch(earnCoins({ reason, metadata, amount })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const spendCoinsAction = useCallback(async (reason, metadata, amount) => {
    try {
      const result = await dispatch(spendCoins({ reason, metadata, amount })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const purchaseCoinsAction = useCallback(async (packType, paymentId) => {
    try {
      const result = await dispatch(purchaseCoins({ packType, paymentId })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadTransactionHistory = useCallback(async (options) => {
    try {
      const result = await dispatch(getTransactionHistory(options)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadEarningOpportunities = useCallback(async () => {
    try {
      const result = await dispatch(getEarningOpportunities()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadSpendingOptions = useCallback(async () => {
    try {
      const result = await dispatch(getSpendingOptions()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const loadCoinPacks = useCallback(async () => {
    try {
      const result = await dispatch(getCoinPacks()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const checkActionAvailability = useCallback(async (action) => {
    try {
      const result = await dispatch(checkAction(action)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Specific actions
  const saveStreakAction = useCallback(async (reason) => {
    try {
      const result = await dispatch(saveStreak(reason)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const battleBoostAction = useCallback(async (battleId) => {
    try {
      const result = await dispatch(battleBoost(battleId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const priorityTransformationAction = useCallback(async (transformationId) => {
    try {
      const result = await dispatch(priorityTransformation(transformationId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const retryTransformationAction = useCallback(async (transformationId) => {
    try {
      const result = await dispatch(retryTransformation(transformationId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const tribeSupportAction = useCallback(async (tribeId) => {
    try {
      const result = await dispatch(tribeSupport(tribeId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // UI actions
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const showRewardPopupAction = useCallback((data) => {
    dispatch(showRewardPopup(data));
  }, [dispatch]);

  const hideRewardPopupAction = useCallback(() => {
    dispatch(hideRewardPopup());
  }, [dispatch]);

  const showSpendModalAction = useCallback((data) => {
    dispatch(showSpendModal(data));
  }, [dispatch]);

  const hideSpendModalAction = useCallback(() => {
    dispatch(hideSpendModal());
  }, [dispatch]);

  const showCoinStoreAction = useCallback(() => {
    dispatch(showCoinStore());
  }, [dispatch]);

  const hideCoinStoreAction = useCallback(() => {
    dispatch(hideCoinStore());
  }, [dispatch]);

  const showEarnMoreAction = useCallback(() => {
    dispatch(showEarnMore());
  }, [dispatch]);

  const hideEarnMoreAction = useCallback(() => {
    dispatch(hideEarnMore());
  }, [dispatch]);

  const updateBalanceAction = useCallback((balance) => {
    dispatch(updateBalance(balance));
  }, [dispatch]);

  const addTransactionAction = useCallback((transaction) => {
    dispatch(addTransaction(transaction));
  }, [dispatch]);

  const resetWalletAction = useCallback(() => {
    dispatch(resetWallet());
  }, [dispatch]);

  // Convenience methods for earning coins
  const earnDailyCheckin = useCallback(async () => {
    return earnCoinsAction('daily_checkin');
  }, [earnCoinsAction]);

  const earnStreakBonus = useCallback(async (dayCount) => {
    const reason = `streak_maintain_${dayCount}`;
    return earnCoinsAction(reason);
  }, [earnCoinsAction]);

  const earnBattleWin = useCallback(async () => {
    return earnCoinsAction('battle_win');
  }, [earnCoinsAction]);

  const earnBattleParticipation = useCallback(async () => {
    return earnCoinsAction('battle_participation');
  }, [earnCoinsAction]);

  const earnVoteMilestone = useCallback(async () => {
    return earnCoinsAction('vote_10_battles');
  }, [earnCoinsAction]);

  const earnShareTransformation = useCallback(async () => {
    return earnCoinsAction('share_transformation');
  }, [earnCoinsAction]);

  const earnReferralJoin = useCallback(async () => {
    return earnCoinsAction('referral_join');
  }, [earnCoinsAction]);

  const earnTribeWin = useCallback(async () => {
    return earnCoinsAction('tribe_win');
  }, [earnCoinsAction]);

  const earnLevelUp = useCallback(async () => {
    return earnCoinsAction('level_up');
  }, [earnCoinsAction]);

  const earnAchievementUnlock = useCallback(async () => {
    return earnCoinsAction('achievement_unlock');
  }, [earnCoinsAction]);

  const earnFirstTransformation = useCallback(async () => {
    return earnCoinsAction('first_transformation');
  }, [earnCoinsAction]);

  const earnFirstBattle = useCallback(async () => {
    return earnCoinsAction('first_battle');
  }, [earnCoinsAction]);

  const earnWeeklyChallenge = useCallback(async () => {
    return earnCoinsAction('weekly_challenge');
  }, [earnCoinsAction]);

  const earnMonthlyChallenge = useCallback(async () => {
    return earnCoinsAction('monthly_challenge');
  }, [earnCoinsAction]);

  // Convenience methods for spending coins
  const spendStreakSave = useCallback(async (reason) => {
    return spendCoinsAction('streak_save', { reason });
  }, [spendCoinsAction]);

  const spendBattleBoost = useCallback(async (battleId) => {
    return spendCoinsAction('battle_boost', { battleId });
  }, [spendCoinsAction]);

  const spendPriorityTransformation = useCallback(async (transformationId) => {
    return spendCoinsAction('priority_transformation', { transformationId });
  }, [spendCoinsAction]);

  const spendRetryTransformation = useCallback(async (transformationId) => {
    return spendCoinsAction('retry_transformation', { transformationId });
  }, [spendCoinsAction]);

  const spendPremiumFilter = useCallback(async () => {
    return spendCoinsAction('premium_filter');
  }, [spendCoinsAction]);

  const spendTribeSupport = useCallback(async (tribeId) => {
    return spendCoinsAction('tribe_support', { tribeId });
  }, [spendCoinsAction]);

  const spendRematchBattle = useCallback(async (battleId) => {
    return spendCoinsAction('rematch_battle', { battleId });
  }, [spendCoinsAction]);

  const spendSkipAd = useCallback(async () => {
    return spendCoinsAction('skip_ad');
  }, [spendCoinsAction]);

  const spendUnlockStyle = useCallback(async (styleId) => {
    return spendCoinsAction('unlock_style', { styleId });
  }, [spendCoinsAction]);

  // Utility methods
  const canAfford = useCallback((cost) => {
    return walletState.balance >= cost;
  }, [walletState.balance]);

  const getSpendingCost = useCallback((action) => {
    const costs = {
      streak_save: 30,
      battle_boost: 25,
      priority_transformation: 20,
      retry_transformation: 15,
      premium_filter: 50,
      tribe_support: 40,
      rematch_battle: 20,
      skip_ad: 10,
      unlock_style: 30,
    };
    return costs[action] || 0;
  }, []);

  const canPerformAction = useCallback((action) => {
    const cost = getSpendingCost(action);
    return cost === 0 || canAfford(cost);
  }, [canAfford, getSpendingCost]);

  return {
    // State
    ...walletState,
    
    // Wallet operations
    loadWallet,
    earnCoins: earnCoinsAction,
    spendCoins: spendCoinsAction,
    purchaseCoins: purchaseCoinsAction,
    loadTransactionHistory,
    loadEarningOpportunities,
    loadSpendingOptions,
    loadCoinPacks,
    checkActionAvailability,
    
    // Specific actions
    saveStreak: saveStreakAction,
    battleBoost: battleBoostAction,
    priorityTransformation: priorityTransformationAction,
    retryTransformation: retryTransformationAction,
    tribeSupport: tribeSupportAction,
    
    // UI actions
    clearError: clearErrorAction,
    showRewardPopup: showRewardPopupAction,
    hideRewardPopup: hideRewardPopupAction,
    showSpendModal: showSpendModalAction,
    hideSpendModal: hideSpendModalAction,
    showCoinStore: showCoinStoreAction,
    hideCoinStore: hideCoinStoreAction,
    showEarnMore: showEarnMoreAction,
    hideEarnMore: hideEarnMoreAction,
    updateBalance: updateBalanceAction,
    addTransaction: addTransactionAction,
    resetWallet: resetWalletAction,
    
    // Convenience earning methods
    earnDailyCheckin,
    earnStreakBonus,
    earnBattleWin,
    earnBattleParticipation,
    earnVoteMilestone,
    earnShareTransformation,
    earnReferralJoin,
    earnTribeWin,
    earnLevelUp,
    earnAchievementUnlock,
    earnFirstTransformation,
    earnFirstBattle,
    earnWeeklyChallenge,
    earnMonthlyChallenge,
    
    // Convenience spending methods
    spendStreakSave,
    spendBattleBoost,
    spendPriorityTransformation,
    spendRetryTransformation,
    spendPremiumFilter,
    spendTribeSupport,
    spendRematchBattle,
    spendSkipAd,
    spendUnlockStyle,
    
    // Utility methods
    canAfford,
    getSpendingCost,
    canPerformAction
  };
};
