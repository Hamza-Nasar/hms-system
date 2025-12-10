import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get("doctorId");

        if (!doctorId) {
            return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
        }

        const availability = await prisma.availability.findMany({
            where: {
                doctorId,
                isAvailable: true,
                startsAt: { gte: new Date() },
            },
            orderBy: { startsAt: "asc" },
        });

        return NextResponse.json(availability);
    } catch (error: any) {
        console.error("Failed to fetch availability:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { doctorId, startsAt, endsAt } = await req.json();
        
        if (!doctorId || !startsAt || !endsAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const startDate = new Date(startsAt);
        const endDate = new Date(endsAt);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        if (startDate >= endDate) {
            return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
        }

        const availability = await prisma.availability.create({
            data: {
                doctorId,
                startsAt: startDate,
                endsAt: endDate,
                isAvailable: true,
            },
        });

        return NextResponse.json(availability, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create availability:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
