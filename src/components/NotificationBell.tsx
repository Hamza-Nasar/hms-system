"use client";

import React, { useEffect, useState } from "react";
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    ListItemText,
    ListItemIcon,
    Chip,
    CircularProgress,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    CheckCircle,
    Cancel,
    Info,
    Warning,
    MarkEmailRead,
    ClearAll,
} from "@mui/icons-material";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { notifications: realtimeNotifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useRealtimeNotifications();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Merge real-time notifications with database notifications
        setNotifications(realtimeNotifications);
    }, [realtimeNotifications]);

    useEffect(() => {
        // Fetch notifications from API
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/notifications?limit=20");
                if (response.ok) {
                    const data = await response.json();
                    setNotifications((prev) => {
                        // Merge and deduplicate
                        const merged = [...data, ...prev];
                        const unique = merged.filter(
                            (notif, index, self) =>
                                index === self.findIndex((n) => n.id === notif.id)
                        );
                        return unique.sort(
                            (a, b) =>
                                new Date(b.timestamp || b.createdAt).getTime() -
                                new Date(a.timestamp || a.createdAt).getTime()
                        );
                    });
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            // Also mark as read in database
            try {
                await fetch(`/api/notifications/${notification.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ read: true }),
                });
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }

        if (notification.link) {
            router.push(notification.link);
        }
        handleClose();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getNotificationIcon = (type?: string) => {
        switch (type?.toUpperCase()) {
            case "APPOINTMENT":
            case "CONFIRMED":
                return <CheckCircle color="success" fontSize="small" />;
            case "CANCELLED":
            case "REJECTED":
                return <Cancel color="error" fontSize="small" />;
            case "WARNING":
                return <Warning color="warning" fontSize="small" />;
            default:
                return <Info color="info" fontSize="small" />;
        }
    };

    const totalUnread = mounted ? notifications.filter((n) => !n.read).length : 0;

    if (!mounted) {
        return (
            <IconButton
                color="inherit"
                sx={{ color: "text.secondary", position: "relative" }}
            >
                <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        );
    }

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{ color: "text.secondary", position: "relative" }}
            >
                <Badge badgeContent={totalUnread} color="error">
                    <NotificationsIcon />
                </Badge>
                {!isConnected && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                        }}
                    />
                )}
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 500,
                        mt: 1,
                    },
                }}
            >
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight={600}>
                        Notifications
                    </Typography>
                    {totalUnread > 0 && (
                        <Button
                            size="small"
                            startIcon={<MarkEmailRead />}
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />

                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                    {loading && notifications.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <MenuItem disabled>
                            <ListItemText
                                primary="No notifications"
                                secondary="You're all caught up!"
                            />
                        </MenuItem>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    bgcolor: notification.read ? "transparent" : "action.hover",
                                    borderLeft: notification.read ? "none" : "3px solid",
                                    borderColor: "primary.main",
                                    py: 1.5,
                                }}
                            >
                                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                                                {notification.title}
                                            </Typography>
                                            {!notification.read && (
                                                <Chip
                                                    label="New"
                                                    size="small"
                                                    color="primary"
                                                    sx={{ height: 16, fontSize: "0.65rem" }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                                {formatDistanceToNow(
                                                    new Date(notification.timestamp || notification.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        ))
                    )}
                </Box>

                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: "center" }}>
                            <Button
                                size="small"
                                onClick={() => {
                                    handleClose();
                                    router.push("/dashboard/notifications");
                                }}
                            >
                                View All Notifications
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </>
    );
}




