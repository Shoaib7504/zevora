import { Request, Response } from 'express';
import { Order } from '../models';

/**
 * POST /orders
 * Create a new order (any signed-in user)
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const userEmail = req.headers['x-user-email'];
    if (!userEmail || typeof userEmail !== 'string') {
      res.status(401).json({ success: false, message: 'Unauthorized: missing x-user-email header' });
      return;
    }

    const { items, shippingAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must have at least one item' });
      return;
    }
    if (!shippingAddress) {
      res.status(400).json({ success: false, message: 'Shipping address is required' });
      return;
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 100 ? 0 : 5.99;
    const total = subtotal + shippingFee;

    const order = new Order({
      userEmail: userEmail.toLowerCase(),
      items,
      shippingAddress,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shippingFee,
      total: parseFloat(total.toFixed(2)),
      notes,
    });

    const saved = await order.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /orders/my
 * Get orders for the currently logged-in user
 */
export async function getUserOrders(req: Request, res: Response): Promise<void> {
  try {
    const userEmail = req.headers['x-user-email'];
    if (!userEmail || typeof userEmail !== 'string') {
      res.status(401).json({ success: false, message: 'Unauthorized: missing x-user-email header' });
      return;
    }

    const orders = await Order.find({ userEmail: userEmail.toLowerCase() })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /orders
 * Get all orders — admin only
 */
export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (status && ['pending','confirmed','shipped','delivered','cancelled'].includes(status)) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /orders/:id/status
 * Update order status — admin only
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
