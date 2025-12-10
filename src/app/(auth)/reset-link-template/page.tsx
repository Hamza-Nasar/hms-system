"use client";

import { Box, Paper, Typography, Button, Link, Alert, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ResetLinkTemplatePage() {
    const router = useRouter();

    // Example reset link (for demonstration)
    const exampleResetLink = "http://localhost:3000/reset-password?token=abc123xyz789exampletoken456def";
    const exampleEmail = "user@example.com";
    const exampleName = "John Doe";

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="background.default"
            sx={{ py: 4 }}
        >
            <Box sx={{ width: "100%", maxWidth: 800 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Typography variant="h4" fontWeight={600}>
                        Password Reset Email Template
                    </Typography>
                </Box>

                {/* Email Preview */}
                <Paper elevation={3} sx={{ p: 0, overflow: "hidden" }}>
                    {/* Email Header */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                            color: "white",
                            p: 4,
                            textAlign: "center",
                        }}
                    >
                        <LockIcon sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h4" fontWeight={600}>
                            🔐 Password Reset
                        </Typography>
                    </Box>

                    {/* Email Content */}
                    <Box sx={{ p: 4 }}>
                        {/* Greeting */}
                        <Typography variant="body1" sx={{ mb: 2, fontSize: 16, lineHeight: 1.6 }}>
                            Hello <strong>{exampleName}</strong>,
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 2, fontSize: 16, lineHeight: 1.6, color: "#333" }}>
                            You requested to reset your password for your <strong>HM System</strong> account.
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3, fontSize: 16, lineHeight: 1.6, color: "#333" }}>
                            Click the button below to reset your password:
                        </Typography>

                        {/* Reset Button */}
                        <Box sx={{ textAlign: "center", my: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    boxShadow: 3,
                                }}
                                onClick={() => {
                                    // Copy link to clipboard
                                    navigator.clipboard.writeText(exampleResetLink);
                                    alert("Reset link copied to clipboard!");
                                }}
                            >
                                Reset Password
                            </Button>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2, mt: 4, color: "#666", fontSize: 14 }}>
                            Or copy and paste this link into your browser:
                        </Typography>

                        {/* Reset Link Box */}
                        <Box
                            sx={{
                                bgcolor: "#f5f5f5",
                                p: 2,
                                borderRadius: 1,
                                borderLeft: "4px solid #1976d2",
                                mb: 3,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#1976d2",
                                    fontSize: 13,
                                    wordBreak: "break-all",
                                    fontFamily: "monospace",
                                }}
                            >
                                {exampleResetLink}
                            </Typography>
                        </Box>

                        {/* Warning Box */}
                        <Alert
                            severity="warning"
                            sx={{
                                mb: 3,
                                "& .MuiAlert-icon": { fontSize: 24 },
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                ⚠️ Important:
                            </Typography>
                            <Typography variant="body2">
                                This link will expire in <strong>1 hour</strong>. If you didn't request this password
                                reset, please ignore this email and your password will remain unchanged.
                            </Typography>
                        </Alert>

                        <Divider sx={{ my: 3 }} />

                        {/* Footer */}
                        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #eee" }}>
                            <Typography variant="body2" sx={{ color: "#999", fontSize: 12, mb: 1 }}>
                                Best regards,
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
                                HM System Team
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#999", fontSize: 12 }}>
                                Hospital Management System
                            </Typography>
                        </Box>
                    </Box>

                    {/* Email Footer Bar */}
                    <Box
                        sx={{
                            bgcolor: "#f5f5f5",
                            p: 2,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "#999", fontSize: 12 }}>
                            This is an automated email. Please do not reply to this message.
                        </Typography>
                    </Box>
                </Paper>

                {/* Template Info */}
                <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Template Information
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Template Name:</strong> Password Reset
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Subject Line:</strong> Password Reset Request - HM System
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Template Variables:</strong>
                        </Typography>
                        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                            <li>
                                <code>{`{{to_name}}`}</code> - Recipient's name ({exampleName})
                            </li>
                            <li>
                                <code>{`{{to_email}}`}</code> - Recipient's email ({exampleEmail})
                            </li>
                            <li>
                                <code>{`{{subject}}`}</code> - Email subject
                            </li>
                            <li>
                                <code>{`{{reset_link}}`}</code> - Password reset URL
                            </li>
                        </Box>
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This is a preview of how the password reset email will look. In development mode, 
                            reset links are logged to the server console instead of being sent via email.
                        </Alert>
                    </Box>
                </Paper>

                {/* Actions */}
                <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
                    <Button
                        variant="outlined"
                        onClick={() => router.push("/forgot-password")}
                    >
                        Test Forgot Password
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const testLink = `${window.location.origin}/reset-password?token=test123`;
                            navigator.clipboard.writeText(testLink);
                            alert("Test reset link copied to clipboard!");
                        }}
                    >
                        Copy Test Reset Link
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}



