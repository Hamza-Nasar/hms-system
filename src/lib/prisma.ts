// This file is deprecated - use src/lib/mongodb.ts instead
// Keeping for backward compatibility during migration
import { getDb, COLLECTIONS, toObjectId, isValidObjectId, MongoDBConnectionError } from './mongodb';
import { handleIncludes, handleAppointmentIncludes, convertDocument } from './mongodb-helpers';

// Re-export MongoDB helpers for easy migration
export { getDb, COLLECTIONS, toObjectId, isValidObjectId, MongoDBConnectionError };

// Helper to safely get database with error handling
async function safeGetDb() {
    try {
        return await getDb();
    } catch (error) {
        if (error instanceof MongoDBConnectionError) {
            // Re-throw as a more specific error that can be caught
            throw error;
        }
        throw error;
    }
}

// Helper to wrap database operations and catch MongoDB connection errors
async function withDb<T>(operation: (db: any) => Promise<T>): Promise<T> {
    try {
        const db = await safeGetDb();
        return await operation(db);
    } catch (error) {
        if (error instanceof MongoDBConnectionError) {
            // Re-throw so calling code can handle it
            throw error;
        }
        throw error;
    }
}

// Legacy Prisma-like interface (will be removed)
export const prisma = {
    user: {
        findUnique: async (args: any) => {
            const result = await withDb(async (db) => {
                const collection = db.collection(COLLECTIONS.USERS);
                const where = args.where;
                let query: any = {};
                if (where.id) {
                    query._id = toObjectId(where.id);
                } else if (where.email) {
                    query.email = where.email;
                } else {
                    query = where;
                }
                
                let user = await collection.findOne(query);
                if (!user) return null;
                
                // Handle include/select
                if (args.include || args.select) {
                    user = await handleIncludes(db, user, args.include, args.select, 'user');
                }
                
                // Handle select only
                if (args.select && !args.include) {
                    const selected: any = {};
                    Object.keys(args.select).forEach(key => {
                        if (args.select[key] && user[key] !== undefined) {
                            selected[key] = user[key];
                        }
                    });
                    return convertDocument(selected);
                }
                
                return convertDocument(user);
            });
            return result;
        },
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.USERS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let users = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                users = await Promise.all(users.map(user => handleIncludes(db, user, args.include, undefined, 'user')));
            }
            
            return convertDocument(users);
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.USERS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            
            // Handle select
            if (args.select) {
                const selected: any = {};
                Object.keys(args.select).forEach(key => {
                    if (args.select[key] && data[key] !== undefined) {
                        selected[key] = data[key];
                    }
                });
                return convertDocument({ ...selected, _id: data._id });
            }
            
            return convertDocument(data);
        },
        update: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.USERS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.findOneAndUpdate(
                query,
                { $set: update },
                { returnDocument: 'after' }
            );
            return result;
        },
        delete: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.USERS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const result = await collection.deleteOne(query);
            return { ...result, id: where.id };
        },
    },
    patient: {
        findUnique: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PATIENTS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else if (where.userId) {
                query.userId = where.userId;
            } else {
                query = where;
            }
            
            let patient = await collection.findOne(query);
            if (!patient) return null;
            
            // Handle includes
            if (args.include) {
                if (args.include.user) {
                    const userCollection = db.collection(COLLECTIONS.USERS);
                    const userId = toObjectId(patient.userId);
                    if (userId) {
                        const user = await userCollection.findOne({ _id: userId });
                        if (user) {
                            if (args.include.user.select) {
                                const selected: any = {};
                                Object.keys(args.include.user.select).forEach(key => {
                                    if (args.include.user.select[key] && user[key] !== undefined) {
                                        selected[key] = user[key];
                                    }
                                });
                                patient.user = selected;
                            } else {
                                patient.user = { ...user, id: user._id.toString() };
                            }
                        }
                    }
                }
            }
            
            return { ...patient, id: patient._id.toString() };
        },
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PATIENTS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let patients = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                patients = await Promise.all(patients.map(async (patient: any) => {
                    if (args.include.user) {
                        const userCollection = db.collection(COLLECTIONS.USERS);
                        const userId = toObjectId(patient.userId);
                        if (userId) {
                            const user = await userCollection.findOne({ _id: userId });
                            if (user) {
                                patient.user = { ...user, id: user._id.toString() };
                            }
                        }
                    }
                    return { ...patient, id: patient._id.toString() };
                }));
            } else {
                patients = patients.map((p: any) => ({ ...p, id: p._id.toString() }));
            }
            
            return patients;
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PATIENTS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            
            // Handle includes
            let result: any = { ...data, id: data._id.toString() };
            if (args.include) {
                if (args.include.user) {
                    const userCollection = db.collection(COLLECTIONS.USERS);
                    const userId = toObjectId(data.userId);
                    if (userId) {
                        const user = await userCollection.findOne({ _id: userId });
                        if (user) {
                            if (args.include.user.select) {
                                const selected: any = {};
                                Object.keys(args.include.user.select).forEach(key => {
                                    if (args.include.user.select[key] && user[key] !== undefined) {
                                        selected[key] = user[key];
                                    }
                                });
                                result.user = selected;
                            } else {
                                result.user = { ...user, id: user._id.toString() };
                            }
                        }
                    }
                }
            }
            
            return result;
        },
        count: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PATIENTS);
            if (args?.where) {
                return collection.countDocuments(args.where);
            }
            return collection.countDocuments();
        },
    },
    doctor: {
        findUnique: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.DOCTORS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else if (where.userId) {
                query.userId = where.userId;
            } else {
                query = where;
            }
            
            let doctor = await collection.findOne(query);
            if (!doctor) return null;
            
            // Handle includes
            if (args.include) {
                if (args.include.user) {
                    const userCollection = db.collection(COLLECTIONS.USERS);
                    const userId = toObjectId(doctor.userId);
                    if (userId) {
                        const user = await userCollection.findOne({ _id: userId });
                        if (user) {
                            if (args.include.user.select) {
                                const selected: any = {};
                                Object.keys(args.include.user.select).forEach(key => {
                                    if (args.include.user.select[key] && user[key] !== undefined) {
                                        selected[key] = user[key];
                                    }
                                });
                                doctor.user = selected;
                            } else {
                                doctor.user = { ...user, id: user._id.toString() };
                            }
                        }
                    }
                }
            }
            
            return { ...doctor, id: doctor._id.toString() };
        },
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.DOCTORS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            let doctors = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                doctors = await Promise.all(doctors.map(async (doctor: any) => {
                    if (args.include.user) {
                        const userCollection = db.collection(COLLECTIONS.USERS);
                        const userId = toObjectId(doctor.userId);
                        if (userId) {
                            const user = await userCollection.findOne({ _id: userId });
                            if (user) {
                                if (args.include.user.select) {
                                    const selected: any = {};
                                    Object.keys(args.include.user.select).forEach(key => {
                                        if (args.include.user.select[key] && user[key] !== undefined) {
                                            selected[key] = user[key];
                                        }
                                    });
                                    doctor.user = selected;
                                } else {
                                    doctor.user = { ...user, id: user._id.toString() };
                                }
                            }
                        }
                    }
                    return { ...doctor, id: doctor._id.toString() };
                }));
            } else {
                doctors = doctors.map((d: any) => ({ ...d, id: d._id.toString() }));
            }
            
            return doctors;
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.DOCTORS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
        count: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.DOCTORS);
            if (args?.where) {
                return collection.countDocuments(args.where);
            }
            return collection.countDocuments();
        },
    },
    appointment: {
        findUnique: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.APPOINTMENTS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            
            let appointment = await collection.findOne(query);
            if (!appointment) return null;
            
            // Handle includes
            if (args.include) {
                appointment = await handleAppointmentIncludes(db, appointment, args.include);
            }
            
            return { ...appointment, id: appointment._id.toString() };
        },
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.APPOINTMENTS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let appointments = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                appointments = await Promise.all(appointments.map(apt => handleAppointmentIncludes(db, apt, args.include)));
            }
            
            return appointments.map((apt: any) => ({ ...apt, id: apt._id.toString() }));
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.APPOINTMENTS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
        update: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.APPOINTMENTS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.findOneAndUpdate(
                query,
                { $set: update },
                { returnDocument: 'after' }
            );
            return result ? { ...result, id: result._id.toString() } : null;
        },
        count: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.APPOINTMENTS);
            let query: any = {};
            if (args?.where) {
                query = args.where;
                // Convert id to _id if needed
                if (query.id) {
                    query._id = toObjectId(query.id);
                    delete query.id;
                }
                // Handle nested where conditions
                if (query.patientId && typeof query.patientId === 'string') {
                    // patientId is stored as string, keep as is
                }
                if (query.doctorId && typeof query.doctorId === 'string') {
                    // doctorId is stored as string, keep as is
                }
            }
            return collection.countDocuments(query);
        },
    },
    bill: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.BILLS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.include) {
                let bills = await cursor.toArray();
                bills = await Promise.all(bills.map(async (bill: any) => {
                    if (args.include.patient) {
                        const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                        const patientId = toObjectId(bill.patientId);
                        if (patientId) {
                            const patient = await patientCollection.findOne({ _id: patientId });
                            if (patient) {
                                if (args.include.patient.select) {
                                    const selected: any = {};
                                    Object.keys(args.include.patient.select).forEach(key => {
                                        if (args.include.patient.select[key] && patient[key] !== undefined) {
                                            selected[key] = patient[key];
                                        }
                                    });
                                    bill.patient = selected;
                                } else {
                                    bill.patient = { ...patient, id: patient._id.toString() };
                                }
                            }
                        }
                    }
                    return { ...bill, id: bill._id.toString() };
                }));
                return bills;
            }
            
            const bills = await cursor.toArray();
            return bills.map((b: any) => ({ ...b, id: b._id.toString() }));
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.BILLS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
    },
    inventory: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.INVENTORY);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            const items = await cursor.toArray();
            return items.map((item: any) => ({ ...item, id: item._id.toString() }));
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.INVENTORY);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
    },
    availability: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.AVAILABILITY);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            const availability = await cursor.toArray();
            return availability.map((a: any) => ({ ...a, id: a._id.toString() }));
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.AVAILABILITY);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
    },
    medicalRecord: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.MEDICAL_RECORDS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let records = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                records = await Promise.all(records.map(async (record: any) => {
                    if (args.include.patient) {
                        const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                        const patientId = toObjectId(record.patientId);
                        if (patientId) {
                            const patient = await patientCollection.findOne({ _id: patientId });
                            if (patient) {
                                if (args.include.patient.select) {
                                    const selected: any = {};
                                    Object.keys(args.include.patient.select).forEach(key => {
                                        if (args.include.patient.select[key] && patient[key] !== undefined) {
                                            selected[key] = patient[key];
                                        }
                                    });
                                    record.patient = selected;
                                } else {
                                    record.patient = { ...patient, id: patient._id.toString() };
                                }
                            }
                        }
                    }
                    if (args.include.doctor) {
                        const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
                        const doctorId = toObjectId(record.doctorId);
                        if (doctorId) {
                            const doctor = await doctorCollection.findOne({ _id: doctorId });
                            if (doctor) {
                                record.doctor = { ...doctor, id: doctor._id.toString() };
                                if (args.include.doctor.user) {
                                    const userCollection = db.collection(COLLECTIONS.USERS);
                                    const userId = toObjectId(doctor.userId);
                                    if (userId) {
                                        const user = await userCollection.findOne({ _id: userId });
                                        if (user) {
                                            if (args.include.doctor.user.select) {
                                                const selected: any = {};
                                                Object.keys(args.include.doctor.user.select).forEach(key => {
                                                    if (args.include.doctor.user.select[key] && user[key] !== undefined) {
                                                        selected[key] = user[key];
                                                    }
                                                });
                                                record.doctor.user = selected;
                                            } else {
                                                record.doctor.user = { ...user, id: user._id.toString() };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return { ...record, id: record._id.toString() };
                }));
            } else {
                records = records.map((r: any) => ({ ...r, id: r._id.toString() }));
            }
            
            return records;
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.MEDICAL_RECORDS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
    },
    prescription: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PRESCRIPTIONS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let prescriptions = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                prescriptions = await Promise.all(prescriptions.map(async (prescription: any) => {
                    if (args.include.patient) {
                        const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                        const patientId = toObjectId(prescription.patientId);
                        if (patientId) {
                            const patient = await patientCollection.findOne({ _id: patientId });
                            if (patient) {
                                if (args.include.patient.select) {
                                    const selected: any = {};
                                    Object.keys(args.include.patient.select).forEach(key => {
                                        if (args.include.patient.select[key] && patient[key] !== undefined) {
                                            selected[key] = patient[key];
                                        }
                                    });
                                    prescription.patient = selected;
                                } else {
                                    prescription.patient = { ...patient, id: patient._id.toString() };
                                }
                            }
                        }
                    }
                    if (args.include.doctor) {
                        const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
                        const doctorId = toObjectId(prescription.doctorId);
                        if (doctorId) {
                            const doctor = await doctorCollection.findOne({ _id: doctorId });
                            if (doctor) {
                                prescription.doctor = { ...doctor, id: doctor._id.toString() };
                                if (args.include.doctor.user) {
                                    const userCollection = db.collection(COLLECTIONS.USERS);
                                    const userId = toObjectId(doctor.userId);
                                    if (userId) {
                                        const user = await userCollection.findOne({ _id: userId });
                                        if (user) {
                                            if (args.include.doctor.user.select) {
                                                const selected: any = {};
                                                Object.keys(args.include.doctor.user.select).forEach(key => {
                                                    if (args.include.doctor.user.select[key] && user[key] !== undefined) {
                                                        selected[key] = user[key];
                                                    }
                                                });
                                                prescription.doctor.user = selected;
                                            } else {
                                                prescription.doctor.user = { ...user, id: user._id.toString() };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return { ...prescription, id: prescription._id.toString() };
                }));
            } else {
                prescriptions = prescriptions.map((p: any) => ({ ...p, id: p._id.toString() }));
            }
            
            return prescriptions;
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PRESCRIPTIONS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
        update: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.PRESCRIPTIONS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.findOneAndUpdate(
                query,
                { $set: update },
                { returnDocument: 'after' }
            );
            if (!result) return null;
            
            // Handle includes if provided
            if (args.include) {
                if (args.include.patient) {
                    const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                    const patientId = toObjectId(result.patientId);
                    if (patientId) {
                        const patient = await patientCollection.findOne({ _id: patientId });
                        if (patient) {
                            if (args.include.patient.select) {
                                const selected: any = {};
                                Object.keys(args.include.patient.select).forEach(key => {
                                    if (args.include.patient.select[key] && patient[key] !== undefined) {
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
                if (args.include.doctor) {
                    const doctorCollection = db.collection(COLLECTIONS.DOCTORS);
                    const doctorId = toObjectId(result.doctorId);
                    if (doctorId) {
                        const doctor = await doctorCollection.findOne({ _id: doctorId });
                        if (doctor) {
                            result.doctor = { ...doctor, id: doctor._id.toString() };
                            if (args.include.doctor.user) {
                                const userCollection = db.collection(COLLECTIONS.USERS);
                                const userId = toObjectId(doctor.userId);
                                if (userId) {
                                    const user = await userCollection.findOne({ _id: userId });
                                    if (user) {
                                        if (args.include.doctor.user.select) {
                                            const selected: any = {};
                                            Object.keys(args.include.doctor.user.select).forEach(key => {
                                                if (args.include.doctor.user.select[key] && user[key] !== undefined) {
                                                    selected[key] = user[key];
                                                }
                                            });
                                            result.doctor.user = selected;
                                        } else {
                                            result.doctor.user = { ...user, id: user._id.toString() };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            return { ...result, id: result._id.toString() };
        },
    },
    labTest: {
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.LAB_TESTS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            let labTests = await cursor.toArray();
            
            // Handle includes
            if (args?.include) {
                if (args.include.patient) {
                    const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                    labTests = await Promise.all(labTests.map(async (test: any) => {
                        const patientId = toObjectId(test.patientId);
                        if (patientId) {
                            const patient = await patientCollection.findOne({ _id: patientId });
                            if (patient) {
                                if (args.include.patient.select) {
                                    const selected: any = {};
                                    Object.keys(args.include.patient.select).forEach(key => {
                                        if (args.include.patient.select[key] && patient[key] !== undefined) {
                                            selected[key] = patient[key];
                                        }
                                    });
                                    test.patient = selected;
                                } else {
                                    test.patient = { ...patient, id: patient._id.toString() };
                                }
                            }
                        }
                        return { ...test, id: test._id.toString() };
                    }));
                } else {
                    labTests = labTests.map((t: any) => ({ ...t, id: t._id.toString() }));
                }
            } else {
                labTests = labTests.map((t: any) => ({ ...t, id: t._id.toString() }));
            }
            
            return labTests;
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.LAB_TESTS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
        update: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.LAB_TESTS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.findOneAndUpdate(
                query,
                { $set: update },
                { returnDocument: 'after' }
            );
            if (!result) return null;
            
            // Handle includes if provided
            if (args.include) {
                if (args.include.patient) {
                    const patientCollection = db.collection(COLLECTIONS.PATIENTS);
                    const patientId = toObjectId(result.patientId);
                    if (patientId) {
                        const patient = await patientCollection.findOne({ _id: patientId });
                        if (patient) {
                            if (args.include.patient.select) {
                                const selected: any = {};
                                Object.keys(args.include.patient.select).forEach(key => {
                                    if (args.include.patient.select[key] && patient[key] !== undefined) {
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
            }
            
            return { ...result, id: result._id.toString() };
        },
    },
    notification: {
        findUnique: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            
            const notification = await collection.findOne(query);
            if (!notification) return null;
            return { ...notification, id: notification._id.toString() };
        },
        findMany: async (args?: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            let query = args?.where || {};
            let cursor = collection.find(query);
            
            if (args?.orderBy) {
                const sort: any = {};
                Object.keys(args.orderBy).forEach(key => {
                    sort[key] = args.orderBy[key] === 'desc' ? -1 : 1;
                });
                cursor = cursor.sort(sort);
            }
            
            if (args?.take) {
                cursor = cursor.limit(args.take);
            }
            
            const notifications = await cursor.toArray();
            return notifications.map((n: any) => ({ ...n, id: n._id.toString() }));
        },
        create: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const ObjectId = (await import('mongodb')).ObjectId;
            const data: any = {
                ...args.data,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await collection.insertOne(data);
            return { ...data, id: data._id.toString() };
        },
        update: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.findOneAndUpdate(
                query,
                { $set: update },
                { returnDocument: 'after' }
            );
            return result ? { ...result, id: result._id.toString() } : null;
        },
        updateMany: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const where = args.where || {};
            const update = { ...args.data, updatedAt: new Date() };
            const result = await collection.updateMany(where, { $set: update });
            return { count: result.modifiedCount };
        },
        delete: async (args: any) => {
            const db = await getDb();
            const collection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const where = args.where;
            let query: any = {};
            if (where.id) {
                query._id = toObjectId(where.id);
            } else {
                query = where;
            }
            const result = await collection.findOneAndDelete(query);
            return result ? { ...result, id: result._id.toString() } : null;
        },
    },
};
