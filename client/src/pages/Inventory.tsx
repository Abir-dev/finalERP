import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryData } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import {
  Download,
  FilterIcon,
  Map,
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Truck,
  Warehouse,
  Calendar,
  Users,
  CheckCircle,
  Check,
  Pencil,
  Trash,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { InteractiveChart } from "@/components/interactive-chart";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import MaterialTransferModal from "@/components/modals/MaterialTransferModal";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { GanttChart } from "@/components/project-management/gantt-chart";
import { MaterialForecast } from "@/components/project-management/material-forecast";
import { IssueReportingFunctional } from "@/components/project-management/issue-reporting-functional";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import type { InventoryItem as InventoryItemType } from "@/types/dummy-data-types";
import { useUser } from "@/contexts/UserContext";
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Add backend state
// const [inventoryTrends, setInventoryTrends] = useState([]);
// const [warehouseUtilization, setWarehouseUtilization] = useState([]);
// const [grnData, setGrnData] = useState([]);
// const [transferData, setTransferData] = useState([]);
// const [tasks, setTasks] = useState([]);

// Add the form schema
const addItemFormSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  category: z.array(z.string()).min(1, "Please select at least one category"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  unit: z.string().min(1, "Please select a unit"),
  location: z.string().min(1, "Please select a location"),
  reorderLevel: z.number().min(0, "Reorder level must be 0 or greater"),
  maxStock: z.number().min(0, "Maximum stock must be 0 or greater"),
  safetyStock: z.number().min(0, "Safety stock must be 0 or greater"),
  primarySupplier: z.string().min(1, "Please select a primary supplier"),
  secondarySupplier: z.string().optional(),
  unitCost: z.number().min(0, "Unit cost must be 0 or greater"),
});

