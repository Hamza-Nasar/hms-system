"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Grid,
    Divider,
    Alert,
    Chip,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import PersonIcon from "@mui/icons-material/Person";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setForm({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "",
            });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement profile update API
            toast({ title: "Profile updated successfully!" });
        } catch (error) {
            toast({ title: "Failed to update profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: "center", py: 4 }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: "auto",
                                    mb: 2,
                                    bgcolor: "primary.main",
                                    fontSize: "3rem",
                                }}
                            >
                                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                                {session?.user?.name || "User"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {session?.user?.email}
                            </Typography>
                            <Chip
                                label={(session?.user as any)?.role || "PATIENT"}
                                color="primary"
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3}>
                                Personal Information
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Full Name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                    required
                                    disabled
                                />
                                <TextField
                                    label="Phone Number"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                />

                                <Box mt={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}



