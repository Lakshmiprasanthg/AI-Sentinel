const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes after connection
    await createIndexes();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Document = require('../models/Document');
    await Document.createIndexes();
    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('Index creation error:', error.message);
  }
};

module.exports = connectDB;
