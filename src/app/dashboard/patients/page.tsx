import React from "react";
import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import PatientsTable from "@/components/PatientsTable";
import { prisma } from "@/lib/prisma";
import PatientsClient from "./PatientsClient";
import AddIcon from "@mui/icons-material/Add";

export default async function PatientsPage() {
    const session = await getSessionWithUser();

    if (!session) {
        redirect("/login");
    }

    const role = (session.user as any)?.role || "PATIENT";
    const isAdmin = role === "admin" || role === "ADMIN";

    // Fetch all patients from the database
    const patientsFromDb = await prisma.patient.findMany({
        select: {
            id: true,
            name: true,
            age: true,
            disease: true,
            gender: true,
            phone: true,
            userId: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Map to table format
    const patients = patientsFromDb.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        disease: p.disease,
        email: "", // Will be populated from user relation if needed
        gender: p.gender || "",
        phone: p.phone || "",
    }));

    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "age", headerName: "Age", width: 100 },
        { field: "gender", headerName: "Gender", width: 120 },
        { field: "phone", headerName: "Phone", width: 150 },
        { field: "disease", headerName: "Disease/Condition", flex: 1 },
    ];

    return <PatientsClient patients={patients} columns={columns} isAdmin={isAdmin} />;
}
