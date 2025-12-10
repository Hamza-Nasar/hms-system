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

        const appointments = await prisma.appointment.findMany({
            include: {
                patient: { select: { name: true, id: true } },
                doctor: { select: { id: true, user: { select: { name: true } } } },
            },
            orderBy: { startsAt: "asc" },
        });

        return NextResponse.json(appointments);
    } catch (error: any) {
        console.error("Failed to fetch appointments:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { patientId, doctorId, startsAt } = await req.json();

        if (!patientId || !doctorId || !startsAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate date
        const appointmentDate = new Date(startsAt);
        if (isNaN(appointmentDate.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        // Check if appointment time is in the future
        if (appointmentDate < new Date()) {
            return NextResponse.json({ error: "Appointment time must be in the future" }, { status: 400 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                startsAt: appointmentDate,
                status: "PENDING",
            },
            include: {
                patient: { select: { name: true, userId: true } },
                doctor: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        // Emit real-time notification to doctor
        const { emitNotificationToUser, emitAppointmentUpdate } = await import("@/lib/socket-server");
        
        if (appointment.doctor.userId) {
            await emitNotificationToUser(appointment.doctor.userId, {
                title: "New Appointment Request",
                message: `You have a new appointment request from ${appointment.patient.name}`,
                type: "appointment",
                link: `/dashboard/appointments`,
            });

            // Save notification to database
            await prisma.notification.create({
                data: {
                    userId: appointment.doctor.userId,
                    title: "New Appointment Request",
                    message: `You have a new appointment request from ${appointment.patient.name}`,
                    type: "APPOINTMENT",
                    link: `/dashboard/appointments`,
                },
            });
        }

        // Emit real-time update
        await emitAppointmentUpdate({
            appointmentId: appointment.id,
            status: "PENDING",
            patientId: appointment.patient.userId,
            doctorId: appointment.doctor.userId,
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create appointment:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
