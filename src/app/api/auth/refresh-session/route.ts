import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        // Force session refresh by getting a new session
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        return NextResponse.json({ 
            message: "Session refreshed",
            session: {
                user: {
                    id: session.user?.id,
                    email: session.user?.email,
                    name: session.user?.name,
                    role: (session.user as any)?.role,
                }
            }
        });
    } catch (error: any) {
        console.error("Session refresh error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}







