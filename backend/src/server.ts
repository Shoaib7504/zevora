import dotenv from 'dotenv';
import path from 'path';

// Load environment variables as early as possible
dotenv.config({ path: path.join(__dirname, '../.env') });

import http from 'http';
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

// Build and launch HTTP server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[Server]: Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Process Level Event Listeners for crash prevention
process.on('uncaughtException', (error: Error) => {
  console.error('[Process Error]: Uncaught Exception:', error);
  // Gracefully stop server
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[Process Error]: Unhandled Rejection:', reason);
  // Gracefully stop server
  server.close(() => {
    process.exit(1);
  });
});
