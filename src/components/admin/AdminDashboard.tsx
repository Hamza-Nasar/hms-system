"use client";

import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
    People as PeopleIcon,
    LocalHospital as HospitalIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    Pending as PendingIcon,
    Today as TodayIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { PremiumStatCard } from "@/components/PremiumStatCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSocket } from "@/hooks/useSocket";

interface AdminDashboardProps {
    stats: {
        patients: number;
        doctors: number;
        appointments: number;
        revenue: number;
        pendingAppointments: number;
        todayAppointments: number;
        activeUsers: number;
    };
}

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    const { socket, isConnected } = useSocket();
    const [chartData, setChartData] = useState<any[]>([]);
    const [appointmentStatusData, setAppointmentStatusData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        fetchChartData();
        const interval = setInterval(fetchChartData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("stats_update", () => {
            fetchChartData();
        });

        return () => {
            socket.off("stats_update");
        };
    }, [socket, isConnected]);

    const fetchChartData = async () => {
        try {
            const [appointmentsRes, revenueRes, statusRes] = await Promise.all([
                fetch("/api/admin/analytics/appointments"),
                fetch("/api/admin/analytics/revenue"),
                fetch("/api/admin/analytics/status"),
            ]);

            if (appointmentsRes.ok) {
                const data = await appointmentsRes.json();
                setChartData(data);
            } else {
                const errorData = await appointmentsRes.json().catch(() => ({}));
                console.error("Failed to fetch appointments:", errorData);
            }

            if (revenueRes.ok) {
                const data = await revenueRes.json();
                setRevenueData(data);
            } else {
                const errorData = await revenueRes.json().catch(() => ({}));
                console.error("Failed to fetch revenue:", errorData);
            }

            if (statusRes.ok) {
                const data = await statusRes.json();
                setAppointmentStatusData(data);
            } else {
                const errorData = await statusRes.json().catch(() => ({}));
                console.error("Failed to fetch status:", errorData);
                if (errorData.message) {
                    console.warn("Admin access issue:", errorData.message);
                }
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        }
    };

    const statCards = [
        {
            title: "Total Patients",
            value: stats.patients,
            icon: PeopleIcon,
            color: "blue",
            change: "+12%",
        },
        {
            title: "Total Doctors",
            value: stats.doctors,
            icon: HospitalIcon,
            color: "purple",
            change: "+5%",
        },
        {
            title: "Total Appointments",
            value: stats.appointments,
            icon: CalendarIcon,
            color: "green",
            change: "+8%",
        },
        {
            title: "Total Revenue",
            value: `$${stats.revenue.toLocaleString()}`,
            icon: TrendingUpIcon,
            color: "orange",
            change: "+15%",
        },
        {
            title: "Pending Appointments",
            value: stats.pendingAppointments,
            icon: PendingIcon,
            color: "default",
            change: "-3%",
        },
        {
            title: "Today's Appointments",
            value: stats.todayAppointments,
            icon: TodayIcon,
            color: "blue",
            change: "+10%",
        },
        {
            title: "Active Users",
            value: stats.activeUsers,
            icon: PersonIcon,
            color: "green",
            change: "+7%",
        },
    ];

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 3,
                    mb: 3,
                }}
            >
                {statCards.map((card, index) => (
                    <PremiumStatCard
                        key={index}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        change={card.change}
                        color={card.color}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Appointments Chart */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Appointments Trend (Last 7 Days)
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={2} />
                                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Appointment Status Pie Chart */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Appointment Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={appointmentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {appointmentStatusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* Revenue Chart */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Revenue Overview (Last 30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#6366f1" />
                            <Bar dataKey="bills" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
}


