import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const designController = {
  async createDesign(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, clientId, projectId, status, files, images } = req.body;

      const design = await prisma.design.create({
        data: {
          name,
          clientId,
          projectId,
          status,
          files: files || [],
          images: images || [],
          createdById: userId
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      res.status(201).json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listAllDesigns(req: Request, res: Response) {
    try {
      const designs = await prisma.design.findMany({
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listDesignsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const designs = await prisma.design.findMany({
        where: {
          createdById: userId
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const design = await prisma.design.findUnique({
        where: { id },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }

      res.json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, clientId, projectId, status, files, images } = req.body;

      const design = await prisma.design.update({
        where: { 
          id,
        },
        data: {
          name,
          clientId,
          projectId,
          status,
          files,
          images
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      res.json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.design.delete({
        where: { 
          id,
        }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesignsByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      const designs = await prisma.design.findMany({
        where: { clientId },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesignsByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      
      const designs = await prisma.design.findMany({
        where: { projectId },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
