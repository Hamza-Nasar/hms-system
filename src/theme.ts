import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#6366f1",
            light: "#818cf8",
            dark: "#4f46e5",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#ec4899",
            light: "#f472b6",
            dark: "#db2777",
        },
        success: {
            main: "#10b981",
            light: "#34d399",
            dark: "#059669",
        },
        error: {
            main: "#ef4444",
            light: "#f87171",
            dark: "#dc2626",
        },
        warning: {
            main: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
        },
        info: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
        },
        background: {
            default: "#fafbfc",
            paper: "#ffffff",
        },
        text: {
            primary: "#0f172a",
            secondary: "#64748b",
        },
    },
    typography: {
        fontFamily: [
            "var(--font-geist-sans)",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
        ].join(","),
        h1: {
            fontWeight: 700,
            fontSize: "2.5rem",
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: "2rem",
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            fontSize: "1.75rem",
            lineHeight: 1.4,
        },
        h4: {
            fontWeight: 600,
            fontSize: "1.5rem",
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 600,
            fontSize: "1.25rem",
            lineHeight: 1.5,
        },
        h6: {
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.5,
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "12px 28px",
                    boxShadow: "none",
                    fontWeight: 600,
                    textTransform: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                        transform: "translateY(-2px)",
                    },
                },
                contained: {
                    background: "#6366f1",
                    "&:hover": {
                        background: "#4f46e5",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
                    transition: "all 0.2s ease",
                    background: "#ffffff",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
                        transform: "translateY(-2px)",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                },
                elevation1: {
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

export default theme;
