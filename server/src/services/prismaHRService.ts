import prisma from '../config/prisma';

export const prismaHRService = {
  async createEmployee(data) {
    return prisma.employee.create({ data });
  },
  async getEmployees(filter = {}) {
    return prisma.employee.findMany({ where: filter, include: { user: true } });
  },
  async getEmployeeById(id) {
    return prisma.employee.findUnique({ where: { id }, include: { user: true } });
  },
  async updateEmployee(id, data) {
    return prisma.employee.update({ where: { id }, data });
  },
  async deleteEmployee(id) {
    return prisma.employee.delete({ where: { id } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToPayroll(employeeId, payrollData) { ... }
}; 