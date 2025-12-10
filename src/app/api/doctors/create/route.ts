import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const role = (session.user as any)?.role || "PATIENT";
        const isAdmin = role === "admin" || role === "ADMIN";

        if (!isAdmin) {
            return NextResponse.json({ error: "Only admins can create doctors" }, { status: 403 });
        }

        const data = await req.json();
        const { name, email, password, specialization, phone, department, experience, qualification, consultationFee } = data;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with DOCTOR role
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: "DOCTOR",
                phone: phone || undefined,
            },
        });

        // Create doctor profile
        const doctor = await prisma.doctor.create({
            data: {
                userId: user.id,
                specialization: specialization || undefined,
                phone: phone || undefined,
                department: department || undefined,
                experience: experience ? parseInt(experience.toString()) : undefined,
                qualification: qualification || undefined,
                consultationFee: consultationFee ? parseFloat(consultationFee.toString()) : undefined,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: "Doctor created successfully",
                doctor,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Failed to create doctor:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create doctor" },
            { status: 500 }
        );
    }
}



