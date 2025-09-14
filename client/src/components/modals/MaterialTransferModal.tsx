import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

type TransferStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
type TransferPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type Unit =
  | "CUBIC_FEET"
  | "M_CUBE"
  | "TONNE"
  | "SQUARE_FEET"
  | "PIECE"
  | "LITRE"
  | "KILOGRAM"
  | "BOX"
  | "ROLL"
  | "SHEET"
  | "HOURS"
  | "DAYS"
  | "LUMPSUM";

interface Vehicle {
  id: string;
  vehicleName: string;
  driverName: string;
  registrationNumber: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface ItemRow {
  id: number;
  description: string;
  quantity: number;
  unit: Unit | "";
  inventoryId?: string;
}

interface MaterialTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (createdOrUpdated: any) => void;
  mode?: 'create' | 'edit';
  transferId?: string; // DB id for edit mode
  onRequestNew?: () => void;
}

const UNITS: { value: Unit; label: string }[] = [
  { value: "CUBIC_FEET", label: "Cubic Feet" },
  { value: "M_CUBE", label: "Metre Cube" },
  { value: "SQUARE_FEET", label: "Square Feet" },
  { value: "TONNE", label: "Tonne" },
  { value: "PIECE", label: "Piece" },
  { value: "LITRE", label: "Litre" },
  { value: "KILOGRAM", label: "Kilogram" },
  { value: "BOX", label: "Box" },
  { value: "ROLL", label: "Roll" },
  { value: "SHEET", label: "Sheet" },
  { value: "HOURS", label: "Hours" },
  { value: "DAYS", label: "Days" },
  { value: "LUMPSUM", label: "Lump Sum" },
];

