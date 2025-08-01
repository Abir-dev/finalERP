import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  DollarSign,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Package,
  Search,
  X,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PurchaseOrderForm } from "./purchase-order-form";
import axios from "axios";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
// import { toast } from "sonner";
import { toast } from "@/components/ui/use-toast";
import { AddVendorModal } from "@/components/modals/AddVendorModal";
import { NewMaterialRequestModal } from "@/components/modals/NewMaterialRequestModal";
import { VendorManagement } from "@/components/vendor-management/VendorManagement";
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  vendorId: string;
  Vendor?: {
    id: string;
    name: string;
    email?: string;
    contact?: string;
  };
  requiredBy: string;
  items: any[];
  totalQuantity: number;
  total: number;
  grandTotal: number;
  roundedTotal: number;
  advancePaid: number;
  taxesAndChargesTotal: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  items: string;
  quantity: number;
  unit: string;
  requestDate: string;
  requiredDate: string;
  status: "pending" | "approved" | "ordered" | "delivered";
  project: string;
  urgency: "normal" | "urgent" | "emergency";
}

export function PurchaseDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  const fetchPurchaseOrders = async () => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/purchase-orders`, { headers });
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "approved":
        return "default";
      case "acknowledged":
      case "ordered":
        return "secondary";
      case "sent":
      case "pending":
        return "outline";
      case "paid":
        return "default";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "emergency":
        return "destructive";
      case "high":
        return "default";
      case "medium":
      case "normal":
        return "secondary";
      case "low":
        return "outline";
    }
  };

  const totalOrderValue = purchaseOrders.reduce(
    (sum, po) => sum + po.grandTotal,
    0
  );
  const completedOrders = purchaseOrders.filter(
    (po) => po.advancePaid > 0
  ).length;
  
  // Filter purchase orders based on search query
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.Vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => 
        item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSearch;
  });

  const handleCreateNewOrder = () => {
    setShowComprehensiveForm(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setCurrentOrder(order);
    setIsDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        await axios.delete(`${API_URL}/purchase-orders/${orderToDelete}`, { headers });
        
        setPurchaseOrders(
          purchaseOrders.filter((order) => order.id !== orderToDelete)
        );
        
        toast({
          title: "Success",
          description: "Purchase order deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive",
        });
      }
      
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const saveOrder = () => {
    if (!currentOrder) return;

    if (currentOrder.id) {
      // Update existing order
      setPurchaseOrders(
        purchaseOrders.map((order) =>
          order.id === currentOrder.id ? currentOrder : order
        )
      );
    } else {
      // Add new order
      const newOrder = {
        ...currentOrder,
        id: `PO${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
      };
      setPurchaseOrders([...purchaseOrders, newOrder]);
    }

    setIsDialogOpen(false);
    setCurrentOrder(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentOrder) return;

    const { name, value } = e.target;
    setCurrentOrder({
      ...currentOrder,
      [name]: value,
    });
  };

  const handleSelectChange = (name: keyof PurchaseOrder, value: string) => {
    if (!currentOrder) return;

    setCurrentOrder({
      ...currentOrder,
      [name]: value,
    });
  };

  // Remove static array
  // const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([
  //   {
  //     id: "MR001",
  //     requestNumber: "MR-2024-001",
  //     requestedBy: "Site Engineer - Team A",
  //     items: "Steel Rods",
  //     quantity: 500,
  //     unit: "kg",
  //     requestDate: "2024-01-22",
  //     requiredDate: "2024-01-30",
  //     status: "approved",
  //     project: "Commercial Complex",
  //     urgency: "normal",
  //   },
  //   {
  //     id: "MR002",
  //     requestNumber: "MR-2024-002",
  //     requestedBy: "Project Manager",
  //     items: "RMC M25",
  //     quantity: 25,
  //     unit: "cum",
  //     requestDate: "2024-01-23",
  //     requiredDate: "2024-01-25",
  //     status: "pending",
  //     project: "Residential Towers",
  //     urgency: "urgent",
  //   },
  // ]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    []
  );

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${API_URL}/material-requests`, { headers })
      .then((res) => setMaterialRequests(res.data))
      .catch(() => {});
  }, []);

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  // Remove currentRequest and related logic for the old modal

  // Update approve/reject/create/update/delete to use backend API
  const handleApproveRequest = async (requestId: string) => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.patch(
      `${API_URL}/material-requests/${requestId}/approve`,
      {},
      { headers }
    );
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
  };
  const handleRejectRequest = async (requestId: string) => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${API_URL}/material-requests/${requestId}`, {
      headers,
    });
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
  };
  const handleCreatePOFromRequest = (request: MaterialRequest) => {
    // Create a new PO from the material request
    const newPO: PurchaseOrder = {
      id: "",
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1)
        .toString()
        .padStart(3, "0")}`,
      vendor: "", // Will be selected when creating PO
      items: request.items,
      totalAmount: 0, // To be calculated
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: request.requiredDate,
      status: "draft",
      priority: request.urgency === "urgent" ? "high" : "medium",
      project: request.project,
    };

    setCurrentOrder(newPO);
    setIsDialogOpen(true);

    // Update request status to 'ordered'
    // setMaterialRequests(
    //   materialRequests.map((mr) =>
    //     mr.id === request.id ? { ...mr, status: "ordered" } : mr,
    //   ),
    // );
  };

  // Remove handleCreateNewRequest and saveRequest for the old modal

  // Add handler for new modal save
  const handleNewMaterialRequestSave = async (data: any) => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.post(`${API_URL}/material-requests`, data, { headers });
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
  };

  return (
    <div>
      {/* <CardHeader></CardHeader> */}
      {/* <CardContent className="mt-6"> */}
        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Material Requests</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            {/* <TabsTrigger value="vendors">Vendors</TabsTrigger> */}
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{(totalOrderValue / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{completedOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending Requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Urgent Items
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Recent Purchase Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchaseOrders.slice(0, 3).map((po) => (
                      <div
                        key={po.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{po.poNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {po.Vendor?.name || 'N/A'} • {po.items.length} item(s)
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">
                              {po.items.length} items
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{po.grandTotal?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(po.requiredBy).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Pending Material Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {materialRequests.map((mr) => (
                      <div
                        key={mr.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{mr.requestNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mr.requestedBy}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={getStatusColor(mr.status)}>
                              {mr.status}
                            </Badge>
                            <Badge variant={getPriorityColor(mr.urgency)}>
                              {mr.urgency}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {mr.quantity} {mr.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Need: {mr.requiredDate}
                          </p>
                          {mr.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Material Requests</CardTitle>
                    <CardDescription>
                      Review and approve material requests from site teams
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsRequestDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request #</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Required By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialRequests.length > 0 ? (
                        materialRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.requestNumber}
                            </TableCell>
                            <TableCell>{request.requestedBy}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {request.items}
                            </TableCell>
                            <TableCell>
                              {request.quantity} {request.unit}
                            </TableCell>
                            <TableCell>{request.requestDate}</TableCell>
                            <TableCell>{request.requiredDate}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getPriorityColor(request.urgency)}
                              >
                                {request.urgency}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveRequest(request.id)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRejectRequest(request.id)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === "approved" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCreatePOFromRequest(request)
                                    }
                                  >
                                    Create PO
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // setCurrentRequest(request); // This line is no longer needed
                                    // setIsRequestDialogOpen(true); // This line is no longer needed
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No material requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <NewMaterialRequestModal
              open={isRequestDialogOpen}
              onOpenChange={setIsRequestDialogOpen}
              onSave={handleNewMaterialRequestSave}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                  <div>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>
                      View, filter, and manage all purchase orders in the system
                    </CardDescription>
                  </div>
                  <div className="flex flex-1 gap-4 items-center md:justify-end">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="invoiced">Invoiced</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    {/*
                    <Select
                      value={selectedPriority}
                      onValueChange={setSelectedPriority}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    */}
                    <Button onClick={() => setShowComprehensiveForm(true)}>
                      <Plus className="mr-2 h-4 w-4" /> New Purchase Order
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Required By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchaseOrders.length > 0 ? (
                        filteredPurchaseOrders.map((order) => (
                          <TableRow key={order.id}>
                          <TableCell className="font-medium">
                          {order.poNumber}
                          </TableCell>
                          <TableCell>{order.Vendor?.name || 'N/A'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                          {order.items.length > 0 
                              ? `${order.items.length} item(s): ${order.items[0]?.itemCode || ''}`
                              : 'No items'
                          }
                          </TableCell>
                          <TableCell>
                            ₹{order.grandTotal?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell>
                          {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(order.requiredBy).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                          <div className="flex gap-2">
                              <Button
                                variant="outline"
                              size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                          <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                          variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                          <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                          </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No purchase orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <VendorManagement />
          </TabsContent>
        </Tabs>
      {/* </CardContent> */}
      {/* Add/Edit Purchase Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentOrder?.id
                ? "Edit Purchase Order"
                : "Create New Purchase Order"}
            </DialogTitle>
            <DialogDescription>
              {currentOrder?.id
                ? `Update details for ${currentOrder.poNumber}`
                : "Fill in the details for the new purchase order"}
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="poNumber" className="text-right">
                  PO Number
                </label>
                <Input
                  id="poNumber"
                  name="poNumber"
                  value={currentOrder.poNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={!!currentOrder.id}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="vendor" className="text-right">
                  Vendor
                </label>
                <Input
                  id="vendor"
                  name="vendor"
                  value={currentOrder.vendor}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="items" className="text-right">
                  Items
                </label>
                <Input
                  id="items"
                  name="items"
                  value={currentOrder.items}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="totalAmount" className="text-right">
                  Amount (₹)
                </label>
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  value={currentOrder.totalAmount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="orderDate" className="text-right">
                  Order Date
                </label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="date"
                  value={currentOrder.orderDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="expectedDelivery" className="text-right">
                  Expected Delivery
                </label>
                <Input
                  id="expectedDelivery"
                  name="expectedDelivery"
                  type="date"
                  value={currentOrder.expectedDelivery}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  Status
                </label>
                <Select
                  value={currentOrder.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="priority" className="text-right">
                  Priority
                </label>
                <Select
                  value={currentOrder.priority}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
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

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="project" className="text-right">
                  Project
                </label>
                <Input
                  id="project"
                  name="project"
                  value={currentOrder.project}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={saveOrder}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this purchase order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comprehensive Purchase Order Form Dialog */}
      <Dialog
        open={showComprehensiveForm}
        onOpenChange={setShowComprehensiveForm}
      >
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <PurchaseOrderForm 
              onSuccess={() => {
                fetchPurchaseOrders();
                setShowComprehensiveForm(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Material Request Modal */}
      <NewMaterialRequestModal
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSave={handleNewMaterialRequestSave}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={showNewVendorModal}
        onOpenChange={setShowNewVendorModal}
      />
    </div>
  );
}
