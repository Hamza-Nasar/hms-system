"use client";
import { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Alert, Card, CardContent, Chip } from "@mui/material";
import { useSocket } from "@/hooks/useSocket";

interface Bill {
    id: string;
    patientId: string;
    amount: number;
    status: string;
    createdAt: string;
    patient?: {
        name: string;
    };
}

export default function BillingPage() {
    const { socket, isConnected } = useSocket();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBills() {
            try {
                setLoading(true);
                const res = await fetch("/api/billing");
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ error: "Failed to fetch bills" }));
                    throw new Error(errorData.error || "Failed to fetch bills");
                }
                const data = await res.json();
                setBills(data || []);
            } catch (err: any) {
                setError(err.message || "Failed to load billing records");
            } finally {
                setLoading(false);
            }
        }
        fetchBills();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleBillingUpdate = () => {
            async function fetchBills() {
                try {
                    const res = await fetch("/api/billing");
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: "Failed to fetch bills" }));
                        throw new Error(errorData.error || "Failed to fetch bills");
                    }
                    const data = await res.json();
                    setBills(data || []);
                } catch (err: any) {
                    console.error("Failed to refresh bills:", err);
                }
            }
            fetchBills();
        };

        socket.on('billing_updated', handleBillingUpdate);

        return () => {
            socket.off('billing_updated', handleBillingUpdate);
        };
    }, [socket, isConnected]);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                Billing Records
            </Typography>
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
                        {bills.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                No billing records found
                            </Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Patient</strong></TableCell>
                                        <TableCell><strong>Amount</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bills.map(b => (
                                        <TableRow key={b.id} hover>
                                            <TableCell>{b.patient?.name || b.patientId}</TableCell>
                                            <TableCell>${b.amount?.toFixed(2) || "0.00"}</TableCell>
                                            <TableCell>{b.status || "PENDING"}</TableCell>
                                            <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
