import mongoose from 'mongoose';

export let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return true;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redberry_db';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`\x1b[32m✔ MongoDB Connected Successfully!\x1b[0m Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m`, (error as Error).message);
    return false;
  }
};
