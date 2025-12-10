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

        const prescription = await prisma.prescription.update({
            where: { id },
            data: {
                ...(data.medications && { medications: data.medications }),
                ...(data.dosage !== undefined && { dosage: data.dosage }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.instructions !== undefined && { instructions: data.instructions }),
                ...(data.status && { status: data.status }),
            },
            include: {
                patient: { select: { name: true, userId: true } },
                doctor: { select: { userId: true, user: { select: { name: true } } } },
            },
        });

        // Emit real-time updates
        try {
            const { emitPrescriptionUpdate } = await import("@/lib/socket-server");
            await emitPrescriptionUpdate({
                prescriptionId: prescription.id,
                patientId: prescription.patient.userId,
                doctorId: prescription.doctor.userId,
                action: 'updated',
            });
        } catch (error) {
            console.log("Socket.io not available, skipping real-time updates");
        }

        return NextResponse.json(prescription);
    } catch (error: any) {
        console.error("Failed to update prescription:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}






