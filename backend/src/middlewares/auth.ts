import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

/**
 * Middleware to restrict API endpoints to specific roles
 * Looks for email in headers for mock/demo purposes
 */
export function requireRole(allowedRoles: ('user' | 'manager' | 'admin')[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.headers['x-user-email'];

      if (!email || typeof email !== 'string') {
        res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Missing or invalid x-user-email header' 
        });
        return;
      }

      const user = await User.findOne({ email });

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: User not found in database' 
        });
        return;
      }

      if (!allowedRoles.includes(user.role as any)) {
        res.status(403).json({ 
          success: false, 
          message: `Forbidden: Insufficient privileges. Required role: one of [${allowedRoles.join(', ')}]` 
        });
        return;
      }

      // Attach user to request
      (req as any).user = user;
      next();
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
export default requireRole;
