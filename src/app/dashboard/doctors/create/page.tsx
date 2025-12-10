"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PremiumCard } from "@/components/PremiumCard";
import { PremiumButton } from "@/components/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { Plus, ArrowLeft } from "lucide-react";

export default function CreateDoctorPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        specialization: "",
        phone: "",
        department: "",
        experience: "",
        qualification: "",
        consultationFee: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = (session?.user as any)?.role === "admin";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!form.name || !form.email || !form.password) {
            setError("Name, Email, and Password are required");
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/doctors/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    specialization: form.specialization || undefined,
                    phone: form.phone || undefined,
                    department: form.department || undefined,
                    experience: form.experience ? parseInt(form.experience) : undefined,
                    qualification: form.qualification || undefined,
                    consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : undefined,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to create doctor" }));
                throw new Error(errorData.error || "Failed to create doctor");
            }

            const data = await res.json();
            toast({ title: "Doctor created successfully!" });
            router.push("/dashboard/doctors");
        } catch (err: any) {
            setError(err.message || "Failed to create doctor");
            toast({ title: err.message || "Failed to create doctor", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    if (!session) {
        return (
            <div className="p-4">
                <div className="p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    Please login to continue
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-4">
                <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                    Only admins can create doctors
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <PremiumButton
                    variant="outline"
                    icon={ArrowLeft}
                    iconPosition="left"
                    onClick={() => router.back()}
                >
                    Back
                </PremiumButton>
                <h1 className="text-3xl font-bold">Create New Doctor</h1>
            </div>

            <PremiumCard title="Doctor Information" description="Fill in the details to create a new doctor account">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Doctor Name *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Dr. John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="doctor@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+1234567890"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                                id="specialization"
                                value={form.specialization}
                                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                placeholder="Cardiology, Neurology, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                placeholder="Cardiology, Emergency, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience (Years)</Label>
                            <Input
                                id="experience"
                                type="number"
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                placeholder="5"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualification</Label>
                            <Input
                                id="qualification"
                                value={form.qualification}
                                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                                placeholder="MBBS, MD, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                            <Input
                                id="consultationFee"
                                type="number"
                                step="0.01"
                                value={form.consultationFee}
                                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                                placeholder="100.00"
                                min="0"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <PremiumButton
                            type="submit"
                            variant="gradient"
                            icon={Plus}
                            iconPosition="left"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? "Creating..." : "Create Doctor"}
                        </PremiumButton>
                        <PremiumButton
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </PremiumButton>
                    </div>
                </form>
            </PremiumCard>
        </div>
    );
}

