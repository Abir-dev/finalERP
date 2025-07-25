import { Router } from 'express';
import { purchaseOrderController } from '../controllers/purchaseOrderController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Purchase Orders
router.post('/', authenticateUser, purchaseOrderController.createPurchaseOrder);
router.get('/', authenticateUser, purchaseOrderController.getPurchaseOrders);
router.get('/:id', authenticateUser, purchaseOrderController.getPurchaseOrderById);
router.put('/:id', authenticateUser, purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', authenticateUser, purchaseOrderController.deletePurchaseOrder);

// Purchase Order Items
router.post('/:poId/items', authenticateUser, purchaseOrderController.addPurchaseOrderItem);
router.put('/items/:id', authenticateUser, purchaseOrderController.updatePurchaseOrderItem);
router.delete('/items/:id', authenticateUser, purchaseOrderController.deletePurchaseOrderItem);

// GRN
router.post('/grn', authenticateUser, purchaseOrderController.createGRN);
router.get('/grn', authenticateUser, purchaseOrderController.getGRNs);
router.get('/grn/:id', authenticateUser, purchaseOrderController.getGRNById);
router.put('/grn/:id', authenticateUser, purchaseOrderController.updateGRN);
router.delete('/grn/:id', authenticateUser, purchaseOrderController.deleteGRN);

export default router; 