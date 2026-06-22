import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes';
import { notFound } from './middlewares/not-found';
import { errorHandler } from './middlewares/error';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Request Logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome / Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-Commerce API Service',
    healthCheck: '/api/health',
    version: '1.0.0',
  });
});

// Silence favicon 404 log traces in browsers
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API Routes Namespace
app.use('/api', apiRouter);

// Fallback middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
