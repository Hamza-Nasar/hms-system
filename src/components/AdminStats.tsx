"use client";

import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
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
        <Grid container spacing={3}>
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
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
                    </Grid>
                );
            })}
        </Grid>
    );
}





