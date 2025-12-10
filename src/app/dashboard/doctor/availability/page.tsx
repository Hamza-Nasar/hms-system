"use client";
import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Alert, Card, CardContent } from "@mui/material";
import { toast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

export default function AvailabilityForm() {
    const { data: session } = useSession();
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [doctorId, setDoctorId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        // Fetch doctor ID from user session
        async function fetchDoctorId() {
            if (session?.user?.id) {
                try {
                    setFetching(true);
                    const res = await fetch("/api/users");
                    if (!res.ok) {
                        throw new Error("Failed to fetch user data");
                    }
                    const data = await res.json();
                    // Find doctor associated with current user
                    const doctor = data.find((d: any) => d.Doctor && d.Doctor.userId === session.user.id);
                    if (doctor?.Doctor) {
                        setDoctorId(doctor.Doctor.id);
                    }
                } catch (error) {
                    console.error("Failed to fetch doctor ID:", error);
                    toast({ title: "Failed to load doctor profile", variant: "destructive" });
                } finally {
                    setFetching(false);
                }
            }
        }
        fetchDoctorId();
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!startsAt || !endsAt) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        if (!doctorId) {
            toast({ title: "Doctor profile not found. Please contact admin.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, startsAt, endsAt }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to add availability" }));
                throw new Error(errorData.error || "Failed to add availability");
            }

            const data = await res.json();
            toast({ title: "Availability added successfully!" });
            setStartsAt("");
            setEndsAt("");
        } catch (error: any) {
            toast({ title: error.message || "Network error. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Set Availability
            </Typography>

            <Card sx={{ maxWidth: 500, mx: "auto" }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {!doctorId && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                Doctor profile not found. Please ensure your account is linked to a doctor profile.
                            </Alert>
                        )}

                        <TextField 
                            type="datetime-local" 
                            label="Start Time" 
                            value={startsAt} 
                            onChange={(e) => setStartsAt(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField 
                            type="datetime-local" 
                            label="End Time" 
                            value={endsAt} 
                            onChange={(e) => setEndsAt(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            sx={{ mt: 2 }}
                            disabled={loading || !doctorId}
                        >
                            {loading ? "Saving..." : "Save Availability"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
