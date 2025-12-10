import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// Dynamic import to avoid server-only code in client bundle

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!status || !["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Check if appointment exists
        const existingAppointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { userId: true, name: true } },
                doctor: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        if (!existingAppointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Update appointment
        await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        // Fetch updated appointment with includes
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { name: true, userId: true } },
                doctor: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        if (!appointment) {
            return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
        }

        // Create notification for patient
        if (appointment.patient?.userId) {
            const statusMessages: Record<string, { title: string; message: string }> = {
                CONFIRMED: {
                    title: "Appointment Confirmed",
                    message: `Your appointment with ${appointment.doctor.user?.name || 'the doctor'} has been confirmed.`,
                },
                CANCELLED: {
                    title: "Appointment Cancelled",
                    message: `Your appointment with ${appointment.doctor.user?.name || 'the doctor'} has been cancelled.`,
                },
                COMPLETED: {
                    title: "Appointment Completed",
                    message: `Your appointment with ${appointment.doctor.user?.name || 'the doctor'} has been completed.`,
                },
                REJECTED: {
                    title: "Appointment Rejected",
                    message: `Your appointment request has been rejected.`,
                },
            };

            const notification = statusMessages[status];
            if (notification) {
                // Save to database
                await prisma.notification.create({
                    data: {
                        userId: appointment.patient.userId,
                        title: notification.title,
                        message: notification.message,
                        type: "APPOINTMENT",
                        link: `/dashboard/appointments`,
                    },
                });

                // Emit real-time update (only if Socket.io is available)
                try {
                    const { emitAppointmentUpdate, emitNotificationToUser } = await import("@/lib/socket-server");
                    await emitAppointmentUpdate({
                        appointmentId: id,
                        status,
                        patientId: appointment.patient.userId,
                        doctorId: appointment.doctor.userId,
                    });
                    await emitNotificationToUser(appointment.patient.userId, {
                        ...notification,
                        type: "appointment",
                        link: `/dashboard/appointments`,
                    });
                } catch (error) {
                    // Socket.io not available - continue without real-time updates
                    console.log("Socket.io not available, skipping real-time updates");
                }
            }
        }

        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error("Failed to update appointment:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
