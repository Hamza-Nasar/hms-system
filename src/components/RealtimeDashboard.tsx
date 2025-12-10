"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Box, Chip, Typography } from "@mui/material";
import { useSession } from "next-auth/react";

interface DashboardStats {
    appointments: number;
    patients: number;
    doctors: number;
    revenue: number;
}

export default function RealtimeDashboard({ initialStats }: { initialStats: DashboardStats }) {
    const { socket, isConnected } = useSocket();
    const { data: session } = useSession();
    const [stats, setStats] = useState(initialStats);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for real-time updates
        socket.on("stats_update", (data: DashboardStats) => {
            setStats(data);
        });

        // Listen for appointment updates that affect stats
        socket.on("appointment_updated", () => {
            // Refresh stats when appointments change
            fetch("/api/dashboard/stats")
                .then((res) => res.json())
                .then((data) => setStats(data))
                .catch((err) => console.error("Failed to refresh stats:", err));
        });

        return () => {
            socket.off("stats_update");
            socket.off("appointment_updated");
        };
    }, [socket, isConnected]);

    return (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            {isConnected && (
                <Chip
                    label="Live"
                    color="success"
                    size="small"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                />
            )}
            <Typography variant="caption" color="text.secondary">
                {isConnected ? "Real-time updates enabled" : "Connecting to real-time service..."}
            </Typography>
        </Box>
    );
}




