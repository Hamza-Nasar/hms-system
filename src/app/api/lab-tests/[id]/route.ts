import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const data = await req.json();

        const labTest = await prisma.labTest.update({
            where: { id },
            data: {
                ...(data.testName && { testName: data.testName }),
                ...(data.testType !== undefined && { testType: data.testType }),
                ...(data.results !== undefined && { results: data.results }),
                ...(data.status && { status: data.status }),
                ...(data.doctorNotes !== undefined && { doctorNotes: data.doctorNotes }),
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
                action: 'updated',
            });

            // Notify patient if test is completed
            if (labTest.status === "COMPLETED" && labTest.patient.userId) {
                await emitNotificationToUser(labTest.patient.userId, {
                    title: "Lab Test Results Available",
                    message: `Results for "${labTest.testName}" are now available.`,
                    type: "LAB_TEST",
                    link: `/dashboard/lab-tests`,
                });

                // Save notification to database
                await prisma.notification.create({
                    data: {
                        userId: labTest.patient.userId,
                        title: "Lab Test Results Available",
                        message: `Results for "${labTest.testName}" are now available.`,
                        type: "LAB_TEST",
                        link: `/dashboard/lab-tests`,
                    },
                });
            }
        } catch (error) {
            console.log("Socket.io not available, skipping real-time updates");
        }

        return NextResponse.json(labTest);
    } catch (error: any) {
        console.error("Failed to update lab test:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}






