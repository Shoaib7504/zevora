import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models';

/**
 * GET /users
 * Get all registered users (admin only)
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({});

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /users/:id/role
 * Update a user's role (admin only)
 */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || !Types.ObjectId.isValid(String(id))) {
      res.status(400).json({ success: false, message: 'Invalid user ID format' });
      return;
    }

    if (!role || !['user', 'manager', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be one of: user, manager, admin' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /users/:id
 * Delete a user account (admin only)
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(String(id))) {
      res.status(400).json({ success: false, message: 'Invalid user ID format' });
      return;
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
