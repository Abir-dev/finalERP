import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticateUser } from '../middleware/auth';
// import { checkRole } from '../middleware/rbac';

const router = Router();

router.get('/overview', authenticateUser, reportController.getOverview);
router.get('/projects', authenticateUser, reportController.getProjectReports);
router.get('/finance', authenticateUser, reportController.getFinanceReports);
router.get('/inventory', authenticateUser, reportController.getInventoryReports);

export default router; 