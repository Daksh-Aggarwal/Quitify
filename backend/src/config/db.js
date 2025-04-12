const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars with correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
        console.error('MongoDB URI is not defined in environment variables');
        console.log('Server will continue without database connection');
        return;
    }
    
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log('Server will continue without database connection');
    }
};

module.exports = connectDB;
