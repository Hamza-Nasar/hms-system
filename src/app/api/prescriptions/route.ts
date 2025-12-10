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

        let prescriptions = [];
        if (isAdmin || isDoctor) {
            prescriptions = await prisma.prescription.findMany({
                include: {
                    patient: { select: { name: true, userId: true } },
                    doctor: { select: { userId: true, user: { select: { name: true } } } },
                },
                orderBy: { date: "desc" },
                take: 100,
            });
        } else {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });
            if (patient) {
                prescriptions = await prisma.prescription.findMany({
                    where: { patientId: patient.id },
                    include: {
                        doctor: { select: { user: { select: { name: true } } } },
                    },
                    orderBy: { date: "desc" },
                });
            }
        }

        return NextResponse.json(prescriptions);
    } catch (error: any) {
        console.error("Failed to fetch prescriptions:", error);
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
            return NextResponse.json({ error: "Only doctors and admins can create prescriptions" }, { status: 403 });
        }

        const { patientId, doctorId, medications, dosage, duration, instructions, status } = await req.json();

        if (!patientId || !doctorId || !medications) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get doctor ID if not provided
        let finalDoctorId = doctorId;
        if (!finalDoctorId && isDoctor) {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });
            if (doctor) {
                finalDoctorId = doctor.id;
            }
        }

        if (!finalDoctorId) {
            return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
        }

        const prescription = await prisma.prescription.create({
            data: {
                patientId,
                doctorId: finalDoctorId,
                medications,
                dosage: dosage || undefined,
                duration: duration || undefined,
                instructions: instructions || undefined,
                status: status || "ACTIVE",
                date: new Date(),
            },
            include: {
                patient: { select: { name: true, userId: true } },
                doctor: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        // Emit real-time updates
        try {
            const { emitPrescriptionUpdate, emitNotificationToUser } = await import("@/lib/socket-server");
            
            await emitPrescriptionUpdate({
                prescriptionId: prescription.id,
                patientId: prescription.patient?.userId || "",
                doctorId: prescription.doctor?.userId || "",
                action: 'created',
            });

            // Notify patient
            if (prescription.patient?.userId) {
                await emitNotificationToUser(prescription.patient.userId, {
                    title: "New Prescription",
                    message: `A new prescription has been created for you.`,
                    type: "PRESCRIPTION",
                    link: `/dashboard/prescriptions`,
                });

                // Save notification to database
                await prisma.notification.create({
                    data: {
                        userId: prescription.patient.userId,
                        title: "New Prescription",
                        message: `A new prescription has been created for you.`,
                        type: "PRESCRIPTION",
                        link: `/dashboard/prescriptions`,
                    },
                });
            }
        } catch (error) {
            console.log("Socket.io not available, skipping real-time updates");
        }

        return NextResponse.json(prescription, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create prescription:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}






