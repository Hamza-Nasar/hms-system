"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { toast } from "sonner";

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    maxAppointmentsPerDay: number;
    appointmentDuration: number;
    timezone: string;
}

export default function SystemSettings() {
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: "HM System",
        siteDescription: "Hospital Management System",
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        smsNotifications: false,
        maxAppointmentsPerDay: 50,
        appointmentDuration: 30,
        timezone: "UTC",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings");
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast.success("Settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Typography>Loading settings...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    System Settings
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ textTransform: "none" }}
                >
                    Save Settings
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
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            General Settings
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Site Name"
                                fullWidth
                                value={settings.siteName}
                                onChange={(e) =>
                                    setSettings({ ...settings, siteName: e.target.value })
                                }
                            />
                            <TextField
                                label="Site Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={settings.siteDescription}
                                onChange={(e) =>
                                    setSettings({ ...settings, siteDescription: e.target.value })
                                }
                            />
                            <TextField
                                label="Timezone"
                                fullWidth
                                value={settings.timezone}
                                onChange={(e) =>
                                    setSettings({ ...settings, timezone: e.target.value })
                                }
                            />
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Appointment Settings
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Max Appointments Per Day"
                                type="number"
                                fullWidth
                                value={settings.maxAppointmentsPerDay}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        maxAppointmentsPerDay: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                            <TextField
                                label="Appointment Duration (minutes)"
                                type="number"
                                fullWidth
                                value={settings.appointmentDuration}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        appointmentDuration: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            System Features
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                maintenanceMode: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Maintenance Mode"
                            />
                            {settings.maintenanceMode && (
                                <Alert severity="warning">
                                    Maintenance mode is enabled. Users will not be able to access the system.
                                </Alert>
                            )}
                            <Divider />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.allowRegistration}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                allowRegistration: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Allow New User Registration"
                            />
                            <Divider />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                emailNotifications: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Enable Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.smsNotifications}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                smsNotifications: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Enable SMS Notifications"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}










