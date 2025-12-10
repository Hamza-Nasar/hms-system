"use client";

import { Box, Typography } from "@mui/material";
import PatientsTable from "@/components/PatientsTable";

interface AppointmentsClientProps {
    appointments: any[];
    columns: any[];
}

export default function AppointmentsClient({ appointments, columns }: AppointmentsClientProps) {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Appointments
            </Typography>
            <PatientsTable rows={appointments} columns={columns} />
        </Box>
    );
}



