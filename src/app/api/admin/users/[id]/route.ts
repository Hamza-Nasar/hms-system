import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/get-session";
import bcrypt from "bcryptjs";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionWithUser(req);
        const userRole = (session?.user as any)?.role?.toLowerCase();
        if (!session || (userRole !== "admin" && userRole !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const data = await req.json();
        const { name, email, password, role, phone, active } = data;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (phone !== undefined) updateData.phone = phone;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionWithUser(req);
        const userRole = (session?.user as any)?.role?.toLowerCase();
        if (!session || (userRole !== "admin" && userRole !== "administrator")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;

        // Don't allow deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


