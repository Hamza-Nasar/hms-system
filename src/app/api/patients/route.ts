// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated - no session" }, { status: 401 });
        }
        if (!session.user?.id) {
            // Try to get user ID from email as fallback
            if (session.user?.email) {
                try {
                    const user = await prisma.user.findUnique({
                        where: { email: session.user.email }
                    });
                    if (user) {
                        // Use the found user ID
                        const patient = await prisma.patient.findUnique({
                            where: { userId: user.id },
                            include: {
                                user: {
                                    select: {
                                        email: true,
                                        name: true,
                                    },
                                },
                            },
                        });
                        if (!patient) {
                            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
                        }
                        return NextResponse.json(patient);
                    }
                } catch (error: any) {
                    console.error("Failed to fetch user by email:", error);
                }
            }
            return NextResponse.json({ error: "Not authenticated - missing user ID" }, { status: 401 });
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(patient);
    } catch (error: any) {
        console.error("Failed to fetch patient:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const data = await req.json();

        // Check if user already has a patient record
        const existingPatient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });

        if (existingPatient) {
            return NextResponse.json({ error: "Patient already exists for this user" }, { status: 400 });
        }

        // Create Patient linked to logged-in user
        const patient = await prisma.patient.create({
            data: {
                userId: session.user.id,
                name: data.name || session.user.name || "Unknown",
                age: data.age || 0,
                disease: data.disease || "",
            },
        });

        return NextResponse.json(patient, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create patient:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
