import prisma from '../config/prisma';

export const prismaVendorService = {
  async createVendor(data) {
    return prisma.vendor.create({ data });
  },
  async getVendors(filter = {}) {
    return prisma.vendor.findMany({ where: filter });
  },
  async getVendorById(id) {
    return prisma.vendor.findUnique({ where: { id } });
  },
  async updateVendor(id, data) {
    return prisma.vendor.update({ where: { id }, data });
  },
  async deleteVendor(id) {
    return prisma.vendor.delete({ where: { id } });
  },
}; 