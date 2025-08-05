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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PurchaseOrderForm } from "./purchase-order-form";
import axios from "axios";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
// import { toast } from "sonner";
import { toast } from "@/components/ui/use-toast";
import { AddVendorModal } from "@/components/modals/AddVendorModal";
import { NewMaterialRequestModal } from "@/components/modals/NewMaterialRequestModal";
import { EditMaterialRequestModal } from "@/components/modals/EditMaterialRequestModal";
import { VendorManagement } from "@/components/vendor-management/VendorManagement";
import { MaterialRequest, MaterialRequestItem } from "@/types/material-request";
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
  const [materialRequestToDelete, setMaterialRequestToDelete] = useState<
    string | null
  >(null);
  const [isDeleteRequestDialogOpen, setIsDeleteRequestDialogOpen] =
    useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState({
    received: { count: 0, amount: "₹0" },
    pending: { count: 0, amount: "₹0" },
    overdue: { count: 0, amount: "₹0" },
  });

  const fetchPurchaseOrders = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/purchase-orders`, {
        headers,
      });
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(
        "Fetching payment summary from:",
        `${API_URL}/billing/payment-summary`
      );
      const response = await axios.get(`${API_URL}/billing/payment-summary`, {
        headers,
      });
      console.log("Payment summary response:", response.data);
      setPaymentSummary(
        response.data || {
          received: { count: 0, amount: "₹0" },
          pending: { count: 0, amount: "₹0" },
          overdue: { count: 0, amount: "₹0" },
        }
      );
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      console.error("API URL:", API_URL);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchPaymentSummary();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "default";
      case "in_progress":
      case "acknowledged":
        return "secondary";
      case "submitted":
      case "draft":
        return "outline";
      case "rejected":
      case "cancelled":
        return "destructive";
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
      order.items.some(
        (item) =>
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

  const handleDeleteMaterialRequest = (requestId: string) => {
    setMaterialRequestToDelete(requestId);
    setIsDeleteRequestDialogOpen(true);
  };

  const confirmDeleteMaterialRequest = async () => {
    if (materialRequestToDelete) {
      try {
        const token = sessionStorage.getItem("jwt_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(
          `${API_URL}/material/material-requests/${materialRequestToDelete}`,
          {
            headers,
          }
        );
        await fetchMaterialRequests();
        toast({
          title: "Success",
          description: "Material request deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting material request:", error);
        toast({
          title: "Error",
          description: "Failed to delete material request",
          variant: "destructive",
        });
      }
    }
    setIsDeleteRequestDialogOpen(false);
    setMaterialRequestToDelete(null);
  };
  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        const token =
          sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await axios.delete(`${API_URL}/purchase-orders/${orderToDelete}`, {
          headers,
        });

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

  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    []
  );

  const fetchMaterialRequests = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_URL}/material/material-requests`,
        { headers }
      );
      setMaterialRequests(response.data);
    } catch (error) {
      console.error("Error fetching material requests:", error);
    }
  };

  useEffect(() => {
    fetchMaterialRequests();
  }, []);

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isEditRequestDialogOpen, setIsEditRequestDialogOpen] = useState(false);
  const [currentEditRequest, setCurrentEditRequest] =
    useState<MaterialRequest | null>(null);

  // Update approve/reject/create/update/delete to use backend API
  const handleApproveRequest = async (requestId: string) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/material/material-requests/${requestId}/approve`,
        {},
        { headers }
      );
      await fetchMaterialRequests();
      toast({
        title: "Success",
        description: "Material request approved successfully",
      });
    } catch (error) {
      console.error("Error approving material request:", error);
      toast({
        title: "Error",
        description: "Failed to approve material request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/material/material-requests/${requestId}/reject`,
        {
          rejectionReason: "Rejected by admin",
        },
        { headers }
      );
      await fetchMaterialRequests();
      toast({
        title: "Success",
        description: "Material request rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting material request:", error);
      toast({
        title: "Error",
        description: "Failed to reject material request",
        variant: "destructive",
      });
    }
  };

  const handleCreatePOFromRequest = (request: MaterialRequest) => {
    // Create a new PO from the material request
    const newPO: PurchaseOrder = {
      id: "",
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1)
        .toString()
        .padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      vendorId: "",
      requiredBy: request.requiredBy || new Date().toISOString().split("T")[0],
      items: request.items.map((item) => ({
        itemCode: item.itemCode,
        description: item.itemCode,
        quantity: item.quantity,
        unit: item.uom,
      })),
      totalQuantity: request.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      total: 0,
      grandTotal: 0,
      roundedTotal: 0,
      advancePaid: 0,
      taxesAndChargesTotal: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentOrder(newPO);
    setIsDialogOpen(true);
  };

  // Remove handleCreateNewRequest and saveRequest for the old modal

  // Add handler for new modal save
  const handleNewMaterialRequestSave = async (data: any) => {
    // The modal already makes the API call, so we just need to refresh the list
    await fetchMaterialRequests();
  };

  // Add handler for edit modal
  const handleEditRequest = (request: MaterialRequest) => {
    setCurrentEditRequest(request);
    setIsEditRequestDialogOpen(true);
  };

  const handleEditRequestSave = async () => {
    await fetchMaterialRequests();
  };

  console.log("Current paymentSummary state:", paymentSummary);

  return (
    <div>
      {/* <CardHeader></CardHeader> */}
      {/* <CardContent className="mt-6"> */}
      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Material Requests</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          {/* <TabsTrigger value="vendors">Vendors</TabsTrigger> */}
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payments Received
                    </p>
                    <p className="text-2xl font-bold">
                      {paymentSummary.received.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paymentSummary.received.count} invoices
                    </p>
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
                      Pending Payments
                    </p>
                    <p className="text-2xl font-bold">
                      {paymentSummary.pending.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paymentSummary.pending.count} invoices
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
                      Overdue Payments
                    </p>
                    <p className="text-2xl font-bold">
                      {paymentSummary.overdue.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paymentSummary.overdue.count} invoices
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
                          {po.Vendor?.name || "N/A"} • {po.items.length} item(s)
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {po.items.length} items
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{po.grandTotal?.toLocaleString() || "0"}
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
                  {materialRequests.slice(0, 3).map((mr) => (
                    <div
                      key={mr.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{mr.requestNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mr.requester?.name || "Unknown"}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant={getStatusColor(mr.status.toLowerCase())}
                          >
                            {mr.status}
                          </Badge>
                          <Badge variant="secondary">{mr.purpose}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {Array.isArray(mr.items) ? mr.items.length : 0}{" "}
                          item(s)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Need:{" "}
                          {mr.requiredBy
                            ? new Date(mr.requiredBy).toLocaleDateString()
                            : "Not specified"}
                        </p>
                        {mr.status === "SUBMITTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={() => handleApproveRequest(mr.id)}
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
                      <TableHead>Purpose</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Required By</TableHead>
                      <TableHead>Status</TableHead>
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
                          <TableCell>
                            {request.requester?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.purpose}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {Array.isArray(request.items)
                              ? request.items.length
                              : 0}{" "}
                            item(s)
                          </TableCell>
                          <TableCell>
                            {new Date(
                              request.transactionDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.requiredBy
                              ? new Date(
                                  request.requiredBy
                                ).toLocaleDateString()
                              : "Not specified"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusColor(
                                request.status.toLowerCase()
                              )}
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === "SUBMITTED" && (
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
                              {request.status === "APPROVED" && (
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
                                onClick={() => handleEditRequest(request)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteMaterialRequest(request.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
          />{" "}
          <AlertDialog
            open={isDeleteRequestDialogOpen}
            onOpenChange={setIsDeleteRequestDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  material request{" "}
                  <span className="font-semibold text-black">
                    {
                      materialRequests.find(
                        (mr) => mr.id === materialRequestToDelete
                      )?.requestNumber
                    }
                  </span>{" "}
                  and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteMaterialRequest}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Vendor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                          <TableCell>{order.Vendor?.name || "N/A"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {order.items.length > 0
                              ? `${order.items.length} item(s): ${
                                  order.items[0]?.itemCode || ""
                                }`
                              : "No items"}
                          </TableCell>
                          <TableCell>
                            ₹{order.grandTotal?.toLocaleString() || "0"}
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

      {/* Edit Material Request Modal */}
      <EditMaterialRequestModal
        open={isEditRequestDialogOpen}
        onOpenChange={setIsEditRequestDialogOpen}
        materialRequest={currentEditRequest}
        onSave={handleEditRequestSave}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={showNewVendorModal}
        onOpenChange={setShowNewVendorModal}
      />
    </div>
  );
}
