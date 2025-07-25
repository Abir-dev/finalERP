import prisma from '../config/prisma';

export const prismaAccountsService = {
  async createPayment(data) {
    return prisma.payment.create({ data });
  },
  async getPayments(filter = {}) {
    return prisma.payment.findMany({ where: filter, include: { invoice: true } });
  },
  async getPaymentById(id) {
    return prisma.payment.findUnique({ where: { id }, include: { invoice: true } });
  },
  async updatePayment(id, data) {
    return prisma.payment.update({ where: { id }, data });
  },
  async deletePayment(id) {
    return prisma.payment.delete({ where: { id } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToInvoice(paymentId, invoiceId) { ... }
}; 