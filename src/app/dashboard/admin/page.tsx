"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import SystemMonitoring from "@/components/admin/SystemMonitoring";
import ActivityLogs from "@/components/admin/ActivityLogs";
import SystemSettings from "@/components/admin/SystemSettings";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Alert, Button, CircularProgress } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AdminPanelPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const [value, setValue] = useState(0);
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        revenue: 0,
        pendingAppointments: 0,
        todayAppointments: 0,
        activeUsers: 0,
    });
    const [accessDenied, setAccessDenied] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            const role = (session.user as any)?.role?.toLowerCase();
            console.log("Admin Panel - Current user role:", role);
            console.log("Admin Panel - Full session:", session);
            
            if (role !== "admin" && role !== "administrator") {
                console.warn("Access denied - User role is not admin. Current role:", role);
                setAccessDenied(true);
            } else {
                setAccessDenied(false);
            }
        }
    }, [session]);

    // Fetch initial stats
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("stats_update", (data: any) => {
            setStats((prev) => ({ ...prev, ...data }));
        });

        socket.on("appointment_updated", () => {
            fetchStats();
        });

        socket.on("user_created", () => {
            fetchStats();
        });

        socket.on("user_updated", () => {
            fetchStats();
        });

        return () => {
            socket.off("stats_update");
            socket.off("appointment_updated");
            socket.off("user_created");
            socket.off("user_updated");
        };
    }, [socket, isConnected]);

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/dashboard/stats");
            if (response.ok) {
                const data = await response.json();
                setStats((prev) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (status === "loading") {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (accessDenied) {
        const role = (session?.user as any)?.role || "unknown";
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        You don't have admin access. Your current role is: <strong>{role}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                        To access the admin panel, your role must be set to "admin" in the database.
                        After updating your role, please log out and log back in to refresh your session.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={refreshing}
                            onClick={async () => {
                                setRefreshing(true);
                                try {
                                    // Try to refresh session first
                                    const response = await fetch("/api/auth/refresh-session", {
                                        method: "POST",
                                    });
                                    const data = await response.json();
                                    
                                    if (data.session) {
                                        // Force page reload to get new session
                                        window.location.reload();
                                    } else {
                                        // If refresh doesn't work, logout
                                        signOut({ callbackUrl: "/login" });
                                    }
                                } catch (error) {
                                    console.error("Session refresh failed:", error);
                                    signOut({ callbackUrl: "/login" });
                                } finally {
                                    setRefreshing(false);
                                }
                            }}
                            startIcon={refreshing ? <CircularProgress size={16} /> : null}
                        >
                            {refreshing ? "Refreshing..." : "Refresh Session"}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                signOut({ callbackUrl: "/login" });
                            }}
                        >
                            Logout & Login Again
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => router.push("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: "text.primary" }}>
                    Admin Panel
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {isConnected && (
                        <Chip
                            label="Live"
                            color="success"
                            size="small"
                            sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600 }}
                        />
                    )}
                    <Chip
                        label={isConnected ? "Real-time Active" : "Real-time Offline"}
                        size="small"
                        color={isConnected ? "success" : "default"}
                        sx={{ height: 24, fontSize: "0.75rem" }}
                    />
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="admin panel tabs"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            minHeight: 48,
                        },
                    }}
                >
                    <Tab label="Dashboard" />
                    <Tab label="User Management" />
                    <Tab label="System Monitoring" />
                    <Tab label="Activity Logs" />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                <AdminDashboard stats={stats} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <UserManagement />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <SystemMonitoring />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <ActivityLogs />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <SystemSettings />
            </TabPanel>
        </Box>
    );
}
