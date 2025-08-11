import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticateUser } from '../middleware/auth';
import { validateInventoryItem, validateMaterialRequest } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Inventory CRUD
router.post('/items', authenticateUser, checkRole('store'), validateInventoryItem, inventoryController.createItem);
router.get('/items', authenticateUser, inventoryController.listItems);
router.get('/items/:id', authenticateUser, inventoryController.getItem);
router.put('/items/:id', authenticateUser, checkRole('store'), validateInventoryItem, inventoryController.updateItem);
router.delete('/items/:id', authenticateUser, checkRole('store'), inventoryController.deleteItem);

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

export default router; 