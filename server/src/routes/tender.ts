import { Router } from 'express';
import { tenderController } from '../controllers/tenderController';
import { authenticateUser } from '../middleware/auth';
import { validateTender, validateBid } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

// Tender CRUD
router.post('/', authenticateUser, checkRole('md'), validateTender, tenderController.createTender);
router.get('/', authenticateUser, tenderController.listTenders);
router.get('/:id', authenticateUser, tenderController.getTender);
router.put('/:id', authenticateUser, checkRole('md'), validateTender, tenderController.updateTender);
router.delete('/:id', authenticateUser, checkRole('admin'), tenderController.deleteTender);

// Bid management
router.post('/:id/bids', authenticateUser, checkRole('client-manager'), validateBid, tenderController.createBid);
router.get('/:id/bids', authenticateUser, tenderController.listBids);
router.put('/:id/bids/:bidId', authenticateUser, checkRole('client-manager'), validateBid, tenderController.updateBid);

export default router; 