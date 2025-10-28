import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { updateRankRealtime, enableRealTimeUpdates, disableRealTimeUpdates } from '../store/slices/leaderboardSlice';
import { useAuth } from './useAuth';

export const useLbSocket = () => {
  const dispatch = useDispatch();
  const { user, token } = useAuth();
  const leaderboardState = useSelector(state => state.leaderboard);
  
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Connect to socket
  const connect = useCallback(() => {
    if (!user || !token || isConnectedRef.current) return;

    try {
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to leaderboard socket');
        isConnectedRef.current = true;
        dispatch(enableRealTimeUpdates());
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from leaderboard socket');
        isConnectedRef.current = false;
        dispatch(disableRealTimeUpdates());
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        isConnectedRef.current = false;
        dispatch(disableRealTimeUpdates());
      });

      // Listen for leaderboard updates
      socketRef.current.on('lb_delta', (data) => {
        console.log('Received leaderboard update:', data);
        dispatch(updateRankRealtime(data));
      });

      // Listen for leaderboard reset
      socketRef.current.on('lb_reset', (data) => {
        console.log('Received leaderboard reset:', data);
        // Handle reset - could refresh data or show notification
      });

    } catch (error) {
      console.error('Failed to connect to socket:', error);
    }
  }, [user, token, dispatch]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
      dispatch(disableRealTimeUpdates());
    }
  }, [dispatch]);

  // Join leaderboard room
  const joinLeaderboard = useCallback((scope, period, country = null) => {
    if (!socketRef.current || !isConnectedRef.current) return;

    try {
      socketRef.current.emit('join-leaderboard', {
        scope,
        period,
        country
      });
      console.log(`Joined leaderboard room: ${scope}-${period}${country ? `-${country}` : ''}`);
    } catch (error) {
      console.error('Failed to join leaderboard room:', error);
    }
  }, []);

  // Leave leaderboard room
  const leaveLeaderboard = useCallback((scope, period, country = null) => {
    if (!socketRef.current || !isConnectedRef.current) return;

    try {
      socketRef.current.emit('leave-leaderboard', {
        scope,
        period,
        country
      });
      console.log(`Left leaderboard room: ${scope}-${period}${country ? `-${country}` : ''}`);
    } catch (error) {
      console.error('Failed to leave leaderboard room:', error);
    }
  }, []);

  // Auto-join current leaderboard room
  const autoJoinCurrentRoom = useCallback(() => {
    const { activeTab, activePeriod, selectedCountry } = leaderboardState;
    
    if (activeTab === 'tribes') {
      joinLeaderboard('tribes', activePeriod);
    } else if (activeTab === 'users') {
      joinLeaderboard('users', activePeriod, selectedCountry);
    } else if (activeTab === 'country') {
      joinLeaderboard('users', activePeriod, selectedCountry);
    }
  }, [leaderboardState, joinLeaderboard]);

  // Auto-leave current leaderboard room
  const autoLeaveCurrentRoom = useCallback(() => {
    const { activeTab, activePeriod, selectedCountry } = leaderboardState;
    
    if (activeTab === 'tribes') {
      leaveLeaderboard('tribes', activePeriod);
    } else if (activeTab === 'users') {
      leaveLeaderboard('users', activePeriod, selectedCountry);
    } else if (activeTab === 'country') {
      leaveLeaderboard('users', activePeriod, selectedCountry);
    }
  }, [leaderboardState, leaveLeaderboard]);

  // Connect on mount
  useEffect(() => {
    if (user && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Auto-join/leave rooms when leaderboard state changes
  useEffect(() => {
    if (isConnectedRef.current) {
      autoLeaveCurrentRoom();
      autoJoinCurrentRoom();
    }
  }, [leaderboardState.activeTab, leaderboardState.activePeriod, leaderboardState.selectedCountry, autoLeaveCurrentRoom, autoJoinCurrentRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected: isConnectedRef.current,
    realTimeEnabled: leaderboardState.realTimeUpdates.enabled,
    
    // Actions
    connect,
    disconnect,
    joinLeaderboard,
    leaveLeaderboard,
    
    // Auto actions
    autoJoinCurrentRoom,
    autoLeaveCurrentRoom
  };
};

export default useLbSocket;
