"use client";

import { useEffect, useState } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useSocket } from "@/hooks/useSocket";
import { Alert } from "@mui/material";

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const { isConnected, socket } = useSocket();
    const [showWarning, setShowWarning] = useState(false);
    useRealtimeNotifications(); // Initialize real-time notifications

    useEffect(() => {
        // Show warning after 3 seconds if not connected (only in development)
        if (process.env.NODE_ENV === 'development' && !isConnected) {
            const timer = setTimeout(() => {
                setShowWarning(true);
            }, 3000);
            return () => clearTimeout(timer);
            } else {
            setShowWarning(false);
        }
    }, [isConnected]);

    return (
        <>
            {showWarning && !isConnected && (
                <Alert 
                    severity="info" 
                    sx={{ 
                        position: 'fixed', 
                        top: 70, 
                        right: 20, 
                        zIndex: 9999,
                        maxWidth: 400,
                        boxShadow: 2
                    }}
                    onClose={() => setShowWarning(false)}
                >
                    <strong>Real-time features not available</strong>
                    <br />
                    Run <code>npm run dev:server</code> to enable live updates
                </Alert>
            )}
            {children}
        </>
    );
}


