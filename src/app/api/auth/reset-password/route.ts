import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Handle test tokens - they cannot be used to actually reset password
        if (token === "test123" || token === "test" || token.startsWith("test_")) {
            return NextResponse.json(
                { 
                    error: "Test token cannot be used to reset password. Please use a real password reset link from your email. Request a new password reset to get a valid token." 
                },
                { status: 400 }
            );
        }

        // Find reset token in database
        let resetRecord = null;
        try {
            const { getDb } = await import("@/lib/prisma");
            const db = await getDb();
            const resetCollection = db.collection("password_resets");
            
            resetRecord = await resetCollection.findOne({
                token: token,
                expiresAt: { $gt: new Date() }, // Token not expired
            });

            if (!resetRecord) {
                return NextResponse.json(
                    { error: "Invalid or expired reset token" },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error("Failed to find reset token:", error);
            return NextResponse.json(
                { error: "Failed to verify reset token" },
                { status: 500 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: resetRecord.userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Delete reset token (used)
        try {
            const { getDb } = await import("@/lib/prisma");
            const db = await getDb();
            const resetCollection = db.collection("password_resets");
            await resetCollection.deleteOne({ token: token });
        } catch (error) {
            console.error("Failed to delete reset token:", error);
            // Continue anyway - password is already updated
        }

        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error: any) {
        console.error("Failed to reset password:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred. Please try again." },
            { status: 500 }
        );
    }
}



