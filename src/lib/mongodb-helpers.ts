import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS, toObjectId } from './mongodb';

// Helper to convert MongoDB document _id to id
export function convertDocument(doc: any): any {
    if (!doc) return doc;
    if (Array.isArray(doc)) {
        return doc.map(convertDocument);
    }
    // Create a new object to avoid mutating the original
    const result: any = {};
    // Copy all properties
    for (const key in doc) {
        if (key === '_id') {
            // Convert _id to id
            result.id = doc._id.toString();
        } else {
            result[key] = doc[key];
        }
    }
    // If _id exists but id wasn't set, set it
    if (doc._id && !result.id) {
        result.id = doc._id.toString();
    }
    return result;
}

// Helper to handle Prisma-style includes
export async function handleIncludes(
    db: Db,
    doc: any,
    include: any,
    select: any,
    modelName: string
): Promise<any> {
    if (!doc) return doc;
    
    const result = { ...doc };
    
    // Convert _id to id for compatibility - get userId for lookups
    const userId = result._id ? result._id.toString() : result.id;
    if (result._id) {
        result.id = result._id.toString();
        // Don't delete _id yet - we might need it for lookups
    }
    
    if (!include) {
        // Clean up _id before returning
        if (result._id) {
            delete result._id;
        }
        return result;
    }
    
    // Handle User includes
    if (include.Patient) {
        const patientCollection = db.collection(COLLECTIONS.PATIENTS);
        const patient = await patientCollection.findOne({ userId: userId });
        if (patient) {
            result.Patient = { ...patient, id: patient._id.toString() };
            
            // Handle nested includes in Patient
            if (include.Patient.include) {
                if (include.Patient.include.appointments) {
                    const appointmentCollection = db.collection(COLLECTIONS.APPOINTMENTS);
                    // Use patient.id (string) for patientId lookup since that's how it's stored
                    let appointmentQuery: any = { patientId: patient._id ? patient._id.toString() : patient.id };
                    let appointments = appointmentCollection.find(appointmentQuery);
                    
                    if (include.Patient.include.appointments.orderBy) {
                        const sort: any = {};
                        Object.keys(include.Patient.include.appointments.orderBy).forEach(key => {
                            sort[key] = include.Patient.include.appointments.orderBy[key] === 'desc' ? -1 : 1;
                        });
                        appointments = appointments.sort(sort);
                    }
                    
                    if (include.Patient.include.appointments.take) {
                        appointments = appointments.limit(include.Patient.include.appointments.take);
                    }
                    
                    let appointmentList = await appointments.toArray();
                    
                    // Handle nested includes in appointments
                    if (include.Patient.include.appointments.include) {
                        if (include.Patient.include.appointments.include.doctor) {
                            const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
                            appointmentList = await Promise.all(appointmentList.map(async (apt: any) => {
                                const doctorId = toObjectId(apt.doctorId);
                                if (doctorId) {
                                    const doctor = await doctorCollection.findOne({ _id: doctorId });
                                    if (doctor) {
                                        apt.doctor = { ...doctor, id: doctor._id.toString() };
                                        
                                        // Handle nested doctor.user
                                        if (include.Patient.include.appointments.include.doctor.user) {
                                            const userCollection = db.collection(COLLECTIONS.USERS);
                                            const doctorUserId = toObjectId(doctor.userId);
                                            if (doctorUserId) {
                                                const doctorUser = await userCollection.findOne({ _id: doctorUserId });
                                                if (doctorUser) {
                                                    apt.doctor.user = { 
                                                        name: doctorUser.name,
                                                        id: doctorUser._id.toString() 
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                                return { ...apt, id: apt._id.toString() };
                            }));
                        }
                    }
                    
                    result.Patient.appointments = appointmentList.map((apt: any) => ({
                        ...apt,
                        id: apt._id.toString()
                    }));
                }
            }
        }
    }
    
    if (include.Doctor) {
        const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
        const doctor = await doctorCollection.findOne({ userId: userId });
        if (doctor) {
            result.Doctor = { ...doctor, id: doctor._id.toString() };
            
            // Handle nested includes in Doctor
            if (include.Doctor.include) {
                if (include.Doctor.include.appointments) {
                    const appointmentCollection = db.collection(COLLECTIONS.APPOINTMENTS);
                    // Use doctor.id (string) for doctorId lookup since that's how it's stored
                    let appointmentQuery: any = { doctorId: doctor._id ? doctor._id.toString() : doctor.id };
                    let appointments = appointmentCollection.find(appointmentQuery);
                    
                    if (include.Doctor.include.appointments.orderBy) {
                        const sort: any = {};
                        Object.keys(include.Doctor.include.appointments.orderBy).forEach(key => {
                            sort[key] = include.Doctor.include.appointments.orderBy[key] === 'desc' ? -1 : 1;
                        });
                        appointments = appointments.sort(sort);
                    }
                    
                    if (include.Doctor.include.appointments.take) {
                        appointments = appointments.limit(include.Doctor.include.appointments.take);
                    }
                    
                    let appointmentList = await appointments.toArray();
                    
                    // Handle nested includes
                    if (include.Doctor.include.appointments.include) {
                        if (include.Doctor.include.appointments.include.patient) {
                            const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                            appointmentList = await Promise.all(appointmentList.map(async (apt: any) => {
                                const patientId = toObjectId(apt.patientId);
                                if (patientId) {
                                    const patient = await patientCollection.findOne({ _id: patientId });
                                    if (patient) {
                                        apt.patient = { 
                                            name: patient.name,
                                            id: patient._id.toString() 
                                        };
                                    }
                                }
                                return { ...apt, id: apt._id.toString() };
                            }));
                        }
                    }
                    
                    result.Doctor.appointments = appointmentList.map((apt: any) => ({
                        ...apt,
                        id: apt._id.toString()
                    }));
                }
            }
        }
    }
    
    // Clean up _id before returning
    if (result._id) {
        delete result._id;
    }
    
    return result;
}

// Helper for appointment includes
export async function handleAppointmentIncludes(
    db: Db,
    appointment: any,
    include: any
): Promise<any> {
    if (!appointment) return appointment;
    
    const result = { ...appointment };
    if (appointment._id) {
        result.id = appointment._id.toString();
    }
    
    if (include.patient) {
        const patientCollection = db.collection(COLLECTIONS.PATIENTS);
        const patientId = toObjectId(appointment.patientId);
        if (patientId) {
            const patient = await patientCollection.findOne({ _id: patientId });
            if (patient) {
                if (include.patient.select) {
                    const selected: any = {};
                    Object.keys(include.patient.select).forEach(key => {
                        if (include.patient.select[key] && patient[key] !== undefined) {
                            selected[key] = patient[key];
                        }
                    });
                    result.patient = selected;
                } else {
                    result.patient = { ...patient, id: patient._id.toString() };
                }
            }
        }
    }
    
    if (include.doctor) {
        const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
        const doctorId = toObjectId(appointment.doctorId);
        if (doctorId) {
            const doctor = await doctorCollection.findOne({ _id: doctorId });
            if (doctor) {
                result.doctor = { ...doctor, id: doctor._id.toString() };
                
                if (include.doctor.user) {
                    const userCollection = db.collection(COLLECTIONS.USERS);
                    const doctorUserId = toObjectId(doctor.userId);
                    if (doctorUserId) {
                        const doctorUser = await userCollection.findOne({ _id: doctorUserId });
                        if (doctorUser) {
                            if (include.doctor.user.select) {
                                const selected: any = {};
                                Object.keys(include.doctor.user.select).forEach(key => {
                                    if (include.doctor.user.select[key] && doctorUser[key] !== undefined) {
                                        selected[key] = doctorUser[key];
                                    }
                                });
                                result.doctor.user = selected;
                            } else {
                                result.doctor.user = { ...doctorUser, id: doctorUser._id.toString() };
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Clean up _id before returning
    if (result._id) {
        delete result._id;
    }
    
    return result;
}

