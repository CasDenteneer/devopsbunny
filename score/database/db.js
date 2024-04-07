const mongoose = require('mongoose');
require('dotenv').config();
const dburl = process.env.DB_URL || 'mongodb://localhost:27017/scoreservice';

const connectDB = async () => {
  try {
    await mongoose.connect(dburl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
