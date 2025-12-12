"use client";

import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, Alert, Link, Paper, Divider } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "@/components/ui/toast";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [providers, setProviders] = useState<Record<string, any> | null>(null);
    const [providersLoading, setProvidersLoading] = useState(true);

    useEffect(() => {
        // Check available OAuth providers using both methods
        const fetchProviders = async () => {
            try {
                // Try getProviders first
                const provs = await getProviders();
                console.log("Available providers:", provs);
                setProviders(provs);
            } catch (error) {
                console.error("Error fetching providers with getProviders:", error);
                // Fallback: Check via API endpoint
                try {
                    const res = await fetch("/api/auth/providers");
                    const data = await res.json();
                    if (data.google) {
                        // If Google is enabled, create a mock provider object
                        setProviders({ google: { id: "google", name: "Google" } });
                    } else {
                        setProviders({});
                    }
                } catch (apiError) {
                    console.error("Error fetching providers from API:", apiError);
                    setProviders({});
                }
            } finally {
                setProvidersLoading(false);
            }
        };

        fetchProviders();

        // Check for OAuth error in URL
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const callbackUrl = params.get("callbackUrl");
        
        if (errorParam) {
            if (errorParam === "Callback") {
                setError("OAuth authentication failed. Please try again.");
                toast({ title: "Authentication failed", variant: "destructive" });
            } else {
                setError(`Authentication error: ${errorParam}`);
                toast({ title: "Authentication error", variant: "destructive" });
            }
            // Clean up URL
            window.history.replaceState({}, "", "/login");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
                toast({ title: "Invalid email or password", variant: "destructive" });
            } else if (res?.ok) {
                toast({ title: "Login successful!" });
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setError("An error occurred. Please try again.");
            toast({ title: "Login failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: "google") => {
        setLoading(true);
        setError("");
        try {
            const result = await signIn(provider, {
                callbackUrl: `${window.location.origin}/dashboard`,
                redirect: true,
            });
            // If redirect is false or result has error, handle it
            if (result?.error) {
                setError(`Failed to sign in with ${provider}. Please try again.`);
                toast({ title: `Failed to sign in with ${provider}`, variant: "destructive" });
                setLoading(false);
            }
        } catch (err: any) {
            console.error("OAuth sign in error:", err);
            setError(`Failed to sign in with ${provider}. Please try again.`);
            toast({ title: `Failed to sign in with ${provider}`, variant: "destructive" });
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingScreen isLoading={loading} message="Logging in..." />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                <Typography variant="h4" gutterBottom align="center" color="primary">
                    Login
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                    Sign in to your account
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        autoFocus
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />

                    <Box textAlign="right" sx={{ mt: 1 }}>
                        <Link href="/forgot-password" underline="hover" variant="body2">
                            Forgot Password?
                        </Link>
                    </Box>

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
                        {loading ? "Logging in..." : "Login"}
                    </Button>

                    {/* OAuth Providers - Always show if Google provider exists */}
                    {providers?.google && (
                        <>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<GoogleIcon />}
                                    onClick={() => handleOAuthSignIn("google")}
                                    disabled={loading || providersLoading}
                                    sx={{
                                        borderColor: "divider",
                                        color: "text.primary",
                                        textTransform: "none",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    Continue with Google
                                </Button>
                            </Box>
                        </>
                    )}

                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Don't have an account?{" "}
                            <Link href="/register" underline="hover">
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
        </>
    );
}
