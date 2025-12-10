"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useSession } from "next-auth/react";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { toast } from "@/components/ui/toast";

interface MedicalRecord {
    id: string;
    date: string;
    diagnosis: string;
    symptoms?: string;
    treatment?: string;
    notes?: string;
    patient?: {
        name: string;
    };
    doctor?: {
        user?: {
            name: string;
        };
    };
}

export default function MedicalRecordsPage() {
    const { data: session } = useSession();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        patientId: "",
        diagnosis: "",
        symptoms: "",
        treatment: "",
        notes: "",
    });

    const role = (session?.user as any)?.role || "PATIENT";
    const isAdmin = role === "admin" || role === "ADMIN";
    const isDoctor = role === "DOCTOR";

    useEffect(() => {
        fetchRecords();
    if (isAdmin || isDoctor) {
            fetchPatients();
        }
    }, [session]);

    async function fetchRecords() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/medical-records");
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to fetch medical records" }));
                throw new Error(errorData.error || "Failed to fetch medical records");
            }
            const data = await res.json();
            setRecords(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load medical records");
            console.error("Failed to fetch medical records:", err);
        } finally {
            setLoading(false);
        }
    }

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
                    Medical Records
                </Typography>
                {(isAdmin || isDoctor) && (
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add Record
                    </Button>
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
                    {records.length === 0 ? (
                        <Typography color="text.secondary" align="center" py={4}>
                            No medical records found
                        </Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Patient</strong></TableCell>
                                    <TableCell><strong>Doctor</strong></TableCell>
                                    <TableCell><strong>Diagnosis</strong></TableCell>
                                    <TableCell><strong>Treatment</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id} hover>
                                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>{record.patient?.name || "N/A"}</TableCell>
                                            <TableCell>{record.doctor?.user?.name || "N/A"}</TableCell>
                                        <TableCell>{record.diagnosis}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.treatment ? "Yes" : "No"}
                                                color={record.treatment ? "success" : "default"}
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

            {/* Add Medical Record Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Medical Record</DialogTitle>
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
                            label="Diagnosis"
                            fullWidth
                            required
                            multiline
                            rows={3}
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            placeholder="Enter diagnosis"
                        />
                        <TextField
                            label="Symptoms"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            placeholder="Patient symptoms"
                        />
                        <TextField
                            label="Treatment"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.treatment}
                            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                            placeholder="Treatment plan"
                        />
                        <TextField
                            label="Notes"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={async () => {
                            if (!formData.patientId || !formData.diagnosis) {
                                toast({ title: "Error: Patient and Diagnosis are required", variant: "destructive" });
                                return;
                            }
                            try {
                                // For doctors, doctorId will be auto-fetched by API
                                // For admins, we need to get doctor list or let them select
                                const payload: any = { ...formData };
                                if (isDoctor) {
                                    // Doctor ID will be auto-fetched from session
                                    delete payload.doctorId;
                                }
                                
                                const res = await fetch("/api/medical-records", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload),
                                });
                                if (res.ok) {
                                    toast({ title: "Success: Medical record created successfully" });
                                    setOpenDialog(false);
                                    setFormData({
                                        patientId: "",
                                        diagnosis: "",
                                        symptoms: "",
                                        treatment: "",
                                        notes: "",
                                    });
                                    fetchRecords();
                                } else {
                                    const error = await res.json();
                                    toast({ title: error.error || "Failed to create medical record", variant: "destructive" });
                                }
                            } catch (err: any) {
                                toast({ title: err.message || "Failed to create medical record", variant: "destructive" });
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
