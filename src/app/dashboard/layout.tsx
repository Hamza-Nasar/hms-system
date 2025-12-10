"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RealtimeProvider from "@/components/RealtimeProvider";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RealtimeProvider>
            <Box display="flex" minHeight="100vh" className="dashboard-bg">
                <Sidebar />
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    sx={{
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Header />
                    <Box
                        component="main"
                        sx={{
                            flex: 1,
                            overflow: "auto",
                            p: 3,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </RealtimeProvider>
    );
}
