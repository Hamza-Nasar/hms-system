"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import {
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
    People as PeopleIcon,
} from "@mui/icons-material";
import { useSocket } from "@/hooks/useSocket";

interface SystemMetrics {
    cpu: number;
    memory: number;
    storage: number;
    activeConnections: number;
    requestsPerMinute: number;
    errorRate: number;
}

export default function SystemMonitoring() {
    const { socket, isConnected } = useSocket();
    const [metrics, setMetrics] = useState<SystemMetrics>({
        cpu: 0,
        memory: 0,
        storage: 0,
        activeConnections: 0,
        requestsPerMinute: 0,
        errorRate: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("system_metrics", (data: SystemMetrics) => {
            setMetrics(data);
        });

        socket.on("system_activity", (activity: any) => {
            setRecentActivity((prev) => [activity, ...prev].slice(0, 20));
        });

        return () => {
            socket.off("system_metrics");
            socket.off("system_activity");
        };
    }, [socket, isConnected]);

    const fetchMetrics = async () => {
        try {
            const response = await fetch("/api/admin/system/metrics");
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
        }
    };

    const getColor = (value: number) => {
        if (value < 50) return "success";
        if (value < 80) return "warning";
        return "error";
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} mb={3}>
                System Monitoring
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                    gap: 3,
                    mb: 3,
                }}
            >
                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <SpeedIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                CPU Usage
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} mb={1}>
                            {metrics.cpu.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.cpu}
                            color={getColor(metrics.cpu) as any}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <MemoryIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                Memory Usage
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} mb={1}>
                            {metrics.memory.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.memory}
                            color={getColor(metrics.memory) as any}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <StorageIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                Storage Usage
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} mb={1}>
                            {metrics.storage.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.storage}
                            color={getColor(metrics.storage) as any}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                Active Connections
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700}>
                            {metrics.activeConnections}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {metrics.requestsPerMinute} req/min
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Recent System Activity
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Event</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentActivity.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No recent activity
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentActivity.map((activity, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(activity.timestamp).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>{activity.event}</TableCell>
                                            <TableCell>{activity.user || "System"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={activity.status}
                                                    size="small"
                                                    color={activity.status === "success" ? "success" : "error"}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}










