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
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useSocket } from "@/hooks/useSocket";

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    resource: string;
    timestamp: string;
    ip?: string;
    status: string;
}

export default function ActivityLogs() {
    const { socket, isConnected } = useSocket();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const rowsPerPage = 20;

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("activity_log", (log: ActivityLog) => {
            setLogs((prev) => [log, ...prev].slice(0, 100)); // Keep last 100 logs
        });

        return () => {
            socket.off("activity_log");
        };
    }, [socket, isConnected]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/activity-logs");
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || log.status === filter;
        return matchesSearch && matchesFilter;
    });

    const paginatedLogs = filteredLogs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} mb={3}>
                Activity Logs
            </Typography>

            <Card>
                <CardContent>
                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="success">Success</MenuItem>
                                <MenuItem value="error">Error</MenuItem>
                                <MenuItem value="warning">Warning</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Resource</TableCell>
                                    <TableCell>IP Address</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{log.user}</TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell>{log.resource}</TableCell>
                                            <TableCell>{log.ip || "N/A"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.status}
                                                    size="small"
                                                    color={
                                                        log.status === "success"
                                                            ? "success"
                                                            : log.status === "error"
                                                            ? "error"
                                                            : "warning"
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredLogs.length > rowsPerPage && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Pagination
                                count={Math.ceil(filteredLogs.length / rowsPerPage)}
                                page={page}
                                onChange={(_e, newPage) => setPage(newPage)}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}










