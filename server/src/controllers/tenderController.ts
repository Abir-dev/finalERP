import { Request, Response } from 'express';
import { prismaTenderService } from '../services/prismaTenderService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const tenderController = {
  async createTender(req: Request, res: Response) {
    try {
      const tender = await prismaTenderService.createTender(req.body);
      // Notify all client managers
      const clientManagers = await prisma.user.findMany({ where: { role: 'client_manager' } });
      await Promise.all(clientManagers.map(manager =>
        prismaNotificationService.createNotification({
          to: manager.id,
          type: 'tender',
          message: `A new tender has been created.`
        })
      ));
      res.status(201).json(tender);
    } catch (error) {
      logger.error("Error creating tender:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listTenders(req: Request, res: Response) {
    try {
      const tenders = await prismaTenderService.getTenders();
      res.json(tenders);
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  },
  async getTender(req: Request, res: Response) {
    try {
      const tender = await prismaTenderService.getTenderById(req.params.id);
      if (!tender) return res.status(404).json({ error: 'Not found' });
      res.json(tender);
    } catch (error) {
      logger.error("Error creating seller:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateTender(req: Request, res: Response) {
    try {
      const tender = await prismaTenderService.updateTender(req.params.id, req.body);
      res.json(tender);
    } catch (error) {
      logger.error("Error creating seller:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteTender(req: Request, res: Response) {
    try {
      await prismaTenderService.deleteTender(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error("Error creating seller:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  // Bid endpoints
  async createBid(req: Request, res: Response) {
    try {
      const bid = await prismaTenderService.createBid(req.params.id, req.body);
      // Fetch the tender to get its projectId
      const tender = await prisma.tender.findUnique({ where: { id: req.params.id } }) as any;
      if (tender && tender.projectId) {
        // Fetch the project to get the clientId
        const project = await prisma.project.findUnique({ where: { id: tender.projectId } });
        if (project && project.clientId) {
          await prismaNotificationService.createNotification({
            to: project.clientId,
            type: 'bid',
            message: `A new bid has been submitted to your tender.`
          });
        }
      }
      res.status(201).json(bid);
    } catch (error) {
      logger.error("Error creating seller:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listBids(req: Request, res: Response) {
    try {
      const bids = await prismaTenderService.getBids(req.params.id);
      res.json(bids);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateBid(req: Request, res: Response) {
    try {
      const bid = await prismaTenderService.updateBid(req.params.bidId, req.body);
      res.json(bid);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 