"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";
import { toast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

interface Doctor {
    id: string;
    user: {
        name: string;
    };
    specialization?: string;
}

interface Appointment {
    id: string;
    startsAt: string;
    status: string;
    doctor: {
        user: {
            name: string;
        };
    };
}

export default function PatientAppointmentsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [form, setForm] = useState({
        doctorId: "",
        startsAt: "",
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [hasPatient, setHasPatient] = useState<boolean | null>(null);

    useEffect(() => {
        fetchPatientId();
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (patientId) {
            fetchAppointments();
        } else if (hasPatient === false) {
            setFetching(false);
        }
    }, [patientId, hasPatient]);

    async function fetchPatientId() {
        try {
            const res = await fetch("/api/patients");
            if (res.status === 404) {
                // Patient doesn't exist yet - this is okay
                setHasPatient(false);
                setPatientId(null);
                return;
            }
            if (res.status === 401) {
                // Not authenticated - redirect to login
                console.error("Authentication failed - redirecting to login");
                router.push("/login");
                return;
            }
            if (!res.ok) {
                console.error("Failed to fetch patient:", res.status);
                setHasPatient(false);
                return;
            }
            const patientData = await res.json();
            if (patientData?.id) {
                setPatientId(patientData.id);
                setHasPatient(true);
            } else {
                setHasPatient(false);
            }
        } catch (error) {
            console.error("Failed to fetch patient:", error);
            setHasPatient(false);
        }
    }

    async function fetchDoctors() {
        try {
            // Try fetching from doctors API first
            let res = await fetch("/api/doctors");
            if (res.ok) {
                const data = await res.json();
                const doctorsList = data.map((d: any) => ({
                    id: d.id,
                    user: d.user || { name: "Unknown" },
                    specialization: d.specialization,
                }));
                setDoctors(doctorsList);
                return;
            }

            // Fallback to users API
            res = await fetch("/api/users?role=doctor");
            if (!res.ok) {
                console.error("Failed to fetch doctors");
                return;
            }
            const data = await res.json();
            const doctorsList = data
                .filter((d: any) => d.Doctor)
                .map((d: any) => ({
                    id: d.Doctor.id,
                    user: d.Doctor.user || d.user || { name: "Unknown" },
                    specialization: d.Doctor.specialization,
                }));
            setDoctors(doctorsList);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
            toast({ title: "Failed to load doctors. Please refresh the page.", variant: "destructive" });
        }
    }

    async function fetchAppointments() {
        if (!patientId) return;
        
        try {
            setFetching(true);
            const res = await fetch("/api/appointments");
            if (!res.ok) {
                throw new Error("Failed to fetch appointments");
            }
            const data = await res.json();
            // Filter appointments for current patient
            const filteredAppointments = data.filter((a: any) => a.patientId === patientId);
            setAppointments(filteredAppointments);
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            toast({ title: "Failed to load appointments", variant: "destructive" });
        } finally {
            setFetching(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (!form.doctorId || !form.startsAt) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (!patientId) {
            toast({ 
                title: "Patient profile not found. Please create a patient profile first.", 
                variant: "destructive" 
            });
            router.push("/dashboard/patients/create");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    doctorId: form.doctorId,
                    startsAt: form.startsAt,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to book appointment" }));
                throw new Error(errorData.error || "Failed to book appointment");
            }

            const data = await res.json();

            toast({ title: "Appointment booked successfully!" });
            setForm({ doctorId: "", startsAt: "" });
            fetchAppointments();
        } catch (err: any) {
            toast({ title: err.message || "Failed to book appointment", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    if (!session) {
        return (
            <Box>
                <Alert severity="info">Please login to continue</Alert>
            </Box>
        );
    }

    if (hasPatient === false) {
        return (
            <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    You need to create a patient profile before booking appointments.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => router.push("/dashboard/patients/create")}
                >
                    Create Patient Profile
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Book Appointment
            </Typography>

            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    New Appointment
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Select Doctor"
                        select
                        value={form.doctorId}
                        onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        disabled={doctors.length === 0}
                    >
                        {doctors.length === 0 ? (
                            <MenuItem disabled>No doctors available</MenuItem>
                        ) : (
                            doctors.map((doctor) => (
                                <MenuItem key={doctor.id} value={doctor.id}>
                                    {doctor.user?.name || "Unknown"} {doctor.specialization && `- ${doctor.specialization}`}
                                </MenuItem>
                            ))
                        )}
                    </TextField>
                    <TextField
                        label="Date & Time"
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                    {!patientId && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Please create a patient profile first to book appointments.
                        </Alert>
                    )}
                    {patientId && doctors.length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No doctors are currently available. Please contact the administrator.
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !patientId || doctors.length === 0}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        {loading ? "Booking..." : "Book Appointment"}
                    </Button>
                    {!patientId && (
                        <Button
                            variant="outlined"
                            onClick={() => router.push("/dashboard/patients/create")}
                            sx={{ mt: 1 }}
                            fullWidth
                        >
                            Create Patient Profile
                        </Button>
                    )}
                </form>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    My Appointments
                </Typography>
                {fetching ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : appointments.length === 0 ? (
                    <Typography color="text.secondary" align="center" py={4}>
                        No appointments found. Book your first appointment above!
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Doctor</strong></TableCell>
                                <TableCell><strong>Date & Time</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments.map((appointment) => (
                                <TableRow key={appointment.id} hover>
                                    <TableCell>{appointment.doctor?.user?.name || "N/A"}</TableCell>
                                    <TableCell>{new Date(appointment.startsAt).toLocaleString()}</TableCell>
                                    <TableCell>{appointment.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </Box>
    );
}
