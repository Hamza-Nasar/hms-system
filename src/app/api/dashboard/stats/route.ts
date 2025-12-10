import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const role = (session.user as any)?.role || "PATIENT";

        let stats = {
            appointments: 0,
            patients: 0,
            doctors: 0,
            revenue: 0,
            pendingAppointments: 0,
            todayAppointments: 0,
            activeUsers: 0,
        };

        if (role === "admin" || role === "ADMIN") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const [appointments, patients, doctors, bills, pending, todayApps] = await Promise.all([
                prisma.appointment.count(),
                prisma.patient.count(),
                prisma.doctor.count(),
                prisma.bill.findMany({
                    where: { status: "PAID" },
                    select: { amount: true },
                }),
                prisma.appointment.count({
                    where: { status: "PENDING" },
                }),
                prisma.appointment.count({
                    where: {
                        startsAt: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                }),
            ]);

            stats = {
                appointments,
                patients,
                doctors,
                revenue: bills.reduce((sum: number, bill: { amount: number }) => sum + bill.amount, 0),
                pendingAppointments: pending,
                todayAppointments: todayApps,
                activeUsers: 0, // This would come from socket.io connected users
            };
        } else if (role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });

            if (doctor) {
                stats.appointments = await prisma.appointment.count({
                    where: { doctorId: doctor.id },
                });
            }
        } else {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });

            if (patient) {
                stats.appointments = await prisma.appointment.count({
                    where: { patientId: patient.id },
                });
            }
        }

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Failed to fetch stats:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}




