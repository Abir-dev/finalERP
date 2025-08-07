import { Request, Response } from "express";
import { PrismaClient, VehicleStatus } from "@prisma/client";
import logger from "../logger/logger";

const prisma = new PrismaClient();

export const vehicleController = {
  // Vehicle CRUD Operations
  async createVehicle(req: Request, res: Response) {
    try {
      const { vehicleName, registrationNumber, assignedSite, licensePlate, driverName, createdById } = req.body;
      
      if (!vehicleName || !registrationNumber || !assignedSite || !licensePlate || !driverName || !createdById) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          vehicleName,
          registrationNumber,
          assignedSite,
          licensePlate,
          driverName,
          createdById,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          movement: true,
          maintenanceHistory: true,
        }
      });

      res.status(201).json({
        message: "Vehicle created successfully",
        vehicle
      });
    } catch (error) {
      logger.error("Error creating vehicle:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getVehicles(req: Request, res: Response) {
    try {
      const { vehicleType, assignedSite, status, search } = req.query;
      
      const where: any = {};
      
      if (vehicleType && vehicleType !== "All") {
        where.vehicleName = { contains: vehicleType as string };
      }
      
      if (assignedSite && assignedSite !== "All") {
        where.assignedSite = assignedSite as string;
      }
      
      if (search) {
        where.OR = [
          { vehicleName: { contains: search as string } },
          { registrationNumber: { contains: search as string } },
          { licensePlate: { contains: search as string } },
          { driverName: { contains: search as string } },
        ];
      }

      const vehicles = await prisma.vehicle.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          movement: {
            orderBy: { date: 'desc' },
            take: 5
          },
          maintenanceHistory: {
            orderBy: { lastServiced: 'desc' },
            take: 3
          },
        },
        orderBy: { vehicleName: 'asc' }
      });

      res.status(200).json(vehicles);
    } catch (error) {
      logger.error("Error fetching vehicles:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          movement: {
            orderBy: { date: 'desc' }
          },
          maintenanceHistory: {
            orderBy: { lastServiced: 'desc' }
          },
        }
      });

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      res.status(200).json(vehicle);
    } catch (error) {
      logger.error("Error fetching vehicle by ID:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          movement: true,
          maintenanceHistory: true,
        }
      });

      res.status(200).json({
        message: "Vehicle updated successfully",
        vehicle
      });
    } catch (error) {
      logger.error("Error updating vehicle:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.vehicle.delete({
        where: { id }
      });

      res.status(200).json({
        message: "Vehicle deleted successfully"
      });
    } catch (error) {
      logger.error("Error deleting vehicle:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Vehicle Movement CRUD Operations
  async createVehicleMovement(req: Request, res: Response) {
    try {
      const { vehicleId, from, to, date } = req.body;

      if (!vehicleId || !from || !to || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const movement = await prisma.vehicleMovement.create({
        data: {
          vehicleId,
          from,
          to,
          date: new Date(date),
        },
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true }
          }
        }
      });

      res.status(201).json({
        message: "Vehicle movement created successfully",
        movement
      });
    } catch (error) {
      logger.error("Error creating vehicle movement:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getVehicleMovements(req: Request, res: Response) {
    try {
      const { vehicleId } = req.query;
      
      const where: any = {};
      if (vehicleId) {
        where.vehicleId = vehicleId as string;
      }

      const movements = await prisma.vehicleMovement.findMany({
        where,
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true, driverName: true }
          }
        },
        orderBy: { date: 'desc' }
      });

      res.status(200).json(movements);
    } catch (error) {
      logger.error("Error fetching vehicle movements:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateVehicleMovement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const movement = await prisma.vehicleMovement.update({
        where: { id },
        data: updateData,
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true }
          }
        }
      });

      res.status(200).json({
        message: "Vehicle movement updated successfully",
        movement
      });
    } catch (error) {
      logger.error("Error updating vehicle movement:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteVehicleMovement(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.vehicleMovement.delete({
        where: { id }
      });

      res.status(200).json({
        message: "Vehicle movement deleted successfully"
      });
    } catch (error) {
      logger.error("Error deleting vehicle movement:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Vehicle Maintenance CRUD Operations
  async createMaintenance(req: Request, res: Response) {
    try {
      const { vehicleId, lastServiced, nextDue, status } = req.body;

      if (!vehicleId || !lastServiced || !nextDue || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const maintenance = await prisma.maintenance.create({
        data: {
          vehicleId,
          lastServiced: new Date(lastServiced),
          nextDue: new Date(nextDue),
          status: status as VehicleStatus,
        },
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true }
          }
        }
      });

      res.status(201).json({
        message: "Maintenance record created successfully",
        maintenance
      });
    } catch (error) {
      logger.error("Error creating maintenance record:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getMaintenanceRecords(req: Request, res: Response) {
    try {
      const { vehicleId, status } = req.query;
      
      const where: any = {};
      if (vehicleId) {
        where.vehicleId = vehicleId as string;
      }
      if (status && status !== "All") {
        where.status = status as VehicleStatus;
      }

      const maintenanceRecords = await prisma.maintenance.findMany({
        where,
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true }
          }
        },
        orderBy: { lastServiced: 'desc' }
      });

      res.status(200).json(maintenanceRecords);
    } catch (error) {
      logger.error("Error fetching maintenance records:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.lastServiced) {
        updateData.lastServiced = new Date(updateData.lastServiced);
      }
      if (updateData.nextDue) {
        updateData.nextDue = new Date(updateData.nextDue);
      }

      const maintenance = await prisma.maintenance.update({
        where: { id },
        data: updateData,
        include: {
          Vehicle: {
            select: { id: true, vehicleName: true, registrationNumber: true }
          }
        }
      });

      res.status(200).json({
        message: "Maintenance record updated successfully",
        maintenance
      });
    } catch (error) {
      logger.error("Error updating maintenance record:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.maintenance.delete({
        where: { id }
      });

      res.status(200).json({
        message: "Maintenance record deleted successfully"
      });
    } catch (error) {
      logger.error("Error deleting maintenance record:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Dashboard Analytics
  async getVehicleAnalytics(req: Request, res: Response) {
    try {
      const totalVehicles = await prisma.vehicle.count();
      
      const vehiclesByStatus = await prisma.maintenance.groupBy({
        by: ['status'],
        _count: {
          _all: true
        }
      });

      const vehiclesBySite = await prisma.vehicle.groupBy({
        by: ['assignedSite'],
        _count: {
          _all: true
        }
      });

      const recentMovements = await prisma.vehicleMovement.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          Vehicle: {
            select: { vehicleName: true, driverName: true }
          }
        }
      });

      const upcomingMaintenance = await prisma.maintenance.findMany({
        where: {
          nextDue: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        include: {
          Vehicle: {
            select: { vehicleName: true, registrationNumber: true }
          }
        },
        orderBy: { nextDue: 'asc' }
      });

      res.status(200).json({
        totalVehicles,
        vehiclesByStatus,
        vehiclesBySite,
        recentMovements,
        upcomingMaintenance
      });
    } catch (error) {
      logger.error("Error fetching vehicle analytics:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
