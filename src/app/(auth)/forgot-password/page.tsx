"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Alert, 
    Link, 
    Paper,
    IconButton,
    InputAdornment,
    Chip,
    Divider
} from "@mui/material";
import { toast } from "@/components/ui/toast";
import { LoadingScreen } from "@/components/LoadingScreen";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LaunchIcon from "@mui/icons-material/Launch";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [resetLink, setResetLink] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        if (!email) {
            setError("Please enter your email address");
            setLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                if (data.resetLink) {
                    setResetLink(data.resetLink);
                }
                toast({ title: data.message || "Password reset link generated!" });
            } else {
                setError(data.error || "Failed to generate reset link");
                toast({ title: data.error || "Failed to generate reset link", variant: "destructive" });
            }
        } catch (err: any) {
            setError("An error occurred. Please try again.");
            toast({ title: "An error occurred. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingScreen isLoading={loading} message="Generating reset link..." />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                    <Box textAlign="center" mb={3}>
                        <EmailIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                        <Typography variant="h4" gutterBottom color="primary">
                            Forgot Password?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your email address and we'll send you a link to reset your password.
                        </Typography>
                    </Box>

                    {success ? (
                        <Box>
                            <Alert 
                                severity="success" 
                                icon={<CheckCircleIcon />}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Password Reset Link Generated!
                                </Typography>
                                <Typography variant="body2">
                                    {resetLink 
                                        ? "Use the link below to reset your password. This link will expire in 1 hour."
                                        : "If an account with that email exists, a password reset link has been generated."
                                    }
                                </Typography>
                            </Alert>

                            {resetLink && (
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Expires in 1 hour
                                        </Typography>
                                    </Box>
                                    
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            bgcolor: "grey.50",
                                            borderColor: "primary.main",
                                            borderWidth: 2,
                                            borderStyle: "solid",
                                            borderRadius: 2,
                                            mb: 2
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    fontFamily: "monospace",
                                                    fontSize: "0.75rem",
                                                    wordBreak: "break-all",
                                                    color: "primary.main",
                                                }}
                                            >
                                                {resetLink}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(resetLink);
                                                        setLinkCopied(true);
                                                        toast({ title: "Link copied to clipboard!" });
                                                        setTimeout(() => setLinkCopied(false), 2000);
                                                    } catch (err) {
                                                        toast({ title: "Failed to copy link", variant: "destructive" });
                                                    }
                                                }}
                                                sx={{ 
                                                    color: "primary.main",
                                                    "&:hover": { bgcolor: "primary.light", color: "white" }
                                                }}
                                            >
                                                {linkCopied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                            </IconButton>
                                        </Box>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<LaunchIcon />}
                                        onClick={() => window.open(resetLink, "_blank")}
                                        sx={{ mb: 2 }}
                                    >
                                        Open Reset Link
                                    </Button>

                                    <Divider sx={{ my: 2 }}>
                                        <Chip label="OR" size="small" />
                                    </Divider>
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                    setSuccess(false);
                                    setResetLink("");
                                    setEmail("");
                                    setLinkCopied(false);
                                }}
                                sx={{ mb: 1 }}
                            >
                                Request Another Link
                            </Button>

                            <Button
                                variant="text"
                                fullWidth
                                onClick={() => router.push("/login")}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                                autoFocus
                                InputProps={{
                                    startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
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
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <Box textAlign="center" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Remember your password?{" "}
                                    <Link href="/login" underline="hover">
                                        Back to Login
                                    </Link>
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <Link href="/reset-link-template" underline="hover" color="primary">
                                        Preview Email Template
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

