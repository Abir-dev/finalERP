import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const project = await prisma.project.create({
        data: req.body,
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        }
      });
      
      // Notify all assigned managers and the client
      if (project.managers && project.managers.length > 0) {
        await Promise.all(project.managers.map(manager =>
          prismaNotificationService.createNotification({
            to: manager.id,
            type: 'project',
            message: `You have been assigned as a manager to a new project.`
          })
        ));
      }
      
      await prismaNotificationService.createNotification({
        to: project.clientId,
        type: 'project',
        message: `A new project has been created for you.`
      });
      
      res.status(201).json(project);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listProjects(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProject(req: Request, res: Response) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        }
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateProject(req: Request, res: Response) {
    try {
      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        }
      });
      
      res.json(project);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteProject(req: Request, res: Response) {
    try {
      await prisma.project.delete({
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
  },

  // Task CRUD Operations
  async createTask(req: Request, res: Response) {
    try {
      const task = await prisma.task.create({
        data: {
          ...req.body,
          projectId: req.params.projectId
        },
        include: {
          project: true
        }
      });
      
      // Notify assigned user if present
      if (task.assignedTo) {
        await prismaNotificationService.createNotification({
          to: task.assignedTo,
          type: 'task',
          message: `A new task has been assigned to you.`
        });
      }
      
      res.status(201).json(task);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listTasks(req: Request, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId: req.params.projectId },
        include: {
          project: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(tasks);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTask(req: Request, res: Response) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: req.params.taskId },
        include: {
          project: true
        }
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTask(req: Request, res: Response) {
    try {
      const task = await prisma.task.update({
        where: { id: req.params.taskId },
        data: req.body,
        include: {
          project: true
        }
      });
      
      res.json(task);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      await prisma.task.delete({
        where: { id: req.params.taskId }
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

  // Project-specific operations
  async getProjectsByClient(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: { clientId: req.params.clientId },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectsByManager(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          managers: {
            some: {
              id: req.params.managerId
            }
          }
        },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectsByMember(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              id: req.params.memberId
            }
          }
        },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTasksByAssignee(req: Request, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        where: { assignedTo: req.params.assigneeId },
        include: {
          project: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(tasks);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 