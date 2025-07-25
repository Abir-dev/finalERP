import { Router } from 'express';
import { accountsController } from '../controllers/accountsController';
import { authenticateUser } from '../middleware/auth';
import { validatePayment } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Payment CRUD
router.post('/payments', authenticateUser, checkRole('accounts'), validatePayment, accountsController.createPayment);
router.get('/payments', authenticateUser, accountsController.listPayments);
router.get('/payments/:id', authenticateUser, accountsController.getPayment);
router.put('/payments/:id', authenticateUser, checkRole('accounts'), validatePayment, accountsController.updatePayment);
router.delete('/payments/:id', authenticateUser, checkRole('accounts'), accountsController.deletePayment);

export default router; 