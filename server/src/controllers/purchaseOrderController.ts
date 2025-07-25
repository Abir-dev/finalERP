import { Request, Response } from 'express';
import { prismaPurchaseOrderService } from '../services/prismaPurchaseOrderService';
import logger from '../logger/logger';

export const purchaseOrderController = {
  // Purchase Orders
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.createPurchaseOrder(req.body);
      res.status(201).json(po);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrders(req: Request, res: Response) {
    try {
      const pos = await prismaPurchaseOrderService.getPurchaseOrders(req.query);
      res.json(pos);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.getPurchaseOrderById(req.params.id);
      res.json(po);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updatePurchaseOrder(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
      res.json(po);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deletePurchaseOrder(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deletePurchaseOrder(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Purchase Order Items
  async addPurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prismaPurchaseOrderService.addPurchaseOrderItem(req.params.poId, req.body);
      res.status(201).json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updatePurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prismaPurchaseOrderService.updatePurchaseOrderItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deletePurchaseOrderItem(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deletePurchaseOrderItem(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // GRN
  async createGRN(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.createGRN(req.body);
      res.status(201).json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getGRNs(req: Request, res: Response) {
    try {
      const grns = await prismaPurchaseOrderService.getGRNs(req.query);
      res.json(grns);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getGRNById(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.getGRNById(req.params.id);
      res.json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateGRN(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.updateGRN(req.params.id, req.body);
      res.json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteGRN(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deleteGRN(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}; 