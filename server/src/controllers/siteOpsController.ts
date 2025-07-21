import { Request, Response } from 'express';
import { prismaSiteOpsService } from '../services/prismaSiteOpsService';

export const siteOpsController = {
  // Equipment Maintenance
  async createEquipmentMaintenance(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createEquipmentMaintenance(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getEquipmentMaintenances(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEquipmentMaintenances(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getEquipmentMaintenanceById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEquipmentMaintenanceById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateEquipmentMaintenance(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateEquipmentMaintenance(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteEquipmentMaintenance(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteEquipmentMaintenance(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Labor Log
  async createLaborLog(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createLaborLog(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getLaborLogs(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getLaborLogs(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getLaborLogById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getLaborLogById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateLaborLog(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateLaborLog(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteLaborLog(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteLaborLog(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Budget Adjustment
  async createBudgetAdjustment(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createBudgetAdjustment(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getBudgetAdjustments(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getBudgetAdjustments(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getBudgetAdjustmentById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getBudgetAdjustmentById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateBudgetAdjustment(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateBudgetAdjustment(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteBudgetAdjustment(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteBudgetAdjustment(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Issue Report
  async createIssueReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createIssueReport(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getIssueReports(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getIssueReports(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getIssueReportById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getIssueReportById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateIssueReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateIssueReport(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteIssueReport(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteIssueReport(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Daily Progress Report
  async createDailyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createDailyProgressReport(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getDailyProgressReports(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getDailyProgressReports(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getDailyProgressReportById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getDailyProgressReportById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateDailyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateDailyProgressReport(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteDailyProgressReport(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteDailyProgressReport(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Weekly Progress Report
  async createWeeklyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createWeeklyProgressReport(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getWeeklyProgressReports(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getWeeklyProgressReports(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getWeeklyProgressReportById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getWeeklyProgressReportById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateWeeklyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateWeeklyProgressReport(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteWeeklyProgressReport(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteWeeklyProgressReport(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Event
  async createEvent(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createEvent(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getEvents(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEvents(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getEventById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEventById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async updateEvent(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateEvent(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteEvent(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteEvent(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
}; 