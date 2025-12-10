import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSessionWithUser();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (!session.user?.id) {
            return NextResponse.json({ error: "Not authenticated - missing user ID" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const unreadOnly = searchParams.get("unread") === "true";

        let notifications: any[] = [];
        try {
            notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                ...(unreadOnly && { read: false }),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        } catch (dbError: any) {
            console.error("Database error fetching notifications:", dbError);
            
            // Handle MongoDB connection errors gracefully
            const errorMessage = dbError.message || "";
            const isMongoError = 
                errorMessage.includes("connection") || 
                errorMessage.includes("timeout") || 
                errorMessage.includes("refused") ||
                errorMessage.includes("Server selection timeout") ||
                dbError.code === "P1001" ||
                dbError.name === "MongoServerError";
            
            if (isMongoError) {
                // Return empty array instead of error when MongoDB is not available
                return NextResponse.json([], { status: 200 });
            }
            
            throw dbError;
        }

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error);
        
        // Handle MongoDB connection errors gracefully
        const errorMessage = error.message || "";
        const isMongoError = 
            errorMessage.includes("connection") || 
            errorMessage.includes("timeout") || 
            errorMessage.includes("refused") ||
            errorMessage.includes("Server selection timeout") ||
            error.code === "P1001" ||
            error.name === "MongoServerError";
        
        if (isMongoError) {
            // Return empty array instead of error when MongoDB is not available
            return NextResponse.json([], { status: 200 });
        }
        
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSessionWithUser();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (!session.user?.id) {
            return NextResponse.json({ error: "Not authenticated - missing user ID" }, { status: 401 });
        }

        const { userId, title, message, type, link } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId: userId || session.user.id,
                title,
                message,
                type: type || "INFO",
                link,
            },
        });

        // Emit real-time notification
        const { emitNotificationToUser } = await import("@/lib/socket-server");
        await emitNotificationToUser(notification.userId, {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.link || undefined,
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create notification:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}




