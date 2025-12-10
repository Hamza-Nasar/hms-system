"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, Paper, MenuItem, Alert, Divider } from "@mui/material";
import { toast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

export default function CreatePatientPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [form, setForm] = useState({
        name: "",
        age: "",
        disease: "",
        phone: "",
        address: "",
        gender: "",
        bloodGroup: "",
        emergencyContact: "",
        insuranceNumber: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!form.name || !form.age) {
            setError("Name and Age are required");
            setLoading(false);
            return;
        }

        const ageNum = parseInt(form.age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
            setError("Please enter a valid age");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/patients/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    age: ageNum,
                    disease: form.disease || undefined,
                    phone: form.phone || undefined,
                    address: form.address || undefined,
                    gender: form.gender || undefined,
                    bloodGroup: form.bloodGroup || undefined,
                    emergencyContact: form.emergencyContact || undefined,
                    insuranceNumber: form.insuranceNumber || undefined,
                    email: form.email || undefined,
                    password: form.password || undefined,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to create patient" }));
                throw new Error(errorData.error || "Failed to create patient");
            }

            const data = await res.json();
            toast({ title: "Patient created successfully!" });
            router.push("/dashboard/patients");
        } catch (err: any) {
            setError(err.message || "Failed to create patient");
            toast({ title: err.message || "Failed to create patient", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    if (!session) {
        return (
            <Box p={4}>
                <Alert severity="info">Please login to continue</Alert>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Paper elevation={2} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
                <Typography variant="h5" gutterBottom>
                    Create New Patient
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Patient Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Age"
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ min: 0, max: 150 }}
                    />
                    <TextField
                        label="Gender"
                        select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        label="Disease/Condition"
                        value={form.disease}
                        onChange={(e) => setForm({ ...form, disease: e.target.value })}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                        placeholder="Enter medical condition (optional)"
                    />
                    <TextField
                        label="Phone Number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="tel"
                    />
                    <TextField
                        label="Address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Blood Group"
                        select
                        value={form.bloodGroup}
                        onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Select Blood Group</MenuItem>
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                    </TextField>
                    <TextField
                        label="Emergency Contact"
                        value={form.emergencyContact}
                        onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                        fullWidth
                        margin="normal"
                        placeholder="Name and phone number"
                    />
                    <TextField
                        label="Insurance Number"
                        value={form.insuranceNumber}
                        onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    {(session?.user as any)?.role === "admin" && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                User Account (Optional - for admin)
                            </Typography>
                            <TextField
                                label="Email (for user account)"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                fullWidth
                                margin="normal"
                                placeholder="Leave blank to auto-generate"
                            />
                            <TextField
                                label="Password (for user account)"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                fullWidth
                                margin="normal"
                                placeholder="Leave blank to use default password"
                            />
                        </>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box display="flex" gap={2} mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Patient"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
