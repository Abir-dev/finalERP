import prisma from '../config/prisma';

export const prismaPurchaseOrderService = {
  // Purchase Orders
  async createPurchaseOrder(data) {
    return prisma.purchaseOrder.create({ data, include: { items: true } });
  },
  async getPurchaseOrders(filter = {}) {
    return prisma.purchaseOrder.findMany({ where: filter, include: { items: true } });
  },
  async getPurchaseOrderById(id) {
    return prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  },
  async updatePurchaseOrder(id, data) {
    return prisma.purchaseOrder.update({ where: { id }, data });
  },
  async deletePurchaseOrder(id) {
    return prisma.purchaseOrder.delete({ where: { id } });
  },

  // Purchase Order Items
  async addPurchaseOrderItem(purchaseOrderId, data) {
    return prisma.purchaseOrderItem.create({ data: { ...data, purchaseOrderId } });
  },
  async updatePurchaseOrderItem(id, data) {
    return prisma.purchaseOrderItem.update({ where: { id }, data });
  },
  async deletePurchaseOrderItem(id) {
    return prisma.purchaseOrderItem.delete({ where: { id } });
  },

  // GRN
  async createGRN(data) {
    return prisma.gRN.create({ data });
  },
  async getGRNs(filter = {}) {
    return prisma.gRN.findMany({ where: filter, include: { purchaseOrder: true } });
  },
  async getGRNById(id) {
    return prisma.gRN.findUnique({ where: { id }, include: { purchaseOrder: true } });
  },
  async updateGRN(id, data) {
    return prisma.gRN.update({ where: { id }, data });
  },
  async deleteGRN(id) {
    return prisma.gRN.delete({ where: { id } });
  },
}; 