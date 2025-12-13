"use client";

import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Tooltip,
} from "@mui/material";
import {
    AccountCircle,
    Settings,
    Logout,
    Menu as MenuIcon,
} from "@mui/icons-material";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationBell from "./NotificationBell";
import PremiumThemeToggle from "./PremiumThemeToggle";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await signOut({ redirect: false });
        router.push("/login");
    };


    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                background: (theme) =>
                    theme.palette.mode === "dark" ? "#1e293b" : "#ffffff",
                color: "text.primary",
                borderBottom: (theme) =>
                    `1px solid ${
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.08)"
                    }`,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 }, py: 1.5 }}>
                <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                        },
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={onMenuClick}
                        sx={{
                            mr: { xs: 1, sm: 2 },
                            display: { md: "none" },
                            color: "text.primary",
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "rgba(99, 102, 241, 0.2)"
                                    : "rgba(99, 102, 241, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LocalHospitalIcon
                            sx={{
                                color: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgb(165, 180, 252)"
                                        : "rgb(99, 102, 241)",
                                fontSize: 20,
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                        >
                            HM System
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.7rem",
                                display: { xs: "none", sm: "block" },
                                mt: -0.5,
                            }}
                        >
                            Hospital Management
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                    <NotificationBell />
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <PremiumThemeToggle />
                    </Box>
                    <Box sx={{ display: { xs: "block", sm: "none" } }}>
                        <PremiumThemeToggle />
                    </Box>

                    <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            sx={{
                                ml: 1,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.1)",
                                },
                            }}
                            size="small"
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    background: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgba(99, 102, 241, 0.3)"
                                            : "rgba(99, 102, 241, 0.1)",
                                    color: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgb(165, 180, 252)"
                                            : "rgb(99, 102, 241)",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                            borderRadius: 2,
                            boxShadow: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                                    : "0 8px 32px rgba(0, 0, 0, 0.12)",
                            border: (theme) =>
                                `1px solid ${
                                    theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(99, 102, 241, 0.1)"
                                }`,
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "rgba(30, 41, 59, 0.95)"
                                    : "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(20px)",
                            "& .MuiMenuItem-root": {
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    background: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgba(99, 102, 241, 0.2)"
                                            : "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                                    transform: "translateX(4px)",
                                },
                            },
                        },
                    }}
                >
                    <MenuItem onClick={() => { handleMenuClose(); router.push("/dashboard/profile"); }}>
                        <AccountCircle sx={{ mr: 2, color: "primary.main" }} fontSize="small" />
                        <Typography sx={{ fontWeight: 500 }}>Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); router.push("/dashboard/settings"); }}>
                        <Settings sx={{ mr: 2, color: "primary.main" }} fontSize="small" />
                        <Typography sx={{ fontWeight: 500 }}>Settings</Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            color: "error.main",
                            "&:hover": {
                                background: "rgba(239, 68, 68, 0.1)",
                            },
                        }}
                    >
                        <Logout sx={{ mr: 2 }} fontSize="small" />
                        <Typography sx={{ fontWeight: 500 }}>Logout</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}


