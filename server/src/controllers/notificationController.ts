import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';

export const notificationController = {
  async createNotification(req: Request, res: Response) {
    // TODO: Add validation and RBAC
    try {
      const notification = await prismaNotificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listNotifications(req: Request, res: Response) {
    try {
      const notifications = await prismaNotificationService.getNotifications({ to: req.user.id });
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async markAsRead(req: Request, res: Response) {
    try {
      const notification = await prismaNotificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // Message endpoints
  async sendMessage(req: Request, res: Response) {
    try {
      const message = await prismaNotificationService.sendMessage(req.body);
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listMessages(req: Request, res: Response) {
    try {
      const messages = await prismaNotificationService.getMessages({ to: req.user.id });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 