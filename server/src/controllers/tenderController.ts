import { Request, Response } from 'express';
import { prismaTenderService } from '../services/prismaTenderService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';

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
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listTenders(req: Request, res: Response) {
    try {
      const tenders = await prismaTenderService.getTenders();
      res.json(tenders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getTender(req: Request, res: Response) {
    try {
      const tender = await prismaTenderService.getTenderById(req.params.id);
      if (!tender) return res.status(404).json({ error: 'Not found' });
      res.json(tender);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateTender(req: Request, res: Response) {
    try {
      const tender = await prismaTenderService.updateTender(req.params.id, req.body);
      res.json(tender);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deleteTender(req: Request, res: Response) {
    try {
      await prismaTenderService.deleteTender(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // Bid endpoints
  async createBid(req: Request, res: Response) {
    try {
      const bid = await prismaTenderService.createBid(req.params.id, req.body);
      // Notify tender creator (assuming tender has a creatorId field)
      const tender = await prisma.tender.findUnique({ where: { id: req.params.id } });
      if (tender && tender.clientId) {
        await prismaNotificationService.createNotification({
          to: tender.clientId,
          type: 'bid',
          message: `A new bid has been submitted to your tender.`
        });
      }
      res.status(201).json(bid);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listBids(req: Request, res: Response) {
    try {
      const bids = await prismaTenderService.getBids(req.params.id);
      res.json(bids);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateBid(req: Request, res: Response) {
    try {
      const bid = await prismaTenderService.updateBid(req.params.bidId, req.body);
      res.json(bid);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}; 