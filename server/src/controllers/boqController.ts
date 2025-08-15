import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const boqController = {
  async createBOQ(req: Request, res: Response) {
    try {
      const { projectId, ...boqData } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const boq = await prisma.bOQ.create({
        data: {
          ...boqData,
          projectId,
          createdById: req.user.id
        },
        include: {
          project: true,
          createdBy: true
        }
      });

      res.status(201).json(boq);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listBOQs(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const boqs = await prisma.bOQ.findMany({
        where: {
          createdById: userId as string
        },
        include: {
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(boqs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const boq = await prisma.bOQ.findFirst({
        where: { 
          id: req.params.id,
          createdById: userId as string
        },
        include: {
          project: true,
          createdBy: true
        }
      });
      
      if (!boq) {
        return res.status(404).json({ error: 'BOQ not found' });
      }
      
      res.json(boq);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // First check if BOQ exists and belongs to user
      const existingBoq = await prisma.bOQ.findFirst({
        where: {
          id: req.params.id,
          createdById: userId as string
        }
      });

      if (!existingBoq) {
        return res.status(404).json({ error: 'BOQ not found or unauthorized' });
      }

      const boq = await prisma.bOQ.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          project: true,
          createdBy: true
        }
      });

      res.json(boq);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // First check if BOQ exists and belongs to user
      const existingBoq = await prisma.bOQ.findFirst({
        where: {
          id: req.params.id,
          createdById: userId as string
        }
      });

      if (!existingBoq) {
        return res.status(404).json({ error: 'BOQ not found or unauthorized' });
      }

      await prisma.bOQ.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
