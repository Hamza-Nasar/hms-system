"use client";

import React, { useState, useEffect } from "react";
import { Box, Tooltip } from "@mui/material";
import { LightMode, DarkMode, BrightnessAuto } from "@mui/icons-material";
import { useThemeMode } from "@/contexts/ThemeContext";

export default function PremiumThemeToggle() {
    const { mode, setMode, actualMode } = useThemeMode();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: "rgba(99, 102, 241, 0.1)",
                }}
            />
        );
    }

    const handleToggle = () => {
        // Toggle between light and dark only
        if (actualMode === "dark") {
            setMode("light");
        } else {
            setMode("dark");
        }
    };

    const getIcon = () => {
        return actualMode === "dark" ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />;
    };

    const getLabel = () => {
        return actualMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    };

    return (
        <Tooltip title={`Theme: ${getLabel()}`} arrow>
            <Box
                onClick={handleToggle}
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(99, 102, 241, 0.1)",
                    border: (theme) =>
                        `1px solid ${
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(99, 102, 241, 0.2)"
                        }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgb(99, 102, 241)",
                    "&:hover": {
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.15)"
                                : "rgba(99, 102, 241, 0.15)",
                        transform: "scale(1.05)",
                    },
                    "&:active": {
                        transform: "scale(0.95)",
                    },
                }}
            >
                {getIcon()}
            </Box>
        </Tooltip>
    );
}

