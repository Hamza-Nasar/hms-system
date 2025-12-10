"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, TextField, Button, Typography, Alert, Link, Paper, IconButton, InputAdornment, CircularProgress, Chip } from "@mui/material";
import { toast } from "@/components/ui/toast";
import { LoadingScreen } from "@/components/LoadingScreen";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Real-time token validation states
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [validatingToken, setValidatingToken] = useState(true);
    const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);
    const [tokenError, setTokenError] = useState("");
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Validate token in real-time
    const validateToken = async () => {
        if (!token) {
            setTokenValid(false);
            setValidatingToken(false);
            setTokenError("No token provided");
            return;
        }

        try {
            console.log("🔍 Validating token:", token);
            const res = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            
            console.log("🔍 Token validation response:", data);

            if (data.valid) {
                setTokenValid(true);
                setTokenError("");
                if (data.minutesRemaining !== undefined) {
                    setMinutesRemaining(data.minutesRemaining);
                }
                // Show test token warning if applicable
                if (data.isTestToken) {
                    console.log("⚠️ Test token detected - UI testing only");
                }
            } else {
                setTokenValid(false);
                setTokenError(data.error || "Invalid or expired token");
            }
        } catch (err) {
            console.error("❌ Token validation error:", err);
            setTokenValid(false);
            setTokenError("Failed to validate token. Please check your connection and try again.");
        } finally {
            setValidatingToken(false);
        }
    };

    // Countdown timer
    useEffect(() => {
        if (tokenValid && minutesRemaining !== null && minutesRemaining > 0) {
            countdownIntervalRef.current = setInterval(() => {
                setMinutesRemaining((prev) => {
                    if (prev === null || prev <= 1) {
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                        }
                        setTokenValid(false);
                        setTokenError("Token has expired");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 60000); // Update every minute
        }

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [tokenValid, minutesRemaining]);

    // Periodic token validation (every 30 seconds)
    useEffect(() => {
        if (token && tokenValid) {
            validationIntervalRef.current = setInterval(() => {
                validateToken();
            }, 30000); // Validate every 30 seconds
        }

        return () => {
            if (validationIntervalRef.current) {
                clearInterval(validationIntervalRef.current);
            }
        };
    }, [token, tokenValid]);

    // Initial token validation
    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setTokenValid(false);
            setValidatingToken(false);
            setTokenError("Invalid reset link. Please request a new password reset.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!token) {
            setError("Invalid reset link");
            setLoading(false);
            return;
        }

        if (!password || !confirmPassword) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast({ title: "Password reset successful!" });
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(data.error || "Failed to reset password");
                toast({ title: data.error || "Failed to reset password", variant: "destructive" });
            }
        } catch (err: any) {
            setError("An error occurred. Please try again.");
            toast({ title: "An error occurred. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while validating token
    if (validatingToken) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Validating reset link...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    // Show error if token is invalid or missing
    if (!token || !tokenValid) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                    <Box textAlign="center" mb={2}>
                        <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
                    </Box>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {tokenError || "Invalid or expired reset link. Please request a new password reset."}
                    </Alert>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => router.push("/forgot-password")}
                    >
                        Request New Reset Link
                    </Button>
                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Link href="/login" underline="hover">
                            Back to Login
                        </Link>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <>
            <LoadingScreen isLoading={loading} message="Resetting password..." />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                    <Box textAlign="center" mb={3}>
                        <LockIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                        <Typography variant="h4" gutterBottom color="primary">
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter your new password below.
                        </Typography>
                        
                        {/* Real-time Token Status */}
                        {tokenValid && (
                            <Box sx={{ mb: 2 }}>
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`Link Valid - ${minutesRemaining !== null ? `${minutesRemaining} min remaining` : "Valid"}`}
                                    color="success"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                                {minutesRemaining !== null && minutesRemaining > 0 && (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Expires in {minutesRemaining} {minutesRemaining === 1 ? "minute" : "minutes"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>

                    {success ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Password has been reset successfully! Redirecting to login...
                            </Alert>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => router.push("/login")}
                            >
                                Go to Login
                            </Button>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                                autoFocus
                                InputProps={{
                                    startAdornment: <LockIcon sx={{ mr: 1, color: "text.secondary" }} />,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Password must be at least 6 characters"
                            />
                            <TextField
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: <LockIcon sx={{ mr: 1, color: "text.secondary" }} />,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>

                            <Box textAlign="center" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Remember your password?{" "}
                                    <Link href="/login" underline="hover">
                                        Back to Login
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    )}
                </Paper>
            </Box>
        </>
    );
}

