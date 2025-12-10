const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/hms-system';

async function checkUsers() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');
        
        const db = client.db();
        const users = await db.collection('User').find({}).toArray();
        
        console.log('📋 All Users:');
        console.log('─'.repeat(60));
        users.forEach((u, index) => {
            console.log(`${index + 1}. Email: ${u.email}`);
            console.log(`   Name: ${u.name || 'N/A'}`);
            console.log(`   Role: ${u.role || 'PATIENT'}`);
            console.log(`   ID: ${u._id}`);
            console.log('');
        });
        
        if (users.length === 0) {
            console.log('⚠️  No users found in database');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

checkUsers();









