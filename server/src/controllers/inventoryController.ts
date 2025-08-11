import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { InventoryCategory, Unit,MaterialRequestStatus } from '@prisma/client';

interface CreateInventoryItemRequest {
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: Unit;
  location: string;
  reorderLevel: number;
  maximumStock: number;
  safetyStock: number;
  primarySupplierName: string;
  vendorId: string;
  secondarySupplierName?: string;
  secondaryVendorId?: string;
  unitCost: number;
  createdById: string;
}

export const inventoryController = {
  async createItem(req: Request, res: Response) {
    try {
      const {
        itemName,
        category,
        quantity,
        unit,
        location,
        reorderLevel,
        maximumStock,
        safetyStock,
        primarySupplierName,
        vendorId,
        secondarySupplierName,
        secondaryVendorId,
        unitCost,
        createdById
      }: CreateInventoryItemRequest = req.body;

      const createData: any = {
        itemName,
        category,
        quantity,
        unit,
        location,
        reorderLevel,
        maximumStock,
        safetyStock,
        primarySupplierName,
        vendorId,
        unitCost,
        createdById
      };

      if (secondarySupplierName) {
        createData.secondarySupplierName = secondarySupplierName;
      }
      if (secondaryVendorId) {
        createData.secondaryVendorId = secondaryVendorId;
      }

      const item = await prisma.inventory.create({
        data: createData,
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      
      res.status(201).json(item);
    } catch (err) {
      logger.error("Error creating inventory item:", err);
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async listItems(req: Request, res: Response) {
    try {
      const {userId} = req.query
      const items = await prisma.inventory.findMany({
        where:{
          createdById:userId as string
        },
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      res.json(items);
    } catch (error) {
      logger.error("Error fetching inventory items:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await prisma.inventory.findUnique({
        where: { id },
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      if (!item) return res.status(404).json({ error: 'Inventory item not found' });
      res.json(item);
    } catch (error) {
      logger.error("Error fetching inventory item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove undefined values and createdById/createdAt/updatedAt from update
      const { createdById, createdAt, updatedAt, ...cleanUpdateData } = updateData;
      
      const item = await prisma.inventory.update({
        where: { id },
        data: cleanUpdateData,
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      res.json(item);
    } catch (error) {
      logger.error("Error updating inventory item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.inventory.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting inventory item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Additional inventory management endpoints
  async getItemsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const items = await prisma.inventory.findMany({
        where: { category: category as InventoryCategory },
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      res.json(items);
    } catch (error) {
      logger.error("Error fetching items by category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getLowStockItems(req: Request, res: Response) {
    try {
      const items = await prisma.inventory.findMany({
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
      res.json(lowStockItems);
    } catch (error) {
      logger.error("Error fetching low stock items:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async searchItems(req: Request, res: Response) {
    try {
      const { search } = req.query;
      if (!search) {
        return res.status(400).json({ error: "Search parameter is required" });
      }
      
      const items = await prisma.inventory.findMany({
        where: {
          OR: [
            { itemName: { contains: search as string, mode: 'insensitive' } },
            { primarySupplierName: { contains: search as string, mode: 'insensitive' } },
            { location: { contains: search as string, mode: 'insensitive' } }
          ]
        },
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });
      res.json(items);
    } catch (error) {
      logger.error("Error searching items:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  // Material request endpoints
  async createMaterialRequest(req: Request, res: Response) {
    try {
      const request = await prisma.materialRequest.create({
        data: req.body,
        include: { 
          items: true, 
          project: true, 
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } }
        }
      });
      
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
      logger.error("Error creating material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listMaterialRequests(req: Request, res: Response) {
    try {
      const requests = await prisma.materialRequest.findMany({
        include: { 
          items: true, 
          project: true, 
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } }
        }
      });
      res.json(requests);
    } catch (error) {
      logger.error("Error fetching material requests:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateMaterialRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await prisma.materialRequest.update({
        where: { id },
        data: req.body,
        include: { 
          items: true, 
          project: true, 
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } }
        }
      });
      
      // If approved, notify requester
      if (request.status === MaterialRequestStatus.COMPLETED) {
        await prismaNotificationService.createNotification({
          to: request.requestedBy,
          type: 'material-request-approved',
          message: `Your material request has been approved.`
        });
      }
      res.json(request);
    } catch (error) {
      logger.error("Error updating material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Additional inventory management endpoints
  async getInventoryMetrics(req: Request, res: Response) {
    try {
      const totalItems = await prisma.inventory.count();
      const items = await prisma.inventory.findMany();
      const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
      const totalValue = await prisma.inventory.aggregate({
        _sum: {
          unitCost: true
        }
      });

      const metrics = {
        totalItems,
        lowStockCount: lowStockItems.length,
        totalValue: totalValue._sum.unitCost || 0,
        lowStockItems: lowStockItems.slice(0, 5)
      };

      res.json(metrics);
    } catch (error) {
      logger.error("Error fetching inventory metrics:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'add' } = req.body;

      const currentItem = await prisma.inventory.findUnique({ where: { id } });
      if (!currentItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      const newQuantity = operation === 'add' 
        ? currentItem.quantity + quantity 
        : currentItem.quantity - quantity;

      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const updatedItem = await prisma.inventory.update({
        where: { id },
        data: { quantity: newQuantity },
        include: { 
          createdBy: { select: { id: true, name: true, email: true } },
          primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
          requests: true 
        }
      });

      res.json(updatedItem);
    } catch (error) {
      logger.error("Error updating stock:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 