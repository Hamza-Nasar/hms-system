"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import createEmotionCache from "@/lib/createEmotionCache";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const cache = React.useMemo(() => createEmotionCache(), []);
    
    return (
        <CacheProvider value={cache}>
            <ThemeContextProvider>
                {children}
            </ThemeContextProvider>
        </CacheProvider>
    );
}