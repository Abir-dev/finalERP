import React, { useState } from 'react';
import { X, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PaymentEntryModalProps {
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

const PaymentEntryModal: React.FC<PaymentEntryModalProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    taxes: false,
    gst: true,
    accounting: true,
    accounts: true
  });

  const [taxCharges, setTaxCharges] = useState<TaxCharge[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [project, setProject] = useState("");
  const dummyProjects = [
    { value: "residential-a", label: "Residential Complex A" },
    { value: "office-b", label: "Office Tower B" },
    { value: "mall-c", label: "Shopping Mall C" },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addTaxCharge = () => {
    const newId = taxCharges.length > 0 ? Math.max(...taxCharges.map(item => item.id)) + 1 : 1;
    setTaxCharges([...taxCharges, {
      id: newId,
      type: '',
      accountHead: '',
      taxRate: 0,
      amount: 0,
      total: 0
    }]);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Entry</h2>
              <p className="text-sm text-gray-600">Record payment transactions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice & Project Section */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice & Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceId" className="text-sm font-medium">
                    Invoice ID
                  </Label>
                  <Select
                    value={invoiceId}
                    onValueChange={value => {
                      setInvoiceId(value);
                      setProject(value);
                    }}
                  >
                    <SelectTrigger id="invoiceId" className="mt-1">
                      <SelectValue placeholder="Select invoice ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyProjects.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="project" className="text-sm font-medium">
                    Project
                  </Label>
                  <Select
                    value={project}
                    onValueChange={value => {
                      setProject(value);
                      setInvoiceId(value);
                    }}
                  >
                    <SelectTrigger id="project" className="mt-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyProjects.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type of Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Type of Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <Label htmlFor="series" className="text-sm font-medium">
                    Series*
                  </Label>
                  <Select defaultValue="ACC-PAY-.YYYY.-">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACC-PAY-.YYYY.-">ACC-PAY-.YYYY.-</SelectItem>
                      <SelectItem value="ACC-REC-.YYYY.-">ACC-REC-.YYYY.-</SelectItem>
                      <SelectItem value="CASH-PAY-.YYYY.-">CASH-PAY-.YYYY.-</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <div>
                  <Label htmlFor="paymentType" className="text-sm font-medium">
                    Payment Type*
                  </Label>
                  <Select defaultValue="Receive">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receive">Receive</SelectItem>
                      <SelectItem value="Pay">Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postingDate" className="text-sm font-medium">
                    Posting Date*
                  </Label>
                  <Input 
                    type="date" 
                    defaultValue="2025-07-26"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="modeOfPayment" className="text-sm font-medium">
                    Mode of Payment
                  </Label>
                  <Input 
                    placeholder="Enter payment mode"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment From / To Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment From / To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="partyType" className="text-sm font-medium">
                    Party Type
                  </Label>
                  <Select defaultValue="Customer">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="party" className="text-sm font-medium">
                    Party
                  </Label>
                  <Input 
                    placeholder="Select party"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="partyName" className="text-sm font-medium">
                    Party Name
                  </Label>
                  <Input 
                    placeholder="Enter party name"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('accounting')}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Accounts</CardTitle>
                {expandedSections.accounts ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.accounts && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accountPaidTo" className="text-sm font-medium">
                    Account Paid To*
                  </Label>
                  <Input 
                    placeholder="Select account"
                    className="mt-1 border-red-500"
                    required
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Taxes and Charges Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('taxes')}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Taxes and Charges</CardTitle>
                {expandedSections.taxes ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.taxes && (
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
                            <Select value={charge.type} onValueChange={(value) => updateTaxCharge(charge.id, 'type', value)}>
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
                              onChange={(e) => updateTaxCharge(charge.id, 'accountHead', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Enter account head"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input 
                              type="number"
                              value={charge.taxRate}
                              onChange={(e) => updateTaxCharge(charge.id, 'taxRate', Number(e.target.value))}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input 
                              type="number"
                              value={charge.amount}
                              onChange={(e) => updateTaxCharge(charge.id, 'amount', Number(e.target.value))}
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

          {/* GST Details Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('gst')}
            >
              <div className="flex items-center justify-between">
                <CardTitle>GST Details</CardTitle>
                {expandedSections.gst ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.gst && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyAddress" className="text-sm font-medium">
                      Company Address
                    </Label>
                    <Input 
                      placeholder="Enter company address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddress" className="text-sm font-medium">
                      Customer Address
                    </Label>
                    <Input 
                      placeholder="Enter customer address"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="placeOfSupply" className="text-sm font-medium">
                    Place of Supply
                  </Label>
                  <Input 
                    placeholder="Enter place of supply"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Accounting Dimensions Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('accounting')}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Accounting Dimensions</CardTitle>
                {expandedSections.accounting ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.accounting && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project" className="text-sm font-medium">
                      Project
                    </Label>
                    <Input 
                      placeholder="Select project"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costCenter" className="text-sm font-medium">
                      Cost Center
                    </Label>
                    <Input 
                      placeholder="Select cost center"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-1" />
            Payment Entry Form
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Payment Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentEntryModal; 