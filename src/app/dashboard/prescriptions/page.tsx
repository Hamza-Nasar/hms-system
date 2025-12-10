"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "@/components/ui/toast";

interface Prescription {
    id: string;
    date: string;
    medications: string;
    dosage?: string;
    duration?: string;
    instructions?: string;
    status: string;
    patient?: {
        name: string;
        userId?: string;
    };
    doctor?: {
        user?: {
            name: string;
        };
        userId?: string;
    };
}

export default function PrescriptionsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        patientId: "",
        medications: "",
        dosage: "",
        duration: "",
        instructions: "",
        status: "ACTIVE",
    });

    const role = (session?.user as any)?.role || "PATIENT";
    const isAdmin = role === "admin" || role === "ADMIN";
    const isDoctor = role === "DOCTOR";

    useEffect(() => {
        fetchPrescriptions();
    if (isAdmin || isDoctor) {
            fetchPatients();
        }
    }, [session]);

    async function fetchPatients() {
        try {
            const res = await fetch("/api/patients");
            if (res.ok) {
                const data = await res.json();
                setPatients(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        }
    }

    // Real-time updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handlePrescriptionUpdate = () => {
            fetchPrescriptions();
        };

        socket.on('prescription_updated', handlePrescriptionUpdate);

        return () => {
            socket.off('prescription_updated', handlePrescriptionUpdate);
        };
    }, [socket, isConnected]);

    async function fetchPrescriptions() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/prescriptions");
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to fetch prescriptions" }));
                throw new Error(errorData.error || "Failed to fetch prescriptions");
            }
            const data = await res.json();
            setPrescriptions(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load prescriptions");
            console.error("Failed to fetch prescriptions:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!session) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                    Prescriptions
                </Typography>
                {(isAdmin || isDoctor) && (
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        New Prescription
                    </Button>
                )}
                {isConnected && (
                    <Chip
                        label="Live"
                        color="success"
                        size="small"
                        sx={{ height: 24, fontSize: "0.7rem" }}
                    />
                )}
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
            <Card>
                <CardContent>
                    {prescriptions.length === 0 ? (
                        <Typography color="text.secondary" align="center" py={4}>
                            No prescriptions found
                        </Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Patient</strong></TableCell>
                                    <TableCell><strong>Doctor</strong></TableCell>
                                    <TableCell><strong>Medications</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {prescriptions.map((prescription) => (
                                    <TableRow key={prescription.id} hover>
                                        <TableCell>{format(new Date(prescription.date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>{prescription.patient?.name || "N/A"}</TableCell>
                                            <TableCell>{prescription.doctor?.user?.name || "N/A"}</TableCell>
                                        <TableCell>{prescription.medications}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={prescription.status}
                                                color={prescription.status === "ACTIVE" ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            )}

            {/* Add Prescription Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Prescription</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Patient</InputLabel>
                            <Select
                                value={formData.patientId}
                                label="Patient"
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            >
                                {patients.map((patient) => (
                                    <MenuItem key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Medications"
                            fullWidth
                            required
                            multiline
                            rows={3}
                            value={formData.medications}
                            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                            placeholder="Enter medication names"
                        />
                        <TextField
                            label="Dosage"
                            fullWidth
                            value={formData.dosage}
                            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            placeholder="e.g., 500mg twice daily"
                        />
                        <TextField
                            label="Duration"
                            fullWidth
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="e.g., 7 days"
                        />
                        <TextField
                            label="Instructions"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Additional instructions for the patient"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={async () => {
                            if (!formData.patientId || !formData.medications) {
                                toast({ title: "Error: Patient and Medications are required", variant: "destructive" });
                                return;
                            }
                            try {
                                const res = await fetch("/api/prescriptions", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(formData),
                                });
                                if (res.ok) {
                                    toast({ title: "Success: Prescription created successfully" });
                                    setOpenDialog(false);
                                    setFormData({
                                        patientId: "",
                                        medications: "",
                                        dosage: "",
                                        duration: "",
                                        instructions: "",
                                        status: "ACTIVE",
                                    });
                                    fetchPrescriptions();
                                } else {
                                    const error = await res.json();
                                    toast({ title: error.error || "Failed to create prescription", variant: "destructive" });
                                }
                            } catch (err: any) {
                                toast({ title: err.message || "Failed to create prescription", variant: "destructive" });
                            }
                        }}
                        variant="contained"
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
