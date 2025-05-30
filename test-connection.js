// test-connection.js
// This file helps debug MongoDB connection issues

const mongoose = require('mongoose');

// REPLACE WITH YOUR CONNECTION STRING
const MONGODB_URI = 'mongodb+srv://xxx/collegeDB?retryWrites=true&w=majority';

console.log('🔍 MongoDB Connection Debugger');
console.log('================================');
console.log(`📍 Connection URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}`);

// Set mongoose debugging on
mongoose.set('debug', true);

// Connection state mapping
const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
};

// Monitor connection state
console.log(`\n📊 Initial connection state: ${states[mongoose.connection.readyState]}`);

// Set up all event handlers BEFORE connecting
mongoose.connection.on('connecting', () => {
    console.log('🔄 Attempting to connect to MongoDB...');
});

mongoose.connection.on('connected', () => {
    console.log('✅ Successfully connected to MongoDB!');
    testConnection();
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('bad auth')) {
        console.error('🔐 Authentication failed - check your username and password');
    } else if (err.message.includes('ENOTFOUND')) {
        console.error('🌐 Cannot find the MongoDB cluster - check your cluster URL');
    } else if (err.message.includes('ETIMEDOUT')) {
        console.error('⏱️ Connection timed out - check your network and IP whitelist');
    }
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Disconnected from MongoDB');
});

// Test function to verify connection works
async function testConnection() {
    try {
        console.log('\n🧪 Testing database operations...');
        
        // Create a simple test schema
        const TestSchema = new mongoose.Schema({
            message: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', TestSchema);
        
        // Try to create a document
        console.log('📝 Creating test document...');
        const testDoc = await TestModel.create({
            message: 'Connection test successful!'
        });
        console.log('✅ Test document created:', testDoc);
        
        // Try to read it back
        console.log('📖 Reading test document...');
        const foundDoc = await TestModel.findById(testDoc._id);
        console.log('✅ Test document found:', foundDoc);
        
        // Clean up
        console.log('🧹 Cleaning up test document...');
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document deleted');
        
        console.log('\n🎉 All tests passed! MongoDB connection is working.');
        console.log('📌 Database name:', mongoose.connection.db.databaseName);
        console.log('📌 Collections:', await mongoose.connection.db.listCollections().toArray());
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Add timeout
const timeout = setTimeout(() => {
    console.error('\n⏰ Connection timeout after 30 seconds');
    console.error('Possible issues:');
    console.error('1. Check your MongoDB Atlas IP whitelist (add your current IP or 0.0.0.0/0 for testing)');
    console.error('2. Verify your connection string format');
    console.error('3. Check network connectivity');
    console.error('4. Ensure cluster is not paused/terminated');
    process.exit(1);
}, 30000);

// Attempt connection
console.log('\n🚀 Initiating connection...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        clearTimeout(timeout);
        console.log('📡 Mongoose.connect() promise resolved');
    })
    .catch(err => {
        clearTimeout(timeout);
        console.error('💥 Mongoose.connect() promise rejected:', err.message);
    });
