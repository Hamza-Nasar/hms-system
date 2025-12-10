// Initialize MongoDB Replica Set
const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/hms-system';

async function initReplicaSet() {
    console.log('Initializing MongoDB Replica Set...\n');
    
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
    });

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');
        
        const adminDb = client.db('admin');
        
        // Check if replica set is already initialized
        try {
            const status = await adminDb.admin().command({ replSetGetStatus: 1 });
            console.log('✓ Replica set already initialized:', status.set);
            console.log('  Status:', status.members[0].stateStr);
            process.exit(0);
        } catch (rsError) {
            if (rsError.message.includes('no replset config')) {
                console.log('Initializing replica set...');
                
                // Initialize replica set
                try {
                    const result = await adminDb.admin().command({
                        replSetInitiate: {
                            _id: 'rs0',
                            members: [
                                { _id: 0, host: 'localhost:27017' }
                            ]
                        }
                    });
                    
                    console.log('✓ Replica set initialization started!');
                    console.log('  Waiting for replica set to become ready...');
                    
                    // Wait for replica set to become PRIMARY
                    let attempts = 0;
                    while (attempts < 30) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        try {
                            const status = await adminDb.admin().command({ replSetGetStatus: 1 });
                            if (status.members[0].stateStr === 'PRIMARY') {
                                console.log('✓ Replica set is ready!');
                                console.log('  Status: PRIMARY');
                                process.exit(0);
                            }
                        } catch (e) {
                            // Still initializing
                        }
                        attempts++;
                    }
                    
                    console.log('⚠ Replica set initialized but not ready yet. Please wait a few seconds.');
                    process.exit(0);
                } catch (initError) {
                    if (initError.message.includes('replication is not enabled')) {
                        console.error('\n✗ ERROR: Replication not enabled in MongoDB config');
                        console.error('\nPlease follow these steps:');
                        console.error('1. Stop MongoDB: Stop-Service MongoDB (as Administrator)');
                        console.error('2. Edit mongod.cfg (usually in C:\\Program Files\\MongoDB\\Server\\<version>\\bin\\)');
                        console.error('3. Add these lines:');
                        console.error('   replication:');
                        console.error('     replSetName: "rs0"');
                        console.error('4. Start MongoDB: Start-Service MongoDB');
                        console.error('5. Run this script again');
                        process.exit(1);
                    } else {
                        console.error('Error:', initError.message);
                        process.exit(1);
                    }
                }
            } else {
                console.error('Error checking replica set:', rsError.message);
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('\n✗ Connection failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check if MongoDB service is running: Get-Service MongoDB');
        console.error('2. Check if port 27017 is listening: netstat -an | findstr 27017');
        process.exit(1);
    } finally {
        await client.close();
    }
}

initReplicaSet();







