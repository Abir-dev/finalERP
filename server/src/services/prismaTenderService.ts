import prisma from '../config/prisma';

export const prismaTenderService = {
  async createTender(data) {
    return prisma.tender.create({ data });
  },
  async getTenders(filter = {}) {
    return prisma.tender.findMany({ where: filter, include: { bids: true } });
  },
  async getTenderById(id) {
    return prisma.tender.findUnique({ where: { id }, include: { bids: true } });
  },
  async updateTender(id, data) {
    return prisma.tender.update({ where: { id }, data });
  },
  async deleteTender(id) {
    return prisma.tender.delete({ where: { id } });
  },
  // Bid management
  async createBid(tenderId, data) {
    return prisma.bid.create({ data: { ...data, tenderId } });
  },
  async getBids(tenderId) {
    return prisma.bid.findMany({ where: { tenderId } });
  },
  async updateBid(bidId, data) {
    return prisma.bid.update({ where: { id: bidId }, data });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToPurchase(tenderId, purchaseData) { ... }
}; 