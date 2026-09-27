const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini_lms';
    await
        mongoose.connect(uri);
  console.log(`MongoDB connected: ${uri}`);
}

module.exports = connectDB;
