import { NextRequest, NextResponse } from "next/server";
import { getSessionWithUser } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const role = (session?.user as any)?.role?.toLowerCase();
        if (!session || (role !== "admin" && role !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Simulated activity logs (in production, store in database)
        const logs = [
            {
                id: "1",
                user: session.user.email || "Admin",
                action: "User Login",
                resource: "/dashboard",
                timestamp: new Date().toISOString(),
                ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
                status: "success",
            },
            {
                id: "2",
                user: "system",
                action: "Appointment Created",
                resource: "/api/appointments",
                timestamp: new Date(Date.now() - 60000).toISOString(),
                ip: "127.0.0.1",
                status: "success",
            },
        ];

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error("Failed to fetch activity logs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


