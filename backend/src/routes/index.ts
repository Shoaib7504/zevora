import { Router } from 'express';
import healthRouter from './health';
import productRouter from './product';
import aiRouter from './ai';
import analyticsRouter from './analytics';
import userRouter from './user';
import orderRouter from './order';

const router = Router();

// Register routers
router.use('/health', healthRouter);
router.use('/products', productRouter);
router.use('/ai', aiRouter);
router.use('/analytics', analyticsRouter);
router.use('/users', userRouter);
router.use('/orders', orderRouter);

export default router;
