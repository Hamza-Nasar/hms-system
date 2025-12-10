import { NextRequest, NextResponse } from "next/server";
import { getSessionWithUser } from "@/lib/get-session";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        // Get session using both methods for comparison
        const serverSession = await getServerSession(authOptions);
        const sessionWithUser = await getSessionWithUser(req);

        return NextResponse.json({
            serverSession: {
                user: serverSession?.user ? {
                    email: serverSession.user.email,
                    name: serverSession.user.name,
                    id: serverSession.user.id,
                    role: (serverSession.user as any)?.role,
                } : null,
            },
            sessionWithUser: {
                user: sessionWithUser?.user ? {
                    email: sessionWithUser.user.email,
                    name: sessionWithUser.user.name,
                    id: sessionWithUser.user.id,
                    role: (sessionWithUser.user as any)?.role,
                } : null,
            },
            message: "Check your role in the response. It should be 'admin' for admin access.",
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}









