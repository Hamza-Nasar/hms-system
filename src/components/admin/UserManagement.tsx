"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    InputAdornment,
    Pagination,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    createdAt: string;
    active?: boolean;
}

export default function UserManagement() {
    const { socket, isConnected } = useSocket();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("user_created", () => {
            fetchUsers();
            toast.success("New user created");
        });

        socket.on("user_updated", () => {
            fetchUsers();
            toast.success("User updated");
        });

        socket.on("user_deleted", () => {
            fetchUsers();
            toast.success("User deleted");
        });

        return () => {
            socket.off("user_created");
            socket.off("user_updated");
            socket.off("user_deleted");
        };
    }, [socket, isConnected]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
        } else {
            setEditingUser(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (userData: any) => {
        try {
            const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
            const method = editingUser ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                toast.success(editingUser ? "User updated successfully" : "User created successfully");
                handleCloseDialog();
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to save user");
            }
        } catch (error) {
            toast.error("Failed to save user");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("User deleted successfully");
                fetchUsers();
            } else {
                toast.error("Failed to delete user");
            }
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !user.active }),
            });

            if (response.ok) {
                toast.success(`User ${user.active ? "deactivated" : "activated"}`);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ textTransform: "none" }}
                >
                    Add User
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                            placeholder="Search users..."
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
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Role"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="doctor">Doctor</MenuItem>
                                <MenuItem value="patient">Patient</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    color={
                                                        user.role === "admin"
                                                            ? "error"
                                                            : user.role === "DOCTOR"
                                                            ? "primary"
                                                            : "default"
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{user.phone || "N/A"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.active !== false ? "Active" : "Inactive"}
                                                    size="small"
                                                    color={user.active !== false ? "success" : "default"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, user)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredUsers.length > rowsPerPage && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Pagination
                                count={Math.ceil(filteredUsers.length / rowsPerPage)}
                                page={page}
                                onChange={(_e, newPage) => setPage(newPage)}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleOpenDialog(selectedUser!); handleMenuClose(); }}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => { handleToggleActive(selectedUser!); handleMenuClose(); }}>
                    {selectedUser?.active !== false ? (
                        <>
                            <BlockIcon sx={{ mr: 1, fontSize: 18 }} /> Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} /> Activate
                        </>
                    )}
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleDeleteUser(selectedUser!.id);
                        handleMenuClose();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                </MenuItem>
            </Menu>

            <UserDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveUser}
                user={editingUser}
            />
        </Box>
    );
}

function UserDialog({
    open,
    onClose,
    onSave,
    user,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    user: User | null;
}) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "PATIENT",
        phone: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.role,
                phone: user.phone || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "PATIENT",
                phone: "",
            });
        }
    }, [user]);

    const handleSubmit = () => {
        if (!formData.name || !formData.email) {
            toast.error("Name and email are required");
            return;
        }
        if (!user && !formData.password) {
            toast.error("Password is required for new users");
            return;
        }
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField
                        label="Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <TextField
                        label={user ? "New Password (leave empty to keep current)" : "Password"}
                        type="password"
                        fullWidth
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!user}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <MenuItem value="PATIENT">Patient</MenuItem>
                            <MenuItem value="DOCTOR">Doctor</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Phone"
                        fullWidth
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {user ? "Update" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}










