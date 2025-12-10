"use client";

import { PremiumStatCard } from "./PremiumStatCard";
import { Users, Calendar, Hospital, TrendingUp } from "lucide-react";

interface StatCard {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    change?: string;
}

// Map MUI icon components to Lucide icons
function getLucideIcon(IconComponent: React.ComponentType<any>): typeof Users {
    // Check if it's a MUI icon by checking the displayName or name
    const componentName = IconComponent.name || "";
    
    if (componentName.includes("People") || componentName.includes("Person")) {
        return Users;
    }
    if (componentName.includes("Calendar")) {
        return Calendar;
    }
    if (componentName.includes("Hospital") || componentName.includes("LocalHospital")) {
        return Hospital;
    }
    if (componentName.includes("Trending") || componentName.includes("TrendingUp")) {
        return TrendingUp;
    }
    
    // Default fallback
    return Users;
}

const colorMap: Record<string, string> = {
    "#6366f1": "blue",
    "#ec4899": "purple",
    "#10b981": "green",
    "#f59e0b": "orange",
};

export default function DashboardStats({ cards }: { cards: StatCard[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => {
                const LucideIcon = getLucideIcon(card.icon);
                const colorKey = colorMap[card.color] || "default";
                
                return (
                    <div
                        key={index}
                        className="animate-fade-in-up"
                        style={{
                            animationDelay: `${index * 0.15}s`,
                        }}
                    >
                        <PremiumStatCard
                            title={card.title}
                            value={card.value}
                            icon={LucideIcon}
                            change={card.change}
                            trend="up"
                            color={colorKey}
                        />
                    </div>
                );
            })}
        </div>
    );
}



