import { MongoClient, Db, ObjectId, MongoServerSelectionError } from 'mongodb';

if (!process.env.DATABASE_URL) {
    throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.DATABASE_URL;
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
    const newClient = new MongoClient(uri, options);
    return newClient.connect().catch((error) => {
        // Log connection error with more details
        if (error instanceof MongoServerSelectionError) {
            console.error('MongoDB connection failed:', error.message);
            console.error('Connection URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Custom error class for MongoDB connection errors
export class MongoDBConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MongoDBConnectionError';
    }
}

// Helper function to get database
export async function getDb(): Promise<Db> {
    try {
        const client = await clientPromise;
        // Extract database name from connection string
        let dbName = 'hms-system'; // default
        try {
            // Handle both mongodb:// and mongodb+srv:// URLs
            if (uri.includes('mongodb+srv://')) {
                const url = new URL(uri);
                const path = url.pathname.substring(1);
                if (path) {
                    dbName = path;
                }
            } else {
                // Handle mongodb://localhost:27017/hms-system format
                const url = new URL(uri);
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

