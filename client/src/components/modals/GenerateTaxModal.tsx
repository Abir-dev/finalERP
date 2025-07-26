import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface GenerateTaxModalProps {
  onClose: () => void;
}

interface TaxCharge {
  id: number;
  type: string;
  accountHead: string;
  taxRate: number;
  amount: number;
  total: number;
}

const GenerateTaxModal = ({ onClose }: GenerateTaxModalProps) => {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Taxes and Charges logic (copied from PaymentEntryModal)
  const [taxCharges, setTaxCharges] = useState<TaxCharge[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const addTaxCharge = () => {
    const newId = taxCharges.length > 0 ? Math.max(...taxCharges.map(item => item.id)) + 1 : 1;
    setTaxCharges([
      ...taxCharges,
      { id: newId, type: '', accountHead: '', taxRate: 0, amount: 0, total: 0 }
    ]);
  };

  const updateTaxCharge = (id: number, field: keyof TaxCharge, value: string | number) => {
    setTaxCharges(taxCharges.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'taxRate' || field === 'amount') {
          updatedItem.total = Number(updatedItem.taxRate) * Number(updatedItem.amount) / 100;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const toggleRowSelection = (id: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === taxCharges.length && taxCharges.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(taxCharges.map(item => item.id));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  const deleteSelectedRows = () => {
    const newTaxCharges = taxCharges.filter(item => !selectedRows.has(item.id));
    setTaxCharges(newTaxCharges);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const handleSave = () => {
    const data = {
      title,
      company,
      taxCategory,
      isDefault,
      isDisabled,
      taxCharges,
    };
    console.log("Saved Tax Info:", data);
    toast.success("Tax info saved!");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Tax</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label htmlFor="tax-title">Title<span className="text-red-500"> *</span></Label>
            <Input id="tax-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
            {/* <div className="flex flex-col gap-2 mt-4">
              <label className="flex items-center gap-2">
                <Checkbox checked={isDefault} onCheckedChange={v => setIsDefault(!!v)} />
                Default
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={isDisabled} onCheckedChange={v => setIsDisabled(!!v)} />
                Disabled
              </label>
            </div> */}
            <Label htmlFor="tax-category" className="mt-4">Tax Category</Label>
            <Input id="tax-category" value={taxCategory} onChange={e => setTaxCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tax-company">Company<span className="text-red-500"> *</span></Label>
            <Input id="tax-company" value={company} onChange={e => setCompany(e.target.value)} className="mt-1 font-semibold" />
          </div>
        </div>
        {/* Taxes and Charges Section (copied) */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
            <div className="flex items-center justify-between">
              <CardTitle>Taxes and Charges</CardTitle>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {expanded && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Advance Taxes and Charges</h4>
                {taxCharges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p>No Data</p>
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
                      <div className="col-span-1">Type *</div>
                      <div className="col-span-2">Account Head *</div>
                      <div className="col-span-1">Tax Rate</div>
                      <div className="col-span-1">Amount</div>
                      <div className="col-span-1">Total</div>
                    </div>
                    {/* Table Rows */}
                    {taxCharges.map((charge, index) => (
                      <div key={charge.id} className="grid grid-cols-8 gap-2 items-center p-2 border rounded">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedRows.has(charge.id)}
                            onChange={() => toggleRowSelection(charge.id)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={index + 1}
                            readOnly
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <Select value={charge.type} onValueChange={value => updateTaxCharge(charge.id, 'type', value)}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TDS">TDS</SelectItem>
                              <SelectItem value="GST">GST</SelectItem>
                              <SelectItem value="TCS">TCS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={charge.accountHead}
                            onChange={e => updateTaxCharge(charge.id, 'accountHead', e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Enter account head"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={charge.taxRate}
                            onChange={e => updateTaxCharge(charge.id, 'taxRate', Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={charge.amount}
                            onChange={e => updateTaxCharge(charge.id, 'amount', Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={charge.total.toFixed(2)}
                            readOnly
                            className="h-8 text-sm bg-gray-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button onClick={addTaxCharge} variant="outline" size="sm">
                    Add Row
                  </Button>
                  {selectedRows.size > 0 && (
                    <Button onClick={deleteSelectedRows} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete Selected ({selectedRows.size})
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateTaxModal; 