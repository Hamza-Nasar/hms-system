"use client";

import React from "react";
import { LucideIcon, Inbox, FileX, Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon | React.ComponentType<any>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

const defaultIcons: Record<string, LucideIcon> = {
    inbox: Inbox,
    file: FileX,
    search: Search,
    calendar: Calendar,
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const DefaultIcon = Icon || Inbox;

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 px-4 text-center",
                className
            )}
        >
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    {React.isValidElement(DefaultIcon) ? (
                        DefaultIcon
                    ) : (
                        <DefaultIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    )}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