export default function MaterialTransferModal({ open, onOpenChange, onSave, mode = 'create', transferId, onRequestNew }: MaterialTransferModalProps) {
  const { toast } = useToast();
  const { user } = useUser();

  // Form state
  const [transferID, setTransferID] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [requestedDate, setRequestedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<TransferStatus>("PENDING");
  const [driverName, setDriverName] = useState("");
  const [etaMinutes, setEtaMinutes] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [approvedById, setApprovedById] = useState<string>("");
  const [priority, setPriority] = useState<TransferPriority>("NORMAL");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<ItemRow[]>([
    { id: 1, description: "", quantity: 0, unit: "" },
  ]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  // Reference data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  // const getToken = () => sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");

  useEffect(() => {
    if (!open) return;
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Load vehicles and users
    const vehiclesUrl = `${API_URL}/vehicles`;
    Promise.all([
      fetch(vehiclesUrl, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/users`, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(async ([vehiclesRes, usersRes]) => {
        setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
        const normalizedUsers: UserOption[] = Array.isArray(usersRes)
          ? usersRes.map((u: any) => ({ id: u.id, name: u.name || u.email || "User", email: u.email }))
          : [];
        if (user && !normalizedUsers.some((u) => u.id === user.id)) {
          normalizedUsers.push({ id: user.id, name: user.name || user.email || "Current User", email: user.email || "" });
        }
        setUsers(normalizedUsers);

        // If edit mode, fetch the transfer details
        if (mode === 'edit' && transferId && user?.id) {
          try {
            const resp = await fetch(`${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`, { headers });
            if (resp.ok) {
              const t = await resp.json();
              setTransferID(t.transferID || "");
              setFromLocation(t.fromLocation || "");
              setToLocation(t.toLocation || "");
              setRequestedDate(t.requestedDate ? new Date(t.requestedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
              setStatus((t.status || 'PENDING') as TransferStatus);
              setDriverName(t.driverName || "");
              setEtaMinutes(typeof t.etaMinutes === 'number' ? String((t.etaMinutes / 60).toFixed(1)) : "");
              setVehicleId(t.vehicleId || "");
              setApprovedById(t.approvedById || "");
              setPriority((t.priority || 'NORMAL') as TransferPriority);
              const mappedItems: ItemRow[] = Array.isArray(t.items)
                ? t.items.map((it: any, idx: number) => ({
                    id: idx + 1,
                    description: it.description || "",
                    quantity: typeof it.quantity === 'number' ? it.quantity : 0,
                    unit: (it.unit || "") as Unit | "",
                    inventoryId: it.inventoryId || undefined,
                  }))
                : [{ id: 1, description: "", quantity: 0, unit: "" }];
              setItems(mappedItems);
              setNotes("");
            } else {
              toast({ title: "Error", description: "Failed to load transfer details", variant: "destructive" });
            }
          } catch (e) {
            toast({ title: "Error", description: "Failed to load transfer details", variant: "destructive" });
          }
        }
      })
      .catch(() => {
        toast({ title: "Warning", description: "Failed to load reference data", variant: "destructive" });
      });
  }, [open, mode, transferId]);

  const addRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems((prev) => [...prev, { id: newId, description: "", quantity: 0, unit: "" }]);
  };

  const removeSelectedRows = () => {
    setItems((prev) => prev.filter((row) => !selectedRowIds.has(row.id)));
    setSelectedRowIds(new Set());
  };

  const updateItem = (id: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const validate = () => {
    if (!transferID.trim()) {
      toast({ title: "Validation Error", description: "Transfer ID is required", variant: "destructive" });
      return false;
    }
    if (!fromLocation.trim() || !toLocation.trim()) {
      toast({ title: "Validation Error", description: "From and To locations are required", variant: "destructive" });
      return false;
    }
    if (!requestedDate) {
      toast({ title: "Validation Error", description: "Requested date is required", variant: "destructive" });
      return false;
    }
    const validItems = items.filter((i) => i.description.trim() && i.quantity > 0);
    if (validItems.length === 0) {
      toast({ title: "Validation Error", description: "At least one valid item is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const etaMinutesValue = etaMinutes ? Math.round(Number(etaMinutes) * 60) : null;
      const payload = {
        transferID: transferID.trim(),
        fromLocation: fromLocation.trim(),
        toLocation: toLocation.trim(),
        requestedDate: new Date(requestedDate).toISOString(),
        status,
        driverName: driverName.trim() || null,
        etaMinutes: etaMinutesValue,
        vehicleId: vehicleId || null,
        approvedById: approvedById || null,
        priority,
        items: items
          .filter((i) => i.description.trim() && i.quantity > 0)
          .map((i) => ({
            description: i.description.trim(),
            quantity: i.quantity,
            unit: i.unit || null,
            inventoryId: i.inventoryId || null,
          })),
        notes: notes.trim() || null,
      };

      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (mode === 'edit' && transferId && user?.id) {
        // Update the transfer header
        const putResp = await fetch(`${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
        if (!putResp.ok) {
          const err = await putResp.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update material transfer');
        }

        // Replace items: delete existing then create new
        const itemsResp = await fetch(`${API_URL}/inventory/transfers/${transferId}/items?userId=${user.id}`, { headers });
        if (!itemsResp.ok) throw new Error('Failed to load existing items');
        const existingItems = await itemsResp.json();
        await Promise.all(
          (existingItems || []).map((it: any) =>
            fetch(`${API_URL}/inventory/transfers/${transferId}/items/${it.id}?userId=${user.id}`, {
              method: 'DELETE',
              headers,
            })
          )
        );
        // Create new items
        for (const i of payload.items) {
          const createItemResp = await fetch(`${API_URL}/inventory/transfers/${transferId}/items?userId=${user.id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(i),
          });
          if (!createItemResp.ok) {
            const err = await createItemResp.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create transfer item');
          }
        }

        const updatedResp = await fetch(`${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`, { headers });
        const updated = updatedResp.ok ? await updatedResp.json() : null;
        toast({ title: 'Success', description: 'Material transfer updated successfully' });
        if (onSave) onSave(updated || { id: transferId, ...payload });
        onOpenChange(false);
      } else {
        // Create new transfer
        const resp = await fetch(`${API_URL}/inventory/transfers`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          const created = await resp.json();
          toast({ title: "Success", description: "Material transfer created successfully" });
          if (onSave) onSave(created);
          onOpenChange(false);
        } else {
          const err = await resp.json().catch(() => ({}));
          toast({ title: "Error", description: err.error || "Failed to create material transfer", variant: "destructive" });
        }
      }

      // reset form after successful close
      setTransferID("");
      setFromLocation("");
      setToLocation("");
      setRequestedDate(new Date().toISOString().split("T")[0]);
      setStatus("PENDING");
      setDriverName("");
      setEtaMinutes("");
      setVehicleId("");
      setApprovedById("");
      setPriority("NORMAL");
      setItems([{ id: 1, description: "", quantity: 0, unit: "" }]);
      setNotes("");
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message || (mode === 'edit' ? 'Failed to update material transfer' : 'Failed to create material transfer'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Material Transfer' : 'New Material Transfer'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Update transfer details and items.' : 'Capture transfer details and items.'}</DialogDescription>
        </DialogHeader>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Transfer ID *</Label>
            <Input value={transferID} onChange={(e) => setTransferID(e.target.value)} placeholder="TRF001" />
          </div>
          <div>
            <Label className="mb-1 block">Requested Date *</Label>
            <Input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">From *</Label>
            <Input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} placeholder="Warehouse A" />
          </div>
          <div>
            <Label className="mb-1 block">To *</Label>
            <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="Site 1" />
          </div>
          <div>
            <Label className="mb-1 block">Status *</Label>
            <Select value={status} onValueChange={(v: TransferStatus) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Priority *</Label>
            <Select value={priority} onValueChange={(v: TransferPriority) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Driver</Label>
            <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <Label className="mb-1 block">ETA (hours)</Label>
            <Input type="number" min="0" step="0.1" value={etaMinutes} onChange={(e) => setEtaMinutes(e.target.value)} placeholder="2.0" />
          </div>
          <div>
            <Label className="mb-1 block">Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <SelectItem value="no-vehicles" disabled>
                    No vehicles found
                  </SelectItem>
                ) : (
                  vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicleName} ({v.registrationNumber}) - {v.driverName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Approved By</Label>
            <Select value={approvedById} onValueChange={setApprovedById}>
              <SelectTrigger>
                <SelectValue placeholder="Select approver" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items */}
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addRow} size="sm">
                  Add Item
                </Button>
                {selectedRowIds.size > 0 && (
                  <Button variant="outline" size="sm" className="text-red-600" onClick={removeSelectedRows}>
                    Delete Selected ({selectedRowIds.size})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"><input
                      type="checkbox"
                      checked={items.length > 0 && selectedRowIds.size === items.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowIds(new Set(items.map((i) => i.id)));
                        } else {
                          setSelectedRowIds(new Set());
                        }
                      }}
                    /></TableHead>
                    <TableHead>No.</TableHead>
                    <TableHead>Description *</TableHead>
                    <TableHead className="w-[120px]">Quantity *</TableHead>
                    <TableHead className="w-[180px]">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRowIds.has(row.id)}
                          onChange={(e) => {
                            const next = new Set(selectedRowIds);
                            e.target.checked ? next.add(row.id) : next.delete(row.id);
                            setSelectedRowIds(next);
                          }}
                        />
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={row.description}
                          onChange={(e) => updateItem(row.id, "description", e.target.value)}
                          placeholder="e.g., Cement bags"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={row.quantity}
                          onChange={(e) => updateItem(row.id, "quantity", Number(e.target.value))}
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row.unit} onValueChange={(v) => updateItem(row.id, "unit", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Label className="mb-1 block">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information..." rows={3} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


