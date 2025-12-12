import { MongoClient, Db, ObjectId, MongoServerSelectionError } from 'mongodb';

// Don't throw during build time - only warn
// The error will be caught at runtime when database is actually used
if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: DATABASE_URL is missing in production. Database operations will fail.');
    } else {
        console.warn('DATABASE_URL is not set. Please add your Mongo URI to .env.local');
    }
}

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/hms-system'; // Fallback for build time
const options = {
    serverSelectionTimeoutMS: 10000, // Increased to 10s for better reliability
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 10000, // Connection timeout
    maxPoolSize: 10, // Maximum number of connections
    retryWrites: true, // Retry writes on network errors
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Helper to create connection promise with error handling
function createClientPromise(): Promise<MongoClient> {
    // Only create connection if DATABASE_URL is actually set
    if (!process.env.DATABASE_URL) {
        return Promise.reject(new Error('DATABASE_URL is required. Please set it in your environment variables.'));
    }
    
    const connectionUri = process.env.DATABASE_URL;
    const newClient = new MongoClient(connectionUri, options);
    return newClient.connect().catch((error) => {
        // Log connection error with more details
        if (error instanceof MongoServerSelectionError) {
            console.error('MongoDB connection failed:', error.message);
            if (connectionUri) {
                console.error('Connection URI:', connectionUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
            }
            console.error('Please check:');
            console.error('1. MongoDB service is running: Get-Service MongoDB');
            console.error('2. MongoDB is listening on port 27017: netstat -an | findstr 27017');
            console.error('3. Connection string in .env.local is correct');
            console.error('4. If using replica set, ensure it is initialized');
        }
        // Re-throw to allow callers to handle
        throw error;
    });
}

// Lazy initialization - only create client promise when DATABASE_URL is available
// This prevents build-time errors when DATABASE_URL is missing
function getClientPromise(): Promise<MongoClient> {
    // Don't create promise if DATABASE_URL is missing (allows build to succeed)
    if (!process.env.DATABASE_URL) {
        return Promise.reject(new Error('DATABASE_URL is required. Please set it in your environment variables.'));
    }
    
    if (!clientPromise) {
        if (process.env.NODE_ENV === 'development') {
            // In development mode, use a global variable so that the value
            // is preserved across module reloads caused by HMR (Hot Module Replacement).
            const globalWithMongo = global as typeof globalThis & {
                _mongoClientPromise?: Promise<MongoClient>;
            };

            if (!globalWithMongo._mongoClientPromise) {
                clientPromise = createClientPromise();
                globalWithMongo._mongoClientPromise = clientPromise;
            } else {
                clientPromise = globalWithMongo._mongoClientPromise;
            }
        } else {
            // In production mode, it's best to not use a global variable.
            clientPromise = createClientPromise();
        }
    }
    return clientPromise;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
// Use lazy initialization to avoid build-time errors
// Only create promise if DATABASE_URL exists (allows build to succeed)
export default process.env.DATABASE_URL ? getClientPromise() : Promise.reject(new Error('DATABASE_URL is required'));

// Custom error class for MongoDB connection errors
export class MongoDBConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MongoDBConnectionError';
    }
}

// Helper function to get database
export async function getDb(): Promise<Db> {
    // Validate DATABASE_URL at runtime, not build time
    if (!process.env.DATABASE_URL) {
        throw new MongoDBConnectionError('DATABASE_URL is required. Please set it in your environment variables.');
    }
    
    try {
        const client = await getClientPromise();
        // Extract database name from connection string
        const actualUri = process.env.DATABASE_URL || uri;
        let dbName = 'hms-system'; // default
        try {
            // Handle both mongodb:// and mongodb+srv:// URLs
            if (actualUri.includes('mongodb+srv://')) {
                const url = new URL(actualUri);
                const path = url.pathname.substring(1);
                if (path) {
                    dbName = path;
                }
            } else {
                // Handle mongodb://localhost:27017/hms-system format
                const url = new URL(actualUri);
                const path = url.pathname.substring(1);
                if (path) {
                    dbName = path;
                } else {
                    // Try to extract from connection string directly
                    const match = uri.match(/\/([^?]+)/);
                    if (match && match[1]) {
                        dbName = match[1];
                    }
                }
            }
        } catch (e) {
            // If URL parsing fails, try to extract from connection string
            const match = uri.match(/\/([^?]+)/);
            if (match && match[1]) {
                dbName = match[1];
            }
        }
        return client.db(dbName);
    } catch (error: any) {
        if (error instanceof MongoServerSelectionError || 
            error.message?.includes('connection') || 
            error.message?.includes('refused') ||
            error.message?.includes('timeout')) {
            // Check if it's a replica set issue
            if (error.message?.includes('replSet') || error.message?.includes('replication')) {
                throw new MongoDBConnectionError('MongoDB replica set not configured. Please run: node init-replica-set.js or see FIX_MONGODB_REPLICA_SET.md');
            }
            throw new MongoDBConnectionError('MongoDB connection failed. Please check: 1) MongoDB service is running 2) Port 27017 is accessible 3) Replica set is configured (see FIX_MONGODB_REPLICA_SET.md)');
        }
        throw error;
    }
}

// Helper to convert string to ObjectId
export function toObjectId(id: string | undefined | null): ObjectId | null {
    if (!id) return null;
    try {
        return new ObjectId(id);
    } catch {
        return null;
    }
}

// Helper to check if string is valid ObjectId
export function isValidObjectId(id: string | undefined | null): boolean {
    if (!id) return false;
    return ObjectId.isValid(id) && id.length === 24;
}

// Collection names
export const COLLECTIONS = {
    USERS: 'User',
    PATIENTS: 'Patient',
    DOCTORS: 'Doctor',
    APPOINTMENTS: 'Appointment',
    BILLS: 'Bill',
    INVENTORY: 'Inventory',
    AVAILABILITY: 'Availability',
    MEDICAL_RECORDS: 'MedicalRecord',
    PRESCRIPTIONS: 'Prescription',
    LAB_TESTS: 'LabTest',
    NOTIFICATIONS: 'Notification',
} as const;

