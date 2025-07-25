import prisma from '../config/prisma';

export const prismaReportService = {
  async getOverview() {
    // Example: aggregate counts from all modules
    const [projects, invoices, inventory, tenders, employees] = await Promise.all([
      prisma.project.count(),
      prisma.invoice.count(),
      prisma.inventoryItem.count(),
      prisma.tender.count(),
      prisma.employee.count()
    ]);
    return { projects, invoices, inventory, tenders, employees };
  },
  async getProjectReports() {
    return prisma.project.findMany({ include: { tasks: true, invoices: true, materialRequests: true } });
  },
  async getFinanceReports() {
    return prisma.invoice.findMany({ include: { payments: true, project: true, client: true } });
  },
  async getInventoryReports() {
    return prisma.inventoryItem.findMany({ include: { requests: true } });
  },
  // Add more custom report logic as needed
}; 