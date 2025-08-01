import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Plus, Trash2, Save, Send, Eye } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import RichTextEditor from "../ui/RichTextEditor";
import { useUser } from "@/contexts/UserContext";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Vendor {
  id: string;
  name: string;
  email?: string;
  contact?: string;
  mobile?: string;
  category?: string;
  location?: string;
}

interface PurchaseOrderItem {
  id: string;
  itemCode: string;
  description: string;
  requiredBy: string;
  quantity: number;
  uom: string;
  rate: number;
  amount: number;
}

interface TaxCharge {
  id: string;
  type: string;
  accountHead: string;
  taxRate: number;
  amount: number;
  total: number;
}

interface PaymentTerm {
  id: string;
  paymentTerm: string;
  description: string;
  dueDate: string;
  invoicePortion: number;
  paymentAmount: number;
}

interface PurchaseOrderFormData {
  poNumber: string;
  date: string; // Will be converted to DateTime when saving
  vendorId: string; // Required field
  requiredBy: string; // Will be converted to DateTime when saving
  setTargetWarehouse?: string; // Optional warehouse field
  vendorAddress: string;
  vendorContact: string;
  shippingAddress: string;
  dispatchAddress: string;
  companyBillingAddress: string;
  placeOfSupply: string;
  paymentTermsTemplate: string;
  terms: string;
  totalQuantity: number; // Will be converted to Decimal
  total: number; // Will be converted to Decimal
  grandTotal: number; // Will be converted to Decimal
  roundingAdjustment: number; // Will be converted to Decimal
  roundedTotal: number; // Will be converted to Decimal
  advancePaid: number; // Will be converted to Decimal
  taxesAndChargesTotal: number; // Will be converted to Decimal
  userId: string;
  items: PurchaseOrderItem[];
  taxesAndCharges: TaxCharge[];
  paymentSchedule: PaymentTerm[];
}


interface PurchaseOrderFormProps {
  onSuccess?: () => void;
}

export function PurchaseOrderForm({ onSuccess }: PurchaseOrderFormProps) {
  const { user } = useUser();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    poNumber: "",
    date: new Date().toISOString().split("T")[0],
    vendorId: "", // Required field
    requiredBy: "",
    setTargetWarehouse: "", // Optional warehouse field
    vendorAddress: "",
    vendorContact: "",
    shippingAddress: "",
    dispatchAddress: "",
    companyBillingAddress: "",
    placeOfSupply: "",
    paymentTermsTemplate: "",
    terms: "",
    totalQuantity: 0,
    total: 0,
    grandTotal: 0,
    roundingAdjustment: 0,
    roundedTotal: 0,
    advancePaid: 0,
    taxesAndChargesTotal: 0,
    userId: "",
    items: [],
    taxesAndCharges: [],
    paymentSchedule: [],
  });
  
  // State to track selected item IDs
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // State to track selected tax/charge IDs
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);

  // State to track selected payment term IDs
  const [selectedPaymentTermIds, setSelectedPaymentTermIds] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("details");
  const [isAccountingDimensionsOpen, setIsAccountingDimensionsOpen] =
    useState(false);
  const [isCurrencyPriceListOpen, setIsCurrencyPriceListOpen] = useState(false);
  const [isAdditionalDiscountOpen, setIsAdditionalDiscountOpen] =
    useState(false);
  const [terms, setTerms] = useState("");

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/vendors`, { headers });
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast.error("Failed to fetch vendors");
      }
    };

    fetchVendors();
  }, []);

  // Update form data when vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      setFormData(prev => ({
        ...prev,
        vendorId: selectedVendor.id,
        vendorContact: selectedVendor.contact || selectedVendor.mobile || "",
        vendorAddress: selectedVendor.location || "",
      }));
    }
  }, [selectedVendor]);

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      itemCode: "",
      description: "",
      requiredBy: "",
      quantity: 0,
      uom: "",
      rate: 0,
      amount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (
    itemId: string,
    field: keyof PurchaseOrderItem,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const addTaxCharge = () => {
    const newTaxCharge: TaxCharge = {
      id: Date.now().toString(),
      type: "",
      accountHead: "",
      taxRate: 0,
      amount: 0,
      total: 0,
    };
    setFormData((prev) => ({
      ...prev,
      taxesAndCharges: [...prev.taxesAndCharges, newTaxCharge],
    }));
  };

  const updateTaxCharge = (id: string, field: keyof TaxCharge, value: any) => {
    setFormData((prev) => ({
      ...prev,
      taxesAndCharges: prev.taxesAndCharges.map((tax) => {
        if (tax.id === id) {
          const updatedTax = { ...tax, [field]: value };
          if (field === "taxRate" || field === "amount") {
            updatedTax.total = (updatedTax.amount * updatedTax.taxRate) / 100;
          }
          return updatedTax;
        }
        return tax;
      }),
    }));
  };

  const addPaymentTerm = () => {
    const newPaymentTerm: PaymentTerm = {
      id: Date.now().toString(),
      paymentTerm: "",
      description: "",
      dueDate: "",
      invoicePortion: 0,
      paymentAmount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newPaymentTerm],
    }));
  };

  // Calculate totals whenever items or taxes change
  useEffect(() => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const taxesTotal = formData.taxesAndCharges.reduce(
      (sum, tax) => sum + tax.total,
      0,
    );
    const grandTotal = itemsTotal + taxesTotal;
    const roundedTotal = Math.round(grandTotal);
    const roundingAdjustment = roundedTotal - grandTotal;

    setFormData((prev) => ({
      ...prev,
      total: itemsTotal,
      taxesAndChargesTotal: taxesTotal,
      grandTotal,
      roundedTotal,
      roundingAdjustment,
      totalQuantity: prev.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
  }, [formData.items, formData.taxesAndCharges]);

  const handleSave = async () => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Prepare data for backend
    const submitData = {
      ...formData,
      terms: terms,
      userId: user?.id || "",
    };

    try {
      const response = await axios.post(`${API_URL}/purchase-orders`, submitData, { headers });
      toast.success("Purchase order saved successfully!");
      onSuccess?.();
    } catch (err) {
      console.error("Error saving purchase order:", err);
      toast.error("Failed to save purchase order.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.vendorId || !formData.poNumber) {
      toast.error("Please fill in required fields: Vendor and PO Number");
      return;
    }
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    await handleSave();
  };

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="border-b bg-background px-0 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">New Purchase Order</h1>
            <p className="text-sm text-muted-foreground">Not Saved</p>
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="text-sm text-muted-foreground">
              Get Items From:
            </span> */}
            {/* <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier-quotation">
                  Supplier Quotation
                </SelectItem>
                <SelectItem value="material-request">
                  Material Request
                </SelectItem>
                <SelectItem value="purchase-order">Purchase Order</SelectItem>
              </SelectContent>
            </Select> */}
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="address-contact">Address & Contact</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            {/* <TabsTrigger value="more-info">More Info</TabsTrigger> */}
          </TabsList>

          <TabsContent value="details" className="space-y-6 w-full">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="poNumber">Purchase Order Number *</Label>
                <Input
                  id="poNumber"
                  value={formData.poNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, poNumber: e.target.value }))
                  }
                  placeholder="Enter PO number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              {/* <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="apply-tax"
                  checked={formData.applyTaxWithholdingAmount}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      applyTaxWithholdingAmount: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="apply-tax" className="text-sm">
                  Apply Tax Withholding Amount
                </Label>
              </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => {
                    const vendor = vendors.find(v => v.id === value);
                    setSelectedVendor(vendor || null);
                    setFormData((prev) => ({
                      ...prev,
                      vendorId: value,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex flex-col">
                          <span>{vendor.name}</span>
                          {vendor.email && (
                            <span className="text-xs text-muted-foreground">
                              {vendor.email}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="required-by">Required By</Label>
                <Input
                  id="required-by"
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requiredBy: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="target-warehouse">Set Target Warehouse</Label>
                <Input
                  id="target-warehouse"
                  value={formData.setTargetWarehouse || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, setTargetWarehouse: e.target.value }))
                  }
                  placeholder="Enter target warehouse"
                />
              </div>
            </div>

            {/* <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reverse-charge"
                  checked={formData.isReverseCharge}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isReverseCharge: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="reverse-charge" className="text-sm">
                  Is Reverse Charge
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subcontracted"
                  checked={formData.isSubcontracted}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isSubcontracted: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="subcontracted" className="text-sm">
                  Is Subcontracted
                </Label>
              </div>
            </div> */}

            {/* Collapsible Sections */}
            {/* <Collapsible
              open={isAccountingDimensionsOpen}
              onOpenChange={setIsAccountingDimensionsOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 text-sm font-medium hover:bg-transparent"
                >
                  <ChevronDown
                    className={`h-4 w-4 mr-2 transition-transform ${isAccountingDimensionsOpen ? "rotate-180" : ""}`}
                  />
                  Accounting Dimensions
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
                  Configure accounting dimensions for this purchase order.
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isCurrencyPriceListOpen}
              onOpenChange={setIsCurrencyPriceListOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 text-sm font-medium hover:bg-transparent"
                >
                  <ChevronDown
                    className={`h-4 w-4 mr-2 transition-transform ${isCurrencyPriceListOpen ? "rotate-180" : ""}`}
                  />
                  Currency and Price List
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
                  Configure currency and pricing information.
                </div>
              </CollapsibleContent>
            </Collapsible> */}

            {/* Barcode Section - commented out for now */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scan-barcode">Scan Barcode</Label>
                <Input
                  id="scan-barcode"
                  value={formData.scanBarcode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scanBarcode: e.target.value,
                    }))
                  }
                  placeholder="Scan or enter barcode"
                />
              </div>
            </div> */}

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Items</Label>
                <div className="flex flex-row gap-2">
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        items: prev.items.filter((item) => !selectedItemIds.includes(item.id)),
                      }));
                      setSelectedItemIds([]);
                    }}
                    size="sm"
                    variant="destructive"
                    disabled={selectedItemIds.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {/* Select All Checkbox */}
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            formData.items.length === 0
                              ? false
                              : selectedItemIds.length === formData.items.length
                              ? true
                              : selectedItemIds.length > 0
                              ? "indeterminate"
                              : false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItemIds(formData.items.map((item) => item.id));
                            } else {
                              setSelectedItemIds([]);
                            }
                          }}
                          aria-label="Select all items"
                        />
                      </TableHead>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead className="min-w-32">Item Code *</TableHead>
                      <TableHead className="min-w-40">Description</TableHead>
                      <TableHead className="min-w-32">Required By *</TableHead>
                      <TableHead className="w-24">Quantity *</TableHead>
                      <TableHead className="w-20">UOM *</TableHead>
                      <TableHead className="w-28">Rate (INR)</TableHead>
                      <TableHead className="w-28">Amount (INR)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <p>No items added yet</p>
                            <Button
                              onClick={addItem}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add First Item
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItemIds.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedItemIds([...selectedItemIds, item.id]);
                                } else {
                                  setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.itemCode}
                              onChange={(e) =>
                                updateItem(item.id, "itemCode", e.target.value)
                              }
                              placeholder="Enter item code"
                              className="min-w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateItem(item.id, "description", e.target.value)
                              }
                              placeholder="Item description"
                              className="min-w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={item.requiredBy}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "requiredBy",
                                  e.target.value,
                                )
                              }
                              placeholder="Required by"
                              className="min-w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  Number(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.uom}
                              onValueChange={(value) =>
                                updateItem(item.id, "uom", value)
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="UOM" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="pcs">pcs</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                                <SelectItem value="sqm">sqm</SelectItem>
                                <SelectItem value="cum">cum</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.rate || ""}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "rate",
                                  Number(e.target.value) || 0,
                                )
                              }
                              placeholder="0.00"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ₹ {item.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => removeItem(item.id)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Total Quantity:</span>{" "}
                  {formData.totalQuantity}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total (INR):</span> ₹{" "}
                  {formData.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Taxes and Charges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Taxes and Charges
                </Label>
                <div className="flex flex-row gap-2">
                  <Button onClick={addTaxCharge} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        taxesAndCharges: prev.taxesAndCharges.filter((tax) => !selectedTaxIds.includes(tax.id)),
                      }));
                      setSelectedTaxIds([]);
                    }}
                    size="sm"
                    variant="destructive"
                    disabled={selectedTaxIds.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All
                  </Button>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-category">Tax Category</Label>
                  <Input id="tax-category" placeholder="Select tax category" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-rule">Shipping Rule</Label>
                  <Input
                    id="shipping-rule"
                    placeholder="Select shipping rule"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incoterm">Incoterm</Label>
                  <Input id="incoterm" placeholder="Select incoterm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-template">Tax Template</Label>
                  <Input id="tax-template" placeholder="Select template" />
                </div>
              </div> */}

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {/* Select All Checkbox for Taxes and Charges */}
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            formData.taxesAndCharges.length === 0
                              ? false
                              : selectedTaxIds.length === formData.taxesAndCharges.length
                              ? true
                              : selectedTaxIds.length > 0
                              ? "indeterminate"
                              : false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTaxIds(formData.taxesAndCharges.map((tax) => tax.id));
                            } else {
                              setSelectedTaxIds([]);
                            }
                          }}
                          aria-label="Select all taxes and charges"
                        />
                      </TableHead>
                      <TableHead className="w-16">No.</TableHead>
                      <TableHead className="min-w-32">Type *</TableHead>
                      <TableHead className="min-w-40">Account Head *</TableHead>
                      <TableHead className="w-24">Tax Rate</TableHead>
                      <TableHead className="w-28">Amount</TableHead>
                      <TableHead className="w-28">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.taxesAndCharges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No taxes or charges added
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.taxesAndCharges.map((tax, index) => (
                        <TableRow key={tax.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTaxIds.includes(tax.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTaxIds([...selectedTaxIds, tax.id]);
                                } else {
                                  setSelectedTaxIds(selectedTaxIds.filter((id) => id !== tax.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={tax.type}
                              onValueChange={(value) =>
                                updateTaxCharge(tax.id, "type", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on-net-total">
                                  On Net Total
                                </SelectItem>
                                <SelectItem value="on-previous-row">
                                  On Previous Row
                                </SelectItem>
                                <SelectItem value="actual">Actual</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={tax.accountHead}
                              onChange={(e) =>
                                updateTaxCharge(
                                  tax.id,
                                  "accountHead",
                                  e.target.value,
                                )
                              }
                              placeholder="Account head"
                              className="min-w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={tax.taxRate || ""}
                              onChange={(e) =>
                                updateTaxCharge(
                                  tax.id,
                                  "taxRate",
                                  Number(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={tax.amount || ""}
                              onChange={(e) =>
                                updateTaxCharge(
                                  tax.id,
                                  "amount",
                                  Number(e.target.value) || 0,
                                )
                              }
                              placeholder="0.00"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ₹ {tax.total.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  taxesAndCharges: prev.taxesAndCharges.filter(
                                    (t) => t.id !== tax.id,
                                  ),
                                }))
                              }
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium">
                  Total Taxes and Charges (INR): ₹{" "}
                  {formData.taxesAndChargesTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Additional Discount */}
            {/* <Collapsible
              open={isAdditionalDiscountOpen}
              onOpenChange={setIsAdditionalDiscountOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 text-sm font-medium hover:bg-transparent"
                >
                  <ChevronDown
                    className={`h-4 w-4 mr-2 transition-transform ${isAdditionalDiscountOpen ? "rotate-180" : ""}`}
                  />
                  Additional Discount
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
                  Configure additional discounts for this purchase order.
                </div>
              </CollapsibleContent>
            </Collapsible> */}

            {/* Totals Section */}
            <div className="bg-muted/20 p-6 rounded-lg space-y-3">
              <h3 className="font-medium text-base">Totals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Grand Total (INR)</span>
                    <span className="font-medium">
                      ₹ {formData.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rounding Adjustment (INR)</span>
                    <span className="font-medium">
                      ₹ {formData.roundingAdjustment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">
                      Rounded Total (INR)
                    </span>
                    <span className="font-semibold">
                      ₹ {formData.roundedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disable-rounded"
                      checked={formData.disableRoundedTotal}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          disableRoundedTotal: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="disable-rounded" className="text-sm">
                      Disable Rounded Total
                    </Label>
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="advance-paid" className="text-sm">
                      Advance Paid
                    </Label>
                    <Input
                      id="advance-paid"
                      type="number"
                      value={formData.advancePaid || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          advancePaid: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address-contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vendor Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vendor Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-address">Vendor Address</Label>
                    <Textarea
                      id="vendor-address"
                      value={formData.vendorAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter vendor address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor-contact">Vendor Contact</Label>
                    <Input
                      id="vendor-contact"
                      value={formData.vendorContact}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorContact: e.target.value,
                        }))
                      }
                      placeholder="Enter vendor contact"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dispatch-address">Dispatch Address</Label>
                    <Textarea
                      id="dispatch-address"
                      value={formData.dispatchAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dispatchAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter dispatch address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-address">Shipping Address</Label>
                    <Input
                      id="shipping-address"
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter shipping address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Company Billing Address */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Company Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-billing">
                      Company Billing Address
                    </Label>
                    <Textarea
                      id="company-billing"
                      value={formData.companyBillingAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyBillingAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter company billing address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place-of-supply">Place of Supply</Label>
                    <Input
                      id="place-of-supply"
                      value={formData.placeOfSupply}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          placeOfSupply: e.target.value,
                        }))
                      }
                      placeholder="Enter place of supply"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-terms-template">
                    Payment Terms Template
                  </Label>
                  <Input
                    id="payment-terms-template"
                    value={formData.paymentTermsTemplate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentTermsTemplate: e.target.value,
                      }))
                    }
                    placeholder="Enter payment terms template"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Payment Schedule
                    </Label>
                    <div className="flex flex-row gap-2">
                      <Button
                        onClick={addPaymentTerm}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Row
                      </Button>
                      <Button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            paymentSchedule: prev.paymentSchedule.filter((term) => !selectedPaymentTermIds.includes(term.id)),
                          }));
                          setSelectedPaymentTermIds([]);
                        }}
                        size="sm"
                        variant="destructive"
                        disabled={selectedPaymentTermIds.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete All
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          {/* Select All Checkbox for Payment Terms */}
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                formData.paymentSchedule.length === 0
                                  ? false
                                  : selectedPaymentTermIds.length === formData.paymentSchedule.length
                                  ? true
                                  : selectedPaymentTermIds.length > 0
                                  ? "indeterminate"
                                  : false
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPaymentTermIds(formData.paymentSchedule.map((term) => term.id));
                                } else {
                                  setSelectedPaymentTermIds([]);
                                }
                              }}
                              aria-label="Select all payment terms"
                            />
                          </TableHead>
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead className="min-w-32">
                            Payment Term
                          </TableHead>
                          <TableHead className="min-w-40">
                            Description
                          </TableHead>
                          <TableHead className="w-36">Due Date *</TableHead>
                          <TableHead className="w-24">
                            Invoice Portion
                          </TableHead>
                          <TableHead className="w-28">
                            Payment Amount *
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.paymentSchedule.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No payment terms added
                            </TableCell>
                          </TableRow>
                        ) : (
                          formData.paymentSchedule.map((payment, index) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedPaymentTermIds.includes(payment.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPaymentTermIds([...selectedPaymentTermIds, payment.id]);
                                    } else {
                                      setSelectedPaymentTermIds(selectedPaymentTermIds.filter((id) => id !== payment.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={payment.paymentTerm}
                                  onChange={(e) => {
                                    const updatedSchedule =
                                      formData.paymentSchedule.map((p) =>
                                        p.id === payment.id
                                          ? {
                                              ...p,
                                              paymentTerm: e.target.value,
                                            }
                                          : p,
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule: updatedSchedule,
                                    }));
                                  }}
                                  placeholder="Payment term"
                                  className="min-w-32"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={payment.description}
                                  onChange={(e) => {
                                    const updatedSchedule =
                                      formData.paymentSchedule.map((p) =>
                                        p.id === payment.id
                                          ? {
                                              ...p,
                                              description: e.target.value,
                                            }
                                          : p,
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule: updatedSchedule,
                                    }));
                                  }}
                                  placeholder="Description"
                                  className="min-w-40"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={payment.dueDate}
                                  onChange={(e) => {
                                    const updatedSchedule =
                                      formData.paymentSchedule.map((p) =>
                                        p.id === payment.id
                                          ? { ...p, dueDate: e.target.value }
                                          : p,
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule: updatedSchedule,
                                    }));
                                  }}
                                  className="w-36"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={payment.invoicePortion || ""}
                                  onChange={(e) => {
                                    const updatedSchedule =
                                      formData.paymentSchedule.map((p) =>
                                        p.id === payment.id
                                          ? {
                                              ...p,
                                              invoicePortion:
                                                Number(e.target.value) || 0,
                                            }
                                          : p,
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule: updatedSchedule,
                                    }));
                                  }}
                                  placeholder="0"
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={payment.paymentAmount || ""}
                                  onChange={(e) => {
                                    const updatedSchedule =
                                      formData.paymentSchedule.map((p) =>
                                        p.id === payment.id
                                          ? {
                                              ...p,
                                              paymentAmount:
                                                Number(e.target.value) || 0,
                                            }
                                          : p,
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule: updatedSchedule,
                                    }));
                                  }}
                                  placeholder="0.00"
                                  className="w-28"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      paymentSchedule:
                                        prev.paymentSchedule.filter(
                                          (p) => p.id !== payment.id,
                                        ),
                                    }))
                                  }
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="shadow-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/40 mt-6">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="terms" className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Please enter any terms and conditions for this purchase order:
                  </label>
                  <RichTextEditor
                    value={terms}
                    onChange={setTerms}
                    placeholder="Enter terms and conditions"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="more-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Additional purchase order configuration options will be
                  available here.
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
