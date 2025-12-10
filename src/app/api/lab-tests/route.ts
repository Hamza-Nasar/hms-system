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

        let labTests = [];
        if (isAdmin || isDoctor) {
            labTests = await prisma.labTest.findMany({
                include: {
                    patient: { select: { name: true, userId: true } },
                },
                orderBy: { date: "desc" },
                take: 100,
            });
        } else {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });
            if (patient) {
                labTests = await prisma.labTest.findMany({
                    where: { patientId: patient.id },
                    orderBy: { date: "desc" },
                });
            }
        }

        return NextResponse.json(labTests);
    } catch (error: any) {
        console.error("Failed to fetch lab tests:", error);
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
            return NextResponse.json({ error: "Only doctors and admins can create lab tests" }, { status: 403 });
        }

        const { patientId, testName, testType, results, status, doctorNotes } = await req.json();

        if (!patientId || !testName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const labTest = await prisma.labTest.create({
            data: {
                patientId,
                testName,
                testType: testType || undefined,
                results: results || undefined,
                status: status || "PENDING",
                doctorNotes: doctorNotes || undefined,
                date: new Date(),
            },
            include: {
                patient: { select: { name: true, userId: true } },
            },
        });

        // Emit real-time updates
        try {
            const { emitLabTestUpdate, emitNotificationToUser } = await import("@/lib/socket-server");
            
            await emitLabTestUpdate({
                labTestId: labTest.id,
                patientId: labTest.patient.userId,
                action: 'created',
            });

            // Notify patient
            if (labTest.patient.userId) {
                await emitNotificationToUser(labTest.patient.userId, {
                    title: "New Lab Test",
                    message: `A new lab test "${labTest.testName}" has been ordered for you.`,
                    type: "LAB_TEST",
                    link: `/dashboard/lab-tests`,
                });

                // Save notification to database
                await prisma.notification.create({
                    data: {
                        userId: labTest.patient.userId,
                        title: "New Lab Test",
                        message: `A new lab test "${labTest.testName}" has been ordered for you.`,
                        type: "LAB_TEST",
                        link: `/dashboard/lab-tests`,
                    },
                });
            }
        } catch (error) {
            console.log("Socket.io not available, skipping real-time updates");
        }

        return NextResponse.json(labTest, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create lab test:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}






