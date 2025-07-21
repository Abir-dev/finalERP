import { Request, Response } from 'express';
import { prismaProjectService } from '../services/prismaProjectService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';

export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const project = await prismaProjectService.createProject(req.body);
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
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async listProjects(req: Request, res: Response) {
    try {
      const projects = await prismaProjectService.getProjects();
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
  async getProject(req: Request, res: Response) {
    try {
      const project = await prismaProjectService.getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Not found' });
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
  async updateProject(req: Request, res: Response) {
    try {
      const project = await prismaProjectService.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async deleteProject(req: Request, res: Response) {
    try {
      await prismaProjectService.deleteProject(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  // Task endpoints
  async addTask(req: Request, res: Response) {
    try {
      const task = await prismaProjectService.addTask(req.params.id, req.body);
      // Notify assigned user if present
      if (task.assignedTo) {
        await prismaNotificationService.createNotification({
          to: task.assignedTo,
          type: 'task',
          message: `A new task has been assigned to you.`
        });
      }
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async updateTask(req: Request, res: Response) {
    try {
      const task = await prismaProjectService.updateTask(req.params.taskId, req.body);
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
  async listTasks(req: Request, res: Response) {
    try {
      const tasks = await prismaProjectService.getTasks(req.params.id);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}; 