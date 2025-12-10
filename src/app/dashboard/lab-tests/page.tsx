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

interface LabTest {
    id: string;
    date: string;
    testName: string;
    testType?: string;
    results?: string;
    status: string;
    doctorNotes?: string;
    patient?: {
        name: string;
        userId?: string;
    };
}

export default function LabTestsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        patientId: "",
        testName: "",
        testType: "",
        results: "",
        status: "PENDING",
        doctorNotes: "",
    });

    const role = (session?.user as any)?.role || "PATIENT";
    const isAdmin = role === "admin" || role === "ADMIN";
    const isDoctor = role === "DOCTOR";

    useEffect(() => {
        fetchLabTests();
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

        const handleLabTestUpdate = () => {
            fetchLabTests();
        };

        socket.on('labtest_updated', handleLabTestUpdate);

        return () => {
            socket.off('labtest_updated', handleLabTestUpdate);
        };
    }, [socket, isConnected]);

    async function fetchLabTests() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/lab-tests");
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to fetch lab tests" }));
                throw new Error(errorData.error || "Failed to fetch lab tests");
            }
            const data = await res.json();
            setLabTests(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load lab tests");
            console.error("Failed to fetch lab tests:", err);
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
                    Lab Tests
                </Typography>
                {(isAdmin || isDoctor) && (
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        New Test
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
                    {labTests.length === 0 ? (
                        <Typography color="text.secondary" align="center" py={4}>
                            No lab tests found
                        </Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Patient</strong></TableCell>
                                    <TableCell><strong>Test Name</strong></TableCell>
                                    <TableCell><strong>Test Type</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {labTests.map((test) => (
                                    <TableRow key={test.id} hover>
                                        <TableCell>{format(new Date(test.date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>{test.patient?.name || "N/A"}</TableCell>
                                        <TableCell>{test.testName}</TableCell>
                                        <TableCell>{test.testType || "N/A"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={test.status}
                                                color={
                                                    test.status === "COMPLETED"
                                                        ? "success"
                                                        : test.status === "PENDING"
                                                        ? "warning"
                                                        : "default"
                                                }
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

            {/* Add Lab Test Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Lab Test</DialogTitle>
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
                            label="Test Name"
                            fullWidth
                            required
                            value={formData.testName}
                            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                            placeholder="e.g., Blood Test, X-Ray"
                        />
                        <TextField
                            label="Test Type"
                            fullWidth
                            value={formData.testType}
                            onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                            placeholder="e.g., Complete Blood Count"
                        />
                        <TextField
                            label="Results"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.results}
                            onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                            placeholder="Test results (if available)"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Doctor Notes"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.doctorNotes}
                            onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                            placeholder="Additional notes or observations"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={async () => {
                            if (!formData.patientId || !formData.testName) {
                                toast({ title: "Error: Patient and Test Name are required", variant: "destructive" });
                                return;
                            }
                            try {
                                const res = await fetch("/api/lab-tests", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(formData),
                                });
                                if (res.ok) {
                                    toast({ title: "Success: Lab test created successfully" });
                                    setOpenDialog(false);
                                    setFormData({
                                        patientId: "",
                                        testName: "",
                                        testType: "",
                                        results: "",
                                        status: "PENDING",
                                        doctorNotes: "",
                                    });
                                    fetchLabTests();
                                } else {
                                    const error = await res.json();
                                    toast({ title: error.error || "Failed to create lab test", variant: "destructive" });
                                }
                            } catch (err: any) {
                                toast({ title: err.message || "Failed to create lab test", variant: "destructive" });
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
