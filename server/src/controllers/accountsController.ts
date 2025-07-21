import { Request, Response } from 'express';
import { prismaAccountsService } from '../services/prismaAccountsService';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';

export const accountsController = {
  async createPayment(req: Request, res: Response) {
    try {
      const payment = await prismaAccountsService.createPayment(req.body);
      // Notify invoice client and accounts team
      const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (invoice) {
        await prismaNotificationService.createNotification({
          to: invoice.clientId,
          type: 'payment',
          message: `A payment has been recorded for your invoice.`
        });
        const accountsUsers = await prisma.user.findMany({ where: { role: 'accounts' } });
        await Promise.all(accountsUsers.map(user =>
          prismaNotificationService.createNotification({
            to: user.id,
            type: 'payment',
            message: `A new payment has been recorded.`
          })
        ));
      }
      res.status(201).json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listPayments(req: Request, res: Response) {
    try {
      const payments = await prismaAccountsService.getPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getPayment(req: Request, res: Response) {
    try {
      const payment = await prismaAccountsService.getPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ error: 'Not found' });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updatePayment(req: Request, res: Response) {
    try {
      const payment = await prismaAccountsService.updatePayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deletePayment(req: Request, res: Response) {
    try {
      const payment = await prismaAccountsService.getPaymentById(req.params.id);
      await prismaAccountsService.deletePayment(req.params.id);
      // Notify accounts team
      const accountsUsers = await prisma.user.findMany({ where: { role: 'accounts' } });
      await Promise.all(accountsUsers.map(user =>
        prismaNotificationService.createNotification({
          to: user.id,
          type: 'payment-removed',
          message: `A payment has been deleted.`
        })
      ));
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}; 