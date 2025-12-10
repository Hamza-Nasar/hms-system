"use client";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Tabs,
    Tab,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { useThemeMode } from "@/contexts/ThemeContext";
import SaveIcon from "@mui/icons-material/Save";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const { mode, setMode } = useThemeMode();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Notification Settings
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [appointmentNotifications, setAppointmentNotifications] = useState(true);
    const [prescriptionNotifications, setPrescriptionNotifications] = useState(true);
    const [labTestNotifications, setLabTestNotifications] = useState(true);
    const [billingNotifications, setBillingNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Profile Settings
    const [profileData, setProfileData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
    });

    // Language & Region
    const [language, setLanguage] = useState("en");
    const [timezone, setTimezone] = useState("UTC");
    const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

    // Privacy Settings
    const [profileVisibility, setProfileVisibility] = useState("private");
    const [dataSharing, setDataSharing] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const storedNotifications = localStorage.getItem("notifications");
        const storedEmailNotifications = localStorage.getItem("emailNotifications");
        const storedSmsNotifications = localStorage.getItem("smsNotifications");
        const storedSoundEnabled = localStorage.getItem("soundEnabled");
        const storedLanguage = localStorage.getItem("language");
        const storedTimezone = localStorage.getItem("timezone");

        if (storedNotifications !== null) setNotifications(storedNotifications === "true");
        if (storedEmailNotifications !== null) setEmailNotifications(storedEmailNotifications === "true");
        if (storedSmsNotifications !== null) setSmsNotifications(storedSmsNotifications === "true");
        if (storedSoundEnabled !== null) setSoundEnabled(storedSoundEnabled === "true");
        if (storedLanguage) setLanguage(storedLanguage);
        if (storedTimezone) setTimezone(storedTimezone);

        // Load profile data
        if (session?.user) {
            setProfileData({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: (session.user as any).phone || "",
            });
        }
    }, [session]);

    const handleSave = () => {
        localStorage.setItem("notifications", notifications.toString());
        localStorage.setItem("emailNotifications", emailNotifications.toString());
        localStorage.setItem("smsNotifications", smsNotifications.toString());
        localStorage.setItem("soundEnabled", soundEnabled.toString());
        localStorage.setItem("language", language);
        localStorage.setItem("timezone", timezone);
        toast({ title: "Settings saved successfully!" });
    };

    const handleThemeChange = (newTheme: string) => {
        setMode(newTheme as "light" | "dark" | "system");
        toast({ title: "Theme updated!" });
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ title: "Passwords do not match", variant: "destructive" });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (response.ok) {
                toast({ title: "Password changed successfully!" });
                setShowPasswordDialog(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                const error = await response.json();
                toast({ title: error.error || "Failed to change password", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Failed to change password", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Settings
            </Typography>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab icon={<PersonIcon />} label="Profile" />
                <Tab icon={<NotificationsIcon />} label="Notifications" />
                <Tab icon={<SecurityIcon />} label="Security" />
                <Tab icon={<LanguageIcon />} label="Language & Region" />
            </Tabs>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3}>
                                Profile Information
                            </Typography>
                            <TextField
                                label="Full Name"
                                fullWidth
                                margin="normal"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                margin="normal"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                disabled
                            />
                            <TextField
                                label="Phone Number"
                                fullWidth
                                margin="normal"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                sx={{ mt: 2 }}
                            >
                                Save Profile
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3}>
                                Appearance
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Theme</InputLabel>
                                <Select
                                    value={mode}
                                    onChange={(e) => handleThemeChange(e.target.value)}
                                    label="Theme"
                                >
                                    <MenuItem value="light">Light</MenuItem>
                                    <MenuItem value="dark">Dark</MenuItem>
                                    <MenuItem value="system">System Default</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Box>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: "grid", gap: 3 }}>
                    <Card>
                        <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={3}>
                                    Notification Preferences
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications}
                                            onChange={(e) => setNotifications(e.target.checked)}
                                        />
                                    }
                                    label="Enable Notifications"
                                />

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={emailNotifications}
                                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Email Notifications"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={smsNotifications}
                                                onChange={(e) => setSmsNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="SMS Notifications"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={soundEnabled}
                                                onChange={(e) => setSoundEnabled(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Sound Alerts"
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                                    Notification Types
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={appointmentNotifications}
                                                onChange={(e) => setAppointmentNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Appointment Updates"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={prescriptionNotifications}
                                                onChange={(e) => setPrescriptionNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Prescription Updates"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={labTestNotifications}
                                                onChange={(e) => setLabTestNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Lab Test Results"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={billingNotifications}
                                                onChange={(e) => setBillingNotifications(e.target.checked)}
                                                disabled={!notifications}
                                            />
                                        }
                                        label="Billing Updates"
                                    />
                                </Box>
                            </CardContent>
                    </Card>
                </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={2}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3}>
                                Password
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setShowPasswordDialog(true)}
                            >
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3}>
                                Privacy
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Profile Visibility</InputLabel>
                                <Select
                                    value={profileVisibility}
                                    onChange={(e) => setProfileVisibility(e.target.value)}
                                    label="Profile Visibility"
                                >
                                    <MenuItem value="public">Public</MenuItem>
                                    <MenuItem value="private">Private</MenuItem>
                                    <MenuItem value="friends">Friends Only</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={dataSharing}
                                        onChange={(e) => setDataSharing(e.target.checked)}
                                    />
                                }
                                label="Allow data sharing for analytics"
                            />
                        </CardContent>
                    </Card>
                </Box>
            </TabPanel>

            {/* Language & Region Tab */}
            <TabPanel value={tabValue} index={3}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr" },
                        gap: 3,
                    }}
                >
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={3}>
                                    Language & Region
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Language</InputLabel>
                                    <Select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        label="Language"
                                    >
                                        <MenuItem value="en">English</MenuItem>
                                        <MenuItem value="ur">Urdu</MenuItem>
                                        <MenuItem value="ar">Arabic</MenuItem>
                                        <MenuItem value="es">Spanish</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Timezone</InputLabel>
                                    <Select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        label="Timezone"
                                    >
                                        <MenuItem value="UTC">UTC</MenuItem>
                                        <MenuItem value="Asia/Karachi">Asia/Karachi (PKT)</MenuItem>
                                        <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                                        <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Date Format</InputLabel>
                                    <Select
                                        value={dateFormat}
                                        onChange={(e) => setDateFormat(e.target.value)}
                                        label="Date Format"
                                    >
                                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>
                </Box>
            </TabPanel>

            <Box mt={3}>
                <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
                    Save All Settings
                </Button>
            </Box>

            {/* Password Change Dialog */}
            <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                        <TextField
                            label="Current Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                ),
                            }}
                        />
                        <TextField
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <TextField
                            label="Confirm New Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={handlePasswordChange} variant="contained" disabled={loading}>
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
