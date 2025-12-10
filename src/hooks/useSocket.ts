'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (to: string, message: string, type?: string) => void;
  sendNotification: (userId: string, notification: any) => void;
}

// Track connection attempts to prevent spam
let connectionAttempts = 0;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 10000; // 10 seconds

export function useSocket(): UseSocketReturn {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Check if we should attempt connection
    const shouldConnect = process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'false';
    if (!shouldConnect) {
      return;
    }

    // Throttle connection attempts
    const now = Date.now();
    if (now - lastConnectionAttempt < CONNECTION_COOLDOWN && connectionAttempts > 3) {
      // Too many failed attempts, wait longer
      return;
    }
    lastConnectionAttempt = now;

    // Initialize socket connection
    const socketUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const newSocket = io(socketUrl, {
      path: '/api/socket',
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 2, // Only 2 attempts to avoid spam
      autoConnect: true,
      timeout: 3000, // 3 second timeout
      forceNew: false,
      // Suppress default error logging
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    let hasLoggedError = false;

    // Connection handlers
    newSocket.on('connect', () => {
      connectionAttempts = 0; // Reset on successful connection
      hasLoggedError = false;
      setIsConnected(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Real-time features connected successfully!');
      }
      
      // Authenticate with user info
      newSocket.emit('authenticate', {
        userId: session.user.id,
        role: (session.user as any).role || 'PATIENT',
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('authenticated', () => {
      // Silent success
    });

    newSocket.on('connect_error', (error) => {
      connectionAttempts++;
      setIsConnected(false);
      
      // Only log once per session to avoid spam
      if (!hasLoggedError && connectionAttempts <= 1) {
        // Show helpful message in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Real-time features not available. To enable real-time:');
          console.warn('   1. Stop current server (Ctrl+C)');
          console.warn('   2. Run: npm run dev:server');
          console.warn('   3. Refresh the page');
        }
        hasLoggedError = true;
      }
      
      // Disable reconnection after multiple failures
      if (connectionAttempts > 2) {
        newSocket.io.opts.reconnection = false;
        newSocket.disconnect();
      }
    });

    newSocket.on('connect_timeout', () => {
      connectionAttempts++;
      setIsConnected(false);
      
      // Disable reconnection after timeout
      if (connectionAttempts > 2) {
        newSocket.io.opts.reconnection = false;
        newSocket.disconnect();
      }
    });

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (newSocket) {
        newSocket.io.opts.reconnection = false;
        newSocket.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user?.id]);

  const sendMessage = (to: string, message: string, type: string = 'message') => {
    if (socket && session?.user?.id) {
      socket.emit('send_message', {
        to,
        from: session.user.id,
        message,
        type,
      });
    }
  };

  const sendNotification = (userId: string, notification: any) => {
    if (socket) {
      socket.emit('notification', {
        userId,
        ...notification,
      });
    }
  };

  return {
    socket,
    isConnected,
    sendMessage,
    sendNotification,
  };
}

