"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface PremiumCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function PremiumCard({
    title,
    description,
    children,
    footer,
    className,
    hover = true,
}: PremiumCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, []);

    return (
        <Card
            ref={cardRef}
            className={cn(
                "group relative border shadow-sm transition-all duration-300",
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
                "border-slate-200 dark:border-slate-800",
                hover && "hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-800",
                isVisible && "animate-fade-in",
                "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-indigo-50/50 before:to-purple-50/50 dark:before:from-indigo-950/20 dark:before:to-purple-950/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10",
                className
            )}
        >
            {title && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            <CardContent className={!title ? "p-6" : ""}>{children}</CardContent>
            {footer && <CardFooter className="pt-4">{footer}</CardFooter>}
        </Card>
    );
}



