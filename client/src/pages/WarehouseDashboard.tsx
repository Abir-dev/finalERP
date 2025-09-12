import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Package, TrendingUp, AlertTriangle, Clock, Plus } from "lucide-react";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import type { InventoryItem as InventoryItemType } from "@/types/dummy-data-types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Local type to be safe if fields differ
interface InventoryItem {
  itemName: string;
  maximumStock: number;
  itemQuality: string;
  id: string;
  name: string;
  category: string | string[];
  type: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
  reorderLevel?: number;
  maxStock?: number;
  safetyStock?: number;
  unitCost?: number;
}

// Very loose shape for material requests to keep UI resilient to backend changes
interface MaterialRequest {
  id: string;
  status?: string;
  createdAt?: string;
  targetWarehouse?: string;
  requestedBy?: { id?: string; name?: string } | string;
  items?: Array<{ id?: string; name?: string; quantity?: number; uom?: string }>;
}

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
  { value: "CUBIC_FEET", label: "Cubic Feet" },
  { value: "SQUARE_FEET", label: "Square Feet" },
  { value: "SQUARE_METRE", label: "Square Metres" },
  { value: "LITRE", label: "Litres" },
  { value: "BOX", label: "Boxes" },
  { value: "ROLL", label: "Rolls" },
  { value: "SHEET", label: "Sheets" },
];

const ITEM_OPTIONS = [
  { value: "CEMENT", label: "Cement" },
  { value: "SAND", label: "Sand" },
  { value: "BRICKS", label: "Bricks" },
  { value: "STEEL", label: "Steel" },
  { value: "AGGREGATE", label: "Aggregate" },
  { value: "WOOD", label: "Wood" },
  { value: "GLASS", label: "Glass" },
  { value: "PAINT", label: "Paint" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "FIXTURES", label: "Fixtures" },
  { value: "TOOLS", label: "Tools" },
  { value: "OTHER", label: "Other" },
];

const INVENTORY_TYPE_OPTIONS = [
  { value: "OLD", label: "Old" },
  { value: "NEW", label: "New" },
];

const WarehouseDashboard = () => {
  const { user } = useUser();
  const userID = user?.id || "";

  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [isReqLoading, setIsReqLoading] = useState(true);

  // Add Item Modal State
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Add Warehouse Item Modal State
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);

  const [currentView, setCurrentView] = useState<'all' | 'old' | 'new' | 'lowstock' | 'value'>('all');
  const [filteredItems, setFilteredItems] = useState<InventoryItemType[]>([]);

  useEffect(() => {
  let filtered: InventoryItemType[] = inventoryItems;
  
  switch (currentView) {
    case 'old':
      filtered = inventoryItems.filter(item => item.type === 'OLD');
      break;
    case 'new':
      filtered = inventoryItems.filter(item => item.type === 'NEW');
      break;
    case 'lowstock':
      filtered = inventoryItems.filter(item => (item.quantity || 0) <= (item.reorderLevel || 50));
      break;
    case 'value':
      filtered = [...inventoryItems].sort((a, b) => ((b.unitCost || 0) * (b.quantity || 0)) - ((a.unitCost || 0) * (a.quantity || 0)));
      break;
    default:
      filtered = inventoryItems;
  }
  
  setFilteredItems(filtered);
}, [inventoryItems, currentView]);

  // Form setup similar to Inventory page to keep fields consistent with backend
  const form = useForm<{ 
    name: string;
    category: string;
    type: string;
    quantity: number;
    unit: string;
    location: string;
    reorderLevel: number;
    maxStock: number;
    safetyStock: number;
    primarySupplier: string;
    secondarySupplier?: string;
    unitCost: number;
  }>({
    defaultValues: {
      name: "",
      category: "",
      type: "",
      quantity: 0,
      unit: "",
      location: "",
      reorderLevel: 0,
      maxStock: 0,
      safetyStock: 0,
      primarySupplier: "",
      secondarySupplier: "",
      unitCost: 0,
    },
  });

  // Warehouse form for Warehouse model schema
  const warehouseForm = useForm<{
    itemName: string;
    category: string; // InventoryCategory enum value
    type: string;
    quantity: number;
    unit: string; // Unit enum value
    location: string;
    reorderLevel: number;
    maximumStock: number;
    safetyStock: number;
    unitCost: number;
    itemQuality: string; // ItemQuality enum value
  }>({
    defaultValues: {
      itemName: "",
      category: "",
      type: "",
      quantity: 0,
      unit: "",
      location: "",
      reorderLevel: 0,
      maximumStock: 0,
      safetyStock: 0,
      unitCost: 0,
      itemQuality: "GOOD",
    },
  });

  // Delete confirmation dialog state
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Warehouse Modal State
  const [isEditWarehouseOpen, setIsEditWarehouseOpen] = useState(false);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);

  // Refresh helper
  const refreshWarehouses = async () => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = `${API_URL}/warehouse`;
      const itemsResponse = await axios.get(endpoint, { headers });
      setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
    } catch (err) {
      console.error("Failed to refresh inventory items", err);
    }
  };

  // Open edit with row data prefilled
  const handleEdit = (row: any) => {
    setEditingWarehouseId(row.id);
    warehouseForm.reset({
      itemName: row.itemName || row.name || "",
      category: Array.isArray(row.category) ? (row.category[0] || "") : (row.category || ""),
      type: row.type || "OLD",
      quantity: Number(row.quantity) || 0,
      unit: row.unit || "",
      location: row.location || "",
      reorderLevel: Number(row.reorderLevel) || 0,
      maximumStock: Number(row.maximumStock ?? row.maxStock ?? 0),
      safetyStock: Number(row.safetyStock) || 0,
      unitCost: Number(row.unitCost) || 0,
      itemQuality: row.itemQuality || "GOOD",
    });
    setIsEditWarehouseOpen(true);
  };

  // Delete warehouse item
