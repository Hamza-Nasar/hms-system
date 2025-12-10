"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, Alert, Link, Paper } from "@mui/material";
import { toast } from "@/components/ui/toast";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Check for replica set error and provide helpful message
                if (data.code === "REPLICA_SET_REQUIRED") {
                    const errorMsg = "Database configuration required. MongoDB must be set up as a replica set. Please contact your administrator or check MONGODB_REPLICA_SET_FIX.md for setup instructions.";
                    setError(errorMsg);
                    toast({ 
                        title: "Database Configuration Required", 
                        description: "MongoDB replica set setup needed",
                        variant: "destructive" 
                    });
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || "Failed to register");
            }

            // Check if user was created as admin (first user)
            const isAdmin = data.user?.role === "admin" || data.user?.role === "ADMIN";
            if (isAdmin) {
                toast({ 
                    title: "Admin Account Created!", 
                    description: "You are the first user and have been granted admin access."
                });
            } else {
                toast({ title: "Registration successful! Please login." });
            }
            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Registration failed");
            toast({ title: err.message || "Registration failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="background.default"
        >
            <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                <Typography variant="h4" gutterBottom align="center" color="primary">
                    Register
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                    Create your account to get started
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Full Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        autoFocus
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        helperText="Minimum 6 characters"
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
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
                        {loading ? "Registering..." : "Register"}
                    </Button>

                    <Box textAlign="center">
                        <Typography variant="body2">
                            Already have an account?{" "}
                            <Link href="/login" underline="hover">
                                Login here
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