// Add maintenance form schema
const maintenanceFormSchema = z.object({
  equipment: z.string().min(1, "Please select equipment"),
  maintenanceType: z.string().min(1, "Please select maintenance type"),
  scheduledDate: z.string().min(1, "Please select a date"),
  priority: z.string().min(1, "Please select priority"),
  technician: z.string().min(1, "Please assign a technician"),
  estimatedDuration: z.number().min(1, "Duration must be at least 1 hour"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type AddItemFormValues = z.infer<typeof addItemFormSchema>;
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

const defaultValues: Partial<AddItemFormValues> = {
  quantity: 0,
  reorderLevel: 50,
  maxStock: 500,
  safetyStock: 20,
  unitCost: 0,
  category: [],
  unit: "",
  location: "",
  primarySupplier: "",
  secondarySupplier: "",
};

const maintenanceDefaultValues: Partial<MaintenanceFormValues> = {
  equipment: "",
  maintenanceType: "",
  scheduledDate: "",
  priority: "Medium",
  technician: "",
  estimatedDuration: 2,
  description: "",
  notes: "",
};

// Update the interface for filters
interface FilterOption {
  key: string;
  label: string;
  options: string[];
  multiple?: boolean;
}

// Add interfaces for inventory item and transfer
interface InventoryItem {
  id: string;
  name: string;
  category: string[];
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
  reorderLevel?: number;
  maxStock?: number;
  safetyStock?: number;
  isFlagged: boolean;
  primarySupplier?: string;
  secondarySupplier?: string;
  unitCost?: number;
  description?: string;
  lastOrderDate?: string;
  nextOrderDate?: string;
  qualityScore?: number;
  photos?: string[];
  notes?: string;
}

interface Transfer {
  id: string;
  from: string;
  to: string;
  items: number;
  status: string;
  driver: string;
  eta: string;
  isFlagged: boolean;
}

// Update category options constant to match backend enums
const CATEGORY_OPTIONS = [
  { value: "CONSTRUCTION_MATERIALS", label: "Construction Materials" },
  { value: "TOOLS_AND_EQUIPMENT", label: "Tools & Equipment" },
  { value: "SAFETY_EQUIPMENT", label: "Safety Equipment" },
  { value: "ELECTRICAL_COMPONENTS", label: "Electrical Components" },
  { value: "PLUMBING_MATERIALS", label: "Plumbing Materials" },
  { value: "HVAC_EQUIPMENT", label: "HVAC Equipment" },
  { value: "FINISHING_MATERIALS", label: "Finishing Materials" },
  { value: "HARDWARE_AND_FASTENERS", label: "Hardware & Fasteners" },
];

const UNIT_OPTIONS = [
  { value: "PIECE", label: "Pieces" },
  { value: "KILOGRAM", label: "Kilograms" },
  { value: "TONNE", label: "Tonnes" },
  { value: "CUBIC_METRE", label: "Cubic Metres" },
  { value: "SQUARE_METRE", label: "Square Metres" },
  { value: "LITRE", label: "Litres" },
  { value: "BOX", label: "Boxes" },
  { value: "ROLL", label: "Rolls" },
  { value: "SHEET", label: "Sheets" },
];

// Column definitions
const inventoryColumns = [
  { key: "name", label: "Item Name", type: "text" as const },
  { key: "category", label: "Category", type: "badge" as const },
  {
    key: "quantity",
    label: "Quantity",
    render: (value: number) => (
      <Badge variant={value > 100 ? "default" : "destructive"}>{value}</Badge>
    ),
  },
  { key: "unit", label: "Unit", type: "text" as const },
  { key: "location", label: "Location", type: "text" as const },
  { key: "lastUpdated", label: "Last Updated", type: "text" as const },
  { key: "actions", label: "Actions", type: "actions" as const },
];

const transferColumns = [
  { key: "id", label: "Transfer ID", type: "text" as const },
  { key: "from", label: "From", type: "text" as const },
  { key: "to", label: "To", type: "text" as const },
  { key: "items", label: "Items", type: "text" as const },
  { key: "status", label: "Status", type: "badge" as const },
  { key: "driver", label: "Driver", type: "text" as const },
  { key: "eta", label: "ETA", type: "text" as const },
  { key: "actions", label: "Actions", type: "actions" as const },
];

const Inventory = () => {
  const [inventoryTrends, setInventoryTrends] = useState([]);
  const [warehouseUtilization, setWarehouseUtilization] = useState([]);
  const [grnData, setGrnData] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const { user } = useUser();
  const userID = user?.id || ""
  // Add new state variables for quick action dialogs
  const [isResolveIssuesOpen, setIsResolveIssuesOpen] = useState(false);
  const [isTrackMaterialsOpen, setIsTrackMaterialsOpen] = useState(false);
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [isReviewProgressOpen, setIsReviewProgressOpen] = useState(false);

  // Add state for inventory items and transfers
  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);

  // Add state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Add state for Add Item dialog
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Add state for View Details dialog
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(
    null
  );

  // Add state for Edit Item dialog
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(
    null
  );

  // Add state for Delete confirmation
  const [itemToDelete, setItemToDelete] = useState<InventoryItemType | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Add state for Schedule Maintenance dialog
  const [isScheduleMaintenanceOpen, setIsScheduleMaintenanceOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  // Add state for Schedule Maintenance CRUD
  const [scheduleMaintenances, setScheduleMaintenances] = useState<any[]>([]);
  const [isEditMaintenanceOpen, setIsEditMaintenanceOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<any | null>(null);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<any | null>(null);
  const [isDeletingMaintenance, setIsDeletingMaintenance] = useState(false);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Add vendors state
  const [vendors, setVendors] = useState<any[]>([]);

  // Function to fetch vendors data
  const fetchVendors = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log("Fetching vendors...");
      const vendorsResponse = await axios.get(`${API_URL}/vendors`, {
        headers,
      });
      console.log("Vendors data:", vendorsResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log("Fetching inventory items...");

      // Fetch inventory items
      const itemsResponse = await axios.get(`${API_URL}/inventory/items?userId=${userID}`, {
        headers,
      });
      console.log("Raw inventory data:", itemsResponse.data);

      // Function to transform backend category enum to frontend label
      const getCategoryLabel = (categoryEnum: string) => {
        const categoryMap = CATEGORY_OPTIONS.find(
          (opt) => opt.value === categoryEnum
        );
        return categoryMap ? categoryMap.label : categoryEnum;
      };

      // Function to transform backend unit enum to frontend label
      const getUnitLabel = (unitEnum: string) => {
        const unitMap = UNIT_OPTIONS.find((opt) => opt.value === unitEnum);
        return unitMap ? unitMap.label : unitEnum;
      };

      // Transform the data to match frontend expectations
      const transformedItems = itemsResponse.data.map((item: any) => ({
        id: item.id,
        name: item.itemName || item.name,
        category: getCategoryLabel(item.category),
        quantity: item.quantity,
        unit: getUnitLabel(item.unit),
        location: item.location,
        lastUpdated: item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        reorderLevel: item.reorderLevel,
        maxStock: item.maximumStock || item.maxStock,
        safetyStock: item.safetyStock,
        isFlagged: item.isFlagged || false,
        primarySupplier:
          item.primarySupplierName || item.primarySupplier?.name || "",
        secondarySupplier:
          item.secondarySupplierName || item.secondarySupplier?.name || "",
        unitCost: item.unitCost ? item.unitCost / 100 : 0, // Convert from cents to currency
        description: item.description,
        lastOrderDate: item.lastOrderDate,
        nextOrderDate: item.nextOrderDate,
        qualityScore: item.qualityScore || 85,
        photos: item.photos || [],
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      console.log("Transformed inventory items:", transformedItems);
      setInventoryItems(transformedItems);

      // Fetch other data
      try {
        const transfersResponse = await axios.get(
          `${API_URL}/inventory/transfers?userId=${userID}`,
          { headers }
        );
        const mappedTransfers: Transfer[] = (Array.isArray(transfersResponse.data) ? transfersResponse.data : []).map((t: any) => ({
          id: t?.transferID || t?.id || `TRF-${Date.now()}`,
          from: t?.fromLocation || t?.from || "-",
          to: t?.toLocation || t?.to || "-",
          items: Array.isArray(t?.items) ? t.items.length : (t?.items ?? 0),
          status: t?.status || "PENDING",
          driver: t?.driverName || t?.driver || "-",
          eta: t?.etaMinutes != null ? `${t.etaMinutes} min` : (t?.eta || "-"),
          isFlagged: false,
        }));
        setTransfers(mappedTransfers);
      } catch (error) {
        console.log("Transfers data not available");
      }

      try {
        const trendsResponse = await axios.get(`${API_URL}/inventory/trends`, {
          headers,
        });
        setInventoryTrends(trendsResponse.data);
      } catch (error) {
        console.log("Trends data not available");
      }

      try {
        const warehouseResponse = await axios.get(
          `${API_URL}/inventory/warehouse-utilization`,
          { headers }
        );
        setWarehouseUtilization(warehouseResponse.data);
      } catch (error) {
        console.log("Warehouse data not available");
      }

      try {
        const grnResponse = await axios.get(`${API_URL}/inventory/grn`, {
          headers,
        });
        setGrnData(grnResponse.data);
      } catch (error) {
        console.log("GRN data not available");
      }

      try {
        const tasksResponse = await axios.get(`${API_URL}/inventory/tasks`, {
          headers,
        });
        setTasks(tasksResponse.data);
      } catch (error) {
        console.log("Tasks data not available");
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to fetch inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule Maintenance CRUD functions
  const fetchScheduleMaintenances = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/schedule-maintenance`, {
        headers,
      });
      setScheduleMaintenances(response.data);
    } catch (error) {
      console.error("Error fetching schedule maintenances:", error);
    }
  };

  const createScheduleMaintenance = async (data: any) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const maintenanceData = {
        equipmentName: data.equipment,
        maintenanceType: data.maintenanceType.toUpperCase(),
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        Priority: data.priority.toUpperCase(),
        technicianName: data.technician,
        estimatedTime: data.estimatedDuration,
        description: data.description || "",
        additionalNotes: data.notes || "",
      };

      const response = await axios.post(
        `${API_URL}/schedule-maintenance`,
        maintenanceData,
        { headers }
      );
      
      toast.success(`Maintenance scheduled for ${data.equipment}`);
      fetchScheduleMaintenances(); // Refresh the list
      return response.data;
    } catch (error) {
      console.error("Error creating schedule maintenance:", error);
      toast.error("Failed to schedule maintenance");
      throw error;
    }
  };

  const updateScheduleMaintenance = async (id: string, data: any) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const maintenanceData = {
        equipmentName: data.equipment,
        maintenanceType: data.maintenanceType.toUpperCase(),
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        Priority: data.priority.toUpperCase(),
        technicianName: data.technician,
        estimatedTime: data.estimatedDuration,
        description: data.description || "",
        additionalNotes: data.notes || "",
      };

      const response = await axios.put(
        `${API_URL}/schedule-maintenance/${id}`,
        maintenanceData,
        { headers }
      );
      
      toast.success("Maintenance updated successfully");
      fetchScheduleMaintenances(); // Refresh the list
      return response.data;
    } catch (error) {
      console.error("Error updating schedule maintenance:", error);
      toast.error("Failed to update maintenance");
      throw error;
    }
  };

  const deleteScheduleMaintenance = async (id: string) => {
    try {
      setIsDeletingMaintenance(true);
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/schedule-maintenance/${id}`, { headers });
      
      toast.success("Maintenance deleted successfully");
      fetchScheduleMaintenances(); // Refresh the list
    } catch (error) {
      console.error("Error deleting schedule maintenance:", error);
      toast.error("Failed to delete maintenance");
    } finally {
      setIsDeletingMaintenance(false);
      setMaintenanceToDelete(null);
    }
  };

  useEffect(() => {
    fetchInventoryData();
    fetchVendors();
    fetchScheduleMaintenances();
  }, []);

  // Add action handlers
  const handleInventoryAction = (
    action: string,
    item: InventoryItemType,
    updatedData?: any
  ) => {
    switch (action) {
      case "view":
        handleViewDetails(item);
        break;
      case "edit":
        handleEditItem(item);
        break;
      case "delete":
        setItemToDelete(item);
        break;
      case "flag":
        const flaggedItems = inventoryItems.map((i) =>
          i.id === item.id ? { ...i, isFlagged: !i.isFlagged } : i
        );
        setInventoryItems(flaggedItems);
        toast.success(
          `Item ${item.isFlagged ? "unflagged" : "flagged"} successfully`
        );
        break;
    }
  };

  const handleTransferAction = (
    action: string,
    transfer: Transfer,
    updatedData?: any
  ) => {
    switch (action) {
      case "edit":
        const updatedTransfers = transfers.map((t) =>
          t.id === transfer.id ? { ...t, ...updatedData } : t
        );
        setTransfers(updatedTransfers);
        toast.success("Transfer updated successfully");
        break;

      case "flag":
        const flaggedTransfers = transfers.map((t) =>
          t.id === transfer.id ? { ...t, isFlagged: !t.isFlagged } : t
        );
        setTransfers(flaggedTransfers);
        toast.success(
          `Transfer ${
            transfer.isFlagged ? "unflagged" : "flagged"
          } successfully`
        );
        break;
    }
  };

  // Filter items based on search and filters
  const filteredItems = inventoryItems.filter((item) => {
    if (!item || !item.name) return false; // Skip items without required fields

    const categoryValue =
      typeof item.category === "string"
        ? item.category
        : Array.isArray(item.category)
        ? item.category.join(" ")
        : "";
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryValue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      !selectedLocation ||
      selectedLocation === "all_locations" ||
      item.location === selectedLocation;
    const matchesCategory =
      !selectedCategory || categoryValue === selectedCategory;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemFormSchema),
    defaultValues,
  });

  const editForm = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemFormSchema),
    defaultValues,
  });

  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: maintenanceDefaultValues,
  });

  const onSubmit = async (data: AddItemFormValues) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated. Please log in.");
        return;
      }

      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Find the vendor by name to get the vendor ID
      const primaryVendor = vendors.find(
        (vendor) => vendor.name === data.primarySupplier
      );
      const secondaryVendor =
        data.secondarySupplier && data.secondarySupplier !== "none"
          ? vendors.find((vendor) => vendor.name === data.secondarySupplier)
          : null;

      if (!primaryVendor) {
        toast.error(
          "Primary supplier not found. Please select a valid supplier."
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/inventory/items`,
        {
          itemName: data.name,
          category: data.category[0], // Backend expects single category enum value
          quantity: data.quantity,
          unit: data.unit,
          location: data.location,
          reorderLevel: data.reorderLevel,
          maximumStock: data.maxStock,
          safetyStock: data.safetyStock,
          primarySupplierName: data.primarySupplier,
          vendorId: primaryVendor.id,
          secondarySupplierName: secondaryVendor
            ? data.secondarySupplier
            : undefined,
          secondaryVendorId: secondaryVendor ? secondaryVendor.id : undefined,
          unitCost: Math.round(data.unitCost * 100), // Backend expects cents
          createdById: user.id,
        },
        { headers }
      );

      const newItem = response.data;
      // Refresh the inventory data to get the latest items
      await fetchInventoryData();
      toast.success("Item added successfully!");
      setIsAddItemOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add item. Please try again.");
      console.error("Error adding item:", error);
    }
  };

  const onEditSubmit = async (data: AddItemFormValues) => {
    if (!editingItem || !user?.id) return;

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Find the vendor by name to get the vendor ID
      const primaryVendor = vendors.find(
        (vendor) => vendor.name === data.primarySupplier
      );
      const secondaryVendor =
        data.secondarySupplier && data.secondarySupplier !== "none"
          ? vendors.find((vendor) => vendor.name === data.secondarySupplier)
          : null;

      if (!primaryVendor) {
        toast.error(
          "Primary supplier not found. Please select a valid supplier."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/inventory/items/${editingItem.id}`,
        {
          itemName: data.name,
          category: data.category[0],
          quantity: data.quantity,
          unit: data.unit,
          location: data.location,
          reorderLevel: data.reorderLevel,
          maximumStock: data.maxStock,
          safetyStock: data.safetyStock,
          primarySupplierName: data.primarySupplier,
          vendorId: primaryVendor.id,
          secondarySupplierName: secondaryVendor
            ? data.secondarySupplier
            : undefined,
          secondaryVendorId: secondaryVendor ? secondaryVendor.id : undefined,
          unitCost: Math.round(data.unitCost * 100),
          createdById: user.id,
        },
        { headers }
      );

      const updatedItem = response.data;
      // Refresh the inventory data to get the latest items
      await fetchInventoryData();
      toast.success("Item updated successfully!");
      setIsEditItemOpen(false);
      setEditingItem(null);
      editForm.reset();
    } catch (error) {
      toast.error("Failed to update item. Please try again.");
      console.error("Error updating item:", error);
    }
  };

  const handleExport = (tabName: string) => {
    let exportData: any[] = [];
    let fileName = "";

    switch (tabName) {
      case "project-overview":
        exportData = tasks.map((task) => ({
          "Task ID": task.id,
          "Task Name": task.name,
          "Start Date": task.startDate,
          "End Date": task.endDate,
          Progress: `${task.progress}%`,
          Status: task.status,
          Priority: task.priority,
          "Assigned To": task.assignedTo,
        }));
        fileName = "project-tasks";
        break;

      case "inventory":
        exportData = filteredItems.map((item) => ({
          "Item Name": item.name,
          Category: Array.isArray(item.category)
            ? item.category.join(", ")
            : item.category,
          Quantity: item.quantity,
          Unit: item.unit,
          Location: item.location,
          "Last Updated": item.lastUpdated,
          "Reorder Level": item.reorderLevel,
          "Max Stock": item.maxStock,
          "Safety Stock": item.safetyStock,
        }));
        fileName = "inventory-items";
        break;

      case "transfers":
        exportData = transfers.map((transfer) => ({
          "Transfer ID": transfer.id,
          From: transfer.from,
          To: transfer.to,
          Items: transfer.items,
          Status: transfer.status,
          Driver: transfer.driver,
          ETA: transfer.eta,
        }));
        fileName = "material-transfers";
        break;

      case "warehouse":
        exportData = warehouseUtilization.map((warehouse) => ({
          Location: warehouse.location,
          Capacity: `${warehouse.capacity}%`,
          "Used Space": `${warehouse.used}%`,
          "Available Space": `${warehouse.capacity - warehouse.used}%`,
          Efficiency: `${warehouse.efficiency}%`,
        }));
        fileName = "warehouse-utilization";
        break;

      case "analytics":
        // Create workbook with multiple sheets
        const wb = XLSX.utils.book_new();

        // Progress data
        const progressData = inventoryTrends.map((data) => ({
          Month: data.month,
          "Planned Progress": `${data.forecast}%`,
          "Actual Progress": `${data.stockLevel}`,
          Efficiency: `${data.efficiency}%`,
        }));

        // Cost data
        const costData = [
          { category: "Raw Materials", cost: 850000, budget: 900000 },
          { category: "Equipment", cost: 320000, budget: 350000 },
          { category: "Labor", cost: 450000, budget: 400000 },
          { category: "Transport", cost: 180000, budget: 200000 },
        ].map((data) => ({
          Category: data.category,
          "Actual Cost": `₹${data.cost}`,
          Budget: `₹${data.budget}`,
          Variance: `₹${data.budget - data.cost}`,
        }));

        const ws1 = XLSX.utils.json_to_sheet(progressData);
        const ws2 = XLSX.utils.json_to_sheet(costData);

        XLSX.utils.book_append_sheet(wb, ws1, "Progress Analytics");
        XLSX.utils.book_append_sheet(wb, ws2, "Cost Analytics");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
          data,
          `analytics-report-${new Date().toISOString().split("T")[0]}.xlsx`
        );

        toast.success("Analytics data has been exported to Excel");
        return;

      default:
        toast.error("No data available for export");
        return;
    }

    if (exportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save file with current date in filename
    const currentDate = new Date().toISOString().split("T")[0];
    saveAs(data, `${fileName}-${currentDate}.xlsx`);

    toast.success("Data has been exported to Excel");
  };

  // Add handlers for quick actions
  const handleResolveIssues = () => {
    const criticalIssues = [
      {
        id: "ISS001",
        title: "Material shortage",
        priority: "high",
        status: "open",
      },
      {
        id: "ISS002",
        title: "Equipment malfunction",
        priority: "critical",
        status: "open",
      },
      {
        id: "ISS003",
        title: "Quality control failure",
        priority: "high",
        status: "open",
      },
    ];
    setIsResolveIssuesOpen(true);
    toast.info(`${criticalIssues.length} critical issues found`, {
      description: "Prioritizing resolution based on impact severity",
    });
  };

  const handleTrackMaterials = () => {
    const delayedMaterials = [
      {
        id: "MAT001",
        name: "Steel Bars",
        delay: "2 days",
        supplier: "Steel Corp",
      },
      {
        id: "MAT002",
        name: "Cement Bags",
        delay: "1 day",
        supplier: "Cement Ltd",
      },
      {
        id: "MAT003",
        name: "Electrical Cables",
        delay: "3 days",
        supplier: "Electric Co",
      },
    ];
    setIsTrackMaterialsOpen(true);
    toast.info(`${delayedMaterials.length} materials delayed`, {
      description: "Tracking delivery status and coordinating with suppliers",
    });
  };

  const handleViewSchedule = () => {
    const scheduledWorkers = [
      { id: "W001", name: "John Doe", role: "Mason", shift: "Morning" },
      { id: "W002", name: "Jane Smith", role: "Electrician", shift: "Morning" },
      { id: "W003", name: "Mike Johnson", role: "Plumber", shift: "Afternoon" },
    ];
    setIsViewScheduleOpen(true);
    toast.info(`${scheduledWorkers.length} workers scheduled`, {
      description: "Reviewing workforce allocation and shifts",
    });
  };

  const handleReviewProgress = () => {
    const milestones = [
      {
        id: "M001",
        name: "Foundation Work",
        progress: 100,
        dueDate: "2024-01-25",
      },
      {
        id: "M002",
        name: "Steel Framework",
        progress: 75,
        dueDate: "2024-01-30",
      },
    ];
    setIsReviewProgressOpen(true);
    toast.info(`${milestones.length} milestones due this week`, {
      description: "Analyzing project timeline and deliverables",
    });
  };

  // Add view details handler
  const handleViewDetails = (item: InventoryItemType) => {
    setSelectedItem(item);
    setIsViewDetailsOpen(true);
  };

  // Add edit item handler
  const handleEditItem = (item: InventoryItemType) => {
    setEditingItem(item);

    // Find the backend enum value for the category
    const getCategoryEnum = (categoryLabel: string | string[]) => {
      const label =
        typeof categoryLabel === "string"
          ? categoryLabel
          : Array.isArray(categoryLabel)
          ? categoryLabel[0]
          : "";
      const categoryMap = CATEGORY_OPTIONS.find((opt) => opt.label === label);
      return categoryMap ? categoryMap.value : label;
    };

    // Find the backend enum value for the unit
    const getUnitEnum = (unitLabel: string | string[]) => {
      const label =
        typeof unitLabel === "string"
          ? unitLabel
          : Array.isArray(unitLabel)
          ? unitLabel[0]
          : "";
      const unitMap = UNIT_OPTIONS.find((opt) => opt.label === label);
      return unitMap ? unitMap.value : label;
    };

    // Populate edit form with current item data
    editForm.reset({
      name: item.name,
      category: [getCategoryEnum(item.category || "")],
      quantity: item.quantity,
      unit: getUnitEnum(item.unit || ""),
      location: item.location || "",
      reorderLevel: item.reorderLevel || 50,
      maxStock: item.maxStock || 500,
      safetyStock: item.safetyStock || 20,
      primarySupplier: item.primarySupplier || "",
      secondarySupplier: item.secondarySupplier || "",
      unitCost: item.unitCost || 0,
    });
    setIsEditItemOpen(true);
  };

  // Add delete item handler
  const handleDeleteItem = async (item: InventoryItemType) => {
    setIsDeleting(true);
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/inventory/items/${item.id}`, { headers });

      // Refresh the inventory data to get the latest items
      await fetchInventoryData();
      toast.success("Item deleted successfully!");
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete item. Please try again.");
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get vendor details by supplier name
  const getVendorDetails = (supplierName: string) => {
    if (!supplierName || !vendors.length) return null;
    return vendors.find(
      (vendor) =>
        vendor.name?.toLowerCase().includes(supplierName?.toLowerCase()) ||
        supplierName?.toLowerCase().includes(vendor.name?.toLowerCase())
    );
  };

  // Enhanced expandable content with vendor information
  const inventoryExpandableContent = (row: InventoryItemType) => {
    const primaryVendor = getVendorDetails(row.primarySupplier || "");
    const secondaryVendor = getVendorDetails(row.secondarySupplier || "");

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-medium mb-2">Stock Details</h4>
          <div className="space-y-1 text-sm">
            <div>Reorder Level: {row.reorderLevel || 50}</div>
            <div>Max Stock: {row.maxStock || 500}</div>
            <div>Safety Stock: {row.safetyStock || 20}</div>
            <div>Unit Cost: ₹{row.unitCost || 0}</div>
            <div>
              Total Value: ₹
              {((row.unitCost || 0) * row.quantity).toLocaleString()}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Primary Vendor</h4>
          <div className="space-y-1 text-sm">
            {primaryVendor ? (
              <>
                <div className="font-medium text-primary">
                  Name : {primaryVendor.name}
                </div>
                {primaryVendor.email && (
                  <div>Email : {primaryVendor.email}</div>
                )}
                {primaryVendor.mobile && (
                  <div>Contact : {primaryVendor.mobile}</div>
                )}
                {primaryVendor.gstin && (
                  <div>GSTIN : {primaryVendor.gstin}</div>
                )}
                {primaryVendor.city && primaryVendor.state && (
                  <div>
                    {primaryVendor.city}, {primaryVendor.state}
                  </div>
                )}
                {primaryVendor.paymentTerms && (
                  <div>Location :  {primaryVendor.paymentTerms}</div>
                )}
              </>
            ) : (
              <>
                <div>{row.primarySupplier || "Not specified"}</div>
                <div className="text-muted-foreground text-xs">
                  Vendor details not found
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Secondary Supplier</h4>
          <div className="space-y-1 text-sm">
            {row.secondarySupplier ? (
              secondaryVendor ? (
                <>
                  <div className="font-medium text-primary">
                   Name:  {secondaryVendor.name}
                  </div>
                  {secondaryVendor.email && (
                    <div>Email : {secondaryVendor.email}</div>
                  )}
                  {secondaryVendor.mobile && (
                    <div>Contact : {secondaryVendor.mobile}</div>
                  )}
                  {secondaryVendor.gstin && (
                    <div>GSTIN : {secondaryVendor.gstin}</div>
                  )}
                  {secondaryVendor.city && secondaryVendor.state && (
                    <div>
                      Location :  {secondaryVendor.city}, {secondaryVendor.state}
                    </div>
                  )}
                  {secondaryVendor.paymentTerms && (
                    <div>💳 {secondaryVendor.paymentTerms}</div>
                  )}
                </>
              ) : (
                <>
                  <div>{row.secondarySupplier}</div>
                  <div className="text-muted-foreground text-xs">
                    Vendor details not found
                  </div>
                </>
              )
            ) : (
              <div className="text-muted-foreground text-sm">
                No secondary supplier
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive project tracking, inventory management and material
            planning
            {!isLoading &&
              ` • ${filteredItems.length} items${
                inventoryItems.length !== filteredItems.length
                  ? ` (${inventoryItems.length} total)`
                  : ""
              }`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("inventory")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={fetchInventoryData}
            disabled={isLoading}
          >
            <Package className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setIsAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={isAddItemOpen}
        onOpenChange={(open) => {
          setIsAddItemOpen(open);
          if (!open) {
            form.reset();
          }
        }}
      >
        <DialogContent
          className="max-w-2xl overflow-y-auto max-h-[90vh]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to the inventory.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        defaultValue={field.value?.[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIT_OPTIONS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter reorder level"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter maximum stock"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="safetyStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter safety stock"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarySupplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Supplier</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.name}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondarySupplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Supplier (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select secondary supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.name}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter unit cost"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddItemOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="ml-3">
                  Add Item
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {/* <TabsTrigger value="project-overview">Project Overview</TabsTrigger> */}
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="material-forecast">Material Forecast</TabsTrigger>
          <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
        </TabsList>

        {/* <TabsContent value="project-overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard
              title="Active Projects"
              value="12"
              icon={Package}
              trend={{ value: 3, label: "new projects this month" }}
              threshold={{ status: 'good', message: 'Project pipeline healthy' }}
            />
            <EnhancedStatCard
              title="Critical Issues"
              value="3"
              icon={AlertTriangle}
              trend={{ value: -2, label: "fewer than last week" }}
              threshold={{ status: 'warning', message: 'Monitor critical issues closely' }}
            />
            <EnhancedStatCard
              title="Material Requests"
              value="18"
              icon={TrendingUp}
              trend={{ value: 15, label: "increase this week" }}
              threshold={{ status: 'good', message: 'Procurement pipeline active' }}
            />
            <EnhancedStatCard
              title="On-Time Completion"
              value="87%"
              description="Project milestone completion rate"
              icon={CheckCircle}
              trend={{ value: 5, label: "improvement" }}
              threshold={{ status: 'good', message: 'Excellent project delivery' }}
            />
          </div> */}

        {/* Enhanced Gantt Chart */}
        {/* <GanttChart
            projectId="PROJ001"
            tasks={tasks}
            onTaskUpdate={(taskId, updates) => {
              console.log('Task updated:', taskId, updates);
            }}
          /> */}

        {/* Quick Actions Dashboard with updated buttons */}
        {/* <Card>
            <CardHeader>
              <CardTitle>Quick Actions & Project Health</CardTitle>
              <CardDescription>Real-time project monitoring and immediate actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">Critical Issues</span>
                  </div>
                  <p className="text-sm text-red-700">3 issues requiring immediate attention</p>
                  <Button size="sm" variant="destructive" className="mt-2" onClick={handleResolveIssues}>
                    Resolve Issues
                  </Button>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Material Delays</span>
                  </div>
                  <p className="text-sm text-yellow-700">5 materials behind schedule</p>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={handleTrackMaterials}>
                    Track Materials
                  </Button>
                </div>

                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Labor Planning</span>
                  </div>
                  <p className="text-sm text-blue-700">15 workers scheduled for tomorrow</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={handleViewSchedule}>
                    View Schedule
                  </Button>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Milestones</span>
                  </div>
                  <p className="text-sm text-green-700">2 milestones due this week</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={handleReviewProgress}>
                    Review Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card> */}
        {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('project-overview')}>
              <Download className="mr-2 h-4 w-4" />
              Export Project Data
            </Button>
          </div> */}
        {/* </TabsContent> */}

        <TabsContent value="material-forecast" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Forecasted Items"
              value={inventoryItems
                .filter((item) => item.quantity < (item.reorderLevel || 50) * 2)
                .length.toString()}
              icon={Package}
              description="Items needing procurement"
              trend={{ value: 8, label: "vs last forecast" }}
              threshold={{
                status: "good",
                message: "Active forecasting in place",
              }}
            />
            <EnhancedStatCard
              title="Estimated Cost"
              value={`₹${inventoryItems
                .filter((item) => item.quantity < (item.reorderLevel || 50) * 2)
                .reduce(
                  (total, item) =>
                    total +
                    (item.unitCost || 0) *
                      ((item.reorderLevel || 50) - item.quantity),
                  0
                )
                .toLocaleString()}`}
              icon={TrendingUp}
              description="Total procurement value"
              trend={{ value: 12, label: "vs last forecast" }}
              threshold={{
                status: "good",
                message: "Within budget parameters",
              }}
            />
            <EnhancedStatCard
              title="Critical Items"
              value={inventoryItems
                .filter((item) => item.quantity <= (item.safetyStock || 20))
                .length.toString()}
              icon={AlertTriangle}
              description="Below safety stock"
              trend={{ value: -25, label: "reduction" }}
              threshold={{
                status:
                  inventoryItems.filter(
                    (item) => item.quantity <= (item.safetyStock || 20)
                  ).length === 0
                    ? "good"
                    : "critical",
                message:
                  inventoryItems.filter(
                    (item) => item.quantity <= (item.safetyStock || 20)
                  ).length === 0
                    ? "No critical shortages"
                    : "Immediate attention required",
              }}
            />
            <EnhancedStatCard
              title="Avg Unit Cost"
              value={`₹${
                inventoryItems.length > 0
                  ? Math.round(
                      inventoryItems.reduce(
                        (total, item) => total + (item.unitCost || 0),
                        0
                      ) / inventoryItems.length
                    )
                  : 0
              }`}
              icon={Calendar}
              description="Average cost per item"
              trend={{ value: -5, label: "cost optimization" }}
              threshold={{
                status: "good",
                message: "Cost management effective",
              }}
            />
          </div>

          <MaterialForecast projectId="PROJ001" timeframe="1-month" />
        </TabsContent>

        <TabsContent value="issue-tracking" className="space-y-6">
          <IssueReportingFunctional projectId="PROJ001" siteId="SITE001" />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Total Items"
              value={inventoryItems.length.toString()}
              icon={Package}
              description="Items in inventory"
              trend={{
                value:
                  inventoryItems.length > 0
                    ? Math.round(((inventoryItems.length - 5) / 5) * 100)
                    : 0,
                label: "vs last month",
              }}
              threshold={{
                status:
                  inventoryItems.length > 10
                    ? "good"
                    : inventoryItems.length > 5
                    ? "warning"
                    : "critical",
                message:
                  inventoryItems.length > 10
                    ? "Good inventory diversity"
                    : inventoryItems.length > 5
                    ? "Consider expanding inventory"
                    : "Low inventory count",
              }}
            />
            <EnhancedStatCard
              title="Total Value"
              value={`₹${inventoryItems
                .reduce(
                  (total, item) => total + (item.unitCost || 0) * item.quantity,
                  0
                )
                .toLocaleString()}`}
              icon={TrendingUp}
              description="Total inventory value"
              trend={{ value: 8, label: "vs last month" }}
              threshold={{ status: "good", message: "Healthy inventory value" }}
            />
            <EnhancedStatCard
              title="Low Stock Items"
              value={inventoryItems
                .filter((item) => item.quantity <= (item.reorderLevel || 50))
                .length.toString()}
              icon={AlertTriangle}
              description="Below reorder level"
              threshold={{
                status:
                  inventoryItems.filter(
                    (item) => item.quantity <= (item.reorderLevel || 50)
                  ).length === 0
                    ? "good"
                    : inventoryItems.filter(
                        (item) => item.quantity <= (item.reorderLevel || 50)
                      ).length <= 2
                    ? "warning"
                    : "critical",
                message:
                  inventoryItems.filter(
                    (item) => item.quantity <= (item.reorderLevel || 50)
                  ).length === 0
                    ? "All items well stocked"
                    : inventoryItems.filter(
                        (item) => item.quantity <= (item.reorderLevel || 50)
                      ).length <= 2
                    ? "Few items need restocking"
                    : "Multiple items critically low",
              }}
            />
            <EnhancedStatCard
              title="Categories"
              value={Array.from(
                new Set(
                  inventoryItems.map((item) => item.category).filter(Boolean)
                )
              ).length.toString()}
              icon={Clock}
              description="Unique categories"
              threshold={{ status: "good", message: "Good category diversity" }}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>Loading inventory items...</span>
              </div>
            </div>
          ) : (
            <ExpandableDataTable
              title="Inventory Items"
              description="Comprehensive inventory management with detailed insights"
              data={filteredItems}
              columns={[
                { key: "name", label: "Item Name", type: "text" as const },
                {
                  key: "category",
                  label: "Category",
                  type: "badge" as const,
                  options: CATEGORY_OPTIONS.map((cat) => cat.label),
                  multiple: false,
                  render: (value: any, item: InventoryItemType) => (
                    <div className="flex flex-wrap gap-1">
                      {item.category ? (
                        <Badge variant="secondary" className="mr-1">
                          {item.category}
                        </Badge>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "quantity",
                  label: "Quantity",
                  render: (value: number, item: InventoryItemType) => (
                    <Badge
                      variant={
                        value > (item.reorderLevel || 50)
                          ? "default"
                          : "destructive"
                      }
                    >
                      {value} {item.unit}
                    </Badge>
                  ),
                },
                { key: "location", label: "Location", type: "text" as const },
                {
                  key: "lastUpdated",
                  label: "Last Updated",
                  type: "text" as const,
                },
                {
                  key: "status",
                  label: "Status",
                  render: (_, item: InventoryItemType) => (
                    <Badge
                      variant={
                        item.quantity > (item.reorderLevel || 50)
                          ? "default"
                          : "destructive"
                      }
                    >
                      {item.quantity > (item.reorderLevel || 50)
                        ? "In Stock"
                        : "Low Stock"}
                    </Badge>
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  type: "actions" as const,
                  render: (value: any, item: InventoryItemType) => (
                    <div className="flex items-center gap-2">
                      {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInventoryAction('view', item)}
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <Package className="h-4 w-4" />
                    </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInventoryAction("edit", item)}
                        className="h-8 w-8 p-0"
                        title="Edit Item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInventoryAction("delete", item)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete Item"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              expandableContent={inventoryExpandableContent}
              searchKey="name"
              filters={[
                {
                  key: "category",
                  label: "Category",
                  options: CATEGORY_OPTIONS.map((cat) => cat.label),
                  multiple: false,
                },
                {
                  key: "location",
                  label: "Location",
                  options: ["Warehouse A", "Warehouse B", "Site 1"],
                },
              ]}
              onRowAction={handleInventoryAction}
            />
          )}

          {/* View Details Dialog */}
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedItem && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle className="text-2xl">
                          {selectedItem.name}
                        </DialogTitle>
                        <DialogDescription>
                          Item ID: {selectedItem.id} • Last Updated:{" "}
                          {selectedItem.lastUpdated}
                        </DialogDescription>
                      </div>
                      <Badge
                        variant={
                          selectedItem.quantity >
                          (selectedItem.reorderLevel || 50)
                            ? "default"
                            : "destructive"
                        }
                      >
                        {selectedItem.quantity >
                        (selectedItem.reorderLevel || 50)
                          ? "In Stock"
                          : "Low Stock"}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Stock Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Stock Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Current Quantity</Label>
                            <p className="text-2xl font-bold">
                              {selectedItem.quantity} {selectedItem.unit}
                            </p>
                          </div>
                          <div>
                            <Label>Category</Label>
                            <p className="text-lg">
                              {Array.isArray(selectedItem.category)
                                ? selectedItem.category.join(", ")
                                : selectedItem.category}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Reorder Level</span>
                            <span>
                              {selectedItem.reorderLevel || 50}{" "}
                              {selectedItem.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maximum Stock</span>
                            <span>
                              {selectedItem.maxStock || 500} {selectedItem.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safety Stock</span>
                            <span>
                              {selectedItem.safetyStock || 20}{" "}
                              {selectedItem.unit}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={
                            (selectedItem.quantity /
                              (selectedItem.maxStock || 500)) *
                            100
                          }
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Location & Movement */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Location & Movement</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Current Location</Label>
                          <p className="text-lg">{selectedItem.location}</p>
                        </div>
                        <div>
                          <Label>Last Order Date</Label>
                          <p>{selectedItem.lastOrderDate || "N/A"}</p>
                        </div>
                        <div>
                          <Label>Next Scheduled Order</Label>
                          <p>{selectedItem.nextOrderDate || "Not scheduled"}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Supplier Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Primary Supplier */}
                        <div className="border-b pb-3">
                          <Label className="font-semibold">
                            Primary Supplier
                          </Label>
                          {(() => {
                            const vendor = getVendorDetails(
                              selectedItem.primarySupplier || ""
                            );
                            return vendor ? (
                              <div className="mt-2 space-y-2">
                                <p className="text-lg font-medium text-primary">
                                  {vendor.name}
                                </p>
                                {vendor.email && (
                                  <p className="text-sm">📧 {vendor.email}</p>
                                )}
                                {vendor.mobile && (
                                  <p className="text-sm">📱 {vendor.mobile}</p>
                                )}
                                {vendor.gstin && (
                                  <p className="text-sm">🆔 {vendor.gstin}</p>
                                )}
                                {vendor.city && vendor.state && (
                                  <p className="text-sm">
                                    📍 {vendor.city}, {vendor.state}
                                  </p>
                                )}
                                {vendor.paymentTerms && (
                                  <p className="text-sm">
                                    💳 {vendor.paymentTerms}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2">
                                <p className="text-lg">
                                  {selectedItem.primarySupplier ||
                                    "Not specified"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Vendor details not found
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Secondary Supplier */}
                        <div className="border-b pb-3">
                          <Label className="font-semibold">
                            Secondary Supplier
                          </Label>
                          {selectedItem.secondarySupplier ? (
                            (() => {
                              const secondaryVendor = getVendorDetails(
                                selectedItem.secondarySupplier
                              );
                              return secondaryVendor ? (
                                <div className="mt-2 space-y-2">
                                  <p className="text-lg font-medium text-secondary">
                                    {secondaryVendor.name}
                                  </p>
                                  {secondaryVendor.email && (
                                    <p className="text-sm">
                                      📧 {secondaryVendor.email}
                                    </p>
                                  )}
                                  {secondaryVendor.mobile && (
                                    <p className="text-sm">
                                      📱 {secondaryVendor.mobile}
                                    </p>
                                  )}
                                  {secondaryVendor.gstin && (
                                    <p className="text-sm">
                                      🆔 {secondaryVendor.gstin}
                                    </p>
                                  )}
                                  {secondaryVendor.city &&
                                    secondaryVendor.state && (
                                      <p className="text-sm">
                                        📍 {secondaryVendor.city},{" "}
                                        {secondaryVendor.state}
                                      </p>
                                    )}
                                  {secondaryVendor.paymentTerms && (
                                    <p className="text-sm">
                                      💳 {secondaryVendor.paymentTerms}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <p className="text-lg">
                                    {selectedItem.secondarySupplier}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Vendor details not found
                                  </p>
                                </div>
                              );
                            })()
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2">
                              No secondary supplier assigned
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Unit Cost</Label>
                          <p className="text-lg">
                            ₹{selectedItem.unitCost || 0}
                          </p>
                        </div>
                        <div>
                          <Label>Quality Score</Label>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={selectedItem.qualityScore || 85}
                              className="h-2"
                            />
                            <span>{selectedItem.qualityScore || 85}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes & Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Description</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedItem.description ||
                              "No description available"}
                          </p>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedItem.notes || "No notes available"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewDetailsOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setIsViewDetailsOpen(false);
                        toast.success("Item details updated successfully");
                      }}
                    >
                      Update
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Item Dialog */}
          <Dialog
            open={isEditItemOpen}
            onOpenChange={(open) => {
              setIsEditItemOpen(open);
              if (!open) {
                setEditingItem(null);
                editForm.reset();
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogDescription>
                  Update the details of this inventory item.
                </DialogDescription>
              </DialogHeader>

              <Form {...editForm}>
                <form
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={field.value?.[0] || ""}
                            onValueChange={(value) => field.onChange([value])}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNIT_OPTIONS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum quantity before reordering
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="maxStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum storage capacity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="safetyStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="20"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Emergency stock level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="primarySupplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Supplier</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select primary supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.name}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="secondarySupplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Supplier (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select secondary supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {vendors.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.name}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="unitCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Cost (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditItemOpen(false);
                        setEditingItem(null);
                        editForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Item</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Alert Dialog */}
          <AlertDialog
            open={!!itemToDelete}
            onOpenChange={() => setItemToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{itemToDelete?.name}"? This
                  action cannot be undone. This will permanently remove the item
                  from your inventory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => itemToDelete && handleDeleteItem(itemToDelete)}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Active Transfers"
              value="7"
              icon={Truck}
              description="Currently in transit"
              threshold={{
                status: "good",
                message: "Normal transfer activity",
              }}
            />
            <EnhancedStatCard
              title="Today's Transfers"
              value="15"
              icon={Package}
              description="Completed today"
              trend={{ value: 25, label: "vs yesterday" }}
            />
            <EnhancedStatCard
              title="Avg Transit Time"
              value="3.2 hrs"
              icon={Clock}
              description="Site to site transfers"
              trend={{ value: -10, label: "improvement" }}
            />
            <EnhancedStatCard
              title="Transfer Accuracy"
              value="98.5%"
              icon={TrendingUp}
              description="Items delivered correctly"
              threshold={{
                status: "good",
                message: "Excellent transfer accuracy",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Material Transfers</h2>
              <p className="text-sm text-muted-foreground">Track material movement between locations</p>
            </div>
            <Button onClick={() => setIsAddTransferOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </div>

          <ExpandableDataTable
            title="Material Transfers"
            description="Track material movement between locations"
            data={transfers}
            columns={transferColumns}
            expandableContent={(row) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Transfer Details</h4>
                  <div className="text-sm space-y-1">
                    <div>Request Date: {row.requestDate || "2024-01-15"}</div>
                    <div>Approved By: {row.approvedBy || "Site Manager"}</div>
                    <div>Vehicle: {row.vehicle || "TRK-001"}</div>
                    <div>Priority: {row.priority || "Normal"}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Items List</h4>
                  <div className="text-sm space-y-1">
                    <div>• Cement bags: 50 units</div>
                    <div>• Steel rods: 25 units</div>
                    <div>• Safety helmets: 10 units</div>
                  </div>
                </div>
              </div>
            )}
            searchKey="id"
            filters={[
              {
                key: "status",
                label: "Status",
                options: ["Pending", "In Transit", "Delivered"],
              },
            ]}
            onRowAction={handleTransferAction}
          />
          <MaterialTransferModal
            open={isAddTransferOpen}
            onOpenChange={setIsAddTransferOpen}
            onSave={(created: any) => {
              const mapped: Transfer = {
                id: created?.transferID || created?.id || `TRF-${Date.now()}`,
                from: created?.fromLocation || created?.from || "-",
                to: created?.toLocation || created?.to || "-",
                items: Array.isArray(created?.items) ? created.items.length : (created?.items ?? 0),
                status: created?.status || "PENDING",
                driver: created?.driverName || created?.driver || "-",
                eta: created?.etaMinutes != null ? `${created.etaMinutes} min` : (created?.eta || "-"),
                isFlagged: false,
              };
              setTransfers((prev) => [mapped, ...prev]);
            }}
          />
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('transfers')}>
              <Download className="mr-2 h-4 w-4" />
              Export Transfers
            </Button>
          </div> */}
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Total Maintenance"
              value={scheduleMaintenances.length.toString()}
              icon={Calendar}
              description="Scheduled maintenance tasks"
              threshold={{
                status: scheduleMaintenances.length > 0 ? "good" : "warning",
                message: scheduleMaintenances.length > 0 ? "Active maintenance schedule" : "No maintenance scheduled",
              }}
            />
            <EnhancedStatCard
              title="Overdue Tasks"
              value={(() => {
                const now = new Date();
                const overdue = scheduleMaintenances.filter(m => {
                  const scheduledDate = new Date(m.scheduledDate);
                  return scheduledDate < now;
                });
                return overdue.length.toString();
              })()}
              icon={AlertTriangle}
              description="Past due maintenance"
              threshold={{
                status: (() => {
                  const now = new Date();
                  const overdue = scheduleMaintenances.filter(m => {
                    const scheduledDate = new Date(m.scheduledDate);
                    return scheduledDate < now;
                  });
                  return overdue.length === 0 ? "good" : overdue.length <= 2 ? "warning" : "critical";
                })(),
                message: (() => {
                  const now = new Date();
                  const overdue = scheduleMaintenances.filter(m => {
                    const scheduledDate = new Date(m.scheduledDate);
                    return scheduledDate < now;
                  });
                  return overdue.length === 0 ? "All tasks on schedule" : `${overdue.length} task(s) overdue`;
                })(),
              }}
            />
            <EnhancedStatCard
              title="High Priority"
              value={(() => {
                const highPriority = scheduleMaintenances.filter(m => 
                  m.Priority === 'HIGH' || m.Priority === 'CRITICAL'
                );
                return highPriority.length.toString();
              })()}
              icon={TrendingUp}
              description="Critical & high priority"
              threshold={{
                status: (() => {
                  const highPriority = scheduleMaintenances.filter(m => 
                    m.Priority === 'HIGH' || m.Priority === 'CRITICAL'
                  );
                  return highPriority.length === 0 ? "good" : highPriority.length <= 3 ? "warning" : "critical";
                })(),
                message: (() => {
                  const highPriority = scheduleMaintenances.filter(m => 
                    m.Priority === 'HIGH' || m.Priority === 'CRITICAL'
                  );
                  return highPriority.length === 0 ? "No urgent tasks" : `${highPriority.length} urgent task(s)`;
                })(),
              }}
            />
            <EnhancedStatCard
              title="This Week"
              value={(() => {
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const thisWeek = scheduleMaintenances.filter(m => {
                  const scheduledDate = new Date(m.scheduledDate);
                  return scheduledDate >= now && scheduledDate <= weekFromNow;
                });
                return thisWeek.length.toString();
              })()}
              icon={Clock}
              description="Due within 7 days"
              threshold={{
                status: "good",
                message: (() => {
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  const thisWeek = scheduleMaintenances.filter(m => {
                    const scheduledDate = new Date(m.scheduledDate);
                    return scheduledDate >= now && scheduledDate <= weekFromNow;
                  });
                  return thisWeek.length === 0 ? "No tasks this week" : "Upcoming maintenance";
                })(),
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* <Card>
              <CardHeader>
                <CardTitle>Warehouse Space Utilization</CardTitle>
                <CardDescription>
                  Real-time space usage across locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseUtilization.map((warehouse) => (
                    <div key={warehouse.location} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {warehouse.location}
                        </span>
                        <span>{warehouse.used}% utilized</span>
                      </div>
                      <Progress value={warehouse.used} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency: {warehouse.efficiency}%</span>
                        <span>
                          {warehouse.capacity - warehouse.used}% available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Equipment & Maintenance</CardTitle>
                    <CardDescription>
                      Warehouse equipment status and schedules
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setIsScheduleMaintenanceOpen(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduleMaintenances.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No maintenance schedules yet</p>
                      <p className="text-sm">Click "Schedule Maintenance" to add one</p>
                    </div>
                  ) : (
                    scheduleMaintenances.map((maintenance) => {
                      const scheduledDate = new Date(maintenance.scheduledDate);
                      const now = new Date();
                      const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      const isOverdue = daysUntil < 0;
                      const isDue = daysUntil <= 7 && daysUntil >= 0;
                      
                      return (
                        <div
                          key={maintenance.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{maintenance.equipmentName}</h4>
                              <Badge
                                variant={maintenance.maintenanceType === 'EMERGENCY' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {maintenance.maintenanceType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Scheduled: {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Technician: {maintenance.technicianName} • {maintenance.estimatedTime}h estimated
                            </p>
                            {maintenance.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {maintenance.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-3">
                              <Badge
                                variant={
                                  isOverdue
                                    ? "destructive"
                                    : isDue
                                    ? "secondary"
                                    : "default"
                                }
                              >
                                {maintenance.Priority}
                              </Badge>
                              <div className="text-sm text-muted-foreground mt-1">
                                {isOverdue 
                                  ? `${Math.abs(daysUntil)} days overdue`
                                  : isDue
                                  ? `${daysUntil} days left`
                                  : `${daysUntil} days left`
                                }
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingMaintenance(maintenance);
                                  maintenanceForm.reset({
                                    equipment: maintenance.equipmentName,
                                    maintenanceType: maintenance.maintenanceType.toLowerCase(),
                                    scheduledDate: new Date(maintenance.scheduledDate).toISOString().slice(0, 10),
                                    priority: maintenance.Priority.charAt(0).toUpperCase() + maintenance.Priority.slice(1).toLowerCase(),
                                    technician: maintenance.technicianName,
                                    estimatedDuration: maintenance.estimatedTime,
                                    description: maintenance.description,
                                    notes: maintenance.additionalNotes,
                                  });
                                  setIsScheduleMaintenanceOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Maintenance Schedule</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the maintenance schedule for "{maintenance.equipmentName}"? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteScheduleMaintenance(maintenance.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      disabled={isDeletingMaintenance}
                                    >
                                      {isDeletingMaintenance ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('warehouse')}>
              <Download className="mr-2 h-4 w-4" />
              Export Warehouse Data
            </Button>
          </div> */}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              title="Project Progress Analytics"
              description="Real-time project completion trends"
              data={inventoryTrends}
              type="line"
              dataKey="actual"
              secondaryDataKey="planned"
              xAxisKey="month"
              showComparison={true}
            />

            <InteractiveChart
              title="Material Cost Trends"
              description="Monthly material expenditure analysis"
              data={[
                { category: "Raw Materials", cost: 850000, budget: 900000 },
                { category: "Equipment", cost: 320000, budget: 350000 },
                { category: "Labor", cost: 450000, budget: 400000 },
                { category: "Transport", cost: 180000, budget: 200000 },
              ]}
              type="bar"
              dataKey="cost"
              secondaryDataKey="budget"
              xAxisKey="category"
            />
          </div>
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('analytics')}>
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </Button>
          </div> */}
        </TabsContent>
      </Tabs>

      {/* Resolve Issues Dialog */}
      <Dialog open={isResolveIssuesOpen} onOpenChange={setIsResolveIssuesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Critical Issues Resolution</DialogTitle>
            <DialogDescription>
              Review and take action on critical issues requiring immediate
              attention
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                id: "ISS001",
                title: "Material shortage",
                priority: "high",
                status: "open",
                description:
                  "Urgent steel reinforcement shortage affecting foundation work",
              },
              {
                id: "ISS002",
                title: "Equipment malfunction",
                priority: "critical",
                status: "open",
                description: "Main crane hydraulic system failure",
              },
              {
                id: "ISS003",
                title: "Quality control failure",
                priority: "high",
                status: "open",
                description:
                  "Concrete mixture not meeting strength requirements",
              },
            ].map((issue) => (
              <div key={issue.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {issue.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      issue.priority === "critical" ? "destructive" : "default"
                    }
                  >
                    {issue.priority}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Issue ${issue.id} marked for resolution`);
                  }}
                >
                  Start Resolution
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResolveIssuesOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Materials Dialog */}
      <Dialog
        open={isTrackMaterialsOpen}
        onOpenChange={setIsTrackMaterialsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Material Tracking</DialogTitle>
            <DialogDescription>
              Monitor delayed materials and their current status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                id: "MAT001",
                name: "Steel Bars",
                delay: "2 days",
                supplier: "Steel Corp",
                status: "In Transit",
              },
              {
                id: "MAT002",
                name: "Cement Bags",
                delay: "1 day",
                supplier: "Cement Ltd",
                status: "Processing",
              },
              {
                id: "MAT003",
                name: "Electrical Cables",
                delay: "3 days",
                supplier: "Electric Co",
                status: "Delayed",
              },
            ].map((material) => (
              <div key={material.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{material.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Supplier: {material.supplier}
                    </p>
                  </div>
                  <Badge
                    variant={
                      material.status === "Delayed" ? "destructive" : "default"
                    }
                  >
                    {material.status}
                  </Badge>
                </div>
                <p className="text-sm text-red-600 mb-2">
                  Delayed by: {material.delay}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(
                      `Expedited delivery request sent for ${material.name}`
                    );
                  }}
                >
                  Expedite Delivery
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTrackMaterialsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Schedule Dialog */}
      <Dialog open={isViewScheduleOpen} onOpenChange={setIsViewScheduleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Labor Schedule</DialogTitle>
            <DialogDescription>
              Review workforce allocation and shift schedules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                id: "W001",
                name: "John Doe",
                role: "Mason",
                shift: "Morning",
                location: "Block A",
              },
              {
                id: "W002",
                name: "Jane Smith",
                role: "Electrician",
                shift: "Morning",
                location: "Block B",
              },
              {
                id: "W003",
                name: "Mike Johnson",
                role: "Plumber",
                shift: "Afternoon",
                location: "Block A",
              },
            ].map((worker) => (
              <div key={worker.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{worker.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {worker.role}
                    </p>
                  </div>
                  <Badge>{worker.shift}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Location: {worker.location}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewScheduleOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Progress Dialog */}
      <Dialog
        open={isReviewProgressOpen}
        onOpenChange={setIsReviewProgressOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Milestone Progress Review</DialogTitle>
            <DialogDescription>
              Track project milestones and their completion status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                id: "M001",
                name: "Foundation Work",
                progress: 100,
                dueDate: "2024-01-25",
                status: "Completed",
              },
              {
                id: "M002",
                name: "Steel Framework",
                progress: 75,
                dueDate: "2024-01-30",
                status: "In Progress",
              },
            ].map((milestone) => (
              <div key={milestone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {milestone.dueDate}
                    </p>
                  </div>
                  <Badge
                    variant={
                      milestone.status === "Completed" ? "default" : "secondary"
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewProgressOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={isScheduleMaintenanceOpen} onOpenChange={setIsScheduleMaintenanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMaintenance ? 'Edit Equipment Maintenance' : 'Schedule Equipment Maintenance'}
            </DialogTitle>
            <DialogDescription>
              {editingMaintenance 
                ? 'Update the maintenance schedule for warehouse equipment'
                : 'Schedule maintenance for warehouse equipment to ensure optimal operation'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...maintenanceForm}>
            <form onSubmit={maintenanceForm.handleSubmit(async (data) => {
              try {
                if (editingMaintenance) {
                  await updateScheduleMaintenance(editingMaintenance.id, data);
                } else {
                  await createScheduleMaintenance(data);
                }
                setIsScheduleMaintenanceOpen(false);
                setIsEditMaintenanceOpen(false);
                setEditingMaintenance(null);
                maintenanceForm.reset();
              } catch (error) {
                // Error handling is done in the API functions
              }
            })} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={maintenanceForm.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter equipment name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="calibration">Calibration</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          // min={new Date().toISOString().slice(0, 10)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Technician</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter technician name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={maintenanceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of maintenance work"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={maintenanceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any additional information or special requirements"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsScheduleMaintenanceOpen(false);
                    setIsEditMaintenanceOpen(false);
                    setEditingMaintenance(null);
                    maintenanceForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMaintenance ? 'Update Maintenance' : 'Schedule Maintenance'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
