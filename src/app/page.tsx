// src/app/page.tsx - Landing/Index Page
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Paper, AppBar, Toolbar } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SecurityIcon from "@mui/icons-material/Security";

export default function HomePage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering session-dependent content until mounted
    if (!mounted) {
        return (
            <Box suppressHydrationWarning>
                <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box suppressHydrationWarning>
            {/* Navigation Bar */}
            <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
                <Toolbar>
                    <LocalHospitalIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        HM System
                    </Typography>
                    {session ? (
                        <Button color="inherit" component={Link} href="/dashboard">
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} href="/login" sx={{ mr: 1 }}>
                                Login
                            </Button>
                            <Button color="inherit" component={Link} href="/admin-login" sx={{ mr: 1 }}>
                                Admin Login
                            </Button>
                            <Button color="inherit" component={Link} href="/register">
                                Register
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    py: 12,
                    textAlign: "center",
                }}
            >
                <Container>
                    <LocalHospitalIcon sx={{ fontSize: 100, mb: 3 }} />
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Hospital Management System
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
                        Comprehensive healthcare management solution
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 6, opacity: 0.8, maxWidth: 600, mx: "auto" }}>
                        Streamline your hospital operations with our advanced management system. 
                        Manage patients, appointments, doctors, and more all in one place.
                    </Typography>
                    {session ? (
                        <Button
                            component={Link}
                            href="/dashboard"
                            variant="contained"
                            size="large"
                            sx={{ 
                                bgcolor: "white", 
                                color: "primary.main", 
                                px: 4,
                                py: 1.5,
                                fontSize: "1.1rem",
                                "&:hover": { bgcolor: "grey.100" } 
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    ) : (
                        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                            <Button
                                component={Link}
                                href="/login"
                                variant="contained"
                                size="large"
                                sx={{ 
                                    bgcolor: "white", 
                                    color: "primary.main", 
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    "&:hover": { bgcolor: "grey.100" } 
                                }}
                            >
                                Login to Dashboard
                            </Button>
                            <Button
                                component={Link}
                                href="/register"
                                variant="outlined"
                                size="large"
                                sx={{ 
                                    borderColor: "white", 
                                    color: "white", 
                                    borderWidth: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    "&:hover": { 
                                        borderColor: "white", 
                                        bgcolor: "rgba(255,255,255,0.1)" 
                                    } 
                                }}
                            >
                                Create Account
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Features Section */}
            <Container sx={{ py: 10 }}>
                <Typography variant="h3" align="center" gutterBottom fontWeight="bold" mb={2}>
                    Key Features
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary" mb={6}>
                    Everything you need to manage your hospital efficiently
                </Typography>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                        gap: 4,
                    }}
                >
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <PeopleIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Patient Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Comprehensive patient records, medical history, and profile management system
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <CalendarTodayIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Appointment Scheduling
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Easy booking system with doctor availability and automated reminders
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <MedicalServicesIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Doctor Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage doctor profiles, schedules, specializations, and availability
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <AssessmentIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Reports & Analytics
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Comprehensive reports and analytics for hospital operations and insights
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <LocalHospitalIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Medical Records
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Digital medical records, prescriptions, and lab test management
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                        <SecurityIcon sx={{ fontSize: 70, color: "primary.main", mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Secure & Reliable
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Enterprise-grade security with role-based access control and data encryption
                        </Typography>
                    </Paper>
                </Box>
            </Container>

            {/* Call to Action Section */}
            {!session && (
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        py: 8,
                        textAlign: "center",
                    }}
                >
                    <Container>
                        <Typography variant="h3" gutterBottom fontWeight="bold">
                            Ready to Get Started?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                            Login to access your dashboard and start managing your hospital operations
                        </Typography>
                        <Button
                            component={Link}
                            href="/login"
                            variant="contained"
                            size="large"
                            sx={{ 
                                bgcolor: "white", 
                                color: "primary.main", 
                                px: 5,
                                py: 1.5,
                                fontSize: "1.1rem",
                                "&:hover": { bgcolor: "grey.100" } 
                            }}
                        >
                            Login Now
                        </Button>
                    </Container>
                </Box>
            )}

            {/* Footer */}
            <Box sx={{ bgcolor: "grey.900", color: "white", py: 4, mt: 8 }}>
                <Container>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                            gap: 4,
                        }}
                    >
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                <LocalHospitalIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                                HM System
                            </Typography>
                            <Typography variant="body2" color="grey.400">
                                Comprehensive healthcare management solution for modern hospitals
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Quick Links
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Button component={Link} href="/login" color="inherit" sx={{ justifyContent: "flex-start" }}>
                                    Login
                                </Button>
                                <Button component={Link} href="/register" color="inherit" sx={{ justifyContent: "flex-start" }}>
                                    Register
                                </Button>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Contact
                            </Typography>
                            <Typography variant="body2" color="grey.400">
                                For support and inquiries, please contact your system administrator
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", mt: 4, pt: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="grey.400">
                            © {new Date().getFullYear()} Hospital Management System. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
