import { Request, Response } from 'express';
import { prismaInventoryService } from '../services/prismaInventoryService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const inventoryController = {
  async createItem(req: Request, res: Response) {
    try {
      const item = await prismaInventoryService.createItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async listItems(req: Request, res: Response) {
    try {
      const items = await prismaInventoryService.getItems();
      res.json(items);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getItem(req: Request, res: Response) {
    try {
      const item = await prismaInventoryService.getItemById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateItem(req: Request, res: Response) {
    try {
      const item = await prismaInventoryService.updateItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteItem(req: Request, res: Response) {
    try {
      await prismaInventoryService.deleteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  // Material request endpoints
  async createMaterialRequest(req: Request, res: Response) {
    try {
      const request = await prismaInventoryService.createMaterialRequest(req.body);
      // Notify store manager(s)
      const storeManagers = await prisma.user.findMany({ where: { role: 'store' } });
      await Promise.all(storeManagers.map(manager =>
        prismaNotificationService.createNotification({
          to: manager.id,
          type: 'material-request',
          message: `A new material request has been submitted.`
        })
      ));
      res.status(201).json(request);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listMaterialRequests(req: Request, res: Response) {
    try {
      const requests = await prismaInventoryService.getMaterialRequests();
      res.json(requests);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateMaterialRequest(req: Request, res: Response) {
    try {
      const request = await prismaInventoryService.updateMaterialRequest(req.params.id, req.body);
      // If approved, notify requester
      if (request.status === 'APPROVED') {
        await prismaNotificationService.createNotification({
          to: request.requestedBy,
          type: 'material-request-approved',
          message: `Your material request has been approved.`
        });
      }
      res.json(request);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 