import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const items = await prisma.inventory.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(items);
    } catch (error: any) {
        console.error("Failed to fetch inventory:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { name, quantity } = await req.json();
        
        if (!name || quantity === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const quantityNum = Number(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
            return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        }

        const item = await prisma.inventory.create({
            data: {
                name,
                quantity: quantityNum,
            },
        });

        // Check for low stock and notify admins
        if (item.quantity <= item.minStock) {
            const { broadcastToRole } = await import("@/lib/socket-server");
            await broadcastToRole("admin", "inventory_low_stock", {
                itemId: item.id,
                itemName: item.name,
                quantity: item.quantity,
                minStock: item.minStock,
            });

            // Create notifications for all admins
            const admins = await prisma.user.findMany({
                where: { role: "admin" },
                select: { id: true },
            });

            await Promise.all(
                admins.map((admin) =>
                    prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: "Low Stock Alert",
                            message: `${item.name} is running low. Current stock: ${item.quantity}, Minimum: ${item.minStock}`,
                            type: "WARNING",
                            link: `/dashboard/inventory`,
                        },
                    })
                )
            );
        }

        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create inventory item:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
