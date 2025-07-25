import { Request, Response } from 'express';
import { prismaVendorService } from '../services/prismaVendorService';
import logger from '../logger/logger';

export const vendorController = {
  async createVendor(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.createVendor(req.body);
      res.status(201).json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getVendors(req: Request, res: Response) {
    try {
      const vendors = await prismaVendorService.getVendors(req.query);
      res.json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getVendorById(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.getVendorById(req.params.id);
      res.json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateVendor(req: Request, res: Response) {
    try {
      const vendor = await prismaVendorService.updateVendor(req.params.id, req.body);
      res.json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteVendor(req: Request, res: Response) {
    try {
      await prismaVendorService.deleteVendor(req.params.id);
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