import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { uploadImage as uploadImageToS3, deleteImage as deleteImageFromS3, extractKeyFromUrl } from '../utils/s3';

// Interface for material transfer item validation
interface ItemValidation {
    fromInventoryItem: any;
    quantity: number;
    itemCode: string;
    itemName: Item;
    type: InventoryType;
    unit: Unit | string | null;
    notes: string | null;
    hsnCode: string | null;
}
import { InventoryCategory, Unit, MaterialRequestStatus, InventoryType, Item } from '@prisma/client';

interface CreateInventoryItemRequest {
    itemName: Item;
    category: InventoryCategory;
    quantity: number;
    type: InventoryType;
    unit: Unit;
    location: string;
    maximumStock: number;
    safetyStock: number;
    primarySupplierName: string;
    primarySupplierManualName?: string;
    vendorId: string;
    secondarySupplierName?: string;
    secondarySupplierManualName?: string;
    secondaryVendorId?: string;
    unitCost: number;
    imageUrl?: string;
    projectId?: string;
    createdById: string;
}

export const inventoryController = {
    async createItem(req: Request, res: Response) {
        try {
            // Handle both JSON and FormData requests
            const {
                itemName,
                itemCode,
                category,
                quantity,
                type,
                unit,
                location,
                maximumStock,
                safetyStock,
                primarySupplierName,
                primarySupplierManualName,
                vendorId,
                secondarySupplierName,
                secondarySupplierManualName,
                secondaryVendorId,
                unitCost,
                imageUrl,
                projectId,
                createdById
            } = req.body;

            // Handle file upload if present
            let finalImageUrl = imageUrl;
            if (req.file) {
                try {
                    // Upload image to S3
                    const uploadResult = await uploadImageToS3({
                        buffer: req.file.buffer,
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                        size: req.file.size,
                    });
                    finalImageUrl = uploadResult.url;
                } catch (error) {
                    logger.error("Error uploading image to S3:", error);
                    return res.status(500).json({
                        error: "Failed to upload image. Please try again.",
                    });
                }
            }

            const createData: any = {
                itemName,
                itemCode,
                category,
                quantity: parseInt(quantity) || 0,
                type,
                unit,
                location,
                maximumStock: parseInt(maximumStock) || 0,
                safetyStock: parseInt(safetyStock) || 0,
                primarySupplierName,
                vendorId,
                unitCost: parseInt(unitCost) || 0,
                imageUrl: finalImageUrl,
                createdById
            };

            // Add manual primary supplier name if provided
            if (primarySupplierManualName) {
                createData.primarySupplierManualName = primarySupplierManualName;
            }

            if (secondarySupplierName) {
                createData.secondarySupplierName = secondarySupplierName;
            }
            // Add manual secondary supplier name if provided
            if (secondarySupplierManualName) {
                createData.secondarySupplierManualName = secondarySupplierManualName;
            }
            if (secondaryVendorId) {
                createData.secondaryVendorId = secondaryVendorId;
            }
            if (projectId) {
                createData.projectId = projectId;
            }

            // Validate that vendor exists (skip if null UUID or null)
            const isNullUUID = vendorId === "00000000-0000-0000-0000-000000000000";
            if (vendorId && !isNullUUID) {
                const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
                if (!vendor) {
                    return res.status(400).json({ error: `Vendor with ID ${vendorId} does not exist` });
                }
            } else if (isNullUUID) {
                createData.vendorId = null;
            }

            // Validate secondary vendor if provided
            if (secondaryVendorId) {
                const secondaryVendor = await prisma.vendor.findUnique({ where: { id: secondaryVendorId } });
                if (!secondaryVendor) {
                    return res.status(400).json({ error: `Secondary vendor with ID ${secondaryVendorId} does not exist` });
                }
            }

            const item = await prisma.inventory.create({
                data: createData,
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    project: { select: { id: true, name: true } },
                    requests: true
                }
            });

            res.status(201).json(item);
        } catch (err) {
            logger.error("Error creating inventory item:", err);
            res.status(400).json({ error: (err as Error).message });
        }
    },
    async listItems(req: Request, res: Response) {
        try {
            const { userId } = req.query
            if (userId) {
                const items = await prisma.inventory.findMany({
                    where: {
                        createdById: userId as string
                    },
                    include: {
                        createdBy: { select: { id: true, name: true, email: true } },
                        primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                        secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                        project: { select: { id: true, name: true } },
                        requests: true
                    }
                });
                res.json(items);
            } else {
                const items = await prisma.inventory.findMany({
                    where: {
                        // createdById:userId as string
                    },
                    include: {
                        createdBy: { select: { id: true, name: true, email: true } },
                        primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                        secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                        project: { select: { id: true, name: true } },
                        requests: true
                    }
                });
                res.json(items);
            }

        } catch (error) {
            logger.error("Error fetching inventory items:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async getItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const item = await prisma.inventory.findUnique({
                where: { id },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    project: { select: { id: true, name: true } },
                    requests: true
                }
            });
            if (!item) return res.status(404).json({ error: 'Inventory item not found' });
            res.json(item);
        } catch (error) {
            logger.error("Error fetching inventory item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async updateItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Handle file upload if present
            if (req.file) {
                try {
                    // Get existing item to check for old image
                    const existingItem = await prisma.inventory.findUnique({
                        where: { id },
                        select: { imageUrl: true },
                    });

                    // Upload new image to S3
                    const uploadResult = await uploadImageToS3({
                        buffer: req.file.buffer,
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                        size: req.file.size,
                    });
                    updateData.imageUrl = uploadResult.url;

                    // Delete old image from S3 if it exists and is an S3 URL
                    if (existingItem?.imageUrl && !existingItem.imageUrl.startsWith('/uploads/')) {
                        try {
                            const oldImageKey = extractKeyFromUrl(existingItem.imageUrl);
                            await deleteImageFromS3(oldImageKey);
                        } catch (deleteError) {
                            // Log but don't fail the update if old image deletion fails
                            logger.warn("Failed to delete old image from S3:", deleteError);
                        }
                    }
                } catch (error) {
                    logger.error("Error uploading image to S3:", error);
                    return res.status(500).json({
                        error: "Failed to upload image. Please try again.",
                    });
                }
            }

            // Convert string values to numbers for numeric fields
            if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity) || 0;
            if (updateData.maximumStock) updateData.maximumStock = parseInt(updateData.maximumStock) || 0;
            if (updateData.safetyStock) updateData.safetyStock = parseInt(updateData.safetyStock) || 0;
            if (updateData.unitCost) updateData.unitCost = parseInt(updateData.unitCost) || 0;

            // Handle secondary supplier fields - set to null if empty strings are provided
            if (updateData.secondarySupplierName === "") {
                updateData.secondarySupplierName = null;
            }
            if (updateData.secondaryVendorId === "") {
                updateData.secondaryVendorId = null;
            }

            // Validate that vendor exists if vendorId is being updated (skip if null UUID)
            const isNullUUID = updateData.vendorId === "00000000-0000-0000-0000-000000000000";
            if (updateData.vendorId && !isNullUUID) {
                const vendor = await prisma.vendor.findUnique({ where: { id: updateData.vendorId } });
                if (!vendor) {
                    return res.status(400).json({ error: `Vendor with ID ${updateData.vendorId} does not exist` });
                }
            } else if (isNullUUID) {
                updateData.vendorId = null;
            }

            // Validate secondary vendor if being updated
            if (updateData.secondaryVendorId && updateData.secondaryVendorId !== null) {
                const secondaryVendor = await prisma.vendor.findUnique({ where: { id: updateData.secondaryVendorId } });
                if (!secondaryVendor) {
                    return res.status(400).json({ error: `Secondary vendor with ID ${updateData.secondaryVendorId} does not exist` });
                }
            }

            // Remove undefined values and createdById/createdAt/updatedAt from update
            const { createdById, createdAt, updatedAt, ...cleanUpdateData } = updateData;

            const item = await prisma.inventory.update({
                where: { id },
                data: cleanUpdateData,
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    project: { select: { id: true, name: true } },
                    requests: true
                }
            });
            res.json(item);
        } catch (error) {
            logger.error("Error updating inventory item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async deleteItem(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Get the item first to check for image
            const item = await prisma.inventory.findUnique({
                where: { id },
                select: { imageUrl: true },
            });

            // Delete the item from database
            await prisma.inventory.delete({ where: { id } });

            // Delete the image from S3 if it exists and is an S3 URL
            if (item?.imageUrl && !item.imageUrl.startsWith('/uploads/')) {
                try {
                    const imageKey = extractKeyFromUrl(item.imageUrl);
                    await deleteImageFromS3(imageKey);
                } catch (deleteError) {
                    // Log but don't fail the delete if image deletion fails
                    logger.warn("Failed to delete image from S3:", deleteError);
                }
            }

            res.status(204).send();
        } catch (error) {
            logger.error("Error deleting inventory item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Additional inventory management endpoints
    async getItemsByCategory(req: Request, res: Response) {
        try {
            const { category } = req.params;
            const items = await prisma.inventory.findMany({
                where: { category: category as InventoryCategory },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    requests: true
                }
            });
            res.json(items);
        } catch (error) {
            logger.error("Error fetching items by category:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    async getLowStockItems(req: Request, res: Response) {
        try {
            const items = await prisma.inventory.findMany({
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    requests: true
                }
            });
            const lowStockItems = items.filter(item => item.quantity <= item.safetyStock);
            res.json(lowStockItems);
        } catch (error) {
            logger.error("Error fetching low stock items:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    async searchItems(req: Request, res: Response) {
        try {
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ error: "Search parameter is required" });
            }

            const items = await prisma.inventory.findMany({
                where: {
                    OR: [
                        // { itemName: { contains: search as Item, mode: 'insensitive' } },
                        { primarySupplierName: { contains: search as string, mode: 'insensitive' } },
                        { location: { contains: search as string, mode: 'insensitive' } }
                    ]
                },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    requests: true
                }
            });
            res.json(items);
        } catch (error) {
            logger.error("Error searching items:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    // Material request endpoints
    async createMaterialRequest(req: Request, res: Response) {
        try {
            const request = await prisma.materialRequest.create({
                data: req.body,
                include: {
                    items: true,
                    project: true,
                    requester: { select: { id: true, name: true, email: true } },
                    approver: { select: { id: true, name: true, email: true } }
                }
            });

            // Notify store manager(s)
            const storeManagers = await prisma.user.findMany({ where: { role: 'store' } });
            await Promise.all(storeManagers.map(manager =>
                prismaNotificationService.createNotification({
                    to: manager.id,
                    type: 'material-request',
                    message: `A new material request has been submitted.`
                })
            ));
            res.status(201).json(request);
        } catch (error) {
            logger.error("Error creating material request:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async listMaterialRequests(req: Request, res: Response) {
        try {
            const requests = await prisma.materialRequest.findMany({
                include: {
                    items: true,
                    project: true,
                    requester: { select: { id: true, name: true, email: true } },
                    approver: { select: { id: true, name: true, email: true } }
                }
            });
            res.json(requests);
        } catch (error) {
            logger.error("Error fetching material requests:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async updateMaterialRequest(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const request = await prisma.materialRequest.update({
                where: { id },
                data: req.body,
                include: {
                    items: true,
                    project: true,
                    requester: { select: { id: true, name: true, email: true } },
                    approver: { select: { id: true, name: true, email: true } }
                }
            });

            // If approved, notify requester
            if (request.status === MaterialRequestStatus.COMPLETED) {
                await prismaNotificationService.createNotification({
                    to: request.requestedBy,
                    type: 'material-request-approved',
                    message: `Your material request has been approved.`
                });
            }
            res.json(request);
        } catch (error) {
            logger.error("Error updating material request:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Additional inventory management endpoints
    async getInventoryMetrics(req: Request, res: Response) {
        try {
            const totalItems = await prisma.inventory.count();
            const items = await prisma.inventory.findMany();
            const lowStockItems = items.filter(item => item.quantity <= item.safetyStock);
            const totalValue = await prisma.inventory.aggregate({
                _sum: {
                    unitCost: true
                }
            });

            const metrics = {
                totalItems,
                lowStockCount: lowStockItems.length,
                totalValue: totalValue._sum.unitCost || 0,
                lowStockItems: lowStockItems.slice(0, 5)
            };

            res.json(metrics);
        } catch (error) {
            logger.error("Error fetching inventory metrics:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    async updateStock(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { quantity, operation = 'add' } = req.body;

            const currentItem = await prisma.inventory.findUnique({ where: { id } });
            if (!currentItem) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }

            const newQuantity = operation === 'add'
                ? currentItem.quantity + quantity
                : currentItem.quantity - quantity;

            if (newQuantity < 0) {
                return res.status(400).json({ error: 'Insufficient stock' });
            }

            const updatedItem = await prisma.inventory.update({
                where: { id },
                data: { quantity: newQuantity },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    primarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    secondarySupplier: { select: { id: true, name: true, email: true, mobile: true } },
                    requests: true
                }
            });

            res.json(updatedItem);
        } catch (error) {
            logger.error("Error updating stock:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Material Transfers
    async createMaterialTransfer(req: Request, res: Response) {
        try {
            const {
                transferID,
                fromLocation,
                toLocation,
                requestedDate,
                status,
                driverName,
                etaMinutes,
                vehicleId,
                approvedById,
                priority,
                items,
                fromUserId,
                toUserId,
                inventoryType,
                gstIn,
                state,
                stateCode,
            } = req.body || {};

            // if (!transferID || !fromLocation || !toLocation || !requestedDate) {
            //   return res.status(400).json({ error: "transferID, fromLocation, toLocation, and requestedDate are required" });
            // }
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "At least one item is required" });
            }
            if (!fromUserId || !toUserId) {
                return res.status(400).json({ error: "fromUserId and toUserId are required" });
            }

            // Validate that both users exist and have store role
            const [fromUser, toUser] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: fromUserId },
                    select: { id: true, name: true, email: true, role: true }
                }),
                prisma.user.findUnique({
                    where: { id: toUserId },
                    select: { id: true, name: true, email: true, role: true }
                })
            ]);

            if (!fromUser || !toUser) {
                return res.status(404).json({ error: "One or both users not found" });
            }

            // if (fromUser.role !== 'store' || toUser.role !== 'store') {
            //   return res.status(400).json({ error: "Both users must have store role" });
            // }

            // Validate each item and check inventory availability
            const itemValidations: ItemValidation[] = [];

            for (const item of items) {
                const { itemCode, itemName, type, quantity, unit, hsnCode } = item;

                if (!itemCode || !itemName || !type || !quantity) {
                    return res.status(400).json({
                        error: `Missing required fields for item: itemCode, itemName, type, and quantity are required`
                    });
                }

                // Validate quantity is a positive integer
                const quantityInt = parseInt(quantity);
                if (isNaN(quantityInt) || quantityInt <= 0) {
                    return res.status(400).json({
                        error: `Invalid quantity for item ${itemCode}: must be a positive integer`
                    });
                }

                // Find the inventory item in the from user's inventory
                const inventoryItem = await prisma.inventory.findFirst({
                    where: {
                        createdById: fromUserId,
                        itemCode: itemCode,
                        itemName: itemName, // itemName is an enum (Item)
                        type: type // type is an enum (InventoryType)
                    }
                });

                // if (!inventoryItem) {
                //   return res.status(404).json({
                //     error: `Item not found in from user's inventory: ${itemCode} - ${itemName} (${type})`
                //   });
                // }

                // Check if sufficient quantity is available
                // if (inventoryItem.quantity < quantityInt) {
                //   return res.status(400).json({
                //     error: `Insufficient quantity for item ${itemCode} - ${itemName}. Available: ${inventoryItem.quantity}, Requested: ${quantityInt}`
                //   });
                // }

                itemValidations.push({
                     fromInventoryItem: inventoryItem,
                     quantity: quantityInt,
                     itemCode,
                     itemName: itemName as Item,
                     type: type as InventoryType,
                     unit: unit || null,
                     notes: item.notes || null,
                     hsnCode: hsnCode || null
                 });
            }

            // Use fallback locations if not provided
            const finalFromLocation = fromLocation || fromUser.name || fromUser.email;
            const finalToLocation = toLocation || toUser.name || toUser.email;

            // Use transaction to ensure all operations succeed or fail together
            const result = await prisma.$transaction(async (tx) => {
                const transferItems: any[] = [];

                for (const validation of itemValidations) {
                     const { fromInventoryItem, quantity, itemCode, itemName, type, unit, notes, hsnCode } = validation;

                     // Deduct from from user's inventory if item exists
                     if (fromInventoryItem) {
                         await tx.inventory.update({
                             where: { id: fromInventoryItem.id },
                             data: { quantity: fromInventoryItem.quantity - quantity }
                         });
                     }

                     // Prepare transfer item data
                     transferItems.push({
                         itemCode: itemCode,
                         itemName: itemName,
                         type: type,
                         description: `${itemCode} - ${itemName} (${type})`,
                         quantity: quantity,
                         unit: unit || fromInventoryItem?.unit || null,
                         inventoryId: fromInventoryItem?.id,
                         notes: notes,
                         hsnCode: hsnCode,
                     });
                 }

                // Create the material transfer
                const created = await tx.materialTransfer.create({
                    data: {
                        transferID,
                        fromLocation: finalFromLocation,
                        toLocation: finalToLocation,
                        requestedDate: new Date(requestedDate),
                        status: status ?? 'PENDING',
                        driverName: driverName || null,
                        etaMinutes: typeof etaMinutes === 'number' ? etaMinutes : null,
                        inventoryType: inventoryType || null,
                        gstIn: gstIn || null,
                        state: state || null,
                        stateCode: stateCode || null,
                        vehicleId: vehicleId || null,
                        approvedById: approvedById || null,
                        priority: priority ?? 'NORMAL',
                        createdById: (req.user as any)?.id,
                        items: {
                            create: transferItems,
                        },
                    },
                    include: {
                        items: true,
                        vehicle: true,
                        approvedBy: { select: { id: true, name: true, email: true } },
                        createdBy: { select: { id: true, name: true, email: true } },
                    },
                });

                return created;
            });

            res.status(201).json({
                message: "Material transfer created successfully",
                transfer: result,
                itemsProcessed: itemValidations.length
            });
        } catch (error) {
            logger.error("Error creating material transfer:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    async listMaterialTransfers(req: Request, res: Response) {
        try {
            const { userId } = req.query;
            if (userId) {
                const transfers = await (prisma as any).materialTransfer.findMany({
                    where: { createdById: userId as string },
                    include: {
                        items: true,
                        vehicle: true,
                        approvedBy: { select: { id: true, name: true, email: true } },
                        createdBy: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                });
                res.json(transfers);
            } else {
                const transfers = await (prisma as any).materialTransfer.findMany({
                    // where: { createdById: userId as string },
                    include: {
                        items: true,
                        vehicle: true,
                        approvedBy: { select: { id: true, name: true, email: true } },
                        createdBy: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                });
                res.json(transfers);
            }
        } catch (error) {
            logger.error("Error fetching material transfers:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    async getMaterialTransfer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const transfer = await (prisma as any).materialTransfer.findUnique({
                where: { id },
                include: {
                    items: true,
                    vehicle: true,
                    approvedBy: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, name: true, email: true } },
                },
            });
            if (!transfer) return res.status(404).json({ error: 'Material transfer not found' });
            if (transfer.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
            res.json(transfer);
        } catch (error) {
            logger.error("Error getting material transfer:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async updateMaterialTransfer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const existing = await (prisma as any).materialTransfer.findUnique({ where: { id } });
            if (!existing) return res.status(404).json({ error: 'Material transfer not found' });
            if (existing.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

            const {
                transferID,
                fromLocation,
                toLocation,
                requestedDate,
                status,
                driverName,
                etaMinutes,
                inventoryType,
                gstIn,
                state,
                stateCode,
                vehicleId,
                approvedById,
                priority
            } = req.body || {};

            const updated = await (prisma as any).materialTransfer.update({
                where: { id },
                data: {
                    ...(transferID && { transferID }),
                    ...(fromLocation && { fromLocation }),
                    ...(toLocation && { toLocation }),
                    ...(requestedDate && { requestedDate: new Date(requestedDate) }),
                    ...(status && { status }),
                    ...(driverName !== undefined && { driverName }),
                    ...(etaMinutes !== undefined && { etaMinutes }),
                    ...(inventoryType !== undefined && { inventoryType }),
                    ...(gstIn !== undefined && { gstIn }),
                    ...(state !== undefined && { state }),
                    ...(stateCode !== undefined && { stateCode }),
                    ...(vehicleId !== undefined && { vehicleId }),
                    ...(approvedById !== undefined && { approvedById }),
                    ...(priority && { priority }),
                },
                include: {
                    items: true,
                    vehicle: true,
                    approvedBy: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, name: true, email: true } },
                },
            });
            res.json(updated);
        } catch (error) {
            logger.error("Error updating material transfer:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async deleteMaterialTransfer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const existing = await (prisma as any).materialTransfer.findUnique({ where: { id }, include: { items: true } });
            if (!existing) return res.status(404).json({ error: 'Material transfer not found' });
            if (existing.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

            await (prisma as any).materialTransferItem.deleteMany({ where: { transferId: id } });
            await (prisma as any).materialTransfer.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            logger.error("Error deleting material transfer:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Material Transfer Items
    async listMaterialTransferItems(req: Request, res: Response) {
        try {
            const { transferId } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
            if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
            if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
            const items = await (prisma as any).materialTransferItem.findMany({ where: { transferId }, orderBy: { id: 'asc' } });
            res.json(items);
        } catch (error) {
            logger.error("Error listing material transfer items:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async createMaterialTransferItem(req: Request, res: Response) {
        try {
            const { transferId } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
            if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
            if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });

            const { itemCode, itemName, type, description, quantity, unit, inventoryId, notes, hsnCode } = req.body || {};
            
            // Use itemCode and itemName to build description if description not provided
            const finalDescription = description || `${itemCode || 'Item'} - ${itemName || 'Unknown'} (${type || 'N/A'})`;
            
            if (!quantity || typeof quantity !== 'number') {
                return res.status(400).json({ error: 'quantity is required and must be a number' });
            }
            
            const item = await (prisma as any).materialTransferItem.create({
                data: {
                    transferId,
                    itemCode: itemCode || null,
                    itemName: itemName || null,
                    type: type || null,
                    description: finalDescription,
                    quantity,
                    unit: unit || null,
                    inventoryId: inventoryId || null,
                    notes: notes || null,
                    hsnCode: hsnCode || null,
                },
            });
            res.status(201).json(item);
        } catch (error) {
            logger.error("Error creating material transfer item:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async getMaterialTransferItem(req: Request, res: Response) {
        try {
            const { transferId, itemId } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
            if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
            if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
            const item = await (prisma as any).materialTransferItem.findUnique({ where: { id: itemId } });
            if (!item || item.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
            res.json(item);
        } catch (error) {
            logger.error("Error getting material transfer item:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async updateMaterialTransferItem(req: Request, res: Response) {
        try {
            const { transferId, itemId } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
            if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
            if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
            const { itemCode, itemName, type, description, quantity, unit, inventoryId, notes, hsnCode } = req.body || {};
            const item = await (prisma as any).materialTransferItem.update({
                where: { id: itemId },
                data: {
                    ...(itemCode !== undefined && { itemCode }),
                    ...(itemName !== undefined && { itemName }),
                    ...(type !== undefined && { type }),
                    ...(description && { description }),
                    ...(quantity !== undefined && { quantity }),
                    ...(unit !== undefined && { unit }),
                    ...(inventoryId !== undefined && { inventoryId }),
                    ...(notes !== undefined && { notes }),
                    ...(hsnCode !== undefined && { hsnCode }),
                },
            });
            if (!item || item.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
            res.json(item);
        } catch (error) {
            logger.error("Error updating material transfer item:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async deleteMaterialTransferItem(req: Request, res: Response) {
        try {
            const { transferId, itemId } = req.params;
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: "userId query param is required" });
            }
            const parent = await (prisma as any).materialTransfer.findUnique({ where: { id: transferId } });
            if (!parent) return res.status(404).json({ error: 'Material transfer not found' });
            if (parent.createdById !== userId) return res.status(403).json({ error: 'Forbidden' });
            const existing = await (prisma as any).materialTransferItem.findUnique({ where: { id: itemId } });
            if (!existing || existing.transferId !== transferId) return res.status(404).json({ error: 'Material transfer item not found' });
            await (prisma as any).materialTransferItem.delete({ where: { id: itemId } });
            res.status(204).send();
        } catch (error) {
            logger.error("Error deleting material transfer item:", error);
            res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Upload authorised signature for Material Transfer
    async uploadAuthorisedSignature(req: Request, res: Response) {
        try {
            const { transferId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const transfer = await (prisma as any).materialTransfer.findUnique({
                where: { id: transferId }
            });

            if (!transfer) {
                return res.status(404).json({ error: 'Material transfer not found' });
            }

            if (transfer.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete old signature if exists
            if (transfer.authorisedSignature) {
                try {
                    const oldKey = extractKeyFromUrl(transfer.authorisedSignature);
                    await deleteImageFromS3(oldKey);
                } catch (error) {
                    logger.warn(`Failed to delete old authorised signature: ${error}`);
                }
            }

            // Upload new signature using the uploadImageToS3 function
            const { url, key } = await uploadImageToS3({
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            });

            const updated = await (prisma as any).materialTransfer.update({
                where: { id: transferId },
                data: { authorisedSignature: url }
            });

            logger.info(`Authorised signature uploaded for transfer: ${transferId} by user: ${userId}`);
            res.json({
                message: 'Authorised signature uploaded successfully',
                url,
                key,
                transfer: updated
            });
        } catch (error) {
            logger.error("Error uploading authorised signature:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
};