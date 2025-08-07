import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, AlertTriangle, Calendar, Download, DollarSign, Clock } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";

interface MaterialRequirement {
  id: string;
  material: string;
  category: string;
  requiredQuantity: number;
  unit: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  plannedDate: string;
  supplier: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';
  leadTime: number;
}

interface MaterialForecastProps {
  projectId: string;
  timeframe: '2-weeks' | '1-month' | 'custom';
}

interface QuoteRequest {
  materialId: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  additionalNotes: string;
}

export function MaterialForecast({ projectId, timeframe }: MaterialForecastProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'2-weeks' | '1-month' | 'custom'>(timeframe);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRequirement | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    materialId: '',
    quantity: 0,
    unit: '',
    requiredDate: '',
    additionalNotes: ''
  });

  // Mock data - would come from API
  const materialRequirements: MaterialRequirement[] = [
    {
      id: 'MAT001',
      material: 'Cement (OPC 53)',
      category: 'Raw Materials',
      requiredQuantity: 500,
      unit: 'bags',
      estimatedCost: 175000,
      priority: 'critical',
      plannedDate: '2024-02-01',
      supplier: 'UltraTech',
      availability: 'low-stock',
      leadTime: 3
    },
    {
      id: 'MAT002',
      material: 'Steel TMT Bars (12mm)',
      category: 'Structural',
      requiredQuantity: 2500,
      unit: 'kg',
      estimatedCost: 145000,
      priority: 'high',
      plannedDate: '2024-02-05',
      supplier: 'Tata Steel',
      availability: 'in-stock',
      leadTime: 5
    },
    {
      id: 'MAT003',
      material: 'Ready Mix Concrete (M25)',
      category: 'Concrete',
      requiredQuantity: 150,
      unit: 'cum',
      estimatedCost: 225000,
      priority: 'high',
      plannedDate: '2024-02-10',
      supplier: 'ACC RMC',
      availability: 'on-order',
      leadTime: 2
    }
  ];

  const getAvailabilityColor = (availability: MaterialRequirement['availability']) => {
    switch (availability) {
      case 'in-stock': return 'default';
      case 'low-stock': return 'secondary';
      case 'out-of-stock': return 'destructive';
      case 'on-order': return 'outline';
    }
  };

  const getPriorityColor = (priority: MaterialRequirement['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const totalEstimatedCost = materialRequirements.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value as '2-weeks' | '1-month' | 'custom');
  };

  const handleExportForecast = () => {
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Overview sheet
    const overviewData = [
      {
        'Total Items': materialRequirements.length,
        'Total Estimated Cost': `₹${(totalEstimatedCost / 100000).toFixed(1)}L`,
        'Critical Items': materialRequirements.filter(m => m.priority === 'critical').length,
        'Average Lead Time': `${Math.round(materialRequirements.reduce((sum, m) => sum + m.leadTime, 0) / materialRequirements.length)} days`
      }
    ];
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');

    // Category breakdown sheet
    const categoryData = ['Raw Materials', 'Structural', 'Concrete', 'Finishing'].map(category => {
      const categoryItems = materialRequirements.filter(m => m.category === category);
      const categoryValue = categoryItems.reduce((sum, m) => sum + m.estimatedCost, 0);
      const percentage = (categoryValue / totalEstimatedCost) * 100;
      
      return {
        'Category': category,
        'Total Cost': `₹${(categoryValue / 100000).toFixed(1)}L`,
        'Percentage': `${percentage.toFixed(1)}%`,
        'Number of Items': categoryItems.length
      };
    });
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Breakdown');

    // Material requirements sheet
    const materialsData = materialRequirements.map(item => ({
      'ID': item.id,
      'Material': item.material,
      'Category': item.category,
      'Required Quantity': item.requiredQuantity,
      'Unit': item.unit,
      'Estimated Cost': `₹${item.estimatedCost.toLocaleString()}`,
      'Priority': item.priority,
      'Planned Date': item.plannedDate,
      'Supplier': item.supplier,
      'Availability': item.availability,
      'Lead Time': `${item.leadTime} days`
    }));
    const materialsSheet = XLSX.utils.json_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(wb, materialsSheet, 'Material Requirements');

    // Export the workbook
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `material-forecast-${selectedTimeframe}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Material forecast data has been exported to Excel");
  };

  const handleRequestQuote = (material: MaterialRequirement) => {
    setSelectedMaterial(material);
    setQuoteRequest({
      materialId: material.id,
      quantity: material.requiredQuantity,
      unit: material.unit,
      requiredDate: material.plannedDate,
      additionalNotes: ''
    });
    setIsQuoteDialogOpen(true);
  };

  const handleSubmitQuoteRequest = () => {
    // Here you would typically make an API call to submit the quote request
    toast.success(`Quote request sent to ${selectedMaterial?.supplier}`);
    setIsQuoteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Material Forecasting & Scheduling</CardTitle>
            <CardDescription>Upcoming material requirements and procurement planning</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-weeks">Next 2 Weeks</SelectItem>
                <SelectItem value="1-month">Next Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportForecast}>
              <Download className="h-4 w-4 mr-1" />
              Export Forecast
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <EnhancedStatCard
            title="Total Material Cost"
            value={`₹${(totalEstimatedCost / 100000).toFixed(1)}L`}
            icon={DollarSign}
            description="Estimated procurement cost"
            trend={{ value: 8, label: "vs last forecast" }}
            threshold={{ status: 'good', message: 'Within budget allocation' }}
          />
          <EnhancedStatCard
            title="Critical Materials"
            value={materialRequirements.filter(m => m.priority === 'critical').length}
            icon={AlertTriangle}
            description="Require immediate action"
            trend={{ value: -12, label: "vs last week" }}
            threshold={{ status: 'warning', message: 'Monitor closely for delays' }}
          />
          <EnhancedStatCard
            title="Avg Lead Time"
            value={`${Math.round(materialRequirements.reduce((sum, m) => sum + m.leadTime, 0) / materialRequirements.length)} days`}
            icon={Clock}
            description="Average material delivery"
            trend={{ value: -5, label: "improvement" }}
            threshold={{ status: 'good', message: 'Lead times improving' }}
          />
          <EnhancedStatCard
            title="Materials Tracked"
            value={materialRequirements.length}
            icon={Package}
            description="Total items in forecast"
            trend={{ value: 15, label: "new additions" }}
            threshold={{ status: 'good', message: 'Comprehensive tracking' }}
          />
        </div> */}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Material List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Raw Materials', 'Structural', 'Concrete', 'Finishing'].map((category) => {
                    const categoryItems = materialRequirements.filter(m => m.category === category);
                    const categoryValue = categoryItems.reduce((sum, m) => sum + m.estimatedCost, 0);
                    const percentage = (categoryValue / totalEstimatedCost) * 100;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span>₹{(categoryValue / 100000).toFixed(1)}L ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                  <SelectItem value="Structural">Structural</SelectItem>
                  <SelectItem value="Concrete">Concrete</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {materialRequirements
                .filter(material => selectedCategory === 'all' || material.category === selectedCategory)
                .map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="font-medium">{material.material}</h4>
                        <p className="text-sm text-muted-foreground">{material.category}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getPriorityColor(material.priority)}>
                            {material.priority}
                          </Badge>
                          <Badge variant={getAvailabilityColor(material.availability)}>
                            {material.availability}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{material.requiredQuantity} {material.unit}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Cost</p>
                        <p className="font-medium">₹{material.estimatedCost.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Planned Date</p>
                        <p className="font-medium">{material.plannedDate}</p>
                        <p className="text-xs text-muted-foreground">Lead: {material.leadTime} days</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium">{material.supplier}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleRequestQuote(material)}
                        >
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quote Request Dialog */}
            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Quote</DialogTitle>
                  <DialogDescription>
                    Submit a quote request to {selectedMaterial?.supplier} for {selectedMaterial?.material}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Required</Label>
                    <div className="flex gap-2">
                      <Input
                        id="quantity"
                        type="number"
                        value={quoteRequest.quantity}
                        onChange={(e) => setQuoteRequest(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">{quoteRequest.unit}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required-date">Required By</Label>
                    <Input
                      id="required-date"
                      type="date"
                      value={quoteRequest.requiredDate}
                      onChange={(e) => setQuoteRequest(prev => ({ ...prev, requiredDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or notes for the supplier..."
                      value={quoteRequest.additionalNotes}
                      onChange={(e) => setQuoteRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitQuoteRequest}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-3">
              {materialRequirements
                .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
                .map((material) => (
                <div key={material.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-20 text-sm text-center">
                    <div className="font-medium">{new Date(material.plannedDate).toLocaleDateString()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{material.material}</span>
                      <Badge variant={getPriorityColor(material.priority)} className="text-xs">
                        {material.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {material.requiredQuantity} {material.unit} - ₹{material.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getAvailabilityColor(material.availability)}>
                      {material.availability}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {material.leadTime} days lead time
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
