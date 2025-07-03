import React, { useState } from 'react';
import { X, Calculator, FileText, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface InvoiceBuilderModalProps {
  onClose: () => void;
}

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  laborType?: 'productive' | 'non-productive' | null;
}

const InvoiceBuilderModal: React.FC<InvoiceBuilderModalProps> = ({ onClose }) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: 'Foundation Work - Phase 1', quantity: 1, rate: 500000, amount: 500000, laborType: 'productive' },
    { id: 2, description: 'Material Supply - Cement & Steel', quantity: 1, rate: 300000, amount: 300000, laborType: null }
  ]);
  
  // State to control whether GST should be applied
  const [applyGst, setApplyGst] = useState<boolean>(true);

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, {
      id: newId,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      laborType: null
    }]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const productiveLabor = lineItems
    .filter(item => item.laborType === 'productive')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const nonProductiveLabor = lineItems
    .filter(item => item.laborType === 'non-productive')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalLabor = productiveLabor + nonProductiveLabor;
  
  const nonLaborItems = lineItems
    .filter(item => item.laborType === null)
    .reduce((sum, item) => sum + item.amount, 0);
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.18; // 18% GST
  const taxAmount = applyGst ? subtotal * taxRate : 0;
  const total = subtotal + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Calculator className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invoice Builder</h2>
              <p className="text-sm text-gray-600">Create progress-based invoices</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Number
                      </label>
                      <Input value="INV-2024-004" readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date
                      </label>
                      <Input type="date" defaultValue="2024-05-26" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential-a">Residential Complex A</SelectItem>
                          <SelectItem value="office-b">Office Tower B</SelectItem>
                          <SelectItem value="mall-c">Shopping Mall C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <Input type="date" defaultValue="2024-06-25" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green-valley">Green Valley Developers</SelectItem>
                        <SelectItem value="metropolitan">Metropolitan Holdings</SelectItem>
                        <SelectItem value="city-center">City Center Corp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Options
                    </label>
                    <RadioGroup 
                      defaultValue={applyGst ? "with-gst" : "without-gst"} 
                      className="flex space-x-4"
                      onValueChange={(value) => setApplyGst(value === "with-gst")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="with-gst" id="with-gst" />
                        <Label htmlFor="with-gst">With GST (18%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="without-gst" id="without-gst" />
                        <Label htmlFor="without-gst">Without GST</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Invoice Items</CardTitle>
                    <Button onClick={addLineItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                        <div className="col-span-4">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Select
                            value={item.laborType || ''}
                            onValueChange={(value) => {
                              const laborType = value === '' ? null : (value as 'productive' | 'non-productive');
                              updateLineItem(item.id, 'laborType', laborType);
                            }}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Labor Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-labor">Not Labor</SelectItem>
                              <SelectItem value="productive">Productive</SelectItem>
                              <SelectItem value="non-productive">Non-Productive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={`₹${item.amount.toLocaleString('en-IN')}`}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 space-y-2">
                    {/* Labor Breakdown */}
                    <div className="border p-3 rounded-md bg-gray-50 mb-4">
                      <h4 className="font-medium text-sm mb-2">Labor Breakdown:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Productive Labor:</span>
                          <span>₹{productiveLabor.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Non-Productive Labor:</span>
                          <span>₹{nonProductiveLabor.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                          <span>Total Labor:</span>
                          <span>₹{totalLabor.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Materials & Other Items:</span>
                      <span>₹{nonLaborItems.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {applyGst && (
                      <div className="flex justify-between text-sm">
                        <span>GST (18%):</span>
                        <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Completed (%)
                    </label>
                    <Input type="number" placeholder="65" min="0" max="100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <Textarea 
                      placeholder="Payment terms, conditions, and notes..."
                      rows={3}
                      defaultValue="Payment due within 30 days of invoice date. 1.5% monthly interest on overdue amounts."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internal Notes
                    </label>
                    <Textarea 
                      placeholder="Internal notes (not visible to client)..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900">Your Company Name</h3>
                      <p className="text-sm text-gray-600">Construction Services</p>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span>Invoice #:</span>
                        <span>INV-2024-004</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Date:</span>
                        <span>26/05/2024</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Due:</span>
                        <span>25/06/2024</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm font-medium">Bill To:</p>
                      <p className="text-sm text-gray-600">Client Name</p>
                      <p className="text-sm text-gray-600">Project Name</p>
                    </div>

                    <div className="border-t pt-3">
                      {/* Labor breakdown in preview */}
                      <div className="mb-2">
                        <div className="text-xs font-medium">Labor Summary:</div>
                        <div className="grid grid-cols-2 text-xs">
                          <span>Productive:</span>
                          <span className="text-right">₹{productiveLabor.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="grid grid-cols-2 text-xs">
                          <span>Non-Productive:</span>
                          <span className="text-right">₹{nonProductiveLabor.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="grid grid-cols-2 text-xs font-medium">
                          <span>Total Labor:</span>
                          <span className="text-right">₹{totalLabor.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {applyGst && (
                        <div className="flex justify-between text-sm">
                          <span>GST (18%):</span>
                          <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t">
                        <span>Total Amount:</span>
                        <span>₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Reminder
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Work Completed:</span>
                      <span>65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Previously Billed:</span>
                      <span>60%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Invoice:</span>
                      <span>5%</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span>Total Billed:</span>
                      <span>65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-1" />
              Auto-saved 1 minute ago
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilderModal; 