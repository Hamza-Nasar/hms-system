import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        // Always return success to prevent email enumeration
        // But only generate and return link if user exists
        if (user) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

            // Store reset token in database
            try {
                const { getDb } = await import("@/lib/prisma");
                const db = await getDb();
                const resetCollection = db.collection("password_resets");
                
                // Delete any existing reset tokens for this user
                await resetCollection.deleteMany({ userId: user.id });
                
                // Insert new reset token
                await resetCollection.insertOne({
                    userId: user.id,
                    email: user.email,
                    token: resetToken,
                    expiresAt: resetTokenExpiry,
                    createdAt: new Date(),
                });
            } catch (error) {
                console.error("Failed to store reset token:", error);
                return NextResponse.json(
                    { error: "Failed to generate reset token. Please try again." },
                    { status: 500 }
                );
            }

            // Generate reset URL
            const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

            // Log email to console (local development only)
            await sendEmail({
                to: user.email,
                toName: user.name,
                subject: "Password Reset Request - HM System",
                resetLink: resetUrl,
                text: `Password Reset Request\n\nHello ${user.name},\n\nYou requested to reset your password. Click this link to reset: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
            });

            // Return reset link for local development (user can see it on page)
            return NextResponse.json({
                success: true,
                message: "Password reset link has been generated successfully.",
                resetLink: resetUrl,
                expiresIn: "1 hour",
            });
        }

        // User doesn't exist - still return success to prevent enumeration
        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error: any) {
        console.error("Failed to process forgot password:", error);
        return NextResponse.json(
            { error: "An error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
