"use client";

import React from "react";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography,
    Chip,
    Drawer,
    useMediaQuery,
    useTheme,
    IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaymentIcon from "@mui/icons-material/Payment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import ScienceIcon from "@mui/icons-material/Science";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
    divider?: boolean;
}

interface SidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const role = (session?.user as any)?.role || "PATIENT";

    const isAdmin = role === "admin" || role === "ADMIN";
    const isDoctor = role === "DOCTOR";
    const isPatient = role === "PATIENT";

    const menuItems: MenuItem[] = [
        { icon: <DashboardIcon />, label: "Dashboard", href: "/dashboard" },
        { icon: <PeopleIcon />, label: "Patients", href: "/dashboard/patients", divider: isAdmin || isDoctor },
        { icon: <PersonAddIcon />, label: "Add Patient", href: "/dashboard/patients/create", divider: isAdmin || isDoctor },
        { icon: <CalendarTodayIcon />, label: "Appointments", href: "/dashboard/appointments" },
        { icon: <CalendarTodayIcon />, label: "My Appointments", href: "/dashboard/patients/appointments", divider: isPatient },
        { icon: <LocalHospitalIcon />, label: "Doctors", href: "/dashboard/doctors", divider: isAdmin },
        { icon: <LocalHospitalIcon />, label: "Doctor Portal", href: "/dashboard/doctor", divider: isDoctor },
        { icon: <CalendarTodayIcon />, label: "My Schedule", href: "/dashboard/doctor/schedule", divider: isDoctor },
        { icon: <MedicalServicesIcon />, label: "Medical Records", href: "/dashboard/medical-records" },
        { icon: <DescriptionIcon />, label: "Prescriptions", href: "/dashboard/prescriptions" },
        { icon: <ScienceIcon />, label: "Lab Tests", href: "/dashboard/lab-tests" },
        { icon: <InventoryIcon />, label: "Inventory", href: "/dashboard/inventory", divider: isAdmin },
        { icon: <PaymentIcon />, label: "Billing", href: "/dashboard/billing" },
        { icon: <AssessmentIcon />, label: "Reports", href: "/dashboard/reports", divider: isAdmin },
        { icon: <NotificationsIcon />, label: "Notifications", href: "/dashboard/notifications" },
        { icon: <SmartToyIcon />, label: "AI Assistant", href: "/dashboard/ai-assistant" },
        { icon: <AdminPanelSettingsIcon />, label: "Admin Panel", href: "/dashboard/admin", divider: isAdmin },
        { icon: <PersonIcon />, label: "Profile", href: "/dashboard/profile" },
        { icon: <SettingsIcon />, label: "Settings", href: "/dashboard/settings" },
    ];

    // Filter menu items based on role
    const filteredItems = menuItems.filter((item) => {
        if (item.href === "/dashboard/admin" && !isAdmin) return false;
        if (item.href === "/dashboard/doctor" && !isDoctor) return false;
        if (item.href === "/dashboard/patients" && isPatient) return false;
        if (item.href === "/dashboard/patients/create" && isPatient) return false;
        if (item.href === "/dashboard/doctors" && !isAdmin) return false;
        if (item.href === "/dashboard/patients/appointments" && !isPatient) return false;
        return true;
    });

    const drawerContent = (
        <Box
            sx={{
                width: 280,
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: (theme) =>
                    theme.palette.mode === "dark" ? "#1e293b" : "#ffffff",
                borderRight: (theme) =>
                    `1px solid ${
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.08)"
                    }`,
                boxShadow: "0 0 1px rgba(0, 0, 0, 0.05)",
            }}
        >
            <Box
                sx={{
                    p: 3,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1,
                        }}
                    >
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
                                    color: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.95)"
                                            : "rgb(15, 23, 42)",
                                    fontSize: "1.125rem",
                                }}
                            >
                                HM System
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.6)"
                                            : "rgba(0, 0, 0, 0.6)",
                                    fontSize: "0.7rem",
                                }}
                            >
                                Hospital Management
                            </Typography>
                        </Box>
                    </Box>
            </Box>

            <List
                sx={{
                    flex: 1,
                    pt: 2,
                    px: 1.5,
                    position: "relative",
                    zIndex: 1,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255, 255, 255, 0.3)",
                        borderRadius: "10px",
                        "&:hover": {
                            background: "rgba(255, 255, 255, 0.5)",
                        },
                    },
                }}
            >
                {filteredItems.map((item, index) => {
                    const isSelected = pathname === item.href;
                    return (
                        <React.Fragment key={item.href}>
                            {item.divider && index > 0 && (
                                <Divider
                                    sx={{
                                        my: 1.5,
                                        borderColor: "rgba(255, 255, 255, 0.1)",
                                    }}
                                />
                            )}
                            <ListItem disablePadding sx={{ mb: 0.75 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    selected={isSelected}
                                    onClick={isMobile ? onMobileClose : undefined}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1,
                                    px: 2,
                                    transition: "all 0.2s ease",
                                    "&.Mui-selected": {
                                        background: (theme) =>
                                            theme.palette.mode === "dark"
                                                ? "rgba(99, 102, 241, 0.2)"
                                                : "rgba(99, 102, 241, 0.1)",
                                        color: (theme) =>
                                            theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.95)"
                                                : "rgb(99, 102, 241)",
                                        "&:hover": {
                                            background: (theme) =>
                                                theme.palette.mode === "dark"
                                                    ? "rgba(99, 102, 241, 0.25)"
                                                    : "rgba(99, 102, 241, 0.15)",
                                        },
                                        "& .MuiListItemIcon-root": {
                                            color: (theme) =>
                                                theme.palette.mode === "dark"
                                                    ? "rgba(255, 255, 255, 0.95)"
                                                    : "rgb(99, 102, 241)",
                                        },
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: 3,
                                            height: "50%",
                                            background: "rgb(99, 102, 241)",
                                            borderRadius: "0 2px 2px 0",
                                        },
                                    },
                                    "&:hover": {
                                        background: (theme) =>
                                            theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.05)"
                                                : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                                >
                                <ListItemIcon
                                    sx={{
                                        color: (theme) =>
                                            isSelected
                                                ? theme.palette.mode === "dark"
                                                    ? "rgba(255, 255, 255, 0.95)"
                                                    : "rgb(99, 102, 241)"
                                                : theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.6)"
                                                : "rgba(0, 0, 0, 0.6)",
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: "0.875rem",
                                        fontWeight: isSelected ? 600 : 500,
                                    }}
                                    sx={{
                                        "& .MuiListItemText-primary": {
                                            color: (theme) =>
                                                isSelected
                                                    ? theme.palette.mode === "dark"
                                                        ? "rgba(255, 255, 255, 0.95)"
                                                        : "rgb(99, 102, 241)"
                                                    : theme.palette.mode === "dark"
                                                    ? "rgba(255, 255, 255, 0.8)"
                                                    : "rgba(0, 0, 0, 0.8)",
                                        },
                                    }}
                                />
                                {item.badge && (
                                    <Chip
                                        label={item.badge}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            background: "rgb(239, 68, 68)",
                                            color: "white",
                                        }}
                                    />
                                )}
                                </ListItemButton>
                            </ListItem>
                        </React.Fragment>
                    );
                })}
            </List>

            <Box
                sx={{
                    p: 2,
                    borderTop: (theme) =>
                        `1px solid ${
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.08)"
                        }`,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.5)",
                        align: "center",
                        display: "block",
                        fontSize: "0.7rem",
                    }}
                >
                    © 2024 HM System
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.4)"
                                : "rgba(0, 0, 0, 0.4)",
                        align: "center",
                        display: "block",
                        fontSize: "0.65rem",
                        mt: 0.5,
                    }}
                >
                    v1.0.0
                </Typography>
            </Box>
        </Box>
    );

    // Mobile drawer
    if (isMobile) {
        return (
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 280,
                        borderRight: "none",
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    // Desktop sidebar
    return (
        <Box
            sx={{
                display: { xs: "none", md: "flex" },
                width: 280,
                flexShrink: 0,
                position: "relative",
            }}
        >
            {drawerContent}
        </Box>
    );
}
