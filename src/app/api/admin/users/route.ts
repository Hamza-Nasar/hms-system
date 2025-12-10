import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const userRole = (session?.user as any)?.role?.toLowerCase();
        if (!session || (userRole !== "admin" && userRole !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(users);
    } catch (error: any) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSessionWithUser(req);
        const userRole = (session?.user as any)?.role?.toLowerCase();
        if (!session || (userRole !== "admin" && userRole !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await req.json();
        const { name, email, password, role, phone } = data;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "PATIENT",
                phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