const handleDeleteItem = async (item: InventoryItem) => {
  setIsDeleting(true);
  try {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${API_URL}/warehouse/${item.id}`, { headers });
    toast.success("Item deleted successfully");
    setItemToDelete(null);
    await refreshWarehouses();
  } catch (error: any) {
    console.error("Failed to delete item:", error);
    const msg = error?.response?.data?.error || error?.message || "Failed to delete item";
    toast.error(msg);
  } finally {
    setIsDeleting(false);
  }
};

  // Update submit
  const onSubmitUpdateWarehouse = async (values: any) => {
    if (!editingWarehouseId) return;
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      const payload = {
        itemName: values.itemName,
        category: values.category,
        type: values.type,
        quantity: Number(values.quantity) || 0,
        unit: values.unit,
        location: values.location,
        reorderLevel: Number(values.reorderLevel) || 0,
        maximumStock: Number(values.maximumStock) || 0,
        safetyStock: Number(values.safetyStock) || 0,
        unitCost: Number(values.unitCost) || 0,
        itemQuality: values.itemQuality,
      };

      await axios.put(`${API_URL}/warehouse/${editingWarehouseId}`, payload, { headers });

      toast.success("Item updated successfully");
      setIsEditWarehouseOpen(false);
      setEditingWarehouseId(null);
      await refreshWarehouses();
    } catch (error: any) {
      console.error("Failed to update item:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed to update item";
      toast.error(msg);
    }
  };

  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!userID) return;
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const endpoint = `${API_URL}/warehouse`;
        const itemsResponse = await axios.get(endpoint, { headers });
        setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
      } catch (err) {
        console.error("Failed to fetch inventory items", err);
        setInventoryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMaterialRequests = async () => {
      if (!userID) return;
      setIsReqLoading(true);
      try {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const isAdmin = user?.role === "admin" || user?.role === "md";
        const endpoint = isAdmin
          ? `${API_URL}/material/material-requests`
          : `${API_URL}/material/material-requests/user/${userID}`;
        const res = await axios.get(endpoint, { headers });
        setMaterialRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch material requests", err);
        setMaterialRequests([]);
      } finally {
        setIsReqLoading(false);
      }
    };

    fetchWarehouseData();
    fetchMaterialRequests();
  }, [userID]);

  // Derived stats
  const totalItems = inventoryItems.length;
  const totalValue = useMemo(
    () => inventoryItems.reduce((sum, it) => sum + (it.unitCost || 0) * (it.quantity || 0), 0),
    [inventoryItems]
  );
  const lowStockCount = useMemo(
    () => inventoryItems.filter((it) => (it.quantity || 0) <= (it.reorderLevel || 50)).length,
    [inventoryItems]
  );
  const uniqueCategoryCount = useMemo(() => {
    const set = new Set<string>();
    for (const it of inventoryItems) {
      if (Array.isArray(it.category)) it.category.forEach((c) => set.add(String(c)));
      else if (it.category) set.add(String(it.category));
    }
    return set.size;
  }, [inventoryItems]);

  // Dynamic filters
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of inventoryItems) {
      if (Array.isArray(it.category)) it.category.forEach((c) => set.add(String(c)));
      else if (it.category) set.add(String(it.category));
    }
    return Array.from(set);
  }, [inventoryItems]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of inventoryItems) if (it.location) set.add(it.location);
    return Array.from(set);
  }, [inventoryItems]);

  // Submit handler to create a new inventory item
  const onSubmitAddItem = async (values: any) => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      // Map UI fields to backend expected payload
      const payload = {
        itemName: values.name,
        category: values.category, // should be enum value like in Inventory page
        type: values.type, // should be enum value like in Inventory page
        quantity: Number(values.quantity) || 0,
        unit: values.unit, // enum
        location: values.location,
        reorderLevel: Number(values.reorderLevel) || 0,
        maximumStock: Number(values.maxStock) || 0,
        safetyStock: Number(values.safetyStock) || 0,
        primarySupplierName: values.primarySupplier,
        vendorId: "", // optional for now unless you want to select a vendor ID
        secondarySupplierName: values.secondarySupplier || undefined,
        unitCost: Math.round((Number(values.unitCost) || 0) * 100), // cents
        createdById: userID,
      };

      const res = await axios.post(`${API_URL}/inventory/items`, payload, { headers });

      // Refresh items list with the new item structure already returned by backend
      await (async () => {
        const endpoint = `${API_URL}/warehouse`;
        const itemsResponse = await axios.get(endpoint, { headers });
        setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
      })();

      toast.success("Item added successfully");
      setIsAddItemOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Failed to add item:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed to add item";
      toast.error(msg);
    }
  };

  // Submit handler to create a new warehouse entry per Warehouse schema
  const onSubmitAddWarehouse = async (values: any) => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      const payload = {
        itemName: values.itemName,
        category: values.category,
        type: values.type,
        quantity: Number(values.quantity) || 0,
        unit: values.unit,
        location: values.location,
        reorderLevel: Number(values.reorderLevel) || 0,
        maximumStock: Number(values.maximumStock) || 0,
        safetyStock: Number(values.safetyStock) || 0,
        unitCost: Number(values.unitCost) || 0,
        itemQuality: values.itemQuality,
      };

      // POST to warehouse API; createdById is set from query by backend
      await axios.post(`${API_URL}/warehouse?userId=${userID}`, payload, { headers });

      toast.success("Warehouse item added successfully");
      setIsAddWarehouseOpen(false);
      warehouseForm.reset();

      // Optionally refresh inventoryItems if you want to reflect immediately
      // You may fetch warehouses here or keep separate state for warehouse list
    } catch (error: any) {
      console.error("Failed to add warehouse item:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed to add warehouse item";
      toast.error(msg);
    }
  };

  // Columns similar to Inventory tab
  const columns = [
    {
      key: "itemName",
      label: "Item Name",
      type: "text" as const,
      render: (value: any, row: InventoryItem) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {Array.isArray(row.category) ? (
              row.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs">{row.category}</Badge>
            )}
            <Badge
              variant={(row.quantity || 0) > (row.reorderLevel || 50) ? "default" : "destructive"}
              className="text-xs"
            >
              {row.quantity} {row.unit}
            </Badge>
          </div>
        </div>
      ),
    },
    { key: "location", label: "Location", type: "text" as const, className: "hidden sm:table-cell" },
    { key: "itemQuality", label: "Status", type: "text" as const, className: "hidden md:table-cell" },
    {
      key: "actions",
      label: "Actions",
      type: "custom" as const,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => setItemToDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  // Expandable row content (simplified)
  const expandableContent = (row: InventoryItem) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <div className="space-y-1">
          <div>Reorder Level: {row.reorderLevel || 50}</div>
          <div>Max Stock: {row.maximumStock || 500}</div>
        </div>
      </div>
      <div>
        <div className="space-y-1">
          <div>Safety Stock: {row.safetyStock || 20}</div>
          <div>Unit Cost: ₹{row.unitCost || 0}</div>
          
        </div>
      </div>
      <div>
        <div className="space-y-1">
          {/* <div>
            Total Value: ₹{(((row.unitCost || 0) * (row.quantity || 0)) || 0).toLocaleString()}
          </div> */}
          <div>Location: {row.location}</div>
          <div>Status: {row.itemQuality}</div>
        </div>
      </div>
    </div>
  );

  // Helper to get item count from a request
  const getRequestItemCount = (req: MaterialRequest) => (Array.isArray(req.items) ? req.items.length : 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
          <p className="text-muted-foreground">Comprehensive Warehouse Dashboard for Inventory Insights</p>
        </div>
        <Button onClick={() => setIsAddWarehouseOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Items
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <EnhancedStatCard
      title="Total Items"
      value={totalItems.toString()}
      icon={Package}
      description="Items in warehouse"
      trend={{ value: totalItems > 0 ? 12 : 0, label: "vs last month" }}
      threshold={{
        status: totalItems > 10 ? "good" : totalItems > 5 ? "warning" : "critical",
        message: totalItems > 10 ? "Good inventory diversity" : totalItems > 5 ? "Consider expanding inventory" : "Low inventory count",
      }}
      onClick={() => setCurrentView('all')}
    />
    
    {/* <EnhancedStatCard
      title="Total Value"
      value={`₹${totalValue.toLocaleString()}`}
      icon={TrendingUp}
      description="Total inventory value"
      trend={{ value: 8, label: "vs last month" }}
      threshold={{ status: "good", message: "Healthy inventory value" }}
      onClick={() => setCurrentView('value')}
    /> */}
    
    <EnhancedStatCard
      title="Low Stock Items"
      value={lowStockCount.toString()}
      icon={AlertTriangle}
      description="Below reorder level"
      threshold={{
        status: lowStockCount === 0 ? "good" : lowStockCount <= 2 ? "warning" : "critical",
        message: lowStockCount === 0 ? "All items well stocked" : lowStockCount <= 2 ? "Few items need restocking" : "Multiple items critically low",
      }}
      onClick={() => setCurrentView('lowstock')}
    />

    <EnhancedStatCard
      title="Old Items"
      value={(
        inventoryItems
          .filter((item) => item.type === 'OLD')
          .filter((item, index, self) => 
            index === self.findIndex(t => (t.itemName || t.name) === (item.itemName || item.name) && t.type === item.type)
          )
          .length || 0
      ).toString()}
      icon={Package}
      description="Items marked as OLD"
      trend={{ value: 3, label: "vs last month" }}
      threshold={{
        status: inventoryItems.filter((item) => item.type === 'OLD').length > 0 ? "good" : "warning",
        message: inventoryItems.filter((item) => item.type === 'OLD').length > 0 ? "Old items in stock" : "No old items available"
      }}
      onClick={() => setCurrentView('old')}
    />

    <EnhancedStatCard
      title="New Items"
      value={(
        inventoryItems
          .filter((item) => item.type === 'NEW')
          .filter((item, index, self) => 
            index === self.findIndex(t => (t.itemName || t.name) === (item.itemName || item.name) && t.type === item.type)
          )
          .length || 0
      ).toString()}
      icon={Package}
      description="Items marked as NEW"
      trend={{ value: 5, label: "vs last month" }}
      threshold={{
        status: inventoryItems.filter((item) => item.type === 'NEW').length > 0 ? "good" : "warning",
        message: inventoryItems.filter((item) => item.type === 'NEW').length > 0 ? "New items available" : "No new items in stock"
      }}
      onClick={() => setCurrentView('new')}
    />
  </div>

      {/* Tabs below the cards */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 items-center justify-between w-full">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          {currentView !== 'all' && (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <div>
          <CardTitle className="text-xl">
            {currentView === 'old' && 'Old Items'}
            {currentView === 'new' && 'New Items'}
            {currentView === 'lowstock' && 'Low Stock Items'}
            {currentView === 'value' && 'High Value Items'}
          </CardTitle>
          <CardDescription>
            {currentView === 'old' && 'Showing items with type OLD'}
            {currentView === 'new' && 'Showing items with type NEW'}
            {currentView === 'lowstock' && 'Showing items below reorder level'}
            {currentView === 'value' && 'Showing items sorted by total value'}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('all')}>
          Back to All Items
        </Button>
      </CardHeader>
      <CardContent>
        <ExpandableDataTable
          title="Warehouse Inventory Items"
          description="Filtered view"
          data={filteredItems as any[]}
          columns={columns as any}
          expandableContent={expandableContent as any}
          searchKey="name"
          filters={[
            { key: "category", label: "Category", options: categoryOptions },
            { key: "location", label: "Location", options: locationOptions },
          ]}
          rowActions={["view"]}
        />
      </CardContent>
    </Card>
  )}

  {currentView === 'all' && (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading warehouse items...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ExpandableDataTable
            title="Warehouse Inventory Items"
            description="Warehouse-focused view of inventory with quick insights"
            data={inventoryItems as any[]}
            columns={columns as any}
            expandableContent={expandableContent as any}
            searchKey="name"
            filters={[
              { key: "category", label: "Category", options: categoryOptions },
              { key: "location", label: "Location", options: locationOptions },
            ]}
            rowActions={["view"]}
          />
        </div>
      )}
    </>
  )}

          {/* Add Warehouse Item Dialog (Warehouse schema) */}
          <Dialog
            open={isAddWarehouseOpen}
            onOpenChange={(open) => {
              setIsAddWarehouseOpen(open);
              if (!open) warehouseForm.reset();
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Warehouse Item</DialogTitle>
                <DialogDescription>Fill in the details to add a new warehouse item.</DialogDescription>
              </DialogHeader>

              <Form {...warehouseForm}>
                <form onSubmit={warehouseForm.handleSubmit(onSubmitAddWarehouse)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={warehouseForm.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ITEM_OPTIONS.map((option) => (
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
                      control={warehouseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                      control={warehouseForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INVENTORY_TYPE_OPTIONS.map((option) => (
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
                      control={warehouseForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
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
                      control={warehouseForm.control}
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
                      control={warehouseForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="maximumStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="safetyStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="unitCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Cost</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="itemQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Quality</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GOOD">Good</SelectItem>
                              <SelectItem value="BAD">Bad</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsAddWarehouseOpen(false); warehouseForm.reset(); }}>Cancel</Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Warehouse Item Dialog */}
          <Dialog
            open={isEditWarehouseOpen}
            onOpenChange={(open) => {
              setIsEditWarehouseOpen(open);
              if (!open) setEditingWarehouseId(null);
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Warehouse Item</DialogTitle>
                <DialogDescription>Update the fields and save changes.</DialogDescription>
              </DialogHeader>

              <Form {...warehouseForm}>
                <form onSubmit={warehouseForm.handleSubmit(onSubmitUpdateWarehouse)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={warehouseForm.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ITEM_OPTIONS.map((option) => (
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
                      control={warehouseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                      control={warehouseForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INVENTORY_TYPE_OPTIONS.map((option) => (
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
                      control={warehouseForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
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
                      control={warehouseForm.control}
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
                      control={warehouseForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="maximumStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="safetyStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="unitCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Cost</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={warehouseForm.control}
                      name="itemQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Quality</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GOOD">Good</SelectItem>
                              <SelectItem value="BAD">Bad</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsEditWarehouseOpen(false); setEditingWarehouseId(null); }}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
        </TabsContent>
        <AlertDialog
  open={!!itemToDelete}
  onOpenChange={() => setItemToDelete(null)}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Warehouse Item</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{itemToDelete?.itemName || itemToDelete?.name}"? This
        action cannot be undone. This will permanently remove the item
        from your warehouse inventory.
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
        <TabsContent value="requests">
          {isReqLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>Loading requests...</span>
              </div>
            </div>
          ) : materialRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg">No material requests found.</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Request ID</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Target Warehouse</th>
                    <th className="text-left p-3">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {materialRequests.map((req) => (
                    <tr key={req.id} className="border-t">
                      <td className="p-3 font-medium">{req.id}</td>
                      <td className="p-3">
                        <Badge variant={
                          req.status === "COMPLETED"
                            ? "default"
                            : req.status === "APPROVED"
                            ? "secondary"
                            : req.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }>
                          {req.status || "PENDING"}
                        </Badge>
                      </td>
                      <td className="p-3">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="p-3">{req.targetWarehouse || "—"}</td>
                      <td className="p-3">{getRequestItemCount(req)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseDashboard;