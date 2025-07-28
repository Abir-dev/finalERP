import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import RichTextEditor from "../ui/RichTextEditor";

interface ItemRow {
  id: number;
  itemCode: string;
  requiredBy: string;
  quantity: number;
  targetWarehouse: string;
  uom: string;
}

interface NewMaterialRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: any) => void;
}

export function NewMaterialRequestModal({ open, onOpenChange, onSave }: NewMaterialRequestModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  // Replace series state with requestNumber
  const [requestNumber, setRequestNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [purpose, setPurpose] = useState("Purchase");
  const [requiredBy, setRequiredBy] = useState("");
  const [priceList, setPriceList] = useState("Standard Buying");
  const [scanBarcode, setScanBarcode] = useState("");
  const [targetWarehouse, setTargetWarehouse] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { id: 1, itemCode: "", requiredBy: "", quantity: 0, targetWarehouse: "", uom: "" },
  ]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Tab content placeholders
  const [terms, setTerms] = useState("");
  const termsTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting helpers
  const applyFormatting = (before: string, after: string = before, placeholder = "") => {
    const textarea = termsTextareaRef.current;
    if (!textarea) {
      console.log("Textarea ref not found");
      return;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = terms.substring(start, end) || placeholder;
    const newValue =
      terms.substring(0, start) + before + selected + after + terms.substring(end);
    setTerms(newValue);
    // Set cursor after the formatted text
    setTimeout(() => {
      textarea.focus();
      if (selected === placeholder) {
        textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
      } else {
        textarea.setSelectionRange(start + before.length + selected.length + after.length, start + before.length + selected.length + after.length);
      }
    }, 0);
    console.log(`Applied formatting: ${before}...${after}`);
  };

  const handleBold = () => {
    console.log("Bold button clicked");
    applyFormatting("**", "**", "bold text");
  };
  const handleItalic = () => {
    console.log("Italic button clicked");
    applyFormatting("*", "*", "italic text");
  };
  const handleUnderline = () => {
    console.log("Underline button clicked");
    applyFormatting("<u>", "</u>", "underlined text");
  };
  const handleList = () => {
    console.log("List button clicked");
    const textarea = termsTextareaRef.current;
    if (!textarea) {
      console.log("Textarea ref not found");
      return;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const lines = terms.substring(start, end).split("\n");
    const formatted = lines.map(line => line ? `- ${line}` : "- ").join("\n");
    const newValue = terms.substring(0, start) + formatted + terms.substring(end);
    setTerms(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 0);
  };
  const handleLink = () => {
    console.log("Link button clicked");
    const textarea = termsTextareaRef.current;
    if (!textarea) {
      console.log("Textarea ref not found");
      return;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = terms.substring(start, end) || "link text";
    const url = "https://";
    const formatted = `[${selected}](${url})`;
    const newValue = terms.substring(0, start) + formatted + terms.substring(end);
    setTerms(newValue);
    setTimeout(() => {
      textarea.focus();
      // Select the url part for easy editing
      const urlStart = start + formatted.indexOf("https://");
      const urlEnd = urlStart + "https://".length;
      textarea.setSelectionRange(urlStart, urlEnd);
    }, 0);
  };
  const [moreInfo, setMoreInfo] = useState("");

  // Add state for project and approver
  const [projectId, setProjectId] = useState("");
  const [approver, setApprover] = useState("");
  // Mock projects data (replace with real data or prop as needed)
  const projects = [
    { id: "1", name: "Project Alpha" },
    { id: "2", name: "Project Beta" },
  ];

  const handleItemChange = (idx: number, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { id: prev.length > 0 ? Math.max(...prev.map(i => i.id)) + 1 : 1, itemCode: "", requiredBy: "", quantity: 0, targetWarehouse: "", uom: "" },
    ]);
  };

  const removeSelectedRows = () => {
    setItems((prev) => prev.filter((item) => !selectedRows.has(item.id)));
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const toggleRowSelection = (id: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === items.length && items.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(items.map(item => item.id));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        requestNumber,
        transactionDate,
        purpose,
        requiredBy,
        priceList,
        scanBarcode,
        targetWarehouse,
        items,
        terms,
        moreInfo,
        projectId,
        approver,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Material Request</DialogTitle>
          <DialogDescription>Fill in the details for the new material request</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            {/* <TabsTrigger value="moreinfo">More Info</TabsTrigger> */}
          </TabsList>
          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Request No. *</label>
                <Input
                  value={requestNumber}
                  onChange={e => setRequestNumber(e.target.value)}
                  placeholder="Enter request number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Approver</label>
                <Input
                  value={approver}
                  onChange={e => setApprover(e.target.value)}
                  placeholder="Enter approver name or ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction Date *</label>
                <Input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose *</label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required By</label>
                <Input
                  type="date"
                  value={requiredBy}
                  onChange={e => setRequiredBy(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price List</label>
                <Select value={priceList} onValueChange={setPriceList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Buying">Standard Buying</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Scan Barcode</label>
              <Input value={scanBarcode} onChange={e => setScanBarcode(e.target.value)} />
            </div> */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Set Target Warehouse</label>
              <Input value={targetWarehouse} onChange={e => setTargetWarehouse(e.target.value)} />
            </div>
            <Card className="mt-4">
              <CardHeader className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
                <div className="flex items-center justify-between">
                  <CardTitle>Items</CardTitle>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {expanded && (
                <CardContent className="space-y-4">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <p>No Items</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Table Headers */}
                      <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                          />
                        </div>
                        <div className="col-span-1">No.</div>
                        <div className="col-span-1">Item Code *</div>
                        <div className="col-span-2">Required By *</div>
                        <div className="col-span-1">Quantity</div>
                        <div className="col-span-1">Target Warehouse</div>
                        <div className="col-span-1">UOM *</div>
                      </div>
                      {/* Table Rows */}
                      {items.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-8 gap-2 items-center p-2 border rounded">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedRows.has(item.id)}
                              onChange={() => toggleRowSelection(item.id)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Input value={idx + 1} readOnly className="h-8 text-sm" />
                          </div>
                          <div className="col-span-1">
                            <Input
                              value={item.itemCode}
                              onChange={e => handleItemChange(idx, "itemCode", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Enter item code"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="date"
                              value={item.requiredBy}
                              onChange={e => handleItemChange(idx, "requiredBy", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              value={item.targetWarehouse}
                              onChange={e => handleItemChange(idx, "targetWarehouse", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Warehouse"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              value={item.uom}
                              onChange={e => handleItemChange(idx, "uom", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="UOM"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button onClick={addRow} variant="outline" size="sm">
                      Add Row
                    </Button>
                    {selectedRows.size > 0 && (
                      <Button onClick={removeSelectedRows} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Delete Selected ({selectedRows.size})
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="terms">
            <Card className="shadow-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/40 mt-6">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="terms" className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Please enter any terms and conditions for this material request:
                  </Label>
                  <RichTextEditor
                    value={terms}
                    onChange={setTerms}
                    placeholder="Enter terms and conditions"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="moreinfo">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">More Info</label>
              <Input value={moreInfo} onChange={e => setMoreInfo(e.target.value)} placeholder="Enter more info..." />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 