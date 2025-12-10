import { Box, Typography } from "@mui/material";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import ReportsStats from "@/components/ReportsStats";

export default async function ReportsPage() {
    const session = await getSessionWithUser();
    if (!session) redirect("/login");

    // Fetch statistics
    const [
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        bills,
    ] = await Promise.all([
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.appointment.count(),
        prisma.appointment.count({
            where: {
                startsAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
        }),
        prisma.appointment.count({ where: { status: "PENDING" } }),
        prisma.appointment.count({ where: { status: "CONFIRMED" } }),
        prisma.bill.findMany({
            where: { status: "PAID" },
            select: { amount: true },
        }),
    ]);

    // Calculate revenue from paid bills
    const revenueThisMonth = bills.reduce((sum: number, bill: { amount: number }) => sum + bill.amount, 0);

    const stats = {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        revenueThisMonth,
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Hospital Reports & Analytics
            </Typography>

            <ReportsStats stats={stats} />
        </Box>
    );
}
