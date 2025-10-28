import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDailyChallenge,
  fetchWeeklyChallenge,
  updateChallengeProgress,
  completeChallenge,
  fetchChallengeStats,
  fetchChallengeHistory,
  fetchChallengeLeaderboard,
  fetchTribeWeeklyChallenge,
} from '../store/slices/challengeSlice';
import { useCallback } from 'react';

const useChallenge = () => {
  const dispatch = useDispatch();
  const {
    dailyChallenge,
    weeklyChallenge,
    challengeStats,
    challengeHistory,
    challengeLeaderboard,
    tribeWeeklyChallenge,
    status,
    error,
  } = useSelector((state) => state.challenge);

  const getDailyChallenge = useCallback(() => {
    return dispatch(fetchDailyChallenge()).unwrap();
  }, [dispatch]);

  const getWeeklyChallenge = useCallback(() => {
    return dispatch(fetchWeeklyChallenge()).unwrap();
  }, [dispatch]);

  const updateProgress = useCallback((activityType, value = 1, metadata = {}) => {
    return dispatch(updateChallengeProgress({ activityType, value, metadata })).unwrap();
  }, [dispatch]);

  const completeChallengeAction = useCallback((userChallengeId, challengeType) => {
    return dispatch(completeChallenge({ userChallengeId, challengeType })).unwrap();
  }, [dispatch]);

  const getChallengeStats = useCallback(() => {
    return dispatch(fetchChallengeStats()).unwrap();
  }, [dispatch]);

  const getChallengeHistory = useCallback((limit = 50, offset = 0) => {
    return dispatch(fetchChallengeHistory({ limit, offset })).unwrap();
  }, [dispatch]);

  const getChallengeLeaderboard = useCallback((type = 'daily', period = 'week') => {
    return dispatch(fetchChallengeLeaderboard({ type, period })).unwrap();
  }, [dispatch]);

  const getTribeWeeklyChallenge = useCallback(() => {
    return dispatch(fetchTribeWeeklyChallenge()).unwrap();
  }, [dispatch]);

  return {
    dailyChallenge,
    weeklyChallenge,
    challengeStats,
    challengeHistory,
    challengeLeaderboard,
    tribeWeeklyChallenge,
    status,
    error,
    getDailyChallenge,
    getWeeklyChallenge,
    updateProgress,
    completeChallenge: completeChallengeAction,
    getChallengeStats,
    getChallengeHistory,
    getChallengeLeaderboard,
    getTribeWeeklyChallenge,
  };
};

export default useChallenge;
export { useChallenge };
