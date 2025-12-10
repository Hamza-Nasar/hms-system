"use client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../theme";

const muiCache = createCache({ key: "mui", prepend: true });

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
