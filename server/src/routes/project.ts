import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticateUser } from '../middleware/auth';
import { validateProject } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Project CRUD
router.post('/', authenticateUser, /* checkRole('site'), validateProject, */ projectController.createProject);
router.get('/', projectController.listProjects); // Removed authenticateUser

// Specific routes must come before parameterized routes
router.get('/activity', projectController.getProjectActivity);

router.get('/:id', authenticateUser, projectController.getProject);
router.put('/:id', authenticateUser, checkRole('site'), validateProject, projectController.updateProject);
router.delete('/:id', authenticateUser, checkRole('admin'), projectController.deleteProject);

// Task management
// router.post('/:id/tasks', authenticateUser, /* checkRole('site-manager'), */ projectController.addTask);
router.get('/:id/tasks', authenticateUser, projectController.listTasks);
router.put('/:id/tasks/:taskId', authenticateUser, /* checkRole('site-manager'), */ projectController.updateTask);

// Non-billable management
router.post('/:id/non-billables', authenticateUser, projectController.addNonBillable);
router.get('/:id/non-billables', authenticateUser, projectController.listNonBillables);
router.put('/:id/non-billables/:nonBillableId', authenticateUser, projectController.updateNonBillable);
router.delete('/:id/non-billables/:nonBillableId', authenticateUser, projectController.deleteNonBillable);
router.post('/:id/recalculate-total', authenticateUser, projectController.recalculateTotalSpend);

export default router; 