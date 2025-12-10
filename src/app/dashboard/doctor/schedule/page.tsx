"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Button,
    Alert,
    CircularProgress,
    Paper,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

interface Availability {
    id: string;
    startsAt: string;
    endsAt: string;
    isAvailable: boolean;
}

interface Appointment {
    id: string;
    startsAt: string;
    endsAt?: string;
    status: string;
    patient: {
        name: string;
    };
}

export default function DoctorSchedulePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctorId, setDoctorId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctorSchedule();
    }, [session]);

    // Real-time updates for schedule
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleAppointmentUpdate = () => {
            fetchDoctorSchedule();
        };

        const handleScheduleUpdate = () => {
            fetchDoctorSchedule();
        };

        socket.on('appointment_updated', handleAppointmentUpdate);
        socket.on('schedule_updated', handleScheduleUpdate);

        return () => {
            socket.off('appointment_updated', handleAppointmentUpdate);
            socket.off('schedule_updated', handleScheduleUpdate);
        };
    }, [socket, isConnected]);

    async function fetchDoctorSchedule() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            
            // Fetch doctor ID
            const userRes = await fetch("/api/users");
            if (userRes.ok) {
                const userData = await userRes.json();
                const doctor = userData.find((d: any) => d.Doctor && d.Doctor.userId === session.user.id);
                if (doctor?.Doctor) {
                    const docId = doctor.Doctor.id;
                    setDoctorId(docId);

                    // Fetch availability
                    const availRes = await fetch(`/api/availability?doctorId=${docId}`);
                    if (availRes.ok) {
                        const availData = await availRes.json();
                        setAvailability(availData);
                    }

                    // Fetch appointments
                    const aptRes = await fetch("/api/appointments");
                    if (aptRes.ok) {
                        const aptData = await aptRes.json();
                        const myAppointments = aptData.filter((a: any) => a.doctorId === docId);
                        setAppointments(myAppointments);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!doctorId) {
        return (
            <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Doctor profile not found. Please ensure your account is linked to a doctor profile.
                </Alert>
            </Box>
        );
    }

    // Combine availability and appointments for a unified schedule view
    const scheduleItems = [
        ...availability.map((avail) => ({
            id: avail.id,
            type: "availability" as const,
            startsAt: avail.startsAt,
            endsAt: avail.endsAt,
            title: "Available",
            status: "available",
        })),
        ...appointments.map((apt) => ({
            id: apt.id,
            type: "appointment" as const,
            startsAt: apt.startsAt,
            endsAt: apt.endsAt || apt.startsAt,
            title: `Appointment with ${apt.patient.name}`,
            status: apt.status,
        })),
    ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                    My Schedule
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/dashboard/doctor/availability")}
                >
                    Set Availability
                </Button>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                }}
            >
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Upcoming Availability
                        </Typography>
                        {availability.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No availability set. Click "Set Availability" to add your schedule.
                            </Alert>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Start Time</strong></TableCell>
                                        <TableCell><strong>End Time</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {availability.map((avail) => (
                                        <TableRow key={avail.id} hover>
                                            <TableCell>
                                                {format(new Date(avail.startsAt), "MMM dd, yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(avail.endsAt), "MMM dd, yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={avail.isAvailable ? "Available" : "Unavailable"}
                                                    color={avail.isAvailable ? "success" : "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Upcoming Appointments
                        </Typography>
                            {appointments.length === 0 ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No appointments scheduled.
                                </Alert>
                            ) : (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Patient</strong></TableCell>
                                            <TableCell><strong>Date & Time</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {appointments.map((apt) => (
                                            <TableRow key={apt.id} hover>
                                                <TableCell>{apt.patient.name}</TableCell>
                                                <TableCell>
                                                    {format(new Date(apt.startsAt), "MMM dd, yyyy HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={apt.status}
                                                        color={
                                                            apt.status === "CONFIRMED"
                                                                ? "success"
                                                                : apt.status === "PENDING"
                                                                ? "warning"
                                                                : "default"
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
            </Box>

            {/* Combined Schedule View */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Complete Schedule
                    </Typography>
                    {scheduleItems.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No schedule items. Set your availability to start.
                        </Alert>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Start Time</strong></TableCell>
                                    <TableCell><strong>End Time</strong></TableCell>
                                    <TableCell><strong>Details</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {scheduleItems.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={item.type === "availability" ? "Availability" : "Appointment"}
                                                color={item.type === "availability" ? "info" : "primary"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(item.startsAt), "MMM dd, yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(item.endsAt), "MMM dd, yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status}
                                                color={
                                                    item.status === "CONFIRMED" || item.status === "available"
                                                        ? "success"
                                                        : item.status === "PENDING"
                                                        ? "warning"
                                                        : "default"
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}



