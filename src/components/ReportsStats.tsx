"use client";

import { Box, Typography, Card, CardContent, CardHeader } from "@mui/material";

interface StatsData {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    revenueThisMonth: number;
}

export default function ReportsStats({ stats }: { stats: StatsData }) {
    const statCards = [
        {
            title: "Total Patients",
            value: stats.totalPatients,
            color: "#6366f1",
        },
        {
            title: "Total Doctors",
            value: stats.totalDoctors,
            color: "#ec4899",
        },
        {
            title: "Total Appointments",
            value: stats.totalAppointments,
            color: "#10b981",
        },
        {
            title: "Appointments Today",
            value: stats.todayAppointments,
            color: "#3b82f6",
        },
        {
            title: "Pending Appointments",
            value: stats.pendingAppointments,
            color: "#f59e0b",
        },
        {
            title: "Confirmed Appointments",
            value: stats.confirmedAppointments,
            color: "#10b981",
        },
        {
            title: "Revenue This Month",
            value: `$${stats.revenueThisMonth.toLocaleString()}`,
            color: "#8b5cf6",
        },
    ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 3,
            }}
        >
            {statCards.map((stat, index) => (
                <Card
                    key={index}
                    sx={{
                        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                        border: `1px solid ${stat.color}20`,
                        height: "100%",
                    }}
                >
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                {stat.title}
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Typography variant="h3" fontWeight={700} color={stat.color}>
                            {stat.value}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

