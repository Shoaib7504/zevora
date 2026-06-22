import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/user';
import { requireRole } from '../middlewares/auth';

const router = Router();

// GET /users — Get all users (admin only)
router.get('/', requireRole(['admin']), getUsers);

// PATCH /users/:id/role — Update user role (admin only)
router.patch('/:id/role', requireRole(['admin']), updateUserRole);

// DELETE /users/:id — Delete a user (admin only)
router.delete('/:id', requireRole(['admin']), deleteUser);

export default router;
