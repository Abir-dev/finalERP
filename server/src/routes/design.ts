import { Router } from 'express';
import { designController } from '../controllers/designController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Design CRUD - Global routes (fetch all designs)
router.get('/', authenticateUser, designController.listAllDesigns);

// Design CRUD - User specific routes (by createdById)
router.post('/:userId', authenticateUser, designController.createDesign);
router.get('/:userId', authenticateUser, designController.listDesignsByUser);
router.get('/:id', authenticateUser, designController.getDesign);
router.put('/:id', authenticateUser, designController.updateDesign);
router.delete('/:id', authenticateUser, designController.deleteDesign);

// Additional filter routes
router.get('/client/:clientId', authenticateUser, designController.getDesignsByClient);
router.get('/project/:projectId', authenticateUser, designController.getDesignsByProject);

export default router;
