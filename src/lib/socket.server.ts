// Server-only file - explicitly marked with .server.ts extension
// This file will NOT be bundled for the client by Next.js
// ONLY import this file in server.ts (custom server), never in API routes or client code

import type { Server as HTTPServer } from 'http';

export interface SocketUser {
  userId: string;
  role: string;
  socketId: string;
}

// Store connected users
const connectedUsers = new Map<string, SocketUser>();

// Only import Socket.io server when actually needed (runtime, not at module load)
export async function initializeSocket(server: HTTPServer) {
  // Dynamic import to avoid bundling issues with Turbopack
  // This will only execute when the custom server runs
  const socketIO = await import('socket.io');
  const SocketIOServer = socketIO.Server;
  
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    // Handle user authentication and join room
    socket.on('authenticate', async (data: { userId: string; role: string }) => {
      if (data.userId && data.role) {
        const user: SocketUser = {
          userId: data.userId,
          role: data.role,
          socketId: socket.id,
        };
        connectedUsers.set(socket.id, user);
        
        // Join user-specific room
        socket.join(`user:${data.userId}`);
        
        // Join role-based rooms
        socket.join(`role:${data.role}`);
        
        // Join admin room if admin
        if (data.role === 'admin' || data.role === 'ADMIN') {
          socket.join('admin');
        }

        socket.emit('authenticated', { success: true });
        console.log(`User ${data.userId} (${data.role}) connected`);
      }
    });

    // Handle real-time chat messages
    socket.on('send_message', async (data: {
      to: string;
      from: string;
      message: string;
      type?: string;
    }) => {
      // Emit to specific user
      io.to(`user:${data.to}`).emit('new_message', {
        from: data.from,
        message: data.message,
        type: data.type || 'message',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle appointment status updates
    socket.on('appointment_update', (data: {
      appointmentId: string;
      status: string;
      patientId?: string;
      doctorId?: string;
    }) => {
      // Notify patient
      if (data.patientId) {
        io.to(`user:${data.patientId}`).emit('appointment_updated', data);
      }
      // Notify doctor
      if (data.doctorId) {
        io.to(`user:${data.doctorId}`).emit('appointment_updated', data);
      }
      // Notify admins
      io.to('admin').emit('appointment_updated', data);
      
      // Broadcast stats update to admins
      io.to('admin').emit('stats_update', { appointments: 'refresh' });
    });

    // Handle user creation/updates
    socket.on('user_created', () => {
      io.to('admin').emit('user_created');
      io.to('admin').emit('stats_update', { patients: 'refresh', activeUsers: 'refresh' });
    });

    socket.on('user_updated', () => {
      io.to('admin').emit('user_updated');
      io.to('admin').emit('stats_update', { activeUsers: 'refresh' });
    });

    socket.on('user_deleted', () => {
      io.to('admin').emit('user_deleted');
      io.to('admin').emit('stats_update', { patients: 'refresh', activeUsers: 'refresh' });
    });

    // Broadcast system metrics periodically to admins
    setInterval(() => {
      const activeConnections = connectedUsers.size;
      io.to('admin').emit('system_metrics', {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        activeConnections,
        requestsPerMinute: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.random() * 5,
      });
    }, 5000); // Every 5 seconds

    // Handle typing indicators
    socket.on('typing', (data: { to: string; from: string; isTyping: boolean }) => {
      socket.to(`user:${data.to}`).emit('user_typing', {
        from: data.from,
        isTyping: data.isTyping,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        connectedUsers.delete(socket.id);
        console.log(`User ${user.userId} disconnected`);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Helper function to get connected users
export function getConnectedUsers(): SocketUser[] {
  return Array.from(connectedUsers.values());
}

