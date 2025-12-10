import { NextRequest, NextResponse } from "next/server";
import { getSessionWithUser } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const role = (session?.user as any)?.role?.toLowerCase();
        if (!session || (role !== "admin" && role !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Simulated system metrics (in production, use actual system monitoring)
        const metrics = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            storage: Math.random() * 100,
            activeConnections: Math.floor(Math.random() * 100) + 10,
            requestsPerMinute: Math.floor(Math.random() * 200) + 50,
            errorRate: Math.random() * 5,
        };

        return NextResponse.json(metrics);
    } catch (error: any) {
        console.error("Failed to fetch system metrics:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


