import { Request, Response } from 'express';
import { prismaReportService } from '../services/prismaReportService';

export const reportController = {
  async getOverview(req: Request, res: Response) {
    try {
      const overview = await prismaReportService.getOverview();
      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getProjectReports(req: Request, res: Response) {
    try {
      const projects = await prismaReportService.getProjectReports();
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getFinanceReports(req: Request, res: Response) {
    try {
      const finance = await prismaReportService.getFinanceReports();
      res.json(finance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getInventoryReports(req: Request, res: Response) {
    try {
      const inventory = await prismaReportService.getInventoryReports();
      res.json(inventory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 