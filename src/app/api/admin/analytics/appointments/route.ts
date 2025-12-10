import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const role = (session?.user as any)?.role?.toLowerCase();
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 403 });
        }
        
        if (role !== "admin" && role !== "administrator") {
            console.log("Admin API - Access denied. User role:", role, "Email:", session.user?.email);
            return NextResponse.json({ 
                error: "Unauthorized", 
                message: `Admin access required. Your current role is: ${role || "not set"}`,
                yourRole: role 
            }, { status: 403 });
        }

        // Get last 7 days of appointments
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split("T")[0]);
        }

        const data = await Promise.all(
            dates.map(async (date) => {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);

                const [total, completed] = await Promise.all([
                    prisma.appointment.count({
                        where: {
                            startsAt: {
                                gte: start,
                                lte: end,
                            },
                        },
                    }),
                    prisma.appointment.count({
                        where: {
                            startsAt: {
                                gte: start,
                                lte: end,
                            },
                            status: "COMPLETED",
                        },
                    }),
                ]);

                return {
                    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    appointments: total,
                    completed,
                };
            })
        );

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Failed to fetch appointment analytics:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


