import { Request, Response } from 'express';
import { prismaReportService } from '../services/prismaReportService';
import logger from '../logger/logger';

export const reportController = {
  async getOverview(req: Request, res: Response) {
    try {
      const overview = await prismaReportService.getOverview();
      res.json(overview);
    }catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getProjectReports(req: Request, res: Response) {
    try {
      const projects = await prismaReportService.getProjectReports();
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getFinanceReports(req: Request, res: Response) {
    try {
      const finance = await prismaReportService.getFinanceReports();
      res.json(finance);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getInventoryReports(req: Request, res: Response) {
    try {
      const inventory = await prismaReportService.getInventoryReports();
      res.json(inventory);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 