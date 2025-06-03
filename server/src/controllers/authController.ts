import { Request, Response } from "express";
import { supabaseService } from "../services/supabaseService";
import { UserRole } from "../utils/constants";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = await supabaseService.signUp(
        email,
        password,
        role as UserRole,
        name
      );
      res.status(201).json(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      console.log("Login attempt with body:", req.body);
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("Missing credentials:", {
          email: !!email,
          password: !!password,
        });
        return res.status(400).json({ error: "Missing email or password" });
      }

      const data = await supabaseService.signIn(email, password);
      res.json(data);
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(401).json({ error: "An unknown error occurred" });
      }
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await supabaseService.getUserById(userId);
      res.json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  },
  async logout(req: Request, res: Response) {
  try {
    await supabaseService.signOut();
    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred during logout' });
    }
  }
},
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const updates = req.body;
      const updatedUser = await supabaseService.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  },
  async createUserInvitation(req: Request, res: Response) {
      try {
        const { email, role, name } = req.body;
  
        if (!email || !role || !name) {
          return res.status(400).json({ error: "Missing required fields" });
        }
  
        // Generate a unique token for this invitation
        const invitationToken = await supabaseService.createUserInvitation(email, role as UserRole, name);
        
        // Construct the registration URL with the token
        const registrationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?token=${invitationToken}`;
        
        res.status(201).json({ 
          message: "User invitation created successfully", 
          registrationUrl 
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: "An unknown error occurred" });
        }
      }
    },
  async validateInvitationToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const userData = await supabaseService.validateInvitationToken(token);
      res.json(userData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  },
};
