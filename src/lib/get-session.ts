// Helper function to get session with proper fallback for user ID
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma, MongoDBConnectionError } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper function to validate MongoDB ObjectID format
function isValidObjectId(id: string | undefined): boolean {
    if (!id) return false;
    // MongoDB ObjectID is exactly 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function getSessionWithUser(req?: NextRequest) {
    try {
        // In App Router, getServerSession should work without request/response
        // but we can pass headers if available for better cookie handling
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return null;
        }

        // If session has user ID and it's a valid MongoDB ObjectID, fetch role from DB
        if (session.user?.id && isValidObjectId(session.user.id)) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { id: true, role: true },
                });
                
                if (user) {
                    return {
                        ...session,
                        user: {
                            ...session.user,
                            id: user.id,
                            role: user.role || (session.user as any)?.role || "PATIENT",
                        },
                    };
                }
            } catch (error: any) {
                // Don't log MongoDB connection errors - they're expected when MongoDB is down
                if (!(error instanceof MongoDBConnectionError) && error?.name !== 'MongoDBConnectionError') {
                    console.error("Error fetching user by ID:", error);
                }
            }
            
            // Fallback: return session with existing role
            return {
                ...session,
                user: {
                    ...session.user,
                    id: session.user.id,
                },
            };
        }

        // Fallback: try to get user ID from email
        if (session.user?.email) {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    select: { id: true, role: true },
                });

                if (user) {
                    return {
                        ...session,
                        user: {
                            ...session.user,
                            id: user.id,
                            role: user.role || (session.user as any)?.role || "PATIENT",
                        },
                    };
                }
            } catch (error: any) {
                // Don't log MongoDB connection errors - they're expected when MongoDB is down
                if (!(error instanceof MongoDBConnectionError) && error?.name !== 'MongoDBConnectionError') {
                    console.error("Error fetching user by email:", error);
                }
                // If database error, still return session without ID
                // Some routes can handle this
            }
        }

        // Return session even without ID (some routes might handle this)
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
}

