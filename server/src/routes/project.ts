import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticateUser } from '../middleware/auth';
import { validateProject } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Project CRUD
router.post('/', authenticateUser, checkRole('site'), validateProject, projectController.createProject);
router.get('/', authenticateUser, projectController.listProjects);
router.get('/:id', authenticateUser, projectController.getProject);
router.put('/:id', authenticateUser, checkRole('site'), validateProject, projectController.updateProject);
router.delete('/:id', authenticateUser, checkRole('admin'), projectController.deleteProject);

// Task management
router.post('/:id/tasks', authenticateUser, /* checkRole('site-manager'), */ projectController.addTask);
router.get('/:id/tasks', authenticateUser, projectController.listTasks);
router.put('/:id/tasks/:taskId', authenticateUser, /* checkRole('site-manager'), */ projectController.updateTask);

export default router; 