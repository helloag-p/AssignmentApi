const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const dbName = process.env.MONGO_DB_NAME || undefined;

  try {
    await mongoose.connect(mongoUri, {
      dbName,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = connectDB;

