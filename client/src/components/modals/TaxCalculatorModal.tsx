import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxCalculatorModalProps {
  onClose: () => void;
}

const TaxCalculatorModal: React.FC<TaxCalculatorModalProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tax Calculator</DialogTitle>
          <DialogDescription>Calculate estimated tax liability</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="taxType">Tax Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gst">GST</SelectItem>
                <SelectItem value="tds">TDS</SelectItem>
                <SelectItem value="income">Income Tax</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="Enter amount" />
          </div>
          <div>
            <Label htmlFor="rate">Tax Rate (%)</Label>
            <Input id="rate" type="number" placeholder="Enter tax rate" />
          </div>
          <div className="p-3 border rounded-lg bg-muted">
            <h3 className="font-medium mb-2">Tax Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Amount:</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>₹0</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Calculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaxCalculatorModal; 