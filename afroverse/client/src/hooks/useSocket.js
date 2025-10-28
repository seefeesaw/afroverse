import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setSocketConnected } from '../store/slices/chatSlice';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectSocket = () => {
    if (socket?.connected) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot connect to socket');
      return;
    }

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      dispatch(setSocketConnected(true));
      reconnectAttemptsRef.current = 0;
      
      // Authenticate with the server
      newSocket.emit('authenticate', {
        userId: 'current-user-id', // You'll need to get this from Redux
        token,
      });
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    newSocket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to authenticate with chat server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      dispatch(setSocketConnected(false));
      
      // Attempt to reconnect if not a manual disconnect
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          connectSocket();
        }, delay);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      dispatch(setSocketConnected(false));
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      dispatch(setSocketConnected(false));
    }
  };

  // Connect on mount
  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
  };
};

export default useSocket;
export { useSocket };
