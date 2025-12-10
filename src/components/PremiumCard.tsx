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
                "group relative border shadow-sm transition-all duration-200",
                "bg-white dark:bg-slate-900",
                hover && "hover:shadow-md hover:-translate-y-1",
                isVisible && "animate-fade-in",
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



