import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        let bills = [];
        try {
            bills = await prisma.bill.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                patient: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });
        } catch (dbError: any) {
            console.error("Database error fetching bills:", dbError);
            
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

        return NextResponse.json(bills);
    } catch (error: any) {
        console.error("Failed to fetch bills:", error);
        
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { patientId, amount, description } = await req.json();

        if (!patientId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bill = await prisma.bill.create({
            data: {
                patientId,
                amount: parseFloat(amount),
                description: description || "",
                status: "PENDING",
            },
            include: {
                patient: {
                    select: {
                        userId: true,
                        name: true,
                    },
                },
            },
        });

        // Emit real-time updates
        try {
            const { emitBillingUpdate, emitNotificationToUser } = await import("@/lib/socket-server");
            
            await emitBillingUpdate({
                billId: bill.id,
                patientId: bill.patient?.userId || "",
                action: 'created',
        });

        // Emit real-time notification to patient
        if (bill.patient?.userId) {
            await emitNotificationToUser(bill.patient.userId, {
                title: "New Bill Generated",
                message: `A new bill of $${bill.amount.toFixed(2)} has been generated for you.`,
                type: "BILLING",
                link: `/dashboard/billing`,
            });

            // Save notification to database
            await prisma.notification.create({
                data: {
                    userId: bill.patient.userId,
                    title: "New Bill Generated",
                    message: `A new bill of $${bill.amount.toFixed(2)} has been generated for you.`,
                    type: "BILLING",
                    link: `/dashboard/billing`,
                },
            });
            }
        } catch (error) {
            console.log("Socket.io not available, skipping real-time updates");
        }

        return NextResponse.json(bill, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create bill:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
