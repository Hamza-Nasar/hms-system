#!/usr/bin/env node

/**
 * Generate a secure random secret for NEXTAUTH_SECRET
 * Usage: node scripts/generate-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n🔐 Generated NEXTAUTH_SECRET:');
console.log('='.repeat(60));
console.log(secret);
console.log('='.repeat(60));
console.log('\n✅ Copy this to your .env file as:');
console.log(`NEXTAUTH_SECRET="${secret}"\n`);

