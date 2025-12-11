import { Router } from 'express';
import { materialIndaneController } from '../controllers/materialIndaneController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Material Indane Routes
router.post('/indanes', authenticateUser, materialIndaneController.createMaterialIndane);
router.get('/indanes', authenticateUser, materialIndaneController.getAllMaterialIndanes);
router.get('/indanes/:indaneId', authenticateUser, materialIndaneController.getMaterialIndaneById);
router.put('/indanes/:indaneId', authenticateUser, materialIndaneController.updateMaterialIndane);
router.delete('/indanes/:indaneId', authenticateUser, materialIndaneController.deleteMaterialIndane);

// Material Indane Item Routes
router.post('/indanes/:indaneId/items', authenticateUser, materialIndaneController.addItem);
router.put('/items/:itemId', authenticateUser, materialIndaneController.updateItem);
router.delete('/items/:itemId', authenticateUser, materialIndaneController.deleteItem);

export default router;
