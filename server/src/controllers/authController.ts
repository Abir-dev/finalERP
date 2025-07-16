import { Request, Response } from "express";
import { prismaUserService } from "../services/prismaUserService";
import { UserRole } from "../utils/constants";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, name, invitationToken } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      // If invitation token is provided, verify it
      if (invitationToken) {
        const invitationData = await prismaUserService.validateInvitationToken(invitationToken);
        if (!invitationData) {
          return res.status(400).json({ error: "Invalid invitation token" });
        }
        if (invitationData.email !== email || invitationData.role !== role) {
          return res.status(400).json({ error: "Invalid registration details. Please use the email and role from your invitation." });
        }
      }
      await prismaUserService.register(name, email, password, role as UserRole);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "An unknown error occurred" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await prismaUserService.login(email, password);
      res.status(201).json({ message: "User logged in successfully", token });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "An unknown error occurred" });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const user = await prismaUserService.getUserById(userId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "An unknown error occurred" });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const updates = req.body;
      const updatedUser = await prismaUserService.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "An unknown error occurred" });
    }
  },

  async createUserInvitation(req: Request, res: Response) {
    try {
      const { email, role, name } = req.body;
      if (!email || !role || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const invitationToken = await prismaUserService.createUserInvitation(email, role as UserRole, name);
      const registrationUrl = `${process.env.CLIENT_URL || "https://testboard-1.onrender.com"}/register?token=${invitationToken}`;
      res.status(201).json({ message: "User invitation created successfully", registrationUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "An unknown error occurred" });
    }
  },

  async validateInvitationToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      const userData = await prismaUserService.validateInvitationToken(token);
      res.json(userData);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "An unknown error occurred" });
    }
  },
};
