import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('[Database Error]: MONGODB_URI env variable is not defined.');
    return; // Don't call process.exit(1) in serverless as it kills the environment
  }

  // If already connected or connecting, skip
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database]: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error]: Failed to connect to MongoDB:`, error);
  }
}

export default connectDB;
