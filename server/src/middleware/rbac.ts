import { Request, Response, NextFunction } from 'express';
import { ROLE_PERMISSIONS, UserRole } from '../utils/constants';

export const checkRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.user_metadata?.role;

    if (!userRole) {
      return res.status(403).json({ error: 'No role assigned' });
    }

    if (userRole === 'admin') {
      return next();
    }

    if (userRole !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.user_metadata?.role as UserRole;

    if (!userRole) {
      return res.status(403).json({ error: 'No role assigned' });
    }

    const permissions = ROLE_PERMISSIONS[userRole];

    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      return next();
    }

    res.status(403).json({ error: 'Insufficient permissions' });
  };
}; 