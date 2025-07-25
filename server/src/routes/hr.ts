import { Router } from 'express';
import { hrController } from '../controllers/hrController';
import { authenticateUser } from '../middleware/auth';
import { validateEmployee } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Employee CRUD
router.post('/employees', authenticateUser, checkRole('admin'), validateEmployee, hrController.createEmployee);
router.get('/employees', authenticateUser, hrController.listEmployees);
router.get('/employees/:id', authenticateUser, hrController.getEmployee);
router.put('/employees/:id', authenticateUser, checkRole('admin'), validateEmployee, hrController.updateEmployee);
router.delete('/employees/:id', authenticateUser, checkRole('admin'), hrController.deleteEmployee);

export default router; 