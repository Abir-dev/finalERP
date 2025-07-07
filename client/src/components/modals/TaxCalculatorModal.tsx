import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxCalculatorModalProps {
  onClose: () => void;
}

const TaxCalculatorModal: React.FC<TaxCalculatorModalProps> = ({ onClose }) => {
  const [taxType, setTaxType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');

  // Set default rates for each tax type
  const handleTaxTypeChange = (value: string) => {
    setTaxType(value);
    if (value === 'gst') setRate('18');
    else if (value === 'tds') setRate('10');
    else if (value === 'income') setRate('30');
    else setRate('');
  };

  // Calculate tax and total
  const baseAmount = parseFloat(amount) || 0;
  const taxRate = parseFloat(rate) || 0;
  const taxAmount = baseAmount * (taxRate / 100);
  const totalAmount = baseAmount + taxAmount;

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
            <Select value={taxType} onValueChange={handleTaxTypeChange}>
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
            <Input id="amount" type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rate">Tax Rate (%)</Label>
            <Input id="rate" type="number" placeholder="Enter tax rate" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div className="p-3 border rounded-lg bg-muted">
            <h3 className="font-medium mb-2">Tax Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span>₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Amount:</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaxCalculatorModal; 