import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator, FileText, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { 
  ServiceInvoice, 
  ServiceInvoiceFormData, 
  ServiceInvoiceLineItem,
  SERVICE_INVOICE_UNITS,
  SERVICE_INVOICE_CATEGORIES,
  INDIAN_STATES
} from "@/types/service-invoice";

interface ServiceInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: ServiceInvoice) => void;
  projectId?: string;
  clientId?: string;
  initialData?: Partial<ServiceInvoice>;
}

export const ServiceInvoiceModal: React.FC<ServiceInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  clientId,
  initialData
}) => {
  const [formData, setFormData] = useState<ServiceInvoiceFormData>({
    header: {
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      state: 'West Bengal',
      stateCode: '19',
      raBillNumber: '',
      uniqueIdentifier: ''
    },
    receiver: {
      name: '',
      address: '',
      gstin: '',
      state: 'West Bengal',
      stateCode: '19'
    },
    project: {
      serviceRenderedAt: '',
      name: '',
      address: '',
      gstin: '',
      state: 'West Bengal',
      stateCode: '19'
    },
    lineItems: [],
    summary: {
      deductionRate: 0.01
    }
  });

  const [currentCategory, setCurrentCategory] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        header: initialData.header || formData.header,
        receiver: initialData.receiver || formData.receiver,
        project: initialData.project || formData.project,
        lineItems: initialData.lineItems || [],
        summary: initialData.summary || formData.summary
      });
    }
  }, [initialData]);

  const addLineItem = () => {
    const newItem: Partial<ServiceInvoiceLineItem> = {
      siNo: (formData.lineItems.length + 1).toString(),
      description: '',
      unit: 'Nos.',
      rate: 0,
      quantityPrevious: 0,
      quantityPresent: 0,
      quantityCumulative: 0,
      amountPrevious: 0,
      amountPresent: 0,
      amountCumulative: 0,
      category: currentCategory
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index: number, field: keyof ServiceInvoiceLineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate cumulative quantity
          if (field === 'quantityPrevious' || field === 'quantityPresent') {
            const prevQty = field === 'quantityPrevious' ? value : item.quantityPrevious || 0;
            const presQty = field === 'quantityPresent' ? value : item.quantityPresent || 0;
            updatedItem.quantityCumulative = prevQty + presQty;
          }
          
          // Auto-calculate amounts
          if (field === 'rate' || field === 'quantityPrevious' || field === 'quantityPresent') {
            const rate = field === 'rate' ? value : item.rate || 0;
            const prevQty = field === 'quantityPrevious' ? value : item.quantityPrevious || 0;
            const presQty = field === 'quantityPresent' ? value : item.quantityPresent || 0;
            
            updatedItem.amountPrevious = rate * prevQty;
            updatedItem.amountPresent = rate * presQty;
            updatedItem.amountCumulative = rate * (prevQty + presQty);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateSummary = () => {
    const taxableValuePrevious = formData.lineItems.reduce((sum, item) => sum + (item.amountPrevious || 0), 0);
    const taxableValuePresent = formData.lineItems.reduce((sum, item) => sum + (item.amountPresent || 0), 0);
    const taxableValueCumulative = formData.lineItems.reduce((sum, item) => sum + (item.amountCumulative || 0), 0);
    
    const deductionRate = formData.summary.deductionRate || 0.01;
    const deductionAmountPrevious = taxableValuePrevious * deductionRate;
    const deductionAmountPresent = taxableValuePresent * deductionRate;
    const deductionAmountCumulative = taxableValueCumulative * deductionRate;
    
    const totalAmountPrevious = taxableValuePrevious - deductionAmountPrevious;
    const totalAmountPresent = taxableValuePresent - deductionAmountPresent;
    const totalAmountCumulative = taxableValueCumulative - deductionAmountCumulative;
    
    const payableAmountRoundedPrevious = Math.round(totalAmountPrevious);
    const payableAmountRoundedPresent = Math.round(totalAmountPresent);
    const payableAmountRoundedCumulative = Math.round(totalAmountCumulative);

    setFormData(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        taxableValuePrevious,
        taxableValuePresent,
        taxableValueCumulative,
        deductionAmountPrevious,
        deductionAmountPresent,
        deductionAmountCumulative,
        totalAmountPrevious,
        totalAmountPresent,
        totalAmountCumulative,
        payableAmountRoundedPrevious,
        payableAmountRoundedPresent,
        payableAmountRoundedCumulative
      }
    }));
  };

  useEffect(() => {
    calculateSummary();
  }, [formData.lineItems, formData.summary.deductionRate]);

  const handleSave = () => {
    if (!formData.header.invoiceNumber || !formData.receiver.name || !formData.project.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const serviceInvoice: ServiceInvoice = {
      id: initialData?.id || `SI-${Date.now()}`,
      header: formData.header as any,
      receiver: formData.receiver as any,
      project: formData.project as any,
      lineItems: formData.lineItems as any,
      summary: formData.summary as any,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: initialData?.status || 'draft',
      projectId,
      clientId
    };

    onSave(serviceInvoice);
    toast.success("Service invoice saved successfully!");
    onClose();
  };

  const groupedLineItems = formData.lineItems.reduce((acc, item, index) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...item, index });
    return acc;
  }, {} as Record<string, (Partial<ServiceInvoiceLineItem> & { index: number })[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {initialData ? 'Edit Service Invoice' : 'Create Service Invoice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Header</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.header.invoiceNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    header: { ...prev.header, invoiceNumber: e.target.value }
                  }))}
                  placeholder="e.g., 6th R/A BILL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.header.invoiceDate || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    header: { ...prev.header, invoiceDate: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="raBillNumber">R/A Bill Number</Label>
                <Input
                  id="raBillNumber"
                  value={formData.header.raBillNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    header: { ...prev.header, raBillNumber: e.target.value }
                  }))}
                  placeholder="e.g., 6th RA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueIdentifier">Unique Identifier</Label>
                <Input
                  id="uniqueIdentifier"
                  value={formData.header.uniqueIdentifier || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    header: { ...prev.header, uniqueIdentifier: e.target.value }
                  }))}
                  placeholder="e.g., 8820172720"
                />
              </div>
            </CardContent>
          </Card>

          {/* Receiver Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Receiver Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Company Name *</Label>
                <Input
                  id="receiverName"
                  value={formData.receiver.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    receiver: { ...prev.receiver, name: e.target.value }
                  }))}
                  placeholder="e.g., RAJ TRIMUTI INFRA PROJECTS PVT. LTD."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverGstin">GSTIN *</Label>
                <Input
                  id="receiverGstin"
                  value={formData.receiver.gstin || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    receiver: { ...prev.receiver, gstin: e.target.value }
                  }))}
                  placeholder="e.g., 19AAGCM6646R1ZI"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="receiverAddress">Address *</Label>
                <Textarea
                  id="receiverAddress"
                  value={formData.receiver.address || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    receiver: { ...prev.receiver, address: e.target.value }
                  }))}
                  placeholder="Complete address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceRenderedAt">Service Rendered At *</Label>
                <Input
                  id="serviceRenderedAt"
                  value={formData.project.serviceRenderedAt || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    project: { ...prev.project, serviceRenderedAt: e.target.value }
                  }))}
                  placeholder="e.g., QUINTESSA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.project.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    project: { ...prev.project, name: e.target.value }
                  }))}
                  placeholder="Project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectAddress">Project Address</Label>
                <Input
                  id="projectAddress"
                  value={formData.project.address || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    project: { ...prev.project, address: e.target.value }
                  }))}
                  placeholder="e.g., MANIKTALA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectGstin">Project GSTIN</Label>
                <Input
                  id="projectGstin"
                  value={formData.project.gstin || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    project: { ...prev.project, gstin: e.target.value }
                  }))}
                  placeholder="GSTIN for project"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Line Items</CardTitle>
                <div className="flex gap-2">
                  <Select value={currentCategory} onValueChange={setCurrentCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_INVOICE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addLineItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedLineItems).map(([category, items]) => (
                <div key={category} className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm font-medium">
                      {category}
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2 text-left text-sm font-medium">SI No.</th>
                          <th className="border border-gray-200 p-2 text-left text-sm font-medium">Description</th>
                          <th className="border border-gray-200 p-2 text-left text-sm font-medium">Unit</th>
                          <th className="border border-gray-200 p-2 text-left text-sm font-medium">Rate</th>
                          <th className="border border-gray-200 p-2 text-center text-sm font-medium" colSpan={3}>
                            Quantity
                          </th>
                          <th className="border border-gray-200 p-2 text-center text-sm font-medium" colSpan={3}>
                            Amount
                          </th>
                          <th className="border border-gray-200 p-2 text-center text-sm font-medium">Actions</th>
                        </tr>
                        <tr className="bg-gray-50">
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Previous</th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Present</th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Cumulative</th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Previous</th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Present</th>
                          <th className="border border-gray-200 p-1 text-center text-xs">Cumulative</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, itemIndex) => (
                          <tr key={item.index}>
                            <td className="border border-gray-200 p-2">
                              <Input
                                value={item.siNo || ''}
                                onChange={(e) => updateLineItem(item.index, 'siNo', e.target.value)}
                                className="w-16 text-center"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                value={item.description || ''}
                                onChange={(e) => updateLineItem(item.index, 'description', e.target.value)}
                                placeholder="Item description"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Select
                                value={item.unit || 'Nos.'}
                                onValueChange={(value) => updateLineItem(item.index, 'unit', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SERVICE_INVOICE_UNITS.map(unit => (
                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.rate || 0}
                                onChange={(e) => updateLineItem(item.index, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-24 text-right"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.quantityPrevious || 0}
                                onChange={(e) => updateLineItem(item.index, 'quantityPrevious', parseFloat(e.target.value) || 0)}
                                className="w-20 text-right"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.quantityPresent || 0}
                                onChange={(e) => updateLineItem(item.index, 'quantityPresent', parseFloat(e.target.value) || 0)}
                                className="w-20 text-right"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.quantityCumulative || 0}
                                readOnly
                                className="w-20 text-right bg-gray-50"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.amountPrevious || 0}
                                readOnly
                                className="w-24 text-right bg-gray-50"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.amountPresent || 0}
                                readOnly
                                className="w-24 text-right bg-gray-50"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Input
                                type="number"
                                value={item.amountCumulative || 0}
                                readOnly
                                className="w-24 text-right bg-gray-50"
                              />
                            </td>
                            <td className="border border-gray-200 p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLineItem(item.index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              
              {formData.lineItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No line items added yet</p>
                  <p className="text-sm">Add line items to create your service invoice</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Taxable Value</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Previous:</span>
                        <span>₹{formData.summary.taxableValuePrevious?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Present:</span>
                        <span>₹{formData.summary.taxableValuePresent?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Cumulative:</span>
                        <span>₹{formData.summary.taxableValueCumulative?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Deduction</h4>
                      <Input
                        type="number"
                        value={((formData.summary.deductionRate || 0) * 100).toFixed(1)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          summary: { ...prev.summary, deductionRate: (parseFloat(e.target.value) || 0) / 100 }
                        }))}
                        className="w-16 text-center"
                        step="0.1"
                      />
                      <span className="text-sm">%</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Previous:</span>
                        <span>₹{formData.summary.deductionAmountPrevious?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Present:</span>
                        <span>₹{formData.summary.deductionAmountPresent?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Cumulative:</span>
                        <span>₹{formData.summary.deductionAmountCumulative?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Total Amount</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Previous:</span>
                        <span>₹{formData.summary.totalAmountPrevious?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Present:</span>
                        <span>₹{formData.summary.totalAmountPresent?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Cumulative:</span>
                        <span>₹{formData.summary.totalAmountCumulative?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payable Amount (ROUND OFF)</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Previous:</span>
                      <span className="font-medium">₹{formData.summary.payableAmountRoundedPrevious?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className="font-medium">₹{formData.summary.payableAmountRoundedPresent?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cumulative:</span>
                      <span className="font-bold text-lg">₹{formData.summary.payableAmountRoundedCumulative?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialData ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
