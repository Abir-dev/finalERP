import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticateUser } from '../middleware/auth';
import { validateInventoryItem, validateMaterialRequest } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';
import upload from '../config/multer';

const router = Router();

// Inventory CRUD
router.post('/items', authenticateUser, upload.single('image'), validateInventoryItem, inventoryController.createItem);
router.get('/items', authenticateUser, inventoryController.listItems);
router.get('/items/:id', authenticateUser, inventoryController.getItem);
router.put('/items/:id', authenticateUser, upload.single('image'), validateInventoryItem, inventoryController.updateItem);
router.delete('/items/:id', authenticateUser,  inventoryController.deleteItem);

// Additional inventory management routes
router.get('/items/category/:category', authenticateUser, inventoryController.getItemsByCategory);
router.get('/items/status/low-stock', authenticateUser, inventoryController.getLowStockItems);
router.get('/items/search', authenticateUser, inventoryController.searchItems);
router.get('/metrics', authenticateUser, inventoryController.getInventoryMetrics);
router.patch('/items/:id/stock', authenticateUser, checkRole('store'), inventoryController.updateStock);

// Material Requests
router.post('/requests', authenticateUser, checkRole('site'), validateMaterialRequest, inventoryController.createMaterialRequest);
router.get('/requests', authenticateUser, inventoryController.listMaterialRequests);
router.put('/requests/:id', authenticateUser, checkRole('store'), validateMaterialRequest, inventoryController.updateMaterialRequest);

// Material Transfers
router.post('/transfers', authenticateUser, inventoryController.createMaterialTransfer);
router.get('/transfers', authenticateUser, inventoryController.listMaterialTransfers);
router.get('/transfers/:id', authenticateUser, inventoryController.getMaterialTransfer);
router.put('/transfers/:id', authenticateUser, inventoryController.updateMaterialTransfer);
router.delete('/transfers/:id', authenticateUser, inventoryController.deleteMaterialTransfer);

// Material Transfer Items
router.get('/transfers/:transferId/items', authenticateUser, inventoryController.listMaterialTransferItems);
router.post('/transfers/:transferId/items', authenticateUser, inventoryController.createMaterialTransferItem);
router.get('/transfers/:transferId/items/:itemId', authenticateUser, inventoryController.getMaterialTransferItem);
router.put('/transfers/:transferId/items/:itemId', authenticateUser, inventoryController.updateMaterialTransferItem);
router.delete('/transfers/:transferId/items/:itemId', authenticateUser, inventoryController.deleteMaterialTransferItem);

export default router; 