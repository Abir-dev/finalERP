import { Request, Response } from 'express';
import { prismaVendorService } from '../services/prismaVendorService';

export const vendorController = {
  async createVendor(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.createVendor(req.body);
      res.status(201).json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getVendors(req: Request, res: Response) {
    try {
      const vendors = await prismaVendorService.getVendors(req.query);
      res.json(vendors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getVendorById(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.getVendorById(req.params.id);
      res.json(vendor);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateVendor(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.updateVendor(req.params.id, req.body);
      res.json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteVendor(req: Request, res: Response) {
    try {
      await prismaVendorService.deleteVendor(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
}; 