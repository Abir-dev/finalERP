import { Request, Response, NextFunction } from 'express';
import { ROLES, UserRole } from '../utils/constants';
export const validateAdminRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if all required fields are present
    if (!email || !password || !role || !name) {
      res.status(400).json({
        error: 'Missing required fields: email, password, role, and name are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role as UserRole)) {
      res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
      return;
    }

    // Validate name
    if (name.length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters long' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}