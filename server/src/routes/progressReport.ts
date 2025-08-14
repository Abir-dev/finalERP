import { Router } from 'express';
import { progressReportController } from '../controllers/progressReportController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// DPR Routes
router.post('/dpr/:userId', authenticateUser, progressReportController.createDPR);
router.get('/dpr/:userId', authenticateUser, progressReportController.getDPRsByUser);
router.get('/dpr/:dprId', authenticateUser, progressReportController.getDPRById);
router.put('/dpr/:dprId', authenticateUser, progressReportController.updateDPR);
router.delete('/dpr/:dprId', authenticateUser, progressReportController.deleteDPR);

// WPR Routes  
router.post('/wpr/:userId', authenticateUser, progressReportController.createWPR);
router.get('/wpr/:userId', authenticateUser, progressReportController.getWPRsByUser);
router.get('/wpr/:wprId', authenticateUser, progressReportController.getWPRById);
router.put('/wpr/:wprId', authenticateUser, progressReportController.updateWPR);
router.delete('/wpr/:wprId', authenticateUser, progressReportController.deleteWPR);

export default router;
