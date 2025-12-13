"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import React from "react";

interface PremiumStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon | React.ComponentType<any>;
    change?: string;
    trend?: "up" | "down" | "neutral";
    className?: string;
    color?: string;
}

export function PremiumStatCard({
    title,
    value,
    icon: Icon,
    change,
    trend = "up",
    className,
    color = "default",
}: PremiumStatCardProps) {
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

    const getColorClasses = () => {
        const colors: Record<string, { bg: string; icon: string }> = {
            default: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "bg-indigo-500" },
            blue: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "bg-blue-500" },
            purple: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "bg-purple-500" },
            green: { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "bg-emerald-500" },
            orange: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "bg-orange-500" },
        };
        return colors[color as keyof typeof colors] || colors.default;
    };

    const colorClasses = getColorClasses();

    return (
        <Card
            ref={cardRef}
            className={cn(
                "group relative border shadow-md hover:shadow-xl transition-all duration-300 hover-lift",
                "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
                "border-slate-200 dark:border-slate-800",
                "hover:border-indigo-200 dark:hover:border-indigo-800",
                "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-indigo-50/30 before:to-purple-50/30 dark:before:from-indigo-950/10 dark:before:to-purple-950/10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10",
                isVisible && "animate-fade-in",
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                    {title}
                </CardTitle>
                <div
                    className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-200",
                        colorClasses.icon,
                        "group-hover:scale-105"
                    )}
                >
                    {React.createElement(Icon as React.ComponentType<any>, {
                        className: "h-5 w-5 text-white",
                        sx: { fontSize: 20, color: "white" },
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {value}
                </div>
                {change && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <TrendingUp
                            className={cn(
                                "h-3 w-3",
                                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                                trend === "down" && "text-red-600 dark:text-red-400 rotate-180",
                                trend === "neutral" && "text-slate-500"
                            )}
                        />
                        <span
                            className={cn(
                                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                                trend === "down" && "text-red-600 dark:text-red-400",
                                trend === "neutral" && "text-slate-600 dark:text-slate-400"
                            )}
                        >
                            {change}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500"> from last month</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}



