import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { UserRole } from '../utils/constants';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, name } = req.body;

      if (!email || !password || !role || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const data = await supabaseService.signUp(email, password, role as UserRole, name);
      res.status(201).json(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const data = await supabaseService.signIn(email, password);
      res.json(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(401).json({ error: 'An unknown error occurred' });
      }
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await supabaseService.getUserById(userId);
      res.json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }
}; 