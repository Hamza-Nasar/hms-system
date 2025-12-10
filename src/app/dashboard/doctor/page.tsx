"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from "@mui/material";
import { toast } from "@/components/ui/toast";

interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    startsAt: string;
    status: string;
    patient?: {
        name: string;
    };
}

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const res = await fetch("/api/appointments");
                if (!res.ok) {
                    throw new Error("Failed to fetch appointments");
                }
                const data = await res.json();
                setAppointments(data || []);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
                toast({ title: "Failed to load appointments", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (appointmentId: string, status: string) => {
        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to update appointment" }));
                throw new Error(errorData.error || "Failed to update appointment");
            }
            const updatedAppointment = await res.json();
            setAppointments(prev => 
                prev.map(a => a.id === appointmentId ? { ...a, status } : a)
            );
            toast({ title: `Appointment ${status.toLowerCase()} successfully!` });
        } catch (error: any) {
            console.error("Failed to update appointment:", error);
            toast({ title: error.message || "Failed to update appointment", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Doctor Dashboard
            </Typography>

            {/* Cards */}
            <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
                <Card className="p-4">
                    <Typography variant="h6" color="text.secondary">Total Appointments</Typography>
                    <Typography variant="h4" fontWeight={700}>{appointments.length}</Typography>
                </Card>
                <Card className="p-4">
                    <Typography variant="h6" color="text.secondary">Pending Approvals</Typography>
                    <Typography variant="h4" fontWeight={700}>{appointments.filter(a => a.status === "PENDING").length}</Typography>
                </Card>
            </Box>

            {/* Appointment Table */}
            <Box>
                <Typography variant="h6" gutterBottom mb={2}>
                    Appointments
                </Typography>
                {appointments.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">No appointments found</Typography>
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Patient</strong></TableCell>
                                <TableCell><strong>Date & Time</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments.map(a => (
                                <TableRow key={a.id} hover>
                                    <TableCell>{a.patient?.name || a.patientId || "N/A"}</TableCell>
                                    <TableCell>{new Date(a.startsAt).toLocaleString()}</TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell>
                                        {a.status === "PENDING" && (
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleStatusUpdate(a.id, "CONFIRMED")}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleStatusUpdate(a.id, "REJECTED")}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Box>
        </Box>
    );
}
