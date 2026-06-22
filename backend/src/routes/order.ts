import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus } from '../controllers/order';
import { requireRole } from '../middlewares/auth';

const router = Router();

// POST /orders — create a new order (any logged-in user)
router.post('/', createOrder);

// GET /orders/my — get current user's orders
router.get('/my', getUserOrders);

// GET /orders — all orders (admin only)
router.get('/', requireRole(['admin']), getAllOrders);

// PATCH /orders/:id/status — update order status (admin only)
router.patch('/:id/status', requireRole(['admin']), updateOrderStatus);

export default router;
