import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const role = (session.user as any)?.role || "PATIENT";
        const isAdmin = role === "admin" || role === "ADMIN";
        const isDoctor = role === "DOCTOR";

        let records: any[] = [];
        if (isAdmin || isDoctor) {
            records = await prisma.medicalRecord.findMany({
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { user: { select: { name: true } } } },
                },
                orderBy: { date: "desc" },
                take: 100,
            });
        } else {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });
            if (patient) {
                records = await prisma.medicalRecord.findMany({
                    where: { patientId: patient.id },
                    include: {
                        doctor: { select: { user: { select: { name: true } } } },
                    },
                    orderBy: { date: "desc" },
                });
            }
        }

        return NextResponse.json(records);
    } catch (error: any) {
        console.error("Failed to fetch medical records:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const role = (session.user as any)?.role || "PATIENT";
        const isAdmin = role === "admin" || role === "ADMIN";
        const isDoctor = role === "DOCTOR";

        if (!isAdmin && !isDoctor) {
            return NextResponse.json({ error: "Only doctors and admins can create medical records" }, { status: 403 });
        }

        const { patientId, doctorId, diagnosis, symptoms, treatment, notes } = await req.json();

        if (!patientId || !diagnosis) {
            return NextResponse.json({ error: "Missing required fields: patientId and diagnosis are required" }, { status: 400 });
        }

        // Get doctor ID - use provided doctorId or get from session if doctor
        let finalDoctorId = doctorId;
        if (!finalDoctorId && isDoctor) {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });
            if (doctor) {
                finalDoctorId = doctor.id;
            }
        }

        // If still no doctor ID and admin, try to get from request or use first available doctor
        if (!finalDoctorId && isAdmin) {
            // Admin can specify doctorId in request, but if not provided, we need it
            if (!doctorId) {
                return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
            }
            finalDoctorId = doctorId;
        }

        if (!finalDoctorId) {
            return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
        }

        const record = await prisma.medicalRecord.create({
            data: {
                patientId,
                doctorId: finalDoctorId,
                diagnosis,
                symptoms: symptoms || undefined,
                treatment: treatment || undefined,
                notes: notes || undefined,
                date: new Date(),
            },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { user: { select: { name: true } } } },
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create medical record:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

