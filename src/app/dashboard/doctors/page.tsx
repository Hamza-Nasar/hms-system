import { Box, Typography, Card, CardContent, Button, Grid, Avatar, Chip, IconButton } from "@mui/material";
import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import Link from "next/link";

export default async function DoctorsPage() {
    const session = await getSessionWithUser();
    if (!session) redirect("/login");

    const role = (session.user as any)?.role || "PATIENT";
    if (role !== "admin") {
        redirect("/dashboard");
    }

    const doctors = await prisma.doctor.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700}>
                    Doctors
                </Typography>
                <Link href="/dashboard/doctors/create" style={{ textDecoration: 'none' }}>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                >
                    Add Doctor
                </Button>
                </Link>
            </Box>

            <Grid container spacing={3}>
                {doctors.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" align="center" py={4}>
                                    No doctors found
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    doctors.map((doctor) => (
                        <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                            <Card sx={{ height: "100%" }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                bgcolor: "primary.main",
                                            }}
                                        >
                                            <LocalHospitalIcon />
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight={600}>
                                                {doctor.user.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {doctor.user.email}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Box>

                                    {doctor.specialization && (
                                        <Chip
                                            label={doctor.specialization}
                                            color="primary"
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />
                                    )}

                                    {doctor.department && (
                                        <Typography variant="body2" color="text.secondary" mb={1}>
                                            Department: {doctor.department}
                                        </Typography>
                                    )}

                                    {doctor.experience && (
                                        <Typography variant="body2" color="text.secondary">
                                            Experience: {doctor.experience} years
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}



