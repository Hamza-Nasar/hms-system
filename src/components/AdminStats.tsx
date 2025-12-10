"use client";

import { Box, Typography, Card, CardContent } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface Stat {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
}

export default function AdminStats({ stats }: { stats: Stat[] }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 3,
            }}
        >
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <Card
                        key={index}
                        sx={{
                            background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                            border: `1px solid ${stat.color}20`,
                            height: "100%",
                        }}
                    >
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {stat.title}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: `${stat.color}20`,
                                        borderRadius: 2,
                                        p: 1.5,
                                        color: stat.color,
                                    }}
                                >
                                    <IconComponent sx={{ fontSize: 40 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}





