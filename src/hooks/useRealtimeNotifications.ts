'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from './useSocket';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  timestamp: string;
  read?: boolean;
}

export function useRealtimeNotifications() {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
        action: notification.link
          ? {
              label: 'View',
              onClick: () => {
                window.location.href = notification.link!;
              },
            }
          : undefined,
      });
    });

    // Listen for appointment updates
    socket.on('appointment_updated', (data: {
      appointmentId: string;
      status: string;
      patientId?: string;
      doctorId?: string;
    }) => {
      const statusMessages: Record<string, string> = {
        CONFIRMED: 'Your appointment has been confirmed',
        CANCELLED: 'Your appointment has been cancelled',
        COMPLETED: 'Your appointment has been completed',
        RESCHEDULED: 'Your appointment has been rescheduled',
      };

      const message = statusMessages[data.status] || 'Your appointment status has been updated';
      
      toast.success('Appointment Update', {
        description: message,
      });

      // Add to notifications
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'Appointment Update',
          message,
          type: 'appointment',
          link: `/dashboard/appointments`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for new messages
    socket.on('new_message', (data: {
      from: string;
      message: string;
      type?: string;
      timestamp: string;
    }) => {
      toast.info('New Message', {
        description: data.message,
      });

      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'New Message',
          message: data.message,
          type: 'message',
          link: '/dashboard/messages',
          timestamp: data.timestamp,
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { from: string; isTyping: boolean }) => {
      // Handle typing indicator (can be used in chat components)
      console.log('User typing:', data);
    });

    return () => {
      socket.off('notification');
      socket.off('appointment_updated');
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, isConnected]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected,
  };
}




