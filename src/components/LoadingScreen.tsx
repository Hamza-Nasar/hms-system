"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Hospital } from "lucide-react";

interface LoadingScreenProps {
    isLoading?: boolean;
    message?: string;
}

export function LoadingScreen({ isLoading = true, message = "Loading..." }: LoadingScreenProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setShow(true);
        } else {
            // Delay hiding for smooth transition
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!show) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex items-center justify-center",
                "bg-gradient-to-br from-background via-background to-muted/20",
                "backdrop-blur-sm",
                "transition-opacity duration-300",
                isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div className="flex flex-col items-center gap-8">
                {/* Animated Logo/Icon - YouTube style */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
                        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full" />
                    </div>
                    
                    {/* Middle ring */}
                    <div className="absolute inset-2 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }}>
                        <div className="w-20 h-20 border-4 border-primary/30 border-r-primary rounded-full" />
                    </div>
                    
                    {/* Inner pulsing circle with icon */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" style={{ animationDuration: "1.5s" }} />
                        <div className="relative z-10">
                            <Hospital className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Loading Text with animated dots */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-xl font-semibold text-foreground">
                        {message}
                    </p>
                    <div className="flex gap-2">
                        <div 
                            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
                            style={{ animationDelay: "0s", animationDuration: "1.4s" }}
                        />
                        <div 
                            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
                            style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
                        />
                        <div 
                            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
                            style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Page transition loading component
export function PageTransitionLoader() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [prevPath, setPrevPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== prevPath) {
            setIsLoading(true);
            setPrevPath(pathname);
            
            // Hide loader after a short delay (page loaded)
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [pathname, prevPath]);

    return <LoadingScreen isLoading={isLoading} message="Loading page..." />;
}

