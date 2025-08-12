import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { DataTable } from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Package,
  Truck,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  Warehouse,
  ArrowLeft,
  MapPin,
  TrendingDown,
  BarChart3,
  Download,
  Trash2,
  Edit,
  PauseCircle,
} from "lucide-react";
import { inventoryData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import AddVehicleModal from "@/components/modals/AddVehicleModal";
import MaintenanceModal from "@/components/modals/MaintenanceModal";
import VehicleMovementLogsTable from "@/components/VehicleMovementLogsTable";
import ActiveVehiclesView from "@/components/ActiveVehiclesView";
import IdleVehiclesView from "@/components/IdleVehiclesView";
import MaintenanceVehiclesView from "@/components/MaintenanceVehiclesView";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Dynamic transfer data will be calculated from actual transfers

type InventoryItem = (typeof inventoryData)[0];

const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return <Badge variant="outline">{category}</Badge>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const unit = row.original.unit;
      return `${quantity} ${unit}`;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
];

const transferColumns = [
  {
    accessorKey: "id",
    header: "Transfer ID",
  },
  {
    accessorKey: "items",
    header: "Items",
  },
  {
    accessorKey: "from",
    header: "From",
  },
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Completed"
          ? "default"
          : status === "In Transit"
          ? "secondary"
          : status === "Cancelled"
          ? "destructive"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const topVehicles = [
  { vehicle: "Truck 1", utilization: 92, site: "Site A" },
  { vehicle: "Excavator 1", utilization: 88, site: "Site B" },
  { vehicle: "Truck 2", utilization: 85, site: "Site C" },
  { vehicle: "Crane 1", utilization: 80, site: "Site A" },
  { vehicle: "Truck 3", utilization: 78, site: "Site B" },
];

const costlyMaintenance = [
  {
    vehicle: "Truck 2",
    date: "2024-05-10",
    cost: 12000,
    desc: "Engine Overhaul",
  },
  {
    vehicle: "Crane 1",
    date: "2024-05-15",
    cost: 9500,
    desc: "Hydraulics Repair",
  },
  {
    vehicle: "Excavator 1",
    date: "2024-05-20",
    cost: 8000,
    desc: "Track Replacement",
  },
];

// Comment out or remove static arrays
// const transfersData = [...];
// const vehicleKpis = [...];
// const vehicleMovementLogs = [...];
// const fuelTrendData = [...];
// const utilizationByProject = [...];
// const purchaseRequests = [...];
// const maintenanceSchedules = [...];

const vehicleTypes = ["All", "Truck", "Excavator", "Crane"];
const projectSites = ["All", "Site A", "Site B", "Site C", "Depot"];
const statusOptions = ["All", "Active", "Idle", "Maintenance"];

type MaintenanceSchedule = {
  vehicle: string;
  last: string;
  next: string;
  status: string; // allow any string for compatibility
  vendor?: string;
  notes?: string;
};

const StoreDashboard = () => {
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] =
    useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemForIssue, setSelectedItemForIssue] =
    useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(inventoryData);
  const [vehicleType, setVehicleType] = useState("all");
  const [vehicleSite, setVehicleSite] = useState("all");
  const [vehicleStatus, setVehicleStatus] = useState("all");
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceModalMode, setMaintenanceModalMode] = useState<
    "create" | "edit"
  >("create");
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] =
    useState<string>("");
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [selectedAsset, setSelectedAsset] =
    useState<MaintenanceSchedule | null>(null);
  const [overviewSubview, setOverviewSubview] = useState<
    "main" | "inventoryValue" | "lowStock" | "activeTransfers" | "totalItems"
  >("main");
  const [inventorySubview, setInventorySubview] = useState<
    "main" | "lowStock" | "totalItems" | "value"
  >("main");
  const [transferSubview, setTransferSubview] = useState<
    "main" | "active" | "completed" | "pending"
  >("main");
  const [analyticsSubview, setAnalyticsSubview] = useState<
    | "main"
    | "spend"
    | "turnover"
    | "deadStock"
    | "leadTime"
    | "suppliers"
    | "requests"
  >("main");
  const [vehicleSubview, setVehicleSubview] = useState<
    "main" | "active" | "onSite" | "maintenance" | "idle"
  >("main");

  // Add backend state
  const [transfers, setTransfers] = useState([]);
  const [vehicleKpis, setVehicleKpis] = useState<any>({});
  const [vehicleMovementLogs, setVehicleMovementLogs] = useState([]);
  const [fuelTrendData, setFuelTrendData] = useState([]);
  const [utilizationByProject, setUtilizationByProject] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [storageUtilization, setStorageUtilization] = useState([]);

  const { toast } = useToast();
  const { user } = useUser();
  const userID: string = user?.id || "";

  const [inventory, setInventory] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [topVehicles, setTopVehicles] = useState<any[]>([]);
  const [costlyMaintenance, setCostlyMaintenance] = useState<any[]>([]);

  // Store analytics data
  const [storeOverview, setStoreOverview] = useState<any>({});
  const [inventoryTurnover, setInventoryTurnover] = useState<any>({});
  const [consumptionTrends, setConsumptionTrends] = useState<any>({});
  const [supplierPerformance, setSupplierPerformance] = useState<any>({});
  const [costAnalysis, setCostAnalysis] = useState<any>({});

  // Vendors and Material Requests data
  const [vendors, setVendors] = useState<any[]>([]);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  console.log(materialRequests);
  const fetchVendorsData = async () => {
    if (!userID) return;

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await axios.get(`${API_URL}/vendors/user/${userID}`, {
        headers,
      });
      setVendors(response.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor data",
        variant: "destructive",
      });
    }
  };

  const fetchTransfersData = async () => {
    if (!userID) return;

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await axios.get(
        `${API_URL}/store/transfers?userId=${userID}`,
        { headers }
      );
      setTransfers(response.data || []);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transfer data",
        variant: "destructive",
      });
    }
  };

  // Calculate transfer statistics from actual data
  const getTransferStats = () => {
    if (!transfers.length) return [];

    const statuses = ["DELIVERED", "IN_TRANSIT", "PENDING", "CANCELLED"];
    const colors = {
      DELIVERED: "#10b981",
      IN_TRANSIT: "#3b82f6",
      PENDING: "#f59e0b",
      CANCELLED: "#ef4444",
    };
    const labels = {
      DELIVERED: "Completed",
      IN_TRANSIT: "In Transit",
      PENDING: "Pending",
      CANCELLED: "Cancelled",
    };

    return statuses.map((status) => ({
      name: labels[status],
      value: transfers.filter((t: any) => t.status === status).length,
      fill: colors[status],
    }));
  };

  // Calculate material request statistics
  const getMaterialRequestStats = () => {
    const statuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
    return statuses.map((status) => ({
      status,
      label: status.charAt(0) + status.slice(1).toLowerCase(),
      count: materialRequests.filter((req: any) => req.status === status)
        .length,
      color:
        status === "APPROVED" || status === "COMPLETED"
          ? "bg-green-500"
          : status === "PENDING"
          ? "bg-yellow-500"
          : status === "REJECTED"
          ? "bg-red-500"
          : "bg-blue-500",
    }));
  };

  // Calculate category-wise inventory analysis from real data
  const getCategoryWiseAnalysis = () => {
    if (!inventory.length) return [];

    const categoryColors = {
      CONSTRUCTION_MATERIALS: "#14b8a6", // Teal
      TOOLS_AND_EQUIPMENT: "#f59e0b", // Yellow
      SAFETY_EQUIPMENT: "#ef4444", // Red
      ELECTRICAL_COMPONENTS: "#8b5cf6", // Purple
      PLUMBING_MATERIALS: "#3b82f6", // Blue
      HVAC_EQUIPMENT: "#84cc16", // Lime
      FINISHING_MATERIALS: "#22c55e", // Green (lighter)
      HARDWARE_AND_FASTENERS: "#f97316", // Orange
      OTHERS: "#6b7280",
    };

    // Group inventory by category and sum quantities
    const categoryData = inventory.reduce((acc: any, item: any) => {
      const category = item.category || "Others";
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          quantity: 0,
          fill: categoryColors[category] || categoryColors["Others"],
        };
      }
      // Sum quantities for pie chart display
      acc[category].value += item.quantity || 0;
      acc[category].quantity += item.quantity || 0;
      return acc;
    }, {});

    return Object.values(categoryData);
  };

  // Format category data for display
  const formatCategoryData = () => {
    const data = getCategoryWiseAnalysis();
    return data.map((item: any) => ({
      ...item,
      displayValue: `${item.quantity} items`,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "bg-green-500";
      case "Low":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStockLevel = (quantity: number, minStock: number) => {
    return Math.min(100, (quantity / minStock) * 100);
  };

  const handleLogGRN = () => {
    toast({
      title: "GRN logged successfully!",
    });
    setIsGRNModalOpen(false);
  };

  const handleRaiseRequest = () => {
    toast({
      title: "Purchase request raised successfully!",
    });
    setIsRequestModalOpen(false);
  };

  const handleTransferApproval = () => {
    toast({
      title: "Transfer request approved!",
    });
    setIsTransferModalOpen(false);
  };

  const handleIssueToSite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const siteTeam = formData.get("siteTeam") as string;
    const reason = formData.get("reason") as string;
    const quantity = Number(formData.get("quantity"));
    const selectedItems = formData.getAll("selectedItems") as string[];

    if (quantity > 0) {
      // Update the inventory items with the reduced quantity
      setInventoryItems((currentItems) =>
        currentItems.map((item) => {
          if (selectedItems.includes(item.name)) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - quantity),
              lastUpdated: new Date().toLocaleDateString(),
            };
          }
          return item;
        })
      );

      toast({
        title: `Issued ${quantity} items to ${siteTeam} for ${reason}`,
      });
      setIsIssueModalOpen(false);
      setSelectedItemForIssue(null);
    }
  };

  const handleUpdateStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuantity = Number(formData.get("quantity"));

    if (selectedItem && newQuantity >= 0) {
      // Update the inventory items with the new quantity
      setInventoryItems((currentItems) =>
        currentItems.map((item) =>
          item.name === selectedItem.name
            ? {
                ...item,
                quantity: newQuantity,
                lastUpdated: new Date().toLocaleDateString(),
              }
            : item
        )
      );

      toast({
        title: `Updated ${selectedItem.name} stock to ${newQuantity} ${selectedItem.unit}`,
      });
      setIsUpdateStockModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleTransferStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toLocation = formData.get("toLocation") as string;
    const quantity = Number(formData.get("quantity"));

    if (selectedItem && quantity > 0) {
      // Update the inventory items with the new quantity after transfer
      setInventoryItems((currentItems) =>
        currentItems.map((item) =>
          item.name === selectedItem.name
            ? {
                ...item,
                quantity: item.quantity - quantity,
                lastUpdated: new Date().toLocaleDateString(),
              }
            : item
        )
      );

      toast({
        title: `Transferred ${quantity} ${selectedItem.unit} of ${selectedItem.name} to ${toLocation}`,
      });
      setIsTransferStockModalOpen(false);
      setSelectedItem(null);
    }
  };

  function handleAddVehicle(vehicle: any) {
    toast({
      title: "Vehicle Added",
      description: `${vehicle.vehicleName} was added successfully.`,
      duration: 3000,
    });
    // Refresh vehicle data after adding
    fetchVehicleData();
  }

  const fetchVehicleData = async (filters?: {
    vehicleType?: string;
    assignedSite?: string;
    status?: string;
  }) => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (filters?.vehicleType && filters.vehicleType !== "all") {
        params.append("vehicleType", filters.vehicleType);
      }
      if (filters?.assignedSite && filters.assignedSite !== "all") {
        params.append("assignedSite", filters.assignedSite);
      }
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      // Always include userId for scoped vehicle queries
      if (userID) {
        params.append("userId", userID);
      }

      // Fetch updated vehicle analytics
      const analyticsResponse = await axios.get(
        `${API_URL}/vehicles/analytics?userId=${userID}`,
        { headers }
      );
      setVehicleKpis(analyticsResponse.data);
      setTopVehicles(analyticsResponse.data.allVehiclesBySite || []);

      // Fetch filtered movements (scoped by user)
      const movementsQuery = params.toString();
      const movementsUrl = `${API_URL}/vehicles/movements/list${
        movementsQuery ? `?${movementsQuery}` : ""
      }`;
      const movementsResponse = await axios.get(movementsUrl, { headers });
      setVehicleMovementLogs(movementsResponse.data);

      // Fetch filtered maintenance (scoped by user)
      const maintenanceQuery = params.toString();
      const maintenanceUrl = `${API_URL}/vehicles/maintenance/list${
        maintenanceQuery ? `?${maintenanceQuery}` : ""
      }`;
      const maintenanceResponse = await axios.get(maintenanceUrl, { headers });
      setMaintenanceSchedules(maintenanceResponse.data);
      const costly = maintenanceResponse.data
        .filter((item: any) => item.cost && item.cost > 5000)
        .sort((a: any, b: any) => (b.cost || 0) - (a.cost || 0))
        .slice(0, 5);
      setCostlyMaintenance(costly);
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

  // Update vehicle data when filters change
  useEffect(() => {
    fetchVehicleData({
      vehicleType,
      assignedSite: vehicleSite,
      status: vehicleStatus,
    });
  }, [vehicleType, vehicleSite, vehicleStatus]);

  // Maintenance CRUD Functions
  const handleAddMaintenance = (vehicleId: string) => {
    setSelectedVehicleForMaintenance(vehicleId);
    setMaintenanceModalMode("create");
    setSelectedMaintenance(null);
    setShowMaintenanceModal(true);
  };

  const handleEditMaintenance = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setMaintenanceModalMode("edit");
    setShowMaintenanceModal(true);
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/vehicles/maintenance/${maintenanceId}`, {
        headers,
      });

      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });

      fetchVehicleData();
    } catch (error: any) {
      console.error("Error deleting maintenance:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to delete maintenance record",
      });
    }
  };

  const handleReorder = (item: any) => {
    // Create a purchase request for the item
    const reorderQuantity = item.minStock * 2 - item.quantity; // Order enough to get back to 2x min stock

    toast({
      title: "Reorder initiated",
      description: `Ordered ${reorderQuantity} ${item.unit} of ${item.item}`,
    });

    // Update the item's status to show it's been reordered
    const updatedInventory = inventory.map((invItem) => {
      if (invItem.id === item.id) {
        return {
          ...invItem,
          status: "Reordered",
        };
      }
      return invItem;
    });

    // In a real application, you would make an API call here to:
    // 1. Create a purchase order
    // 2. Update the item status
    // 3. Notify relevant stakeholders
  };

  const handleApproveRequest = (request: any) => {
    // Update the status of the request
    setPurchaseRequests((currentRequests) =>
      currentRequests.map((req) =>
        req.id === request.id ? { ...req, status: "Approved" } : req
      )
    );

    // Show success notification
    toast({
      title: "Purchase request approved",
      description: `Request for ${request.item} has been approved`,
    });

    // In a real application, you would:
    // 1. Make an API call to update the request status
    // 2. Create a purchase order
    // 3. Notify relevant stakeholders
    // 4. Update inventory tracking system
  };

  const handleGetQuote = (request: any) => {
    // Show processing notification
    toast({
      title: "Requesting quotes",
      description: `Sending quote requests to vendors for ${request.item}`,
    });

    // In a real application, you would:
    // 1. Send quote requests to relevant vendors
    // 2. Track quote request status
    // 3. Update the request status
    // 4. Notify procurement team
  };

  const handleScheduleMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const maintenanceDate = formData.get("maintenanceDate") as string;
    const vendor = formData.get("vendor") as string;
    const notes = formData.get("notes") as string;

    if (selectedAsset && maintenanceDate) {
      // Update the maintenance schedule
      setMaintenanceSchedules((current) =>
        current.map((schedule) =>
          schedule.vehicle === selectedAsset.vehicle
            ? {
                ...schedule,
                next: maintenanceDate,
                status: "Scheduled",
                vendor,
                notes,
              }
            : schedule
        )
      );

      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance for ${selectedAsset.vehicle} scheduled for ${maintenanceDate}`,
      });

      // Close the modal and reset selection
      setIsMaintenanceModalOpen(false);
      setSelectedAsset(null);
    }
  };

  const fetchAnalyticsData = async () => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (!userID) return;

    try {
      // Fetch inventory turnover data
      const turnoverRes = await axios.get(
        `${API_URL}/store/analytics/turnover?userId=${userID}`,
        { headers }
      );
      setInventoryTurnover(turnoverRes.data);

      // Fetch consumption trends
      const consumptionRes = await axios.get(
        `${API_URL}/store/analytics/consumption?userId=${userID}`,
        { headers }
      );
      setConsumptionTrends(consumptionRes.data);

      // Fetch supplier performance
      const supplierRes = await axios.get(
        `${API_URL}/store/analytics/supplier-performance?userId=${userID}`,
        { headers }
      );
      setSupplierPerformance(supplierRes.data);

      // Fetch cost analysis
      const costRes = await axios.get(
        `${API_URL}/store/analytics/cost-analysis?userId=${userID}`,
        { headers }
      );
      setCostAnalysis(costRes.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Store Overview Data
    axios
      .get(`${API_URL}/store/overview?userId=${userID}`, { headers })
      .then((res) => {
        setStoreOverview(res.data);
        setRecentTransactions(res.data.recentTransactions || []);
      })
      .catch((error) => console.error("Error fetching store overview:", error));

    // Store Inventory Data
    axios
      .get(`${API_URL}/store/inventory-data?userId=${userID}`, { headers })
      .then((res) => setInventory(res.data || []))
      .catch((error) => console.error("Error fetching inventory data:", error));

    // Store Stock Levels
    axios
      .get(`${API_URL}/store/stock-levels?userId=${userID}`, { headers })
      .then((res) => setStockData(res.data.stockData || []))
      .catch((error) => console.error("Error fetching stock levels:", error));

    // Store Transfers
    fetchTransfersData();

    // Vehicle data - using new vehicle APIs
    axios
      .get(`${API_URL}/vehicles/analytics?userId=${userID}`, { headers })
      .then((res) => {
        setVehicleKpis(res.data);
        setTopVehicles(res.data.allVehiclesBySite || []);
      })
      .catch(() => {});

    axios
      .get(`${API_URL}/vehicles/movements/list?userId=${userID}`, { headers })
      .then((res) => setVehicleMovementLogs(res.data))
      .catch(() => {});

    axios
      .get(`${API_URL}/vehicles/maintenance/list?userId=${userID}`, { headers })
      .then((res) => {
        setMaintenanceSchedules(res.data);
        // Filter costly maintenance from the data
        const costly = res.data
          .filter((item) => item.cost && item.cost > 5000)
          .sort((a, b) => (b.cost || 0) - (a.cost || 0))
          .slice(0, 5);
        setCostlyMaintenance(costly);
      })
      .catch(() => {});

    // Temporary mock data for fuel trends and utilization until endpoints are implemented
    setFuelTrendData([
      { name: "Week 1", Truck1: 120, Truck2: 110 },
      { name: "Week 2", Truck1: 115, Truck2: 105 },
      { name: "Week 3", Truck1: 125, Truck2: 115 },
      { name: "Week 4", Truck1: 118, Truck2: 108 },
    ]);

    setUtilizationByProject([
      { project: "Site A", utilization: 85 },
      { project: "Site B", utilization: 72 },
      { project: "Site C", utilization: 90 },
      { project: "Depot", utilization: 45 },
    ]);

    // Purchase requests
    axios
      .get(`${API_URL}/purchase-requests`, { headers })
      .then((res) => setPurchaseRequests(res.data))
      .catch(() => {});

    // Store analytics data
    if (userID) {
      // Store Overview Data
      axios
        .get(`${API_URL}/store/overview?userId=${userID}`, { headers })
        .then((res) => {
          setStoreOverview(res.data);
          setRecentTransactions(res.data.recentTransactions || []);
        })
        .catch((error) =>
          console.error("Error fetching store overview:", error)
        );

      // Fetch analytics data
      fetchAnalyticsData();

      // Fetch vendors data
      fetchVendorsData();

      // Fetch material requests data
      axios
        .get(`${API_URL}/material/material-requests/user/${userID}`, {
          headers,
        })
        .then((res) => setMaterialRequests(res.data || []))
        .catch((error) =>
          console.error("Error fetching material requests:", error)
        );
    }
  }, [userID]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Store Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Inventory management and logistics
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={() => setIsGRNModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Log GRN
          </Button> */}
          <Button
            onClick={() => setIsRequestModalOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Raise Request
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-6 sticky top-0 z-10 bg-background"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="warehouse">Warehouse</TabsTrigger> */}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="vehicle-tracking">Vehicle Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {overviewSubview === "main" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="Total Items"
                  value={`${storeOverview?.kpis?.totalItems || 0}`}
                  icon={Package}
                  description="All inventory items"
                  onClick={() => setOverviewSubview("totalItems")}
                />
                <StatCard
                  title="Low Stock Items"
                  value={`${storeOverview?.kpis?.lowStockItems || 0}`}
                  icon={AlertTriangle}
                  description="Need immediate attention"
                  onClick={() => setOverviewSubview("lowStock")}
                />
                <StatCard
                  title="Active Transfers"
                  value={`${storeOverview?.kpis?.activeTransfers || 0}`}
                  icon={Truck}
                  description="In transit"
                  onClick={() => setOverviewSubview("activeTransfers")}
                />
                {/* <StatCard
                  title="Total Inventory Value"
                  value={`₹${(
                    storeOverview?.kpis?.totalValue || 0
                  ).toLocaleString()}`}
                  icon={TrendingDown}
                  description="Across all locations"
                  onClick={() => setOverviewSubview("inventoryValue")}
                /> */}
              </div>

              {/* Critical Alerts */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    Critical Stock Alerts
                  </CardTitle>
                  <CardDescription>
                    Items below reorder level that need immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory
                      .filter((item) => item.quantity <= item.reorderLevel)
                      .map((item) => {
                        const stockStatus =
                          item.quantity <= item.reorderLevel * 0.5
                            ? "Critical"
                            : "Low";
                        const bgColor =
                          stockStatus === "Critical"
                            ? "bg-red-100 border-red-300"
                            : "bg-yellow-50 border-yellow-200";
                        const textColor =
                          stockStatus === "Critical"
                            ? "text-red-600"
                            : "text-yellow-600";

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 ${bgColor} border rounded-lg`}
                          >
                            <div className="flex items-center">
                              <AlertTriangle
                                className={`h-4 w-4 mr-3 ${textColor}`}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.itemName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Current: {item.quantity} {item.unit} | Reorder
                                  Level: {item.reorderLevel} {item.unit}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Location: {item.location} | Supplier:{" "}
                                  {item.primarySupplier?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge
                                variant={
                                  stockStatus === "Critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={
                                  stockStatus === "Critical"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }
                              >
                                {stockStatus}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Reorder Initiated",
                                    description: `Reorder request created for ${item.itemName}`,
                                  });
                                }}
                              >
                                Reorder
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    {inventory.filter(
                      (item) => item.quantity <= item.reorderLevel
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">
                          All Stock Levels Good
                        </p>
                        <p className="text-sm">
                          No items are below reorder level
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Material Transfers
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to transfers tab
                          const tabsList = document.querySelector('[role="tablist"]');
                          const transfersTab = tabsList?.querySelector('[value="analytics"]');
                          (transfersTab as HTMLElement)?.click();
                        }}
                      >
                        View All
                      </Button> */}
                    </CardTitle>
                    <CardDescription>
                      Latest material movements between locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transfers.slice(0, 5).map((transfer, index) => (
                        <div
                          key={transfer.id || index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                transfer.status === "DELIVERED"
                                  ? "bg-green-500"
                                  : transfer.status === "IN_TRANSIT"
                                  ? "bg-blue-500"
                                  : transfer.status === "PENDING"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {transfer.items && transfer.items.length > 0
                                    ? transfer.items
                                        .slice(0, 2)
                                        .map((item: any) => item.description)
                                        .join(", ") +
                                      (transfer.items.length > 2
                                        ? ` +${transfer.items.length - 2} more`
                                        : "")
                                    : "No items"}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {transfer.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {transfer.items?.length || 0} item(s)
                                </span>
                                <span className="text-sm text-gray-500">
                                  {transfer.fromLocation} →{" "}
                                  {transfer.toLocation}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">
                                  Transfer ID:
                                </span>{" "}
                                {transfer.transferID}
                                {transfer.items &&
                                  transfer.items.length > 0 && (
                                    <span className="ml-3">
                                      <span className="font-medium">
                                        Quantities:
                                      </span>{" "}
                                      {transfer.items
                                        .slice(0, 2)
                                        .map(
                                          (item: any) =>
                                            `${item.quantity} ${
                                              item.unit || "units"
                                            }`
                                        )
                                        .join(", ")}
                                      {transfer.items.length > 2 &&
                                        ` +${transfer.items.length - 2} more`}
                                    </span>
                                  )}
                              </p>
                              {transfer.vehicle && (
                                <p className="text-xs text-gray-400 mt-1">
                                  <span className="font-medium">Vehicle:</span>{" "}
                                  {transfer.vehicle.vehicleName}
                                  {transfer.driverName &&
                                    ` • Driver: ${transfer.driverName}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                transfer.createdAt
                              ).toLocaleDateString()}
                            </span>
                            <p className="text-xs text-gray-400">
                              {new Date(
                                transfer.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {transfers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            No Recent Transfers
                          </p>
                          <p className="text-sm">No material transfers found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader>
                    <CardTitle>Storage Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {storageUtilization.map((storage, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {storage.location}
                            </span>
                            <span>
                              {storage.utilization}% ({storage.capacity})
                            </span>
                          </div>
                          <Progress
                            value={storage.utilization}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </>
          )}
          {overviewSubview === "inventoryValue" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Total Inventory Value</h2>
                <Button
                  variant="outline"
                  onClick={() => setOverviewSubview("main")}
                >
                  Back to Overview
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold mb-1">₹45,00,000</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Total value of all inventory across all locations as of
                      today.
                    </div>
                    <div className="mb-4">
                      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              name: "Raw Materials",
                              value: 2000000,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Consumables",
                              value: 1200000,
                              fill: "#10b981",
                            },
                            {
                              name: "Tools & Equipment",
                              value: 800000,
                              fill: "#f59e0b",
                            },
                            {
                              name: "Safety Items",
                              value: 500000,
                              fill: "#ef4444",
                            },
                          ].map((cat, idx, arr) => {
                            const total = arr.reduce(
                              (sum, c) => sum + c.value,
                              0
                            );
                            return (
                              <tr key={cat.name}>
                                <td className="p-2 flex items-center gap-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.fill }}
                                  ></span>
                                  {cat.name}
                                </td>
                                <td className="p-2">
                                  ₹{cat.value.toLocaleString()}
                                </td>
                                <td className="p-2">
                                  {((cat.value / total) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Raw Materials",
                            value: 2000000,
                            fill: "#3b82f6",
                          },
                          {
                            name: "Consumables",
                            value: 1200000,
                            fill: "#10b981",
                          },
                          {
                            name: "Tools & Equipment",
                            value: 800000,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Safety Items",
                            value: 500000,
                            fill: "#ef4444",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: "Raw Materials", fill: "#3b82f6" },
                          { name: "Consumables", fill: "#10b981" },
                          { name: "Tools & Equipment", fill: "#f59e0b" },
                          { name: "Safety Items", fill: "#ef4444" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {overviewSubview === "lowStock" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Low Stock Items</h2>
                <Button
                  variant="outline"
                  onClick={() => setOverviewSubview("main")}
                >
                  Back to Overview
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {inventory
                      .filter((item) => item.quantity <= item.reorderLevel)
                      .map((item) => {
                        const stockStatus =
                          item.quantity <= item.reorderLevel * 0.5
                            ? "Critical"
                            : "Low";
                        const bgColor =
                          stockStatus === "Critical"
                            ? "bg-red-100 border-red-300"
                            : "bg-yellow-50 border-yellow-200";
                        const textColor =
                          stockStatus === "Critical"
                            ? "text-red-600"
                            : "text-yellow-600";

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 ${bgColor} border rounded-lg`}
                          >
                            <div className="flex items-center">
                              <AlertTriangle
                                className={`h-4 w-4 mr-3 ${textColor}`}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.itemName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Current: {item.quantity} {item.unit} | Reorder
                                  Level: {item.reorderLevel} {item.unit}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Location: {item.location} | Supplier:{" "}
                                  {item.primarySupplier?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge
                                variant={
                                  stockStatus === "Critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={
                                  stockStatus === "Critical"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }
                              >
                                {stockStatus}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Reorder Initiated",
                                    description: `Reorder request created for ${item.itemName}`,
                                  });
                                }}
                              >
                                Reorder
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    {inventory.filter(
                      (item) => item.quantity <= item.reorderLevel
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">
                          All Stock Levels Good
                        </p>
                        <p className="text-sm">
                          No items are below reorder level
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {overviewSubview === "activeTransfers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Active Transfers</h2>
                <Button
                  variant="outline"
                  onClick={() => setOverviewSubview("main")}
                >
                  Back to Overview
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transfers.slice(0, 5).map((transfer, index) => (
                      <div
                        key={transfer.id || index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              transfer.status === "DELIVERED"
                                ? "bg-green-500"
                                : transfer.status === "IN_TRANSIT"
                                ? "bg-blue-500"
                                : transfer.status === "PENDING"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">
                                {transfer.items && transfer.items.length > 0
                                  ? transfer.items
                                      .slice(0, 2)
                                      .map((item: any) => item.description)
                                      .join(", ") +
                                    (transfer.items.length > 2
                                      ? ` +${transfer.items.length - 2} more`
                                      : "")
                                  : "No items"}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transfer.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">
                                {transfer.items?.length || 0} item(s)
                              </span>
                              <span className="text-sm text-gray-500">
                                {transfer.fromLocation} → {transfer.toLocation}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Transfer ID:</span>{" "}
                              {transfer.transferID}
                              {transfer.items && transfer.items.length > 0 && (
                                <span className="ml-3">
                                  <span className="font-medium">
                                    Quantities:
                                  </span>{" "}
                                  {transfer.items
                                    .slice(0, 2)
                                    .map(
                                      (item: any) =>
                                        `${item.quantity} ${
                                          item.unit || "units"
                                        }`
                                    )
                                    .join(", ")}
                                  {transfer.items.length > 2 &&
                                    ` +${transfer.items.length - 2} more`}
                                </span>
                              )}
                            </p>
                            {transfer.vehicle && (
                              <p className="text-xs text-gray-400 mt-1">
                                <span className="font-medium">Vehicle:</span>{" "}
                                {transfer.vehicle.vehicleName}
                                {transfer.driverName &&
                                  ` • Driver: ${transfer.driverName}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </span>
                          <p className="text-xs text-gray-400">
                            {new Date(transfer.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {transfers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          No Recent Transfers
                        </p>
                        <p className="text-sm">No material transfers found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {overviewSubview === "totalItems" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">All Inventory Items</h2>
                <Button
                  variant="outline"
                  onClick={() => setOverviewSubview("main")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {inventory.length > 0 ? (
                      inventory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-3 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.itemName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} {item.unit} |
                                Location: {item.location}
                              </p>
                              <p className="text-xs text-gray-500">
                                Category: {item.category} | Reorder Level:{" "}
                                {item.reorderLevel} {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge
                              variant={
                                item.quantity <= item.reorderLevel
                                  ? "destructive"
                                  : "default"
                              }
                              className={
                                item.quantity <= item.reorderLevel
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }
                            >
                              {item.quantity <= item.reorderLevel
                                ? "Low Stock"
                                : "In Stock"}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ₹
                                {(
                                  Number(item.unitCost) * item.quantity
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                Total Value
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          No Inventory Items
                        </p>
                        <p className="text-sm">No items found in inventory</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          {inventorySubview === "main" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Low Stock Items"
                  value="24"
                  icon={AlertTriangle}
                  description="Below reorder level"
                  onClick={() => setInventorySubview("lowStock")}
                />
                <StatCard
                  title="Total Items"
                  value="1,247"
                  icon={Package}
                  description="In inventory"
                  onClick={() => setInventorySubview("totalItems")}
                />
                <StatCard
                  title="Value"
                  value="₹12.5M"
                  icon={Package}
                  description="Total inventory value"
                  onClick={() => setInventorySubview("value")}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Category Overview</CardTitle>
                  <CardDescription>
                    Inventory status by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="inStock" fill="#10b981" />
                      <Bar dataKey="lowStock" fill="#f59e0b" />
                      <Bar dataKey="outOfStock" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Alerts</CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        item: "Steel TMT Bars",
                        category: "Raw Material",
                        issue: "Low Stock",
                        level: "High",
                        action: "Reorder",
                      },
                      {
                        item: "Safety Helmets",
                        category: "Safety",
                        issue: "Expiring Soon",
                        level: "Medium",
                        action: "Use First",
                      },
                      {
                        item: "Electrical Wire",
                        category: "Electrical",
                        issue: "High Usage",
                        level: "Low",
                        action: "Monitor",
                      },
                    ].map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{alert.item}</h3>
                          <p className="text-sm text-muted-foreground">
                            {alert.category} • {alert.issue}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              alert.level === "High"
                                ? "destructive"
                                : alert.level === "Medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {alert.level}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() =>
                              toast({
                                title: `${alert.action} action for ${alert.item}`,
                              })
                            }
                          >
                            {alert.action}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Site Inventory</CardTitle>
                    <CardDescription>
                      Current stock levels across locations
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsIssueModalOpen(true)}
                    className="gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Issue to Site
                  </Button>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={[
                      ...inventoryColumns,
                      {
                        id: "actions",
                        header: "Actions",
                        cell: ({ row }) => (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(row.original);
                                setIsTransferStockModalOpen(true);
                              }}
                            >
                              Transfer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(row.original);
                                setIsUpdateStockModalOpen(true);
                              }}
                            >
                              Update Stock
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={inventoryItems}
                    searchKey="name"
                  />
                </CardContent>
              </Card>
            </div>
          )}
          {inventorySubview === "lowStock" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Low Stock Items</h2>
                <Button
                  variant="outline"
                  onClick={() => setInventorySubview("main")}
                >
                  Back to Inventory
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {inventory
                      .filter(
                        (item) =>
                          item.status === "Critical" || item.status === "Low"
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.item}
                              </p>
                              <p className="text-sm text-gray-600">
                                Current: {item.quantity} {item.unit} | Min:{" "}
                                {item.minStock} {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(item)}
                              disabled={item.status === "Reordered"}
                            >
                              {item.status === "Reordered"
                                ? "Reordered"
                                : "Reorder"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {inventorySubview === "totalItems" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Total Items</h2>
                <Button
                  variant="outline"
                  onClick={() => setInventorySubview("main")}
                >
                  Back to Inventory
                </Button>
              </div>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="mb-4 text-lg">
                    Total number of unique inventory items:{" "}
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    This includes all SKUs and item types across all warehouses
                    and sites. Below is a breakdown by category and by site.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">By Category</h3>
                      <ul className="list-disc pl-6">
                        <li>Raw Materials: 520 items</li>
                        <li>Consumables: 320 items</li>
                        <li>Tools & Equipment: 210 items</li>
                        <li>Safety Items: 197 items</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">By Site</h3>
                      <ul className="list-disc pl-6">
                        <li>Warehouse A: 420 items</li>
                        <li>Warehouse B: 310 items</li>
                        <li>Yard 1: 280 items</li>
                        <li>Yard 2: 237 items</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Card className="shadow-none border border-muted-foreground/10">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between px-6 pt-6 pb-2">
                          <div>
                            <h3 className="font-semibold text-base">
                              Site Inventory
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Current stock levels across locations
                            </p>
                          </div>
                          <Button
                            onClick={() => setIsIssueModalOpen(true)}
                            className="gap-2"
                            size="sm"
                          >
                            <Truck className="h-4 w-4" />
                            Issue to Site
                          </Button>
                        </div>
                        <div className="px-6 pb-6">
                          <DataTable
                            columns={[
                              ...inventoryColumns,
                              {
                                id: "actions",
                                header: "Actions",
                                cell: ({ row }) => (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedItem(row.original);
                                        setIsTransferStockModalOpen(true);
                                      }}
                                    >
                                      Transfer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedItem(row.original);
                                        setIsUpdateStockModalOpen(true);
                                      }}
                                    >
                                      Update Stock
                                    </Button>
                                  </div>
                                ),
                              },
                            ]}
                            data={inventoryItems}
                            searchKey="name"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {inventorySubview === "value" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Inventory Value</h2>
                <Button
                  variant="outline"
                  onClick={() => setInventorySubview("main")}
                >
                  Back to Inventory
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold mb-1">₹12,50,000</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Total value of all inventory as of today.
                    </div>
                    <div className="mb-4">
                      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              name: "Raw Materials",
                              value: 500000,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Consumables",
                              value: 350000,
                              fill: "#10b981",
                            },
                            {
                              name: "Tools & Equipment",
                              value: 250000,
                              fill: "#f59e0b",
                            },
                            {
                              name: "Safety Items",
                              value: 150000,
                              fill: "#ef4444",
                            },
                          ].map((cat, idx, arr) => {
                            const total = arr.reduce(
                              (sum, c) => sum + c.value,
                              0
                            );
                            return (
                              <tr key={cat.name}>
                                <td className="p-2 flex items-center gap-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.fill }}
                                  ></span>
                                  {cat.name}
                                </td>
                                <td className="p-2">
                                  ₹{cat.value.toLocaleString()}
                                </td>
                                <td className="p-2">
                                  {((cat.value / total) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Raw Materials",
                            value: 500000,
                            fill: "#3b82f6",
                          },
                          {
                            name: "Consumables",
                            value: 350000,
                            fill: "#10b981",
                          },
                          {
                            name: "Tools & Equipment",
                            value: 250000,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Safety Items",
                            value: 150000,
                            fill: "#ef4444",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: "Raw Materials", fill: "#3b82f6" },
                          { name: "Consumables", fill: "#10b981" },
                          { name: "Tools & Equipment", fill: "#f59e0b" },
                          { name: "Safety Items", fill: "#ef4444" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers">
          {transferSubview === "main" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Active Transfers"
                  value={transfers
                    .filter((t: any) => t.status === "IN_TRANSIT")
                    .length.toString()}
                  icon={Truck}
                  description="Currently in transit"
                  onClick={() => setTransferSubview("active")}
                />
                <StatCard
                  title="Completed Today"
                  value={transfers
                    .filter(
                      (t: any) =>
                        t.status === "DELIVERED" &&
                        new Date(t.createdAt).toDateString() ===
                          new Date().toDateString()
                    )
                    .length.toString()}
                  icon={CheckCircle}
                  description="Successfully delivered"
                  onClick={() => setTransferSubview("completed")}
                />
                <StatCard
                  title="Pending Approval"
                  value={transfers
                    .filter((t: any) => t.status === "PENDING")
                    .length.toString()}
                  icon={Clock}
                  description="Awaiting authorization"
                  onClick={() => setTransferSubview("pending")}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Status Distribution</CardTitle>
                  <CardDescription>
                    Current transfer status overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getTransferStats()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getTransferStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {getTransferStats().map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          ></div>
                          <span>
                            {item.name}: {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Timeline</CardTitle>
                  <CardDescription>Recent transfer activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "TR001",
                        status: "Delivered",
                        time: "2 hours ago",
                        from: "Warehouse A",
                        to: "Site 1",
                      },
                      {
                        id: "TR002",
                        status: "In Transit",
                        time: "4 hours ago",
                        from: "Site 2",
                        to: "Central",
                      },
                      {
                        id: "TR003",
                        status: "Packed",
                        time: "6 hours ago",
                        from: "Warehouse B",
                        to: "Site 3",
                      },
                      {
                        id: "TR004",
                        status: "Requested",
                        time: "8 hours ago",
                        from: "Site 1",
                        to: "Warehouse A",
                      },
                    ].map((transfer) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{transfer.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transfer.from} → {transfer.to}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{transfer.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {transfer.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Material Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={transferColumns}
                    data={transfers}
                    searchKey="items"
                  />
                </CardContent>
              </Card>
            </div>
          )}
          {transferSubview === "active" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Active Transfers</h2>
                <Button
                  variant="outline"
                  onClick={() => setTransferSubview("main")}
                >
                  Back to Transfers
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transfers
                      .filter((t) => t.status === "In Transit")
                      .map((transfer) => (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{transfer.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {transfer.items} | {transfer.from} → {transfer.to}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{transfer.status}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {transferSubview === "completed" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Completed Transfers</h2>
                <Button
                  variant="outline"
                  onClick={() => setTransferSubview("main")}
                >
                  Back to Transfers
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transfers
                      .filter((t) => t.status === "Completed")
                      .map((transfer) => (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{transfer.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {transfer.items} | {transfer.from} → {transfer.to}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">{transfer.status}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {transferSubview === "pending" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Pending Transfers</h2>
                <Button
                  variant="outline"
                  onClick={() => setTransferSubview("main")}
                >
                  Back to Transfers
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transfers
                      .filter((t) => t.status === "Pending")
                      .map((transfer) => (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{transfer.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {transfer.items} | {transfer.from} → {transfer.to}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{transfer.status}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="procurement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {request.item}
                        </h4>
                        <Badge
                          variant={
                            request.urgency === "High"
                              ? "destructive"
                              : request.urgency === "Medium"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {request.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Project: {request.project}
                      </p>
                      <p className="text-sm text-gray-600">
                        Requested by: {request.requestedBy}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        {request.status === "Pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveRequest(request)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGetQuote(request)}
                            >
                              Get Quote
                            </Button>
                          </>
                        ) : (
                          <Badge variant="default">{request.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      vendor: "ABC Materials",
                      rating: 4.8,
                      deliveries: 24,
                      onTime: 96,
                    },
                    {
                      vendor: "XYZ Suppliers",
                      rating: 4.6,
                      deliveries: 18,
                      onTime: 89,
                    },
                    {
                      vendor: "BuildCorp",
                      rating: 4.2,
                      deliveries: 32,
                      onTime: 78,
                    },
                  ].map((vendor, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">
                          {vendor.vendor}
                        </h4>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-yellow-600 mr-1">
                            ★
                          </span>
                          <span className="text-sm font-semibold">
                            {vendor.rating}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Deliveries</p>
                          <p className="font-medium">{vendor.deliveries}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">On-time %</p>
                          <p className="font-medium">{vendor.onTime}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warehouse">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Capacity"
                value="85%"
                icon={Warehouse}
                description="Warehouse utilization"
                onClick={() =>
                  toast({
                    title: "Viewing capacity details",
                  })
                }
              />
              <StatCard
                title="AMC Due Items"
                value="12"
                icon={AlertTriangle}
                description="Maintenance required"
                onClick={() =>
                  toast({
                    title: "Viewing AMC schedule",
                  })
                }
              />
              <StatCard
                title="Asset Value"
                value="₹45M"
                icon={Package}
                description="Total asset value"
                onClick={() =>
                  toast({
                    title: "Viewing asset register",
                  })
                }
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Central Warehouse Management</CardTitle>
                <CardDescription>Asset and inventory oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">
                      Stock by Site Distribution
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          site: "Site 1 - Villa Complex",
                          percentage: 35,
                          value: "₹4.2M",
                        },
                        {
                          site: "Site 2 - Commercial Tower",
                          percentage: 28,
                          value: "₹3.5M",
                        },
                        {
                          site: "Site 3 - Apartments",
                          percentage: 22,
                          value: "₹2.8M",
                        },
                        {
                          site: "Central Warehouse",
                          percentage: 15,
                          value: "₹1.8M",
                        },
                      ].map((site) => (
                        <div
                          key={site.site}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{site.site}</h4>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${site.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-semibold">
                              {site.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {site.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">
                      Asset Maintenance Schedule
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          vehicle: "Excavator JCB-001",
                          last: "2024-01-15",
                          next: "2024-04-15",
                          status: "Scheduled",
                          vendor: "Mech Services",
                        },
                        {
                          vehicle: "Crane CR-002",
                          last: "2024-01-10",
                          next: "2024-04-10",
                          status: "Overdue",
                          vendor: "Crane Care",
                        },
                        {
                          vehicle: "Mixer MX-003",
                          last: "2024-01-08",
                          next: "2024-04-08",
                          status: "Scheduled",
                          vendor: "Equipment Pro",
                        },
                      ].map((asset) => (
                        <div
                          key={asset.vehicle}
                          className="p-3 border rounded-lg"
                        >
                          <h4 className="font-medium text-sm">
                            {asset.vehicle}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Vendor: {asset.vendor}
                          </p>
                          <div className="flex justify-between mt-2 text-xs">
                            <span>Last: {asset.last}</span>
                            <span>Next: {asset.next}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedAsset(asset as MaintenanceSchedule);
                              setIsMaintenanceModalOpen(true);
                            }}
                          >
                            Schedule Maintenance
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {analyticsSubview === "main" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Monthly Spend"
                  value={`₹${(
                    costAnalysis?.avgMonthlySpend || 0
                  ).toLocaleString()}`}
                  icon={BarChart3}
                  description="Average monthly spending"
                  onClick={() => setAnalyticsSubview("spend")}
                />
                {/* <StatCard
                  title="Total Consumption"
                  value={`${inventoryTurnover?.totalConsumption || 0}`}
                  icon={TrendingDown}
                  description="Last 6 months"
                  onClick={() => setAnalyticsSubview("turnover")}
                /> */}
                <StatCard
                  title="Total Suppliers"
                  value={`${vendors.length}`}
                  icon={Truck}
                  description="Active vendors"
                  onClick={() => setAnalyticsSubview("suppliers")}
                />
                <StatCard
                  title="Total Requests"
                  value={`${materialRequests.length}`}
                  icon={Clock}
                  description="Material requests"
                  onClick={() => setAnalyticsSubview("requests")}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* <Card>
                  <CardHeader>
                    <CardTitle>Monthly Consumption Trend</CardTitle>
                    <CardDescription>
                      Value of materials consumed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { month: "Sep", value: 2800000 },
                          { month: "Oct", value: 3200000 },
                          { month: "Nov", value: 2900000 },
                          { month: "Dec", value: 3500000 },
                          { month: "Jan", value: 3100000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card> */}

                <Card>
                  <CardHeader>
                    <CardTitle>Category-wise Analysis</CardTitle>
                    <CardDescription>
                      Inventory quantities by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Get dynamic category data
                      const categoryData = getCategoryWiseAnalysis();

                      // If no real data, use sample data
                      const defaultData = [
                        { name: "Raw Materials", value: 150, fill: "#3b82f6" },
                        { name: "Consumables", value: 120, fill: "#10b981" },
                        {
                          name: "Tools & Equipment",
                          value: 80,
                          fill: "#f59e0b",
                        },
                        { name: "Safety Items", value: 45, fill: "#ef4444" },
                        { name: "Electrical", value: 35, fill: "#8b5cf6" },
                      ];

                      const displayData = categoryData;
                      const isRealData = categoryData.length > 0;

                      return (
                        <div className="space-y-4">
                          {/* Data status */}
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={displayData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {displayData.map((entry: any, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any) => [
                                  `${value} items`,
                                  "Quantity",
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="grid grid-cols-2 gap-4">
                            {displayData.map((item: any) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
                                  style={{ backgroundColor: item.fill }}
                                ></div>
                                <span className="text-sm font-medium">
                                  {item.name
                                    .replace(/_/g, " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase()
                                    )}
                                  : {" "}
                                  <span className="font-normal">
                                    {item.value} items
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* <Card>
                <CardHeader>
                  <CardTitle>Inventory KPI Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        metric: "Stock Accuracy",
                        value: "98.5%",
                        trend: "+0.5%",
                        status: "positive",
                      },
                      {
                        metric: "Order Fill Rate",
                        value: "94.2%",
                        trend: "-1.2%",
                        status: "negative",
                      },
                      {
                        metric: "Inventory to Sales",
                        value: "2.4x",
                        trend: "0.0",
                        status: "neutral",
                      },
                      {
                        metric: "Storage Utilization",
                        value: "82%",
                        trend: "+5%",
                        status: "positive",
                      },
                    ].map((kpi) => (
                      <div key={kpi.metric} className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">{kpi.metric}</p>
                        <div className="flex items-end gap-2 mt-1">
                          <span className="text-2xl font-semibold">
                            {kpi.value}
                          </span>
                          <span
                            className={`text-sm ${
                              kpi.status === "positive"
                                ? "text-green-600"
                                : kpi.status === "negative"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {kpi.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          )}
          {analyticsSubview === "spend" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Monthly Spend</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 text-lg">
                    Total spend this month:{" "}
                    <span className="font-bold">₹32,50,000</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    This is a 12% increase compared to last month. The chart
                    below shows the monthly spend trend.
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { month: "Sep", value: 2800000 },
                        { month: "Oct", value: 3200000 },
                        { month: "Nov", value: 2900000 },
                        { month: "Dec", value: 3500000 },
                        { month: "Jan", value: 3100000 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {analyticsSubview === "turnover" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Stock Turnover</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 text-lg">
                    Current stock turnover ratio:{" "}
                    <span className="font-bold">4.2x</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    This ratio represents how many times inventory is sold and
                    replaced over the last 30 days.
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: "Sep", turnover: 3.8 },
                        { month: "Oct", turnover: 4.1 },
                        { month: "Nov", turnover: 4.0 },
                        { month: "Dec", turnover: 4.3 },
                        { month: "Jan", turnover: 4.2 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="turnover"
                        stroke="#6366f1"
                        name="Turnover Ratio"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {analyticsSubview === "deadStock" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Dead Stock</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>
              <Card>
                <CardContent className="p-6 space-y-8">
                  <div className="mb-2">
                    <div className="text-2xl font-bold mb-1">₹8,20,000</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Total value of dead stock (no movement {">"} 90 days)
                      across all locations.
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Breakdown by Item</h3>
                      <table className="min-w-full text-sm border rounded-lg overflow-hidden mb-4">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Item</th>
                            <th className="p-2 text-left">Location</th>
                            <th className="p-2 text-left">Qty</th>
                            <th className="p-2 text-left">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              item: "Cement Bags",
                              location: "Warehouse B",
                              qty: 120,
                              value: 120000,
                              fill: "#3b82f6",
                            },
                            {
                              item: "Old Paint Stock",
                              location: "Yard 2",
                              qty: 40,
                              value: 40000,
                              fill: "#10b981",
                            },
                            {
                              item: "Obsolete Tools",
                              location: "Warehouse A",
                              qty: 15,
                              value: 15000,
                              fill: "#f59e0b",
                            },
                            {
                              item: "Expired Safety Helmets",
                              location: "Warehouse B",
                              qty: 30,
                              value: 30000,
                              fill: "#ef4444",
                            },
                            {
                              item: "Unused Steel Rods",
                              location: "Yard 1",
                              qty: 10,
                              value: 20000,
                              fill: "#6366f1",
                            },
                          ].map((row) => (
                            <tr key={row.item + row.location}>
                              <td className="p-2 flex items-center gap-2">
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{ backgroundColor: row.fill }}
                                ></span>
                                {row.item}
                              </td>
                              <td className="p-2">{row.location}</td>
                              <td className="p-2">{row.qty}</td>
                              <td className="p-2">
                                ₹{row.value.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Dead Stock Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Cement Bags",
                                value: 120000,
                                fill: "#3b82f6",
                              },
                              {
                                name: "Old Paint Stock",
                                value: 40000,
                                fill: "#10b981",
                              },
                              {
                                name: "Obsolete Tools",
                                value: 15000,
                                fill: "#f59e0b",
                              },
                              {
                                name: "Expired Safety Helmets",
                                value: 30000,
                                fill: "#ef4444",
                              },
                              {
                                name: "Unused Steel Rods",
                                value: 20000,
                                fill: "#6366f1",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {[
                              { name: "Cement Bags", fill: "#3b82f6" },
                              { name: "Old Paint Stock", fill: "#10b981" },
                              { name: "Obsolete Tools", fill: "#f59e0b" },
                              {
                                name: "Expired Safety Helmets",
                                fill: "#ef4444",
                              },
                              { name: "Unused Steel Rods", fill: "#6366f1" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {[
                          {
                            name: "Cement Bags",
                            value: "₹1.2L",
                            fill: "#3b82f6",
                          },
                          {
                            name: "Old Paint Stock",
                            value: "₹0.4L",
                            fill: "#10b981",
                          },
                          {
                            name: "Obsolete Tools",
                            value: "₹0.15L",
                            fill: "#f59e0b",
                          },
                          {
                            name: "Expired Safety Helmets",
                            value: "₹0.3L",
                            fill: "#ef4444",
                          },
                          {
                            name: "Unused Steel Rods",
                            value: "₹0.2L",
                            fill: "#6366f1",
                          },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            ></div>
                            <span className="text-sm">
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {analyticsSubview === "leadTime" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Average Lead Time</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 text-lg">
                    Current average lead time:{" "}
                    <span className="font-bold">12 days</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Lead time is the average duration from order placement to
                    delivery. The chart below shows the trend over recent
                    months.
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: "Sep", lead: 14 },
                        { month: "Oct", lead: 13 },
                        { month: "Nov", lead: 12 },
                        { month: "Dec", lead: 11 },
                        { month: "Jan", lead: 12 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="lead"
                        stroke="#0ea5e9"
                        name="Lead Time (days)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {analyticsSubview === "suppliers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Total Suppliers</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Total active vendors/suppliers in the system.
                    </div>
                  </div>

                  {vendors.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-2">Vendor Details</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-3 text-left">Vendor Name</th>
                              <th className="p-3 text-left">GSTIN</th>
                              <th className="p-3 text-left">Type</th>
                              <th className="p-3 text-left">Phone</th>
                              <th className="p-3 text-left">Email</th>
                              <th className="p-3 text-left">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendors.map((vendor, idx) => (
                              <tr
                                key={vendor.id || idx}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="p-3 font-medium">
                                  {vendor.name || "N/A"}
                                </td>
                                <td className="p-3">
                                  {vendor.gstin ? (
                                    <span className="text-xs font-mono">
                                      {vendor.gstin}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      Not provided
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline">
                                    {vendor.vendorType || "COMPANY"}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {vendor.mobile || "N/A"}
                                </td>
                                <td className="p-3">{vendor.email || "N/A"}</td>
                                <td className="p-3">
                                  {vendor.location ||
                                    (vendor.city && vendor.state
                                      ? `${vendor.city}, ${vendor.state}`
                                      : vendor.addressLine1
                                      ? vendor.addressLine1
                                      : "N/A")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No vendors found. Add vendors to see them here.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {analyticsSubview === "requests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Material Transfers & Requests
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalyticsSubview("main")}
                >
                  Back to Analytics
                </Button>
              </div>

              {/* Material Requests Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Material Requests</CardTitle>
                  <CardDescription>
                    Material requisition requests from sites
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {materialRequests.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-2">Request Details</h3>

                      {/* Status Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {getMaterialRequestStats().map((item) => (
                          <div
                            key={item.status}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${item.color}`}
                              ></div>
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </div>
                            <div className="text-2xl font-bold">
                              {item.count}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-3 text-left">Transfer ID</th>
                              <th className="p-3 text-left">Site</th>
                              <th className="p-3 text-left">Priority</th>
                              <th className="p-3 text-left">Status</th>
                              <th className="p-3 text-left">Created Date</th>
                              <th className="p-3 text-left">Required By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materialRequests.map((request, idx) => (
                              <tr
                                key={request.id || idx}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="p-3 font-medium">
                                  {request.requestNumber}
                                </td>
                                <td className="p-3">
                                  {request.site?.name ||
                                    request.targetWarehouse ||
                                    "N/A"}
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      request.priority === "HIGH"
                                        ? "destructive"
                                        : request.priority === "MEDIUM"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {request.priority || "MEDIUM"}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      request.status === "APPROVED" ||
                                      request.status === "COMPLETED"
                                        ? "default"
                                        : request.status === "PENDING"
                                        ? "outline"
                                        : "destructive"
                                    }
                                  >
                                    {request.status || "PENDING"}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {request.createdAt
                                    ? new Date(
                                        request.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td className="p-3">
                                  {request.requiredBy
                                    ? new Date(
                                        request.requiredBy
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No material requests found. Create material requests to
                      see them here.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicle-tracking" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-between items-center mr-4">
            {/* <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem
                    key={type.toLowerCase()}
                    value={type.toLowerCase()}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleSite} onValueChange={setVehicleSite}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Project Site" />
              </SelectTrigger>
              <SelectContent>
                {projectSites.map((site) => (
                  <SelectItem
                    key={site.toLowerCase()}
                    value={site.toLowerCase()}
                  >
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem
                    key={status.toLowerCase()}
                    value={status.toLowerCase()}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <h1 className="text-2xl font-semibold ml-4">Vehicle Status</h1>
            <Button onClick={() => setShowAddVehicleModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Vehicle
            </Button>
            {/* <div className="ml-auto">
              <Badge variant="outline">
                RFID/GPS Sync:{" "}
                <span className="text-green-600 ml-1">Active</span>
              </Badge>
            </div> */}
          </div>
          {vehicleSubview === "main" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Total Active Vehicles"
                  value={(
                    vehicleKpis?.vehiclesByStatus?.find(
                      (status: any) => status.status === "ACTIVE"
                    )?._count?._all || "0"
                  ).toString()}
                  icon={Truck}
                  description="Currently operational"
                  onClick={() => setVehicleSubview("active")}
                />
                <StatCard
                  title="Idle Vehicles"
                  value={
                    (vehicleKpis as any)?.vehiclesByStatus
                      ?.find((status: any) => status.status === "IDLE")
                      ?._count._all?.toString() || "0"
                  }
                  icon={PauseCircle}
                  description="Currently not in use"
                  onClick={() => setVehicleSubview("idle")}
                />
                <StatCard
                  title="Under Maintenance"
                  value={
                    (vehicleKpis as any)?.vehiclesByStatus
                      ?.find((status: any) => status.status === "MAINTENANCE")
                      ?._count._all?.toString() || "0"
                  }
                  icon={AlertTriangle}
                  description="Currently in workshop"
                  onClick={() => setVehicleSubview("maintenance")}
                />
              </div>
              {/* All original vehicle tracking tab content below */}
              {/* Vehicle Movement Logs Table */}
              <VehicleMovementLogsTable
                vehicleMovementLogs={vehicleMovementLogs}
                onRefresh={() =>
                  fetchVehicleData({
                    vehicleType,
                    assignedSite: vehicleSite,
                    status: vehicleStatus,
                  })
                }
              />
              {/* Maintenance Schedule & History Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Maintenance Schedule & History</CardTitle>
                  </div>
                  {/* <Button
                    onClick={() => handleAddMaintenance('')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Maintenance
                  </Button> */}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 text-left">Vehicle</th>
                          <th className="p-2 text-left">Last Serviced</th>
                          <th className="p-2 text-left">Next Due</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceSchedules.map((row, idx) => (
                          <tr key={row.id || idx} className="border-b">
                            <td className="p-2">
                              {row.Vehicle?.vehicleName || "N/A"}
                            </td>
                            <td className="p-2">
                              {new Date(row.lastServiced).toLocaleDateString()}
                            </td>
                            <td className="p-2">
                              {new Date(row.nextDue).toLocaleDateString()}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  row.status === "MAINTENANCE"
                                    ? "destructive"
                                    : row.status === "ACTIVE"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {row.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditMaintenance(row)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteMaintenance(row.id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {maintenanceSchedules.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-4 text-center text-muted-foreground"
                            >
                              No maintenance schedules found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {vehicleSubview === "active" && (
            <ActiveVehiclesView
              onBack={() => setVehicleSubview("main")}
              totalActiveCount={(vehicleKpis as any)?.totalVehicles || 0}
              userId={userID}
            />
          )}
          {vehicleSubview === "idle" && (
            <IdleVehiclesView
              onBack={() => setVehicleSubview("main")}
              totalIdleCount={
                (vehicleKpis as any)?.vehiclesByStatus?.find(
                  (status: any) => status.status === "IDLE"
                )?._count._all || 0
              }
              userId={userID}
            />
          )}
          {vehicleSubview === "maintenance" && (
            <MaintenanceVehiclesView
              onBack={() => setVehicleSubview("main")}
              totalMaintenanceCount={
                (vehicleKpis as any)?.vehiclesByStatus?.find(
                  (status: any) => status.status === "MAINTENANCE"
                )?._count._all || 0
              }
              userId={userID}
            />
          )}
          {vehicleSubview === "onSite" && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-xl">Vehicles on Site</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setVehicleSubview("main")}
                >
                  Back to Vehicle Tracking
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pl-4">
                <div className="mb-4 text-lg">
                  There are <span className="font-bold">12</span> vehicles
                  currently deployed at project sites.
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  See the list of vehicles and their assigned sites below.
                </div>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2 pt-2">
                    <CardTitle className="text-base">
                      Site-wise Vehicle Deployment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Vehicle</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Site</th>
                          <th className="px-4 py-2 text-left">Utilization</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topVehicles.map((v, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-2 font-medium">
                              {v.vehicle}
                            </td>
                            <td className="px-4 py-2">
                              <Badge variant="outline">
                                {v.vehicle.includes("Truck")
                                  ? "Truck"
                                  : v.vehicle.includes("Excavator")
                                  ? "Excavator"
                                  : v.vehicle.includes("Crane")
                                  ? "Crane"
                                  : "Other"}
                              </Badge>
                            </td>
                            <td className="px-4 py-2">{v.site}</td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  v.utilization > 85
                                    ? "default"
                                    : v.utilization > 80
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {v.utilization}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
          {vehicleSubview === "maintenance" && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-xl">Under Maintenance</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setVehicleSubview("main")}
                >
                  Back to Vehicle Tracking
                </Button>
              </CardHeader>
              <CardContent className="space-y-8 pl-4">
                <div className="mb-4 text-lg">
                  There are <span className="font-bold">3</span> vehicles
                  currently under maintenance.
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  See the maintenance schedule and costliest recent repairs
                  below.
                </div>
                <Card className="bg-muted/50 mb-6">
                  <CardHeader className="pb-2 pt-2">
                    <CardTitle className="text-base">
                      Maintenance Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Vehicle</th>
                          <th className="px-4 py-2 text-left">Last Serviced</th>
                          <th className="px-4 py-2 text-left">Next Due</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceSchedules.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-2 font-medium">
                              {row.vehicle}
                            </td>
                            <td className="px-4 py-2">{row.last}</td>
                            <td className="px-4 py-2">{row.next}</td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  row.status === "Overdue"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {row.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2 pt-2">
                    <CardTitle className="text-base">
                      Most Costly Recent Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Vehicle</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Cost</th>
                          <th className="px-4 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costlyMaintenance.map((m, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-2 font-medium">
                              {m.vehicle}
                            </td>
                            <td className="px-4 py-2">{m.date}</td>
                            <td className="px-4 py-2">
                              ₹{m.cost.toLocaleString()}
                            </td>
                            <td className="px-4 py-2">{m.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* GRN Modal */}
      <Dialog open={isGRNModalOpen} onOpenChange={setIsGRNModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New GRN</DialogTitle>
            <DialogDescription>
              Record goods receipt and verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steel-suppliers">
                    Steel Suppliers Ltd
                  </SelectItem>
                  <SelectItem value="cement-corp">Cement Corp</SelectItem>
                  <SelectItem value="paint-supplies">Paint Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="po">Purchase Order</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PO-001">
                    PO-001 - Steel Materials
                  </SelectItem>
                  <SelectItem value="PO-002">PO-002 - Cement Bags</SelectItem>
                  <SelectItem value="PO-003">PO-003 - Paint Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="photos">Upload Photos</Label>
              <Input id="photos" type="file" multiple accept="image/*" />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsGRNModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleLogGRN}>Save GRN</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Purchase Request</DialogTitle>
            <DialogDescription>
              Create new purchase request for materials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="site">Site</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site-1">Site 1 - Villa Complex</SelectItem>
                  <SelectItem value="site-2">
                    Site 2 - Commercial Tower
                  </SelectItem>
                  <SelectItem value="site-3">Site 3 - Apartments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRaiseRequest}>Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Approval Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transfer Request</DialogTitle>
            <DialogDescription>
              Review and approve material transfer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transfer Details</Label>
              <div className="p-3 border rounded-lg bg-muted">
                <p className="text-sm">
                  TR001 - Steel Rods from Warehouse A to Site 1
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested by: Site Manager
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTransferModalOpen(false)}
              >
                Reject
              </Button>
              <Button onClick={handleTransferApproval}>Approve Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue to Site Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Issue to Site Team</DialogTitle>
            <DialogDescription>Issue materials to site team</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueToSite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteTeam">Site Team</Label>
                <Select name="siteTeam" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team-a">Site Team A</SelectItem>
                    <SelectItem value="team-b">Site Team B</SelectItem>
                    <SelectItem value="team-c">Site Team C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Issue Reason</Label>
                <Select name="reason" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">
                      Construction Work
                    </SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="repair">Repair Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Items to Issue</Label>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                  <div>Item Name</div>
                  <div>Category</div>
                  <div>Available Quantity</div>
                  <div>Select</div>
                </div>
                <div className="space-y-2">
                  {inventoryItems.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-4 gap-4 items-center text-sm"
                    >
                      <div>{item.name}</div>
                      <div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <div>
                        {item.quantity} {item.unit}
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          name="selectedItems"
                          value={item.name}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Issue Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity to issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsIssueModalOpen(false);
                  setSelectedItemForIssue(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Issue Items</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Stock Modal */}
      <Dialog
        open={isUpdateStockModalOpen}
        onOpenChange={setIsUpdateStockModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-quantity">Current Quantity</Label>
              <Input
                id="current-quantity"
                value={selectedItem?.quantity || 0}
                disabled
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">New Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                defaultValue={selectedItem?.quantity || 0}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUpdateStockModalOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Modal */}
      <Dialog
        open={isTransferStockModalOpen}
        onOpenChange={setIsTransferStockModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Transfer {selectedItem?.name} to another location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromLocation">From Location</Label>
              <Input
                id="fromLocation"
                value={selectedItem?.location || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toLocation">To Location</Label>
              <Select name="toLocation" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                  <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                  <SelectItem value="Site 1">Site 1</SelectItem>
                  <SelectItem value="Site 2">Site 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentQuantity">Available Quantity</Label>
              <Input
                id="currentQuantity"
                value={`${selectedItem?.quantity || 0} ${
                  selectedItem?.unit || ""
                }`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Transfer Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 0}
                required
                defaultValue="1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTransferStockModalOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Transfer Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <AddVehicleModal
          onClose={() => setShowAddVehicleModal(false)}
          onAdd={handleAddVehicle}
          onSuccess={fetchVehicleData}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <MaintenanceModal
          onClose={() => setShowMaintenanceModal(false)}
          onSuccess={fetchVehicleData}
          maintenance={selectedMaintenance}
          mode={maintenanceModalMode}
          vehicleId={selectedVehicleForMaintenance}
        />
      )}

      {/* Schedule Maintenance Modal */}
      <Dialog
        open={isMaintenanceModalOpen}
        onOpenChange={setIsMaintenanceModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule maintenance for {selectedAsset?.vehicle}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleMaintenance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceDate">Maintenance Date</Label>
              <Input
                id="maintenanceDate"
                name="maintenanceDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Maintenance Vendor</Label>
              <Select name="vendor" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mech-services">Mech Services</SelectItem>
                  <SelectItem value="crane-care">Crane Care</SelectItem>
                  <SelectItem value="equipment-pro">Equipment Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Maintenance Notes</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Add any specific maintenance instructions or notes"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMaintenanceModalOpen(false);
                  setSelectedAsset(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreDashboard;
