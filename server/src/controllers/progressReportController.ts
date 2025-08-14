import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const progressReportController = {
  // DPR CRUD Operations
  async createDPR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        projectId,
        workDone,
        weather,
        notes,
        workSections,
        manpower,
        manpowerRoles,
        equipmentUsed,
        safetyIncident,
        qualityCheck,
        delayIssue,
        materials,
        subcontractor
      } = req.body;

      const dpr = await (prisma as any).dailyProgressReport.create({
        data: {
          projectId,
          workDone,
          weather,
          notes,
          workSections,
          manpower,
          manpowerRoles,
          equipmentUsed,
          safetyIncident,
          qualityCheck,
          delayIssue,
          materials: JSON.stringify(materials || []),
          subcontractor,
          createdById: userId
        }
      });

      logger.info(`DPR created successfully with ID: ${dpr.id} by user: ${userId}`);
      res.status(201).json(dpr);
    } catch (error) {
      logger.error("Error creating DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDPRsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { projectId } = req.query;

      const whereClause: any = {
        createdById: userId
      };

      if (projectId) {
        whereClause.projectId = projectId as string;
      }

      const dprs = await (prisma as any).dailyProgressReport.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Parse materials JSON for response
      const dprsWithParsedMaterials = dprs.map((dpr: any) => ({
        ...dpr,
        materials: dpr.materials ? JSON.parse(dpr.materials) : []
      }));

      logger.info(`Retrieved ${dprs.length} DPRs for user: ${userId}`);
      res.json(dprsWithParsedMaterials);
    } catch (error) {
      logger.error("Error retrieving DPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDPRById(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const dpr = await (prisma as any).dailyProgressReport.findFirst({
        where: {
          id: dprId,
          createdById: userId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!dpr) {
        return res.status(404).json({ error: 'DPR not found or unauthorized' });
      }

      // Parse materials JSON for response
      const dprWithParsedMaterials = {
        ...dpr,
        materials: dpr.materials ? JSON.parse(dpr.materials) : []
      };

      logger.info(`Retrieved DPR: ${dprId} for user: ${userId}`);
      res.json(dprWithParsedMaterials);
    } catch (error) {
      logger.error("Error retrieving DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateDPR(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        workDone,
        weather,
        notes,
        workSections,
        manpower,
        manpowerRoles,
        equipmentUsed,
        safetyIncident,
        qualityCheck,
        delayIssue,
        materials,
        subcontractor
      } = req.body;

      // First check if the DPR exists and belongs to the user
      const existingDPR = await (prisma as any).dailyProgressReport.findFirst({
        where: {
          id: dprId,
          createdById: userId
        }
      });

      if (!existingDPR) {
        return res.status(404).json({ error: 'DPR not found or unauthorized' });
      }

      const dpr = await (prisma as any).dailyProgressReport.update({
        where: {
          id: dprId
        },
        data: {
          ...(workDone && { workDone }),
          ...(weather && { weather }),
          ...(notes !== undefined && { notes }),
          ...(workSections && { workSections }),
          ...(manpower && { manpower }),
          ...(manpowerRoles && { manpowerRoles }),
          ...(equipmentUsed && { equipmentUsed }),
          ...(safetyIncident !== undefined && { safetyIncident }),
          ...(qualityCheck !== undefined && { qualityCheck }),
          ...(delayIssue !== undefined && { delayIssue }),
          ...(materials && { materials: JSON.stringify(materials) }),
          ...(subcontractor !== undefined && { subcontractor })
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Parse materials JSON for response
      const dprWithParsedMaterials = {
        ...dpr,
        materials: dpr.materials ? JSON.parse(dpr.materials) : []
      };

      logger.info(`DPR updated successfully: ${dprId} by user: ${userId}`);
      res.json(dprWithParsedMaterials);
    } catch (error) {
      logger.error("Error updating DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteDPR(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First check if the DPR exists and belongs to the user
      const existingDPR = await (prisma as any).dailyProgressReport.findFirst({
        where: {
          id: dprId,
          createdById: userId
        }
      });

      if (!existingDPR) {
        return res.status(404).json({ error: 'DPR not found or unauthorized' });
      }

      await (prisma as any).dailyProgressReport.delete({
        where: {
          id: dprId
        }
      });

      logger.info(`DPR deleted successfully: ${dprId} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // WPR CRUD Operations
  async createWPR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        projectId,
        weekStart,
        weekEnding,
        milestones,
        plannedProgress,
        actualProgress,
        progressRemarks,
        issues,
        risks,
        safetySummary,
        qualitySummary,
        manpower,
        equipment,
        materials,
        teamPerformance
      } = req.body;

      const wpr = await (prisma as any).weeklyProgressReport.create({
        data: {
          projectId,
          weekStart: new Date(weekStart),
          weekEnding: new Date(weekEnding),
          milestones,
          plannedProgress,
          actualProgress,
          progressRemarks,
          issues,
          risks,
          safetySummary,
          qualitySummary,
          manpower: JSON.stringify(manpower || []),
          equipment: JSON.stringify(equipment || []),
          materials: JSON.stringify(materials || []),
          teamPerformance,
          createdById: userId
        }
      });

      logger.info(`WPR created successfully with ID: ${wpr.id} by user: ${userId}`);
      res.status(201).json(wpr);
    } catch (error) {
      logger.error("Error creating WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getWPRsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { projectId } = req.query;

      const whereClause: any = {
        createdById: userId
      };

      if (projectId) {
        whereClause.projectId = projectId as string;
      }

      const wprs = await (prisma as any).weeklyProgressReport.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Parse JSON fields for response
      const wprsWithParsedData = wprs.map((wpr: any) => ({
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      }));

      logger.info(`Retrieved ${wprs.length} WPRs for user: ${userId}`);
      res.json(wprsWithParsedData);
    } catch (error) {
      logger.error("Error retrieving WPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getWPRById(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const wpr = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!wpr) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      // Parse JSON fields for response
      const wprWithParsedData = {
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      };

      logger.info(`Retrieved WPR: ${wprId} for user: ${userId}`);
      res.json(wprWithParsedData);
    } catch (error) {
      logger.error("Error retrieving WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateWPR(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        weekStart,
        weekEnding,
        milestones,
        plannedProgress,
        actualProgress,
        progressRemarks,
        issues,
        risks,
        safetySummary,
        qualitySummary,
        manpower,
        equipment,
        materials,
        teamPerformance
      } = req.body;

      // First check if the WPR exists and belongs to the user
      const existingWPR = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
        }
      });

      if (!existingWPR) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      const wpr = await (prisma as any).weeklyProgressReport.update({
        where: {
          id: wprId
        },
        data: {
          ...(weekStart && { weekStart: new Date(weekStart) }),
          ...(weekEnding && { weekEnding: new Date(weekEnding) }),
          ...(milestones && { milestones }),
          ...(plannedProgress && { plannedProgress }),
          ...(actualProgress && { actualProgress }),
          ...(progressRemarks !== undefined && { progressRemarks }),
          ...(issues !== undefined && { issues }),
          ...(risks !== undefined && { risks }),
          ...(safetySummary !== undefined && { safetySummary }),
          ...(qualitySummary !== undefined && { qualitySummary }),
          ...(manpower && { manpower: JSON.stringify(manpower) }),
          ...(equipment && { equipment: JSON.stringify(equipment) }),
          ...(materials && { materials: JSON.stringify(materials) }),
          ...(teamPerformance !== undefined && { teamPerformance })
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Parse JSON fields for response
      const wprWithParsedData = {
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      };

      logger.info(`WPR updated successfully: ${wprId} by user: ${userId}`);
      res.json(wprWithParsedData);
    } catch (error) {
      logger.error("Error updating WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteWPR(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First check if the WPR exists and belongs to the user
      const existingWPR = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
        }
      });

      if (!existingWPR) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      await (prisma as any).weeklyProgressReport.delete({
        where: {
          id: wprId
        }
      });

      logger.info(`WPR deleted successfully: ${wprId} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
