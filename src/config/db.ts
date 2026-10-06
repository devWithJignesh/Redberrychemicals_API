import mongoose from 'mongoose';

export let isConnected = false;
let cachedPromise: Promise<boolean> | null = null;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb+srv://Vercel-Admin-redberryAPI:tjRRUnMyJkcUfBSm@redberryapi.8wn4tvi.mongodb.net/test?retryWrites=true&w=majority';

  cachedPromise = (async () => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      isConnected = true;
      console.log(`\x1b[32m✔ MongoDB Connected Successfully!\x1b[0m Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
      return true;
    } catch (error) {
      cachedPromise = null;
      isConnected = false;
      console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m`, (error as Error).message);
      return false;
    }
  })();

  return cachedPromise;
};
