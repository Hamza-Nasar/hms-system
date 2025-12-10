"use client";

import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Chip, IconButton, Button, Tabs, Tab, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { format } from "date-fns";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { toast } from "@/components/ui/toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type?: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { notifications: realtimeNotifications, markAsRead, markAllAsRead } = useRealtimeNotifications();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch("/api/notifications?limit=200");
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        // Merge real-time notifications
        if (realtimeNotifications.length > 0) {
            setNotifications((prev) => {
                // Normalize real-time notifications to match local Notification type
                const normalizedRealtime = realtimeNotifications.map((notif) => ({
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    type: notif.type,
                    read: notif.read || false,
                    link: notif.link,
                    createdAt: notif.timestamp || new Date().toISOString(),
                }));
                
                const merged = [...normalizedRealtime, ...prev];
                const unique = merged.filter(
                    (notif, index, self) =>
                        index === self.findIndex((n) => n.id === notif.id)
                );
                return unique.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime()
                );
            });
        }
    }, [realtimeNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: true }),
            });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            toast({ title: "Marked as read" });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });
            setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
            toast({ title: "All notifications marked as read" });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
                toast({ title: "Notification deleted" });
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast({ title: "Failed to delete notification", variant: "destructive" });
        }
    };

    const handleDeleteAllRead = async () => {
        if (!confirm("Are you sure you want to delete all read notifications?")) return;
        
        try {
            const readNotifications = notifications.filter((n) => n.read);
            await Promise.all(
                readNotifications.map((notif) =>
                    fetch(`/api/notifications/${notif.id}`, { method: "DELETE" })
                )
            );
            setNotifications((prev) => prev.filter((notif) => !notif.read));
            toast({ title: "All read notifications deleted" });
        } catch (error) {
            console.error("Failed to delete notifications:", error);
            toast({ title: "Failed to delete notifications", variant: "destructive" });
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter((notification) => {
        // Filter by read/unread status
        if (filter === "unread" && notification.read) return false;
        if (filter === "read" && !notification.read) return false;

        // Filter by type
        if (typeFilter !== "all" && notification.type !== typeFilter) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                notification.title.toLowerCase().includes(query) ||
                notification.message.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;
    const readCount = notifications.filter((n) => n.read).length;
    const notificationTypes = Array.from(new Set(notifications.map((n) => n.type || "INFO")));

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                    Notifications
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                    {unreadCount > 0 && (
                            <Chip label={`${unreadCount} unread`} color="primary" />
                    )}
                    {readCount > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteAllRead}
                            color="error"
                        >
                            Delete Read
                        </Button>
                    )}
                    {unreadCount > 0 && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<MarkEmailReadIcon />}
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Button>
                    )}
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                        <TextField
                            placeholder="Search notifications..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1, minWidth: 200 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Filter</InputLabel>
                            <Select
                                value={filter}
                                label="Filter"
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <MenuItem value="all">All ({notifications.length})</MenuItem>
                                <MenuItem value="unread">Unread ({unreadCount})</MenuItem>
                                <MenuItem value="read">Read ({readCount})</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Type"
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                {notificationTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box textAlign="center" py={4}>
                            <Typography color="text.secondary">Loading notifications...</Typography>
                        </Box>
                    ) : filteredNotifications.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <NotificationsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                            <Typography color="text.secondary">
                                {searchQuery || filter !== "all" || typeFilter !== "all"
                                    ? "No notifications match your filters"
                                    : "No notifications yet"}
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {filteredNotifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        cursor: "pointer",
                                        bgcolor: notification.read ? "transparent" : "action.hover",
                                        borderRadius: 2,
                                        mb: 1,
                                        borderLeft: notification.read ? "none" : "4px solid",
                                        borderColor: "primary.main",
                                        "&:hover": {
                                            bgcolor: "action.selected",
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <NotificationsIcon
                                            color={notification.read ? "disabled" : "primary"}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                <Typography variant="subtitle1" fontWeight={notification.read ? 400 : 600}>
                                                    {notification.title}
                                                </Typography>
                                                {!notification.read && (
                                                    <Chip label="New" color="primary" size="small" />
                                                )}
                                                {notification.type && (
                                                    <Chip 
                                                        label={notification.type} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                                    {format(
                                                        new Date(notification.createdAt || Date.now()),
                                                        "MMM dd, yyyy HH:mm"
                                                    )}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Box display="flex" gap={1}>
                                    {!notification.read && (
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                        >
                                            <CheckCircleIcon />
                                        </IconButton>
                                    )}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => handleDelete(notification.id, e)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
