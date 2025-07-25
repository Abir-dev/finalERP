import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const prismaInventoryService = {
  async createItem(data: Prisma.InventoryItemUncheckedCreateInput) {
    return prisma.inventoryItem.create({ data });
  },
  async getItems(filter: any = {}) {
    return prisma.inventoryItem.findMany({ where: filter, include: { requests: true } });
  },
  async getItemById(id: string) {
    return prisma.inventoryItem.findUnique({ where: { id }, include: { requests: true } });
  },
  async updateItem(id: string, data: Prisma.InventoryItemUpdateInput) {
    return prisma.inventoryItem.update({ where: { id }, data });
  },
  async deleteItem(id: string) {
    return prisma.inventoryItem.delete({ where: { id } });
  },
  // Material request management
  async createMaterialRequest(data: Prisma.MaterialRequestUncheckedCreateInput) {
    return prisma.materialRequest.create({ data });
  },
  async getMaterialRequests(filter: any = {}) {
    return prisma.materialRequest.findMany({ where: filter, include: { item: true, project: true, requester: true } });
  },
  async updateMaterialRequest(id: string, data: Prisma.MaterialRequestUpdateInput) {
    return prisma.materialRequest.update({ where: { id }, data });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToProject(materialRequestId: string, projectId: string) { ... }
}; 