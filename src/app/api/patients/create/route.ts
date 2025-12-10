import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const session = await getSessionWithUser();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (!session.user?.id) {
            return NextResponse.json({ error: "Not authenticated - missing user ID" }, { status: 401 });
        }

        const role = (session.user as any)?.role || "PATIENT";
        const isAdmin = role === "admin" || role === "ADMIN";

        const data: {
            name?: string;
            age?: number;
            disease?: string;
            phone?: string;
            address?: string;
            gender?: string;
            bloodGroup?: string;
            emergencyContact?: string;
            insuranceNumber?: string;
            email?: string; // For creating user account if needed
            password?: string; // For creating user account if needed
        } = await req.json();

        if (!data.name || !data.age) {
            return NextResponse.json({ error: "Name and Age are required fields" }, { status: 400 });
        }

        let userId = session.user.id;

        // If admin is creating a patient, create or find user account
        if (isAdmin) {
            if (data.email) {
                // Check if user exists
                let user = await prisma.user.findUnique({
                    where: { email: data.email },
                });

                if (!user) {
                    // Create new user account for the patient
                    const hashedPassword = data.password 
                        ? await bcrypt.hash(data.password, 10)
                        : await bcrypt.hash("Patient123!", 10); // Default password

                    user = await prisma.user.create({
                        data: {
                            name: data.name,
                            email: data.email,
                            password: hashedPassword,
                            role: "PATIENT",
                            phone: data.phone,
                        },
                    });
                }

                userId = user.id;
            } else {
                // If no email provided, create a user account with generated email
                const generatedEmail = `patient_${Date.now()}@hm.local`;
                const hashedPassword = await bcrypt.hash("Patient123!", 10);

                const user = await prisma.user.create({
                    data: {
                        name: data.name,
                        email: generatedEmail,
                        password: hashedPassword,
                        role: "PATIENT",
                        phone: data.phone,
                    },
                });

                userId = user.id;
            }
        }

        // Check if patient already exists for this user
        const existingPatient = await prisma.patient.findUnique({
            where: { userId },
        });

        if (existingPatient) {
            return NextResponse.json({ 
                error: "Patient already exists for this user. Please update the existing record instead." 
            }, { status: 400 });
        }

        // Create patient record
        const patient = await prisma.patient.create({
            data: {
                userId,
                name: data.name,
                age: Number(data.age),
                disease: data.disease,
                phone: data.phone,
                address: data.address,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                emergencyContact: data.emergencyContact,
                insuranceNumber: data.insuranceNumber,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });

        // Emit real-time notification if Socket.io is available
        try {
            const { emitNotificationToUser } = await import("@/lib/socket-server");
            if (isAdmin && userId !== session.user.id) {
                await emitNotificationToUser(userId, {
                    title: "Patient Profile Created",
                    message: `Your patient profile has been created by an administrator.`,
                    type: "INFO",
                    link: `/dashboard/profile`,
                });
            }
        } catch (error) {
            // Socket.io not available, continue without notification
        }

        return NextResponse.json(patient, { status: 201 });
    } catch (err: any) {
        console.error("Failed to create patient:", err);
        
        // Handle unique constraint errors
        if (err.code === "P2002") {
            return NextResponse.json({ 
                error: "A patient with this information already exists" 
            }, { status: 400 });
        }

        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
    }
}
