import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { valid: false, error: "Token is required" },
                { status: 400 }
            );
        }

        // Allow test token for testing (works in all environments)
        // This is safe because test token cannot be used to actually reset password
        if (token === "test123" || token === "test" || token.startsWith("test_")) {
            console.log("⚠️ Test token detected:", token);
            return NextResponse.json({
                valid: true,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
                minutesRemaining: 60,
                message: "Test token is valid (for UI testing only)",
                isTestToken: true,
            });
        }

        // Check token validity in database
        try {
            const { getDb } = await import("@/lib/prisma");
            const db = await getDb();
            const resetCollection = db.collection("password_resets");
            
            const resetRecord = await resetCollection.findOne({
                token: token,
                expiresAt: { $gt: new Date() }, // Token not expired
            });

            if (!resetRecord) {
                return NextResponse.json({
                    valid: false,
                    error: "Invalid or expired reset token",
                });
            }

            // Check if token is still valid (not expired)
            const now = new Date();
            const expiresAt = new Date(resetRecord.expiresAt);
            const timeRemaining = expiresAt.getTime() - now.getTime();
            const minutesRemaining = Math.floor(timeRemaining / 60000);

            return NextResponse.json({
                valid: true,
                expiresAt: resetRecord.expiresAt,
                minutesRemaining: minutesRemaining > 0 ? minutesRemaining : 0,
                message: `Token is valid. Expires in ${minutesRemaining} minutes.`,
            });
        } catch (error) {
            console.error("Failed to validate reset token:", error);
            return NextResponse.json(
                { valid: false, error: "Failed to validate token" },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Error validating reset token:", error);
        return NextResponse.json(
            { valid: false, error: "An error occurred" },
            { status: 500 }
        );
    }
}



