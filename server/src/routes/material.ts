import { Router } from 'express';
import { materialController } from '../controllers/materialController';
import { authenticateUser } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { validateMaterialRequest, validateMaterialRequestItem } from '../middleware/validation';

const router = Router();

// MaterialRequest CRUD
router.post('/material-requests', authenticateUser, checkRole('accounts'), validateMaterialRequest, materialController.createMaterialRequest);
router.get('/material-requests', authenticateUser, materialController.listMaterialRequests);
router.get('/material-requests/:id', authenticateUser, materialController.getMaterialRequest);
router.put('/material-requests/:id', authenticateUser, checkRole('accounts'), validateMaterialRequest, materialController.updateMaterialRequest);
router.delete('/material-requests/:id', authenticateUser, checkRole('admin'), materialController.deleteMaterialRequest);

// Material Request Approval/Rejection
router.post('/material-requests/:id/approve', authenticateUser, checkRole('admin'), materialController.approveMaterialRequest);
router.post('/material-requests/:id/reject', authenticateUser, checkRole('admin'), materialController.rejectMaterialRequest);

// MaterialRequestItem CRUD
router.post('/material-requests/:materialRequestId/items', authenticateUser, checkRole('accounts'), validateMaterialRequestItem, materialController.createMaterialRequestItem);
router.get('/material-requests/:materialRequestId/items', authenticateUser, materialController.listMaterialRequestItems);
router.get('/material-requests/:materialRequestId/items/:itemId', authenticateUser, materialController.getMaterialRequestItem);
router.put('/material-requests/:materialRequestId/items/:itemId', authenticateUser, checkRole('accounts'), validateMaterialRequestItem, materialController.updateMaterialRequestItem);
router.delete('/material-requests/:materialRequestId/items/:itemId', authenticateUser, checkRole('accounts'), materialController.deleteMaterialRequestItem);

export default router; 