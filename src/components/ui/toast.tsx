"use client";
import * as React from "react";
import { Toaster, toast as shadToast } from "sonner";

export const ToastProvider = () => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return <Toaster position="top-right" />;
};

export const toast = ({ title, variant = "default" }: { title: string; variant?: "default" | "destructive" }) => {
    if (variant === "destructive") {
        shadToast.error(title);
    } else {
        shadToast.success(title);
    }
};
