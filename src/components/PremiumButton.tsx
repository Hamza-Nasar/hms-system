"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "gradient" | "outline" | "ghost";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
}

export function PremiumButton({
    children,
    variant = "default",
    icon: Icon,
    iconPosition = "left",
    className,
    ...props
}: PremiumButtonProps) {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:text-primary-foreground",
        gradient: "bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl dark:text-white",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:hover:text-white",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground",
    };

    return (
        <Button
            className={cn(
                "transition-all duration-300 font-semibold",
                variants[variant],
                className
            )}
            {...props}
        >
            {Icon && iconPosition === "left" && <Icon className="mr-2 h-4 w-4" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="ml-2 h-4 w-4" />}
        </Button>
    );
}



