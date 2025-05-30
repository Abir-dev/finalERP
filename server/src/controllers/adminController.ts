import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { UserRole } from '../utils/constants';

export const adminController = {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, name } = req.body;

      // Only admin can create users
      const adminRole = req.user?.user_metadata?.role;
      if (adminRole !== 'admin') {
        res.status(403).json({ error: 'Only admin can create users' });
        return;
      }

      const data = await supabaseService.signUp(email, password, role as UserRole, name);
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: role,
          name: name
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Failed to create user' });
    }
  },

  async createInitialAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      
      // Check if any user exists
      const usersExist = await supabaseService.checkIfUsersExist();
      
      // If users exist, prevent creating initial admin
      if (usersExist) {
        res.status(403).json({ 
          error: 'Initial admin can only be created when no users exist' 
        });
        return;
      }

      const data = await supabaseService.signUp(email, password, 'admin', name);
      res.status(201).json({
        message: 'Initial admin created successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: 'admin',
          name: name
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Failed to create admin user' });
    }
  }
}; 