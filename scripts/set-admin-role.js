/**
 * Quick script to set admin role for a user
 * Usage: node scripts/set-admin-role.js your-email@example.com
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/set-admin-role.js your-email@example.com');
    process.exit(1);
}

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/hms-system';

async function setAdminRole() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();
        const collection = db.collection('User');

        // Find user
        const user = await collection.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }

        console.log(`📧 Found user: ${user.name} (${user.email})`);
        console.log(`📋 Current role: ${user.role || 'PATIENT'}`);

        // Update role
        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            { $set: { role: 'admin' } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Admin role set successfully!');
            console.log('\n📝 Next steps:');
            console.log('   1. Logout from the application');
            console.log('   2. Login again');
            console.log('   3. Access admin panel at: /dashboard/admin');
        } else {
            console.log('⚠️  Role was already set to admin');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

setAdminRole();









