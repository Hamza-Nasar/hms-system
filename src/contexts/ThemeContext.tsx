"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createTheme, ThemeProvider as MUIThemeProvider, Theme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    actualMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Return default values instead of throwing to prevent crashes
        return {
            mode: "system" as ThemeMode,
            setMode: () => {},
            actualMode: "light" as "light" | "dark",
        };
    }
    return context;
}

const getSystemPreference = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = (): ThemeMode => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme-mode");
    return (stored as ThemeMode) || "system";
};

const createAppTheme = (mode: "light" | "dark"): Theme => {
    return createTheme({
        palette: {
            mode,
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
            ...(mode === "dark"
                ? {
                      background: {
                          default: "#0f172a",
                          paper: "#1e293b",
                      },
                      text: {
                          primary: "#f1f5f9",
                          secondary: "#cbd5e1",
                      },
                  }
                : {
                      background: {
                          default: "#f8fafc",
                          paper: "#ffffff",
                      },
                      text: {
                          primary: "#1e293b",
                          secondary: "#64748b",
                      },
                  }),
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
                        borderRadius: 8,
                        padding: "10px 24px",
                        boxShadow: "none",
                        "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        },
                    },
                    contained: {
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: mode === "dark"
                            ? "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            boxShadow: mode === "dark"
                                ? "0 10px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)"
                                : "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.06)",
                            transform: "translateY(-2px)",
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: mode === "dark"
                            ? "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
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
};

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    // Initialize with system preference or stored value
    const [mode, setModeState] = useState<ThemeMode>("system");
    const [mounted, setMounted] = useState(false);

    // Mark as mounted after initial render and load theme
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setModeState(getStoredTheme());
        }
    }, []);

    // Calculate actual mode (light/dark) based on preference
    const actualMode = useMemo(() => {
        if (!mounted) return "light"; // Default during SSR
        if (mode === "system") {
            return getSystemPreference();
        }
        return mode;
    }, [mode, mounted]);

    // Listen to system preference changes
    useEffect(() => {
        if (mode !== "system" || typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            // Re-render when system preference changes
            // The actualMode will update automatically via useMemo
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [mode]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        if (typeof window !== "undefined") {
            localStorage.setItem("theme-mode", newMode);
        }
    };

    const theme = useMemo(() => {
        if (!mounted) {
            // Return a default theme during SSR
            return createAppTheme("light");
        }
        return createAppTheme(actualMode);
    }, [actualMode, mounted]);

    // Update HTML class for dark mode
    useEffect(() => {
        if (typeof document !== "undefined") {
            const html = document.documentElement;
            if (actualMode === "dark") {
                html.classList.add("dark");
            } else {
                html.classList.remove("dark");
            }
        }
    }, [actualMode]);

    // Always provide the context, even during initial render
    // This prevents the "must be used within ThemeContextProvider" error
    const contextValue = useMemo(
        () => ({ mode, setMode, actualMode }),
        [mode, actualMode]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <MUIThemeProvider theme={theme}>
                {mounted && <CssBaseline enableColorScheme />}
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
}

