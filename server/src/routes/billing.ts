import { Router } from 'express';
import { billingController } from '../controllers/billingController';
import { authenticateUser } from '../middleware/auth';
import { validateInvoice, validatePayment } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Invoice CRUD
router.post('/invoices', authenticateUser, checkRole('accounts'), validateInvoice, billingController.createInvoice);
router.get('/invoices', authenticateUser, billingController.listInvoices);
router.get('/invoices/:id', authenticateUser, billingController.getInvoice);
router.put('/invoices/:id', authenticateUser, checkRole('accounts'), validateInvoice, billingController.updateInvoice);
router.delete('/invoices/:id', authenticateUser, checkRole('admin'), billingController.deleteInvoice);

// Payment management
router.post('/invoices/:id/payments', authenticateUser, checkRole('accounts'), validatePayment, billingController.addPayment);
router.get('/invoices/:id/payments', authenticateUser, billingController.listPayments);

export default router; 