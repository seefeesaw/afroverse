import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCurrentEvent,
  fetchUpcomingEvent,
  fetchClanWarStandings,
  fetchPowerHourStatus,
  updateClanWarScore,
  fetchUserEventStats,
  fetchUserEventHistory,
  fetchEventLeaderboard,
  fetchTribeWarStatus,
} from '../store/slices/eventSlice';
import { useCallback } from 'react';

const useEvent = () => {
  const dispatch = useDispatch();
  const {
    currentEvent,
    upcomingEvent,
    clanWarStandings,
    powerHourStatus,
    userTribeWar,
    eventStats,
    eventHistory,
    eventLeaderboard,
    status,
    error,
  } = useSelector((state) => state.event);

  const getCurrentEvent = useCallback(() => {
    return dispatch(fetchCurrentEvent()).unwrap();
  }, [dispatch]);

  const getUpcomingEvent = useCallback(() => {
    return dispatch(fetchUpcomingEvent()).unwrap();
  }, [dispatch]);

  const getClanWarStandings = useCallback(() => {
    return dispatch(fetchClanWarStandings()).unwrap();
  }, [dispatch]);

  const getPowerHourStatus = useCallback(() => {
    return dispatch(fetchPowerHourStatus()).unwrap();
  }, [dispatch]);

  const updateClanWarScoreAction = useCallback((activityType, value = 1, metadata = {}) => {
    return dispatch(updateClanWarScore({ activityType, value, metadata })).unwrap();
  }, [dispatch]);

  const getEventStats = useCallback(() => {
    return dispatch(fetchUserEventStats()).unwrap();
  }, [dispatch]);

  const getEventHistory = useCallback((limit = 50, offset = 0) => {
    return dispatch(fetchUserEventHistory({ limit, offset })).unwrap();
  }, [dispatch]);

  const getEventLeaderboard = useCallback((eventType = 'clan_war', limit = 50) => {
    return dispatch(fetchEventLeaderboard({ eventType, limit })).unwrap();
  }, [dispatch]);

  const getTribeWarStatus = useCallback(() => {
    return dispatch(fetchTribeWarStatus()).unwrap();
  }, [dispatch]);

  return {
    currentEvent,
    upcomingEvent,
    clanWarStandings,
    powerHourStatus,
    userTribeWar,
    eventStats,
    eventHistory,
    eventLeaderboard,
    status,
    error,
    getCurrentEvent,
    getUpcomingEvent,
    getClanWarStandings,
    getPowerHourStatus,
    updateClanWarScore: updateClanWarScoreAction,
    getEventStats,
    getEventHistory,
    getEventLeaderboard,
    getTribeWarStatus,
  };
};

export default useEvent;
export { useEvent };
