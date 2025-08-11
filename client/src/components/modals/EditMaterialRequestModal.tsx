import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import {
  MaterialRequest,
  MaterialRequestItem,
  UpdateMaterialRequestData,
} from "@/types/material-request";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface EditMaterialRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialRequest: MaterialRequest | null;
  onSave: () => void;
}

export function EditMaterialRequestModal({
  open,
  onOpenChange,
  materialRequest,
  onSave,
}: EditMaterialRequestModalProps) {
  const [formData, setFormData] = useState<UpdateMaterialRequestData>({
    requestNumber: "",
    transactionDate: "",
    purpose: "PURCHASE",
    requiredBy: "",
    priceList: "",
    targetWarehouse: "",
    terms: "",
    moreInfo: "",
    projectId: "",
    status: "SUBMITTED",
  });

  const [items, setItems] = useState<
    Omit<
      MaterialRequestItem,
      "id" | "materialRequestId" | "createdAt" | "updatedAt"
    >[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Load projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token =
          sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/projects`, { headers });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (open) {
      fetchProjects();
    }
  }, [open]);

  // Initialize form data when material request changes
  useEffect(() => {
    if (materialRequest) {
      setFormData({
        requestNumber: materialRequest.requestNumber,
        transactionDate: materialRequest.transactionDate.split("T")[0],
        purpose: materialRequest.purpose,
        requiredBy: materialRequest.requiredBy
          ? materialRequest.requiredBy.split("T")[0]
          : "",
        priceList: materialRequest.priceList || "",
        targetWarehouse: materialRequest.targetWarehouse || "",
        terms: materialRequest.terms || "",
        moreInfo: materialRequest.moreInfo || "",
        projectId: materialRequest.projectId || "",
        status: materialRequest.status || "SUBMITTED",
      });

      // Initialize items
      if (materialRequest.items && Array.isArray(materialRequest.items)) {
        setItems(
          materialRequest.items.map((item) => ({
            itemCode: item.itemCode,
            requiredBy: item.requiredBy ? item.requiredBy.split("T")[0] : "",
            quantity: item.quantity,
            targetWarehouse: item.targetWarehouse || "",
            uom: item.uom,
          }))
        );
      } else {
        setItems([]);
      }
    }
  }, [materialRequest]);

  const handleInputChange = (
    field: keyof UpdateMaterialRequestData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemCode: "",
        requiredBy: "",
        quantity: 0,
        targetWarehouse: "",
        uom: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!materialRequest) return;

    setLoading(true);
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Prepare data with properly formatted dates
      const updateData = {
        ...formData,
        transactionDate: formData.transactionDate
          ? new Date(formData.transactionDate + "T00:00:00.000Z").toISOString()
          : undefined,
        requiredBy: formData.requiredBy
          ? new Date(formData.requiredBy + "T00:00:00.000Z").toISOString()
          : undefined,
      };

      // Update the material request
      await axios.put(
        `${API_URL}/material/material-requests/${materialRequest.id}`,
        updateData,
        { headers }
      );

      // Update items if they've changed
      if (items.length > 0) {
        // First, get current items to compare
        const currentItemsResponse = await axios.get(
          `${API_URL}/material/material-requests/${materialRequest.id}/items`,
          { headers }
        );
        const currentItems = currentItemsResponse.data;

        // Delete existing items
        for (const item of currentItems) {
          await axios.delete(
            `${API_URL}/material/material-requests/${materialRequest.id}/items/${item.id}`,
            { headers }
          );
        }

        // Create new items
        for (const item of items) {
          const itemData = {
            ...item,
            requiredBy: item.requiredBy
              ? new Date(item.requiredBy + "T00:00:00.000Z").toISOString()
              : undefined,
          };
          await axios.post(
            `${API_URL}/material/material-requests/${materialRequest.id}/items`,
            itemData,
            { headers }
          );
        }
      }

      toast({
        title: "Success",
        description: "Material request updated successfully",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating material request:", error);
      toast({
        title: "Error",
        description: "Failed to update material request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!materialRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Material Request</DialogTitle>
          <DialogDescription>
            Update the details for material request{" "}
            {materialRequest.requestNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestNumber">Request Number</Label>
              <Input
                id="requestNumber"
                value={formData.requestNumber}
                onChange={(e) =>
                  handleInputChange("requestNumber", e.target.value)
                }
                placeholder="Enter request number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) =>
                  handleInputChange("transactionDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select
                value={formData.purpose}
                onValueChange={(value) =>
                  handleInputChange("purpose", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="CONSUMPTION">Consumption</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredBy">Required By</Label>
              <Input
                id="requiredBy"
                type="date"
                value={formData.requiredBy}
                onChange={(e) =>
                  handleInputChange("requiredBy", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceList">Price List</Label>
              <Input
                id="priceList"
                value={formData.priceList}
                onChange={(e) => handleInputChange("priceList", e.target.value)}
                placeholder="Enter price list"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWarehouse">Target Warehouse</Label>
              <Input
                id="targetWarehouse"
                value={formData.targetWarehouse}
                onChange={(e) =>
                  handleInputChange("targetWarehouse", e.target.value)
                }
                placeholder="Enter target warehouse"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange("projectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Terms and More Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                placeholder="Enter terms and conditions"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moreInfo">Additional Information</Label>
              <Textarea
                id="moreInfo"
                value={formData.moreInfo}
                onChange={(e) => handleInputChange("moreInfo", e.target.value)}
                placeholder="Enter additional information"
                rows={3}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`itemCode-${index}`}>Item Code</Label>
                      <Input
                        id={`itemCode-${index}`}
                        value={item.itemCode}
                        onChange={(e) =>
                          handleItemChange(index, "itemCode", e.target.value)
                        }
                        placeholder="Enter item code"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`uom-${index}`}>Unit of Measure</Label>
                      <Input
                        id={`uom-${index}`}
                        value={item.uom}
                        onChange={(e) =>
                          handleItemChange(index, "uom", e.target.value)
                        }
                        placeholder="e.g., kg, pcs, m"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`itemRequiredBy-${index}`}>
                        Required By
                      </Label>
                      <Input
                        id={`itemRequiredBy-${index}`}
                        type="date"
                        value={item.requiredBy}
                        onChange={(e) =>
                          handleItemChange(index, "requiredBy", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor={`targetWarehouse-${index}`}>
                        Target Warehouse
                      </Label>
                      <Input
                        id={`targetWarehouse-${index}`}
                        value={item.targetWarehouse}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "targetWarehouse",
                            e.target.value
                          )
                        }
                        placeholder="Enter target warehouse"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items added. Click "Add Item" to add materials.
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {materialRequest.requester && (
              <span className="text-sm text-muted-foreground">
                Requested by: {materialRequest.requester.name}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Updating..." : "Update Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
