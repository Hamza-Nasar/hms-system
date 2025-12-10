import React from "react";
import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Box, Typography } from "@mui/material";
import PatientsTable from "@/components/PatientsTable";
import { prisma } from "@/lib/prisma";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
    const session = await getSessionWithUser();
    if (!session) redirect("/login");

    const appointmentsFromDb = await prisma.appointment.findMany({
        include: {
            patient: { select: { name: true } },
            doctor: { select: { user: { select: { name: true } } } },
        },
    });

    const appointments = appointmentsFromDb.map((a) => ({
        id: a.id,
        patient: a.patient?.name || "N/A",
        doctor: a.doctor?.user?.name || "N/A",
        date: a.startsAt.toLocaleString(),
        status: a.status,
    }));

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "patient", headerName: "Patient", flex: 1 },
        { field: "doctor", headerName: "Doctor", flex: 1 },
        { field: "date", headerName: "Date/Time", width: 200 },
        { field: "status", headerName: "Status", width: 120 },
    ];

    return <AppointmentsClient appointments={appointments} columns={columns} />;
}

