import { NextResponse } from "next/server";

export async function GET() {
    // Check if Google OAuth is configured
    const isGoogleEnabled = !!(
        process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET
    );

    return NextResponse.json({
        google: isGoogleEnabled,
    });
}

