import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, email, password } = data;

        // Validate all required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Check if user already exists - only select email to avoid password issues
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already taken" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if any admin users exist
        // If no admins exist, allow first registration to be admin
        let userRole = "PATIENT";
        try {
            // Check for admin users (case-insensitive check)
            const allUsers = await prisma.user.findMany({
                select: { role: true }
            });
            
            const hasAdmin = allUsers.some(user => {
                const role = (user.role || "").toLowerCase();
                return role === "admin" || role === "administrator";
            });
            
            // If no admins exist, make first user an admin
            if (!hasAdmin) {
                userRole = "admin";
                console.log("No admin users found. Creating first user as admin:", email);
            }
        } catch (error) {
            // If check fails, default to PATIENT
            console.warn("Could not check for existing admins, defaulting to PATIENT role");
        }

        // Create user with all required fields
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: hashedPassword,
                    role: userRole,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });
        } catch (createError: any) {
            // Handle MongoDB duplicate key error (email already exists)
            if (createError.code === 11000 || createError.codeName === 'DuplicateKey') {
                return NextResponse.json({ error: "Email already taken" }, { status: 400 });
            }
            // Re-throw to be handled by outer catch
            throw createError;
        }

        return NextResponse.json({ user }, { status: 201 });
    } catch (err: any) {
        console.error("Registration error:", err);
        
        // Handle MongoDB duplicate key error
        if (err.code === 11000 || err.codeName === 'DuplicateKey') {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        return NextResponse.json(
            { error: err.message || "Something went wrong during registration" },
            { status: 500 }
        );
    }
}
