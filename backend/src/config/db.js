const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('MongoDB URI:', mongoUri);
    
    if (!mongoUri) {
        console.error('MongoDB URI is not defined in environment variables');
        console.log('Server will continue without database connection');
        return;
    }
    
    try {
        const conn = await mongoose.connect(mongoUri, {
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
