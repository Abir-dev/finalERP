import { Request, Response } from 'express';
import { prismaBillingService } from '../services/prismaBillingService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const billingController = {
  async createInvoice(req: Request, res: Response) {
    try {
      const invoice = await prismaBillingService.createInvoice(req.body);
      // Send notification to client
      await prismaNotificationService.createNotification({
        to: invoice.clientId,
        type: 'invoice',
        message: `A new invoice has been created for you.`,
      });
      res.status(201).json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listInvoices(req: Request, res: Response) {
    try {
      const invoices = await prismaBillingService.getInvoices();
      res.json(invoices);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getInvoice(req: Request, res: Response) {
    try {
      const invoice = await prismaBillingService.getInvoiceById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Not found' });
      res.json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateInvoice(req: Request, res: Response) {
    try {
      const invoice = await prismaBillingService.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteInvoice(req: Request, res: Response) {
    try {
      await prismaBillingService.deleteInvoice(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  // Payment endpoints
  async addPayment(req: Request, res: Response) {
    try {
      const payment = await prismaBillingService.addPayment(req.params.id, req.body);
      // Check if invoice is now fully paid
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: { payments: true },
      });
      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        if (!invoice.paid && totalPaid >= invoice.amount) {
          await prisma.invoice.update({ where: { id: invoice.id }, data: { paid: true } });
          // Notify accounts and client
          await prismaNotificationService.createNotification({
            to: invoice.clientId,
            type: 'payment',
            message: `Your invoice has been fully paid.`
          });
        }
      }
      res.status(201).json(payment);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listPayments(req: Request, res: Response) {
    try {
      const payments = await prismaBillingService.getPayments(req.params.id);
      res.json(payments);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 