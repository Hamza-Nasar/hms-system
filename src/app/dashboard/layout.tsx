"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RealtimeProvider from "@/components/RealtimeProvider";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    return (
        <RealtimeProvider>
            <Box display="flex" minHeight="100vh" className="dashboard-bg">
                <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerClose} />
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    sx={{
                        overflow: "hidden",
                        position: "relative",
                        width: { xs: "100%", md: "auto" },
                        flex: { xs: "1 1 100%", md: "1 1 auto" },
                    }}
                >
                    <Header onMenuClick={handleDrawerToggle} />
                    <Box
                        component="main"
                        sx={{
                            flex: 1,
                            overflow: "auto",
                            p: { xs: 2, sm: 3 },
                            position: "relative",
                            zIndex: 1,
                            width: "100%",
                            maxWidth: "100%",
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </RealtimeProvider>
    );
}
