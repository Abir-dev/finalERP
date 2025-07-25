import prisma from '../config/prisma';

export const prismaSiteOpsService = {
  // Equipment Maintenance
  async createEquipmentMaintenance(data) {
    return prisma.equipmentMaintenance.create({ data });
  },
  async getEquipmentMaintenances(filter = {}) {
    return prisma.equipmentMaintenance.findMany({ where: filter });
  },
  async getEquipmentMaintenanceById(id) {
    return prisma.equipmentMaintenance.findUnique({ where: { id } });
  },
  async updateEquipmentMaintenance(id, data) {
    return prisma.equipmentMaintenance.update({ where: { id }, data });
  },
  async deleteEquipmentMaintenance(id) {
    return prisma.equipmentMaintenance.delete({ where: { id } });
  },

  // Labor Log
  async createLaborLog(data) {
    return prisma.laborLog.create({ data });
  },
  async getLaborLogs(filter = {}) {
    return prisma.laborLog.findMany({ where: filter });
  },
  async getLaborLogById(id) {
    return prisma.laborLog.findUnique({ where: { id } });
  },
  async updateLaborLog(id, data) {
    return prisma.laborLog.update({ where: { id }, data });
  },
  async deleteLaborLog(id) {
    return prisma.laborLog.delete({ where: { id } });
  },

  // Budget Adjustment
  async createBudgetAdjustment(data) {
    return prisma.budgetAdjustment.create({ data });
  },
  async getBudgetAdjustments(filter = {}) {
    return prisma.budgetAdjustment.findMany({ where: filter });
  },
  async getBudgetAdjustmentById(id) {
    return prisma.budgetAdjustment.findUnique({ where: { id } });
  },
  async updateBudgetAdjustment(id, data) {
    return prisma.budgetAdjustment.update({ where: { id }, data });
  },
  async deleteBudgetAdjustment(id) {
    return prisma.budgetAdjustment.delete({ where: { id } });
  },

  // Issue Report
  async createIssueReport(data) {
    return prisma.issueReport.create({ data });
  },
  async getIssueReports(filter = {}) {
    return prisma.issueReport.findMany({ where: filter });
  },
  async getIssueReportById(id) {
    return prisma.issueReport.findUnique({ where: { id } });
  },
  async updateIssueReport(id, data) {
    return prisma.issueReport.update({ where: { id }, data });
  },
  async deleteIssueReport(id) {
    return prisma.issueReport.delete({ where: { id } });
  },

  // Daily Progress Report
  async createDailyProgressReport(data) {
    return prisma.dailyProgressReport.create({ data });
  },
  async getDailyProgressReports(filter = {}) {
    return prisma.dailyProgressReport.findMany({ where: filter });
  },
  async getDailyProgressReportById(id) {
    return prisma.dailyProgressReport.findUnique({ where: { id } });
  },
  async updateDailyProgressReport(id, data) {
    return prisma.dailyProgressReport.update({ where: { id }, data });
  },
  async deleteDailyProgressReport(id) {
    return prisma.dailyProgressReport.delete({ where: { id } });
  },

  // Weekly Progress Report
  async createWeeklyProgressReport(data) {
    return prisma.weeklyProgressReport.create({ data });
  },
  async getWeeklyProgressReports(filter = {}) {
    return prisma.weeklyProgressReport.findMany({ where: filter });
  },
  async getWeeklyProgressReportById(id) {
    return prisma.weeklyProgressReport.findUnique({ where: { id } });
  },
  async updateWeeklyProgressReport(id, data) {
    return prisma.weeklyProgressReport.update({ where: { id }, data });
  },
  async deleteWeeklyProgressReport(id) {
    return prisma.weeklyProgressReport.delete({ where: { id } });
  },

  // Event
  async createEvent(data) {
    return prisma.event.create({ data });
  },
  async getEvents(filter = {}) {
    return prisma.event.findMany({ where: filter });
  },
  async getEventById(id) {
    return prisma.event.findUnique({ where: { id } });
  },
  async updateEvent(id, data) {
    return prisma.event.update({ where: { id }, data });
  },
  async deleteEvent(id) {
    return prisma.event.delete({ where: { id } });
  },
}; 