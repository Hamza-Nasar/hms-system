"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "./LoadingScreen";

export function PageTransition() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [prevPath, setPrevPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== prevPath) {
            setIsLoading(true);
            setPrevPath(pathname);
            
            // Hide loader after page transition
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 400);
            
            return () => clearTimeout(timer);
        }
    }, [pathname, prevPath]);

    return <LoadingScreen isLoading={isLoading} message="Loading page..." />;
}


