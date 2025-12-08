require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('URI Type:', typeof uri);
console.log('URI Length:', uri ? uri.length : 0);
// Mask the URI for safety logs, showing only protocol and host if possible
const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined';
console.log('Target URI:', maskedUri);

if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Connection State:', mongoose.connection.readyState);
        console.log('Host:', mongoose.connection.host);
        console.log('Port:', mongoose.connection.port);
        console.log('Name:', mongoose.connection.name);
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection Failed:', err.name, err.code);
        console.error('Error Details:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    });
