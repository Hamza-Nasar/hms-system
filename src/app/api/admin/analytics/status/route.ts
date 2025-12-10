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

        const [pending, confirmed, completed, cancelled] = await Promise.all([
            prisma.appointment.count({ where: { status: "PENDING" } }),
            prisma.appointment.count({ where: { status: "CONFIRMED" } }),
            prisma.appointment.count({ where: { status: "COMPLETED" } }),
            prisma.appointment.count({ where: { status: "CANCELLED" } }),
        ]);

        return NextResponse.json([
            { name: "Pending", value: pending },
            { name: "Confirmed", value: confirmed },
            { name: "Completed", value: completed },
            { name: "Cancelled", value: cancelled },
        ]);
    } catch (error: any) {
        console.error("Failed to fetch status analytics:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


