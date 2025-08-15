import { Router } from 'express';
import { boqController } from '../controllers/boqController';
import { authenticateUser } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

// BOQ CRUD operations
router.post('/boqs', authenticateUser, checkRole('accounts'), boqController.createBOQ);
router.get('/boqs', authenticateUser, boqController.listBOQs);
router.get('/boqs/:id', authenticateUser, boqController.getBOQ);
router.put('/boqs/:id', authenticateUser, checkRole('accounts'), boqController.updateBOQ);
router.delete('/boqs/:id', authenticateUser, checkRole('admin'), boqController.deleteBOQ);

export default router;
