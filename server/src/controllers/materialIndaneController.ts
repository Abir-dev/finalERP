import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const materialIndaneController = {
  // Create Material Indane
  async createMaterialIndane(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        orderSlipNo,
        site,
        date,
        storeKeeperName,
        storeKeeperSignature,
        projectManagerName,
        projectManagerSignature,
        items
      } = req.body;

      // Validate required fields
      if (!orderSlipNo || !site || !date || !storeKeeperName || !projectManagerName) {
        return res.status(400).json({
          message: "Missing required fields: orderSlipNo, site, date, storeKeeperName, projectManagerName"
        });
      }

      const indane = await (prisma as any).materialIndane.create({
        data: {
          orderSlipNo,
          site,
          date: new Date(date),
          storeKeeperName,
          storeKeeperSignature,
          projectManagerName,
          projectManagerSignature,
          createdById: userId,
          items: {
            create: (items || []).map((item: any, index: number) => ({
              slNo: item.slNo || index + 1,
              dateOfOrder: item.dateOfOrder ? new Date(item.dateOfOrder) : null,
              materialDescription: item.materialDescription,
              unit: item.unit,
              requiredQty: parseFloat(item.requiredQty),
              receivedQty: parseFloat(item.receivedQty) || 0,
              balance: parseFloat(item.balance) || 0,
              deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
              remarks: item.remarks
            }))
          }
        },
        include: {
          items: {
            orderBy: { slNo: 'asc' }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`Material Indane created: ${indane.id} by user: ${userId}`);
      res.status(201).json(indane);
    } catch (error) {
      logger.error("Error creating Material Indane:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get all Material Indanes
  async getAllMaterialIndanes(req: Request, res: Response) {
    try {
      const { site, orderSlipNo, startDate, endDate } = req.query;

      const whereClause: any = {};

      if (site) {
        whereClause.site = {
          contains: site as string,
          mode: 'insensitive'
        };
      }

      if (orderSlipNo) {
        whereClause.orderSlipNo = {
          contains: orderSlipNo as string,
          mode: 'insensitive'
        };
      }

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.date.lte = new Date(endDate as string);
        }
      }

      const indanes = await (prisma as any).materialIndane.findMany({
        where: whereClause,
        include: {
          items: {
            orderBy: { slNo: 'asc' }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      logger.info(`Retrieved ${indanes.length} Material Indanes`);
      res.json(indanes);
    } catch (error) {
      logger.error("Error retrieving Material Indanes:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get Material Indane by ID
  async getMaterialIndaneById(req: Request, res: Response) {
    try {
      const { indaneId } = req.params;

      const indane = await (prisma as any).materialIndane.findUnique({
        where: { id: indaneId },
        include: {
          items: {
            orderBy: { slNo: 'asc' }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!indane) {
        return res.status(404).json({ error: 'Material Indane not found' });
      }

      logger.info(`Retrieved Material Indane: ${indaneId}`);
      res.json(indane);
    } catch (error) {
      logger.error("Error retrieving Material Indane:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update Material Indane
  async updateMaterialIndane(req: Request, res: Response) {
    try {
      const { indaneId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        orderSlipNo,
        site,
        date,
        storeKeeperName,
        storeKeeperSignature,
        projectManagerName,
        projectManagerSignature,
        items
      } = req.body;

      // Check ownership
      const existingIndane = await (prisma as any).materialIndane.findUnique({
        where: { id: indaneId }
      });

      if (!existingIndane) {
        return res.status(404).json({ error: 'Material Indane not found' });
      }

      if (existingIndane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete old items if updating
      if (items) {
        await (prisma as any).materialIndaneItem.deleteMany({
          where: { indaneId }
        });
      }

      const indane = await (prisma as any).materialIndane.update({
        where: { id: indaneId },
        data: {
          ...(orderSlipNo && { orderSlipNo }),
          ...(site && { site }),
          ...(date && { date: new Date(date) }),
          ...(storeKeeperName && { storeKeeperName }),
          ...(storeKeeperSignature !== undefined && { storeKeeperSignature }),
          ...(projectManagerName && { projectManagerName }),
          ...(projectManagerSignature !== undefined && { projectManagerSignature }),
          ...(items && {
            items: {
              create: items.map((item: any, index: number) => ({
                slNo: item.slNo || index + 1,
                dateOfOrder: item.dateOfOrder ? new Date(item.dateOfOrder) : null,
                materialDescription: item.materialDescription,
                unit: item.unit,
                requiredQty: parseFloat(item.requiredQty),
                receivedQty: parseFloat(item.receivedQty) || 0,
                balance: parseFloat(item.balance) || 0,
                deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
                remarks: item.remarks
              }))
            }
          })
        },
        include: {
          items: {
            orderBy: { slNo: 'asc' }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`Material Indane updated: ${indaneId} by user: ${userId}`);
      res.json(indane);
    } catch (error) {
      logger.error("Error updating Material Indane:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete Material Indane
  async deleteMaterialIndane(req: Request, res: Response) {
    try {
      const { indaneId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const existingIndane = await (prisma as any).materialIndane.findUnique({
        where: { id: indaneId }
      });

      if (!existingIndane) {
        return res.status(404).json({ error: 'Material Indane not found' });
      }

      if (existingIndane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await (prisma as any).materialIndane.delete({
        where: { id: indaneId }
      });

      logger.info(`Material Indane deleted: ${indaneId} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting Material Indane:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Add Item to Material Indane
  async addItem(req: Request, res: Response) {
    try {
      const { indaneId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        slNo,
        dateOfOrder,
        materialDescription,
        unit,
        requiredQty,
        receivedQty,
        balance,
        deliveryDate,
        remarks
      } = req.body;

      if (!materialDescription || !unit || requiredQty === undefined) {
        return res.status(400).json({
          message: "Missing required fields: materialDescription, unit, requiredQty"
        });
      }

      // Verify indane exists and user has access
      const indane = await (prisma as any).materialIndane.findUnique({
        where: { id: indaneId }
      });

      if (!indane) {
        return res.status(404).json({ error: 'Material Indane not found' });
      }

      if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get max slNo if not provided
      const maxSlNo = await (prisma as any).materialIndaneItem.aggregate({
        where: { indaneId },
        _max: { slNo: true }
      });

      const item = await (prisma as any).materialIndaneItem.create({
        data: {
          indaneId,
          slNo: slNo || (maxSlNo._max.slNo || 0) + 1,
          dateOfOrder: dateOfOrder ? new Date(dateOfOrder) : null,
          materialDescription,
          unit,
          requiredQty: parseFloat(requiredQty),
          receivedQty: parseFloat(receivedQty) || 0,
          balance: parseFloat(balance) || 0,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          remarks
        }
      });

      logger.info(`Item added to Material Indane: ${indaneId}`);
      res.status(201).json(item);
    } catch (error) {
      logger.error("Error adding item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update Item
  async updateItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        slNo,
        dateOfOrder,
        materialDescription,
        unit,
        requiredQty,
        receivedQty,
        balance,
        deliveryDate,
        remarks
      } = req.body;

      // Verify item exists and user has access
      const item = await (prisma as any).materialIndaneItem.findUnique({
        where: { id: itemId },
        include: { indane: true }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (item.indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedItem = await (prisma as any).materialIndaneItem.update({
        where: { id: itemId },
        data: {
          ...(slNo !== undefined && { slNo }),
          ...(dateOfOrder !== undefined && { dateOfOrder: dateOfOrder ? new Date(dateOfOrder) : null }),
          ...(materialDescription && { materialDescription }),
          ...(unit && { unit }),
          ...(requiredQty !== undefined && { requiredQty: parseFloat(requiredQty) }),
          ...(receivedQty !== undefined && { receivedQty: parseFloat(receivedQty) }),
          ...(balance !== undefined && { balance: parseFloat(balance) }),
          ...(deliveryDate !== undefined && { deliveryDate: deliveryDate ? new Date(deliveryDate) : null }),
          ...(remarks !== undefined && { remarks })
        }
      });

      logger.info(`Item updated: ${itemId}`);
      res.json(updatedItem);
    } catch (error) {
      logger.error("Error updating item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete Item
  async deleteItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const item = await (prisma as any).materialIndaneItem.findUnique({
        where: { id: itemId },
        include: { indane: true }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (item.indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await (prisma as any).materialIndaneItem.delete({
        where: { id: itemId }
      });

      logger.info(`Item deleted: ${itemId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
