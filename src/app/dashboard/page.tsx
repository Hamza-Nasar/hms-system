// src/app/dashboard/page.tsx
import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma, MongoDBConnectionError } from "@/lib/prisma";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DashboardStats from "@/components/DashboardStats";
import { PremiumCard } from "@/components/PremiumCard";
import { Badge } from "@/components/ui/badge";
import DatabaseError from "@/components/DatabaseError";

// Helper function to validate MongoDB ObjectID format
function isValidObjectId(id: string | undefined): boolean {
    if (!id) return false;
    // MongoDB ObjectID is exactly 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
}

export default async function DashboardPage() {
    const session = await getSessionWithUser();
    if (!session) redirect("/login");

    // Fetch user-specific data
    // Always prefer email lookup as it's more reliable
    // Only use userId if it's a valid MongoDB ObjectID
    const userId = (session.user as any)?.id;
    const userEmail = session.user?.email;
    
    if (!userEmail) {
        redirect("/login");
    }

    let user;
    try {
        // Always use email for lookup as it's more reliable
        // Only use userId if it's a valid MongoDB ObjectID format
        const whereClause = isValidObjectId(userId) 
            ? { id: userId } 
            : { email: userEmail };
        
        user = await prisma.user.findUnique({
            where: whereClause,
            include: {
                Patient: {
                    include: {
                        appointments: {
                            take: 5,
                            orderBy: { startsAt: "desc" },
                            include: {
                                doctor: {
                                    include: {
                                        user: {
                                            select: { name: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                Doctor: {
                    include: {
                        appointments: {
                            take: 5,
                            orderBy: { startsAt: "desc" },
                            include: {
                                patient: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
            },
        });
    } catch (error: any) {
        // Only log non-MongoDB connection errors to avoid console spam
        // MongoDB connection errors are expected when replica set is not configured
        const isMongoConnectionError = 
            error instanceof MongoDBConnectionError ||
            error?.name === 'MongoDBConnectionError' ||
            (error.message && (
                error.message.includes("MongoDB connection failed") ||
                error.message.includes("replica set") ||
                error.message.includes("replSet")
            ));
        
        if (!isMongoConnectionError && process.env.NODE_ENV === 'development') {
            console.error("Database connection error:", error);
        }
        
        // If MongoDB is not running, show user-friendly error page
        const isMongoError = 
            error instanceof MongoDBConnectionError ||
            error?.name === 'MongoDBConnectionError' ||
            (error.message && (
                error.message.includes("connection") || 
                error.message.includes("timeout") || 
                error.message.includes("refused") ||
                error.message.includes("Server selection timeout") ||
                error.message.includes("MongoDB is not running") ||
                error.message.includes("replica set") ||
                error.message.includes("replSet") ||
                error.message.includes("replication")
            )) ||
            error.code === "P1001";
        
        if (isMongoError) {
            // Return error component instead of throwing
            return <DatabaseError />;
        }
        throw error;
    }

    const role = (session.user as any)?.role || user?.role || "PATIENT";
    const isAdmin = role === "admin";
    const isDoctor = role === "DOCTOR" || user?.Doctor;
    const isPatient = role === "PATIENT" || user?.Patient;

    // Get statistics based on role
    let stats = {
        appointments: 0,
        patients: 0,
        doctors: 0,
        revenue: 0,
    };

    if (isAdmin) {
        const [appointments, patients, doctors, bills] = await Promise.all([
            prisma.appointment.count(),
            prisma.patient.count(),
            prisma.doctor.count(),
            prisma.bill.findMany({
                where: { status: "PAID" },
                select: { amount: true },
            }),
        ]);
        stats = {
            appointments,
            patients,
            doctors,
            revenue: bills.reduce((sum: number, bill: { amount: number }) => sum + bill.amount, 0),
        };
    } else if (isDoctor && user?.Doctor) {
        stats.appointments = await prisma.appointment.count({
            where: { doctorId: user.Doctor.id },
        });
    } else if (isPatient && user?.Patient) {
        stats.appointments = await prisma.appointment.count({
            where: { patientId: user.Patient.id },
        });
    }

    const statCards = [
        {
            title: isAdmin ? "Total Patients" : isDoctor ? "My Appointments" : "My Appointments",
            value: isAdmin ? stats.patients : stats.appointments,
            icon: isAdmin ? PeopleIcon : CalendarTodayIcon,
            color: "#6366f1",
            change: "+12%",
        },
        ...(isAdmin
            ? [
                  {
                      title: "Total Doctors",
                      value: stats.doctors,
                      icon: LocalHospitalIcon,
                      color: "#ec4899",
                      change: "+5%",
                  },
                  {
                      title: "Total Appointments",
                      value: stats.appointments,
                      icon: CalendarTodayIcon,
                      color: "#10b981",
                      change: "+8%",
                  },
                  {
                      title: "Total Revenue",
                      value: `$${stats.revenue.toLocaleString()}`,
                      icon: TrendingUpIcon,
                      color: "#f59e0b",
                      change: "+15%",
                  },
              ]
            : []),
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Welcome back, {session.user?.name || session.user?.email}! 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
                    {isAdmin && "Here's what's happening in your hospital today"}
                    {isDoctor && "Manage your appointments and patients"}
                    {isPatient && "View your appointments and medical records"}
                </p>
            </div>

            <DashboardStats cards={statCards} />

            {/* Recent Activity */}
            {(isPatient && user?.Patient?.appointments && user.Patient.appointments.length > 0) ||
            (isDoctor && user?.Doctor?.appointments && user.Doctor.appointments.length > 0) ? (
                <PremiumCard
                    title="Recent Appointments"
                    description="Your latest appointment activity"
                    className="mt-6"
                >
                    <div className="space-y-3">
                        {isPatient &&
                            user?.Patient?.appointments?.map((apt: any) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-900 hover:shadow-sm transition-all duration-200 hover-lift"
                                >
                                    <div className="space-y-1">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {new Date(apt.startsAt).toLocaleDateString()} at{" "}
                                            {new Date(apt.startsAt).toLocaleTimeString()}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Doctor: <span className="text-slate-900 dark:text-slate-200">{apt.doctor?.user?.name || "Unknown"}</span>
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            apt.status === "CONFIRMED"
                                                ? "default"
                                                : apt.status === "PENDING"
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className={`font-medium px-3 py-1 ${
                                            apt.status === "CONFIRMED"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : apt.status === "PENDING"
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                        }`}
                                    >
                                        {apt.status}
                                    </Badge>
                                </div>
                            ))}
                        {isDoctor &&
                            user?.Doctor?.appointments?.map((apt: any) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 hover-lift"
                                >
                                    <div className="space-y-1">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {new Date(apt.startsAt).toLocaleDateString()} at{" "}
                                            {new Date(apt.startsAt).toLocaleTimeString()}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Patient: <span className="text-slate-900 dark:text-slate-200">{apt.patient?.name || "Unknown"}</span>
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            apt.status === "CONFIRMED"
                                                ? "default"
                                                : apt.status === "PENDING"
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className={`font-medium px-3 py-1 ${
                                            apt.status === "CONFIRMED"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : apt.status === "PENDING"
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                        }`}
                                    >
                                        {apt.status}
                                    </Badge>
                                </div>
                            ))}
                    </div>
                </PremiumCard>
            ) : null}
        </div>
    );
}
