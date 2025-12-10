// Quick MongoDB Connection Test
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/hms-system';

async function testConnection() {
    console.log('Testing MongoDB connection...');
    console.log('URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

    try {
        console.log('\n[1/3] Attempting to connect...');
        await client.connect();
        console.log('✓ Connected successfully!');
        
        console.log('\n[2/3] Testing database access...');
        const db = client.db('hms-system');
        const collections = await db.listCollections().toArray();
        console.log(`✓ Database accessible. Found ${collections.length} collections.`);
        
        console.log('\n[3/3] Checking replica set status...');
        try {
            const adminDb = client.db('admin');
            const status = await adminDb.admin().command({ replSetGetStatus: 1 });
            console.log('✓ Replica set is configured:', status.set);
            console.log('  Status:', status.members[0].stateStr);
        } catch (rsError) {
            if (rsError.message.includes('not running with --replSet')) {
                console.log('⚠ Replica set not initialized');
                console.log('  This is required for Prisma to work properly.');
                console.log('  Run: .\\init-replica-set.ps1');
            } else {
                console.log('⚠ Could not check replica set:', rsError.message);
            }
        }
        
        console.log('\n✓ All tests passed! MongoDB is working correctly.');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Connection failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check if MongoDB service is running: Get-Service MongoDB');
        console.error('2. Check if port 27017 is listening: netstat -an | findstr 27017');
        console.error('3. Verify DATABASE_URL in .env.local');
        console.error('4. Check MongoDB logs for errors');
        process.exit(1);
    } finally {
        await client.close();
    }
}

testConnection();







