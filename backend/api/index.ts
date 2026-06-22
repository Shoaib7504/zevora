import app from '../src/app';
import { connectDB } from '../src/config/db';

// Ensure DB is connected for serverless invocations
connectDB();

export default app;
