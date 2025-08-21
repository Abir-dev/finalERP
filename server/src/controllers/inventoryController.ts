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
      if(userId){
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
      }else{
        const items = await prisma.inventory.findMany({
          where:{
            // createdById:userId as string
          },
          include: { 
            createdBy: { select: { id: true, name: true, email: true } },
            primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
            secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
            requests: true 
          }
        });
        res.json(items);
      }
     
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
  },

  // Material Transfers
  async createMaterialTransfer(req: Request, res: Response) {
    try {
      const {
        transferID,
        fromLocation,
        toLocation,
        requestedDate,
        status,
        driverName,
        etaMinutes,
        vehicleId,
        approvedById,
        priority,
        items,
      } = req.body || {};

      if (!transferID || !fromLocation || !toLocation || !requestedDate) {
        return res.status(400).json({ error: "transferID, fromLocation, toLocation, requestedDate are required" });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }

      const created = await (prisma as any).materialTransfer.create({
        data: {
          transferID,
          fromLocation,
          toLocation,
          requestedDate: new Date(requestedDate),
          status: status ?? undefined,
          driverName: driverName || null,
          etaMinutes: typeof etaMinutes === 'number' ? etaMinutes : null,
          vehicleId: vehicleId || null,
          approvedById: approvedById || null,
          priority: priority ?? undefined,
          createdById: (req.user as any)?.id,
          items: {
            create: items.map((i: any) => ({
              description: i.description,
              quantity: i.quantity,
              unit: i.unit || null,
              inventoryId: i.inventoryId || null,
              notes: i.notes || null,
            })),
          },
        },
        include: {
          items: true,
          vehicle: true,
          approvedBy: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json(created);
    } catch (error) {
      logger.error("Error creating material transfer:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

 async listMaterialTransfers(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (userId) {
        const transfers = await (prisma as any).materialTransfer.findMany({
          where: { createdById: userId as string },
          include: {
            items: true,
            vehicle: true,
            approvedBy: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        res.json(transfers);
      }else{
      const transfers = await (prisma as any).materialTransfer.findMany({
        // where: { createdById: userId as string },
        include: {
          items: true,
          vehicle: true,
          approvedBy: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(transfers);
    }
    } catch (error) {
      logger.error("Error fetching material transfers:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getMaterialTransfer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const transfer = await (prisma as any).materialTransfer.findUnique({
        where: { id },
        include: {
          items: true,
          vehicle: true,
          approvedBy: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
      if (!transfer) return res.status(404).json({ error: 'Material transfer not found' });
      if (transfer.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
      res.json(transfer);
    } catch (error) {
      logger.error("Error getting material transfer:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async updateMaterialTransfer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const existing = await (prisma as any).materialTransfer.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Material transfer not found' });
      if (existing.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

      const { transferID, fromLocation, toLocation, requestedDate, status, driverName, etaMinutes, vehicleId, approvedById, priority } = req.body || {};

      const updated = await (prisma as any).materialTransfer.update({
        where: { id },
        data: {
          transferID,
          fromLocation,
          toLocation,
          requestedDate: requestedDate ? new Date(requestedDate) : undefined,
          status,
          driverName,
          etaMinutes,
          vehicleId,
          approvedById,
          priority,
        },
        include: {
          items: true,
          vehicle: true,
          approvedBy: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
      res.json(updated);
    } catch (error) {
      logger.error("Error updating material transfer:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async deleteMaterialTransfer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const existing = await (prisma as any).materialTransfer.findUnique({ where: { id }, include: { items: true } });
      if (!existing) return res.status(404).json({ error: 'Material transfer not found' });
      if (existing.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

      await (prisma as any).materialTransferItem.deleteMany({ where: { transferId: id } });
      await (prisma as any).materialTransfer.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting material transfer:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  // Material Transfer Items
  async listMaterialTransferItems(req: Request, res: Response) {
    try {
      const { transferId } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
      if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
      if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
      const items = await (prisma as any).materialTransferItem.findMany({ where: { transferId }, orderBy: { id: 'asc' } });
      res.json(items);
    } catch (error) {
      logger.error("Error listing material transfer items:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async createMaterialTransferItem(req: Request, res: Response) {
    try {
      const { transferId } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
      if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
      if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

      const { description, quantity, unit, inventoryId, notes } = req.body || {};
      if (!description || typeof quantity !== 'number') {
        return res.status(400).json({ error: 'description and quantity are required' });
      }
      const item = await (prisma as any).materialTransferItem.create({
        data: {
          transferId,
          description,
          quantity,
          unit: unit || null,
          inventoryId: inventoryId || null,
          notes: notes || null,
        },
      });
      res.status(201).json(item);
    } catch (error) {
      logger.error("Error creating material transfer item:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async getMaterialTransferItem(req: Request, res: Response) {
    try {
      const { transferId, itemId } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
      if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
      if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
      const item = await (prisma as any).materialTransferItem.findUnique({ where: { id: itemId } });
      if (!item || item.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
      res.json(item);
    } catch (error) {
      logger.error("Error getting material transfer item:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async updateMaterialTransferItem(req: Request, res: Response) {
    try {
      const { transferId, itemId } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
      if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
      if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
      const { description, quantity, unit, inventoryId, notes } = req.body || {};
      const item = await (prisma as any).materialTransferItem.update({
        where: { id: itemId },
        data: { description, quantity, unit, inventoryId, notes },
      });
      if (!item || item.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
      res.json(item);
    } catch (error) {
      logger.error("Error updating material transfer item:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  async deleteMaterialTransferItem(req: Request, res: Response) {
    try {
      const { transferId, itemId } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query param is required" });
      }
      const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
      if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
      if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
      const existing = await (prisma as any).materialTransferItem.findUnique({ where: { id: itemId } });
      if (!existing || existing.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
      await (prisma as any).materialTransferItem.delete({ where: { id: itemId } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting material transfer item:", error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
};