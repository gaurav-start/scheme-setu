import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    // Skip real database connection during test runs; MongoMemoryServer is used instead.
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.log('MONGODB_URI not specified in environment. Running without DB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

export default connectDB;
