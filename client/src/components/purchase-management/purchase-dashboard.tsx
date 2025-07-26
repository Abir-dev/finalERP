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
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  items: string;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: "draft" | "sent" | "acknowledged" | "delivered" | "invoiced" | "paid";
  priority: "low" | "medium" | "high" | "urgent";
  project: string;
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
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "",
    contact: "",
    email: "",
    address: "",
    paymentTerms: "",
    documents: [] as File[]
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
const [showVendorDetails, setShowVendorDetails] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/purchase-orders`, { headers })
      .then(res => setPurchaseOrders(res.data))
      .catch(() => {});
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
    (sum, po) => sum + po.totalAmount,
    0,
  );
  const deliveredOrders = purchaseOrders.filter(
    (po) => po.status === "delivered",
  ).length;
  // Filter purchase orders based on selected filters and search query
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || order.priority === selectedPriority;
    const matchesSearch =
      searchQuery === "" ||
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.project.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateNewOrder = () => {
    setCurrentOrder({
      id: "",
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
      vendor: "",
      items: "",
      totalAmount: 0,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "draft",
      priority: "medium",
      project: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setCurrentOrder(order);
    setIsDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      setPurchaseOrders(
        purchaseOrders.filter((order) => order.id !== orderToDelete),
      );
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
          order.id === currentOrder.id ? currentOrder : order,
        ),
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
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/material-requests`, { headers })
      .then(res => setMaterialRequests(res.data))
      .catch(() => {});
  }, []);

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<MaterialRequest | null>(
    null,
  );

  // Update approve/reject/create/update/delete to use backend API
  const handleApproveRequest = async (requestId: string) => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.patch(`${API_URL}/material-requests/${requestId}/approve`, {}, { headers });
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
  };
  const handleRejectRequest = async (requestId: string) => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${API_URL}/material-requests/${requestId}`, { headers });
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
  };
  const handleCreatePOFromRequest = (request: MaterialRequest) => {
    // Create a new PO from the material request
    const newPO: PurchaseOrder = {
      id: "",
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
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

  const handleCreateNewRequest = () => {
    setCurrentRequest({
      id: "",
      requestNumber: `MR-${new Date().getFullYear()}-${(materialRequests.length + 1).toString().padStart(3, "0")}`,
      requestedBy: "",
      items: "",
      quantity: 0,
      unit: "",
      requestDate: new Date().toISOString().split("T")[0],
      requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "pending",
      project: "",
      urgency: "normal",
    });
    setIsRequestDialogOpen(true);
  };

  const saveRequest = async () => {
    if (!currentRequest) return;
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (currentRequest.id) {
      await axios.put(`${API_URL}/material-requests/${currentRequest.id}`, currentRequest, { headers });
    } else {
      await axios.post(`${API_URL}/material-requests`, currentRequest, { headers });
    }
    const res = await axios.get(`${API_URL}/material-requests`, { headers });
    setMaterialRequests(res.data);
    setIsRequestDialogOpen(false);
    setCurrentRequest(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          
          {activeTab === "orders" && (
            <div className="flex gap-2">
              <Button onClick={() => setShowComprehensiveForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Purchase Order
              </Button>
              {/* <Button onClick={handleCreateNewOrder} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Quick Order
              </Button> */}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
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
                      <p className="text-sm text-muted-foreground">Delivered</p>
                      <p className="text-2xl font-bold">{deliveredOrders}</p>
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
                            {po.vendor} • {po.items}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={getStatusColor(po.status)}>
                              {po.status}
                            </Badge>
                            <Badge variant={getPriorityColor(po.priority)}>
                              {po.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(po.totalAmount / 1000).toFixed(0)}K
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {po.expectedDelivery}
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
                  <Button onClick={handleCreateNewRequest}>
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
                                    setCurrentRequest(request);
                                    setIsRequestDialogOpen(true);
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
                          <TableCell colSpan={9} className="h-24 text-center">
                            No material requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-4">
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
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <X
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div>
            </div>

            {/* Purchase Orders Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
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
                        <TableCell>{order.vendor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {order.items}
                        </TableCell>
                        <TableCell>
                          ₹{(order.totalAmount / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{order.expectedDelivery}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
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
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
  <Card>
  <CardHeader className="flex flex-row items-center justify-between">
  <div>
    <CardTitle>Vendor Performance Management</CardTitle>
    <CardDescription>Track and evaluate vendor performance across multiple metrics</CardDescription>
  </div>
  <Button 
    onClick={() => setShowNewVendorModal(true)}
    size="sm"
  >
    <Plus className="mr-2 h-4 w-4" />
    Add Vendor
  </Button>
</CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            id: 'steel-corp',
            vendor: 'Steel Corp Ltd',
            category: 'Raw Materials',
            orders: 24,
            onTimeDelivery: 95,
            qualityScore: 4.5,
            priceCompetitiveness: 4.2,
            totalValue: '₹25L',
            status: 'Preferred',
            contact: 'Rajesh Kumar - +91 9876543210',
            contract: 'Active until Dec 2023',
            paymentTerms: 'Net 30',
            performanceNotes: 'Consistent quality, reliable delivery'
          },
          {
            id: 'cement-ind',
            vendor: 'Cement Industries',
            category: 'Building Materials',
            orders: 18,
            onTimeDelivery: 88,
            qualityScore: 4.2,
            priceCompetitiveness: 4.0,
            totalValue: '₹18L',
            status: 'Approved',
            contact: 'Priya Sharma - +91 8765432109',
            contract: 'Active until Nov 2023',
            paymentTerms: 'Net 45',
            performanceNotes: 'Good pricing but occasional delays'
          },
          {
            id: 'hardware-sol',
            vendor: 'Hardware Solutions',
            category: 'Tools & Equipment',
            orders: 32,
            onTimeDelivery: 92,
            qualityScore: 4.3,
            priceCompetitiveness: 4.1,
            totalValue: '₹12L',
            status: 'Preferred',
            contact: 'Vikram Patel - +91 7654321098',
            contract: 'Active until Jan 2024',
            paymentTerms: 'Net 15',
            performanceNotes: 'Excellent customer service'
          },
          {
            id: 'safety-co',
            vendor: 'Safety First Co',
            category: 'Safety Equipment',
            orders: 15,
            onTimeDelivery: 78,
            qualityScore: 3.8,
            priceCompetitiveness: 3.5,
            totalValue: '₹8L',
            status: 'Under Review',
            contact: 'Anjali Gupta - +91 6543210987',
            contract: 'Expiring next month',
            paymentTerms: 'Net 30',
            performanceNotes: 'Quality concerns reported'
          }
        ].map((vendor) => (
          <div key={vendor.id} className="p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
              <div className="md:col-span-2">
                <h4 className="font-medium">{vendor.vendor}</h4>
                <p className="text-sm text-muted-foreground">{vendor.category}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  vendor.status === 'Preferred' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="font-medium">{vendor.orders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Time</p>
                <p className="font-medium">{vendor.onTimeDelivery}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <p className="font-medium">{vendor.qualityScore}/5.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{vendor.priceCompetitiveness}/5.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-medium">{vendor.totalValue}</p>
              </div>
              <div className="flex justify-center gap-3 md:col-span-2">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowVendorDetails(true);
                  }}
                >
                  Details
                </Button>
                {/* <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContactVendor(vendor.contact)}
                >
                  Contact
                </Button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Vendor Details Modal */}
  <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
    <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{selectedVendor?.vendor} Details</DialogTitle>
        <DialogDescription>
          Comprehensive vendor performance and contract information
        </DialogDescription>
      </DialogHeader>
      
      {selectedVendor && (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium">{selectedVendor.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  selectedVendor.status === 'Preferred' ? 'bg-green-500' : 
                  selectedVendor.status === 'Approved' ? 'bg-blue-500' : 
                  'bg-yellow-500'
                }`} />
                <span className="capitalize">{selectedVendor.status}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Orders</Label>
              <p className="font-medium">{selectedVendor.orders}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Value</Label>
              <p className="font-medium">{selectedVendor.totalValue}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">On-Time Delivery</Label>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${selectedVendor.onTimeDelivery}%` }}
                  ></div>
                </div>
                <span className="text-sm">{selectedVendor.onTimeDelivery}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Quality Score</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(selectedVendor.qualityScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm">({selectedVendor.qualityScore.toFixed(1)})</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Price Rating</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(selectedVendor.priceCompetitiveness) ? 'text-blue-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm">({selectedVendor.priceCompetitiveness.toFixed(1)})</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Contact Information</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.contact}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Contract Details</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.contract}</p>
              <p className="text-sm mt-2">Payment Terms: {selectedVendor.paymentTerms}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Performance Notes</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.performanceNotes}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            {/* <Button 
              variant="outline"
              onClick={() => {
                setPoFormData({
                  ...poFormData,
                  vendor: selectedVendor.id,
                  description: `Purchase order for ${selectedVendor.category} from ${selectedVendor.vendor}`
                });
                setShowVendorDetails(false);
                setIsPOModalOpen(true);
              }}
            >
              Create PO
            </Button> */}
            {/* <Button 
              variant="outline"
              onClick={() => {
                setShowVendorDetails(false);
                handleVendorReport(selectedVendor.vendor);
              }}
            >
              Generate Report
            </Button> */}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

  {/* New Vendor Modal */}
  <Dialog open={showNewVendorModal} onOpenChange={setShowNewVendorModal}>
    <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Vendor</DialogTitle>
        <DialogDescription>
          Register a new vendor in the procurement system
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorName" className="text-right">
            Vendor Name *
          </Label>
          <Input
            id="vendorName"
            value={newVendor.name}
            onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
            className="col-span-3"
            placeholder="Enter vendor name"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorCategory" className="text-right">
            Category *
          </Label>
          <Select
            value={newVendor.category}
            onValueChange={(value) => setNewVendor({...newVendor, category: value})}
            required
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Raw Materials">Raw Materials</SelectItem>
              <SelectItem value="Building Materials">Building Materials</SelectItem>
              <SelectItem value="Tools & Equipment">Tools & Equipment</SelectItem>
              <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorContact" className="text-right">
            Contact *
          </Label>
          <Input
            id="vendorContact"
            value={newVendor.contact}
            onChange={(e) => setNewVendor({...newVendor, contact: e.target.value})}
            className="col-span-3"
            placeholder="Contact person and phone"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorEmail" className="text-right">
            Email *
          </Label>
          <Input
            id="vendorEmail"
            type="email"
            value={newVendor.email}
            onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
            className="col-span-3"
            placeholder="vendor@example.com"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorAddress" className="text-right">
            Address
          </Label>
          <Textarea
            id="vendorAddress"
            value={newVendor.address}
            onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
            className="col-span-3"
            placeholder="Full business address"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorPaymentTerms" className="text-right">
            Payment Terms *
          </Label>
          <Select
            value={newVendor.paymentTerms}
            onValueChange={(value) => setNewVendor({...newVendor, paymentTerms: value})}
            required
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Net 15">Net 15</SelectItem>
              <SelectItem value="Net 30">Net 30</SelectItem>
              <SelectItem value="Net 45">Net 45</SelectItem>
              <SelectItem value="Net 60">Net 60</SelectItem>
              <SelectItem value="Advance">Advance Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendorDocs" className="text-right">
            Documents
          </Label>
          <Input
            id="vendorDocs"
            type="file"
            className="col-span-3"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setNewVendor({...newVendor, documents: Array.from(e.target.files)});
              }
            }}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => setShowNewVendorModal(false)}
        >
          Cancel
        </Button>
        <Button 
          onClick={async () => {
            if (!newVendor.name || !newVendor.category || !newVendor.contact || !newVendor.email || !newVendor.paymentTerms) {
              toast({
                title: "Missing required fields",
                description: "Please fill out all required fields",
                variant: "destructive"
              });
              return;
            }
            
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              toast({
                title: "Vendor added successfully",
                description: `${newVendor.name} has been registered in the system`,
              });
              
              setNewVendor({
                name: "",
                category: "",
                contact: "",
                email: "",
                address: "",
                paymentTerms: "",
                documents: []
              });
              
              setShowNewVendorModal(false);
            } catch (error) {
              toast({
                title: "Error adding vendor",
                description: "Please try again",
                variant: "destructive"
              });
            }
          }}
        >
          Add Vendor
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</TabsContent>
          {/* <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Track vendor performance and relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Steel Corp Ltd', orders: 12, onTimeDelivery: 95, avgRating: 4.5, totalValue: 2500000 },
                    { name: 'Cement Industries', orders: 8, onTimeDelivery: 88, avgRating: 4.2, totalValue: 1800000 },
                    { name: 'Hardware Solutions', orders: 15, onTimeDelivery: 92, avgRating: 4.3, totalValue: 950000 }
                  ].map((vendor) => (
                    <div key={vendor.name} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <h4 className="font-medium">{vendor.name}</h4>
                          <p className="text-sm text-muted-foreground">{vendor.orders} orders</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                          <div className="flex items-center gap-2">
                            <Progress value={vendor.onTimeDelivery} className="flex-1" />
                            <span className="text-sm">{vendor.onTimeDelivery}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="font-medium">{vendor.avgRating}/5.0</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value</p>
                          <p className="font-medium">₹{(vendor.totalValue / 100000).toFixed(1)}L</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            History
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        category: "Raw Materials",
                        amount: 850000,
                        percentage: 45,
                      },
                      { category: "Equipment", amount: 450000, percentage: 24 },
                      { category: "Services", amount: 350000, percentage: 18 },
                      {
                        category: "Consumables",
                        amount: 245000,
                        percentage: 13,
                      },
                    ].map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {category.category}
                          </span>
                          <span>
                            ₹{(category.amount / 1000).toFixed(0)}K (
                            {category.percentage}%)
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">₹2.8L</p>
                      <p className="text-sm text-muted-foreground">
                        Total savings this quarter
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { method: "Bulk Purchasing", savings: 125000 },
                        { method: "Vendor Negotiations", savings: 95000 },
                        { method: "Alternative Sourcing", savings: 60000 },
                      ].map((saving) => (
                        <div
                          key={saving.method}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{saving.method}</span>
                          <span className="font-medium text-green-600">
                            ₹{(saving.savings / 1000).toFixed(0)}K
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
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

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentRequest?.id
                ? "Edit Material Request"
                : "Create New Material Request"}
            </DialogTitle>
            <DialogDescription>
              {currentRequest?.id
                ? `Update details for ${currentRequest.requestNumber}`
                : "Fill in the details for the new material request"}
            </DialogDescription>
          </DialogHeader>

          {currentRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="requestNumber" className="text-right">
                  Request #
                </label>
                <Input
                  id="requestNumber"
                  name="requestNumber"
                  value={currentRequest.requestNumber}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      requestNumber: e.target.value,
                    })
                  }
                  className="col-span-3"
                  disabled={!!currentRequest.id}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="requestedBy" className="text-right">
                  Requested By
                </label>
                <Input
                  id="requestedBy"
                  name="requestedBy"
                  value={currentRequest.requestedBy}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      requestedBy: e.target.value,
                    })
                  }
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
                  value={currentRequest.items}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      items: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="quantity" className="text-right">
                  Quantity
                </label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={currentRequest.quantity}
                    onChange={(e) =>
                      setCurrentRequest({
                        ...currentRequest,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-3/4"
                  />
                  <Select
                    value={currentRequest.unit}
                    onValueChange={(value) =>
                      setCurrentRequest({ ...currentRequest, unit: value })
                    }
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="cum">cum</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="requestDate" className="text-right">
                  Request Date
                </label>
                <Input
                  id="requestDate"
                  name="requestDate"
                  type="date"
                  value={currentRequest.requestDate}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      requestDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="requiredDate" className="text-right">
                  Required By
                </label>
                <Input
                  id="requiredDate"
                  name="requiredDate"
                  type="date"
                  value={currentRequest.requiredDate}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      requiredDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="project" className="text-right">
                  Project
                </label>
                <Input
                  id="project"
                  name="project"
                  value={currentRequest.project}
                  onChange={(e) =>
                    setCurrentRequest({
                      ...currentRequest,
                      project: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="urgency" className="text-right">
                  Urgency
                </label>
                <Select
                  value={currentRequest.urgency}
                  onValueChange={(value) =>
                    setCurrentRequest({
                      ...currentRequest,
                      urgency: value as any,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={saveRequest}>
              Save Changes
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
            <PurchaseOrderForm />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
