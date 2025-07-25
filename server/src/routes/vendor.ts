import { Router } from 'express';
import { vendorController } from '../controllers/vendorController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, vendorController.createVendor);
router.get('/', authenticateUser, vendorController.getVendors);
router.get('/:id', authenticateUser, vendorController.getVendorById);
router.put('/:id', authenticateUser, vendorController.updateVendor);
router.delete('/:id', authenticateUser, vendorController.deleteVendor);

export default router; 