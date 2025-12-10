"use client";

import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import PatientsTable from "@/components/PatientsTable";
import AddIcon from "@mui/icons-material/Add";

interface PatientsClientProps {
    patients: any[];
    columns: any[];
    isAdmin: boolean;
}

export default function PatientsClient({ patients, columns, isAdmin }: PatientsClientProps) {
    const router = useRouter();

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={700}>
                    Patients
                </Typography>
                {(isAdmin || true) && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push("/dashboard/patients/create")}
                        sx={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            },
                        }}
                    >
                        New Patient
                    </Button>
                )}
            </Box>

            <PatientsTable rows={patients} columns={columns} />
        </Box>
    );
}



