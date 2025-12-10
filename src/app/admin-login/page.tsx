"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Box,
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    LocalHospital,
} from "@mui/icons-material";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            // Wait a bit for session to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if user is admin after login - try multiple times
            let userRole = null;
            for (let i = 0; i < 3; i++) {
                const sessionResponse = await fetch("/api/auth/session");
                const session = await sessionResponse.json();
                userRole = (session?.user as any)?.role?.toLowerCase();
                
                if (userRole === "admin" || userRole === "administrator") {
                    break;
                }
                
                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (userRole !== "admin" && userRole !== "administrator") {
                setError(`Access denied. This login is only for administrators. Your current role is: ${userRole || "not set"}. Please contact your system administrator to get admin access.`);
                // Sign out the user
                await fetch("/api/auth/signout", { method: "POST" });
                setLoading(false);
                return;
            }

            // Redirect to admin panel
            router.push("/dashboard/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                        : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <AdminPanelSettings sx={{ fontSize: 36, color: "white" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Admin Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Hospital Management System - Administrator Access
                    </Typography>
                </Box>

                <Card
                    sx={{
                        boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                                ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                                : "0 8px 32px rgba(0, 0, 0, 0.1)",
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                        >
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                            />

                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                    },
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? "Signing in..." : "Sign In as Admin"}
                            </Button>
                        </Box>

                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                <Link
                                    href="/login"
                                    style={{
                                        color: "inherit",
                                        textDecoration: "none",
                                    }}
                                >
                                    ← Back to Regular Login
                                </Link>
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                mt: 4,
                                p: 2,
                                borderRadius: 2,
                                background: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgba(99, 102, 241, 0.1)"
                                        : "rgba(99, 102, 241, 0.05)",
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                <strong>Note:</strong> Only users with administrator role can access this page.
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                If you need admin access, please contact your system administrator.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                            }}
                        >
                            <LocalHospital />
                            <Typography variant="body2">HM System</Typography>
                        </Box>
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

