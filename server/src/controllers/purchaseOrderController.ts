import { Request, Response } from 'express';
import { prismaPurchaseOrderService } from '../services/prismaPurchaseOrderService';

export const purchaseOrderController = {
  // Purchase Orders
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.createPurchaseOrder(req.body);
      res.status(201).json(po);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getPurchaseOrders(req: Request, res: Response) {
    try {
      const pos = await prismaPurchaseOrderService.getPurchaseOrders(req.query);
      res.json(pos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.getPurchaseOrderById(req.params.id);
      res.json(po);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updatePurchaseOrder(req: Request, res: Response) {
    try {
      const po = await prismaPurchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
      res.json(po);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deletePurchaseOrder(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deletePurchaseOrder(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Purchase Order Items
  async addPurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prismaPurchaseOrderService.addPurchaseOrderItem(req.params.poId, req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async updatePurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prismaPurchaseOrderService.updatePurchaseOrderItem(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deletePurchaseOrderItem(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deletePurchaseOrderItem(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // GRN
  async createGRN(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.createGRN(req.body);
      res.status(201).json(grn);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getGRNs(req: Request, res: Response) {
    try {
      const grns = await prismaPurchaseOrderService.getGRNs(req.query);
      res.json(grns);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getGRNById(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.getGRNById(req.params.id);
      res.json(grn);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateGRN(req: Request, res: Response) {
    try {
      const grn = await prismaPurchaseOrderService.updateGRN(req.params.id, req.body);
      res.json(grn);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteGRN(req: Request, res: Response) {
    try {
      await prismaPurchaseOrderService.deleteGRN(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
}; 