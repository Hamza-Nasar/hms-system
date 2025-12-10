import { NextRequest, NextResponse } from "next/server";
import { getSessionWithUser } from "@/lib/get-session";

// In-memory settings store (in production, use database)
let systemSettings: any = {
    siteName: "HM System",
    siteDescription: "Hospital Management System",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxAppointmentsPerDay: 50,
    appointmentDuration: 30,
    timezone: "UTC",
};

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const role = (session?.user as any)?.role?.toLowerCase();
        if (!session || (role !== "admin" && role !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(systemSettings);
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const role = (session?.user as any)?.role?.toLowerCase();
        if (!session || (role !== "admin" && role !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await req.json();
        systemSettings = { ...systemSettings, ...data };

        return NextResponse.json(systemSettings);
    } catch (error: any) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


