import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Package, Truck, AlertTriangle, Plus, CheckCircle, Clock, Warehouse, ArrowLeft, MapPin, TrendingDown, BarChart3, Download } from "lucide-react"
import { inventoryData } from "@/lib/dummy-data"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import AddVehicleModal from "@/components/modals/AddVehicleModal"
import { useToast } from "@/components/ui/use-toast"

const inventory = [
  { id: 1, item: 'Cement', quantity: 150, unit: 'bags', minStock: 50, location: 'Warehouse A', status: 'Good' },
  { id: 2, item: 'Steel Bars', quantity: 25, unit: 'tons', minStock: 30, location: 'Warehouse B', status: 'Low' },
  { id: 3, item: 'Bricks', quantity: 45000, unit: 'pieces', minStock: 20000, location: 'Yard 1', status: 'Good' },
  { id: 4, item: 'Sand', quantity: 8, unit: 'cubic meters', minStock: 15, location: 'Yard 2', status: 'Critical' }
];

const stockData = [
  { category: 'Raw Materials', inStock: 1200, lowStock: 80, outOfStock: 15 },
  { category: 'Finishing Items', inStock: 800, lowStock: 45, outOfStock: 8 },
  { category: 'Tools & Equipment', inStock: 350, lowStock: 25, outOfStock: 5 },
  { category: 'Safety Items', inStock: 600, lowStock: 30, outOfStock: 3 },
];

const transferData = [
  { name: 'Completed', value: 45, fill: '#10b981' },
  { name: 'In Transit', value: 12, fill: '#3b82f6' },
  { name: 'Pending', value: 8, fill: '#f59e0b' },
  { name: 'Cancelled', value: 3, fill: '#ef4444' },
];

type InventoryItem = typeof inventoryData[0]

const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return <Badge variant="outline">{category}</Badge>
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      const unit = row.original.unit
      return `${quantity} ${unit}`
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
]

const transferColumns = [
  {
    accessorKey: "id",
    header: "Transfer ID",
  },
  {
    accessorKey: "items",
    header: "Items",
  },
  {
    accessorKey: "from",
    header: "From",
  },
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string
      const variant = status === "Completed" ? "default" :
        status === "In Transit" ? "secondary" :
          status === "Cancelled" ? "destructive" : "outline"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]


const topVehicles = [
  { vehicle: 'Truck 1', utilization: 92, site: 'Site A' },
  { vehicle: 'Excavator 1', utilization: 88, site: 'Site B' },
  { vehicle: 'Truck 2', utilization: 85, site: 'Site C' },
  { vehicle: 'Crane 1', utilization: 80, site: 'Site A' },
  { vehicle: 'Truck 3', utilization: 78, site: 'Site B' },
];

const costlyMaintenance = [
  { vehicle: 'Truck 2', date: '2024-05-10', cost: 12000, desc: 'Engine Overhaul' },
  { vehicle: 'Crane 1', date: '2024-05-15', cost: 9500, desc: 'Hydraulics Repair' },
  { vehicle: 'Excavator 1', date: '2024-05-20', cost: 8000, desc: 'Track Replacement' },
];


const transfersData = [
  { id: "TR001", items: "Steel Rods, Cement", from: "Warehouse A", to: "Site 1", status: "In Transit" },
  { id: "TR002", items: "Paint, Brushes", from: "Site 2", to: "Warehouse B", status: "Completed" },
  { id: "TR003", items: "Safety Equipment", from: "Central Store", to: "Site 3", status: "Pending" },
]

const vehicleKpis = [
  { label: 'Total Active Vehicles', value: 18, color: 'green' },
  { label: 'Vehicles on Site', value: 12, color: 'blue' },
  { label: 'Under Maintenance', value: 3, color: 'yellow' },
];
const vehicleMovementLogs = [
  { date: '2024-06-01', time: '09:00', from: 'Depot', to: 'Site A', driver: 'John Doe' },
  { date: '2024-06-01', time: '10:30', from: 'Site A', to: 'Site B', driver: 'Jane Smith' },
  { date: '2024-06-01', time: '12:00', from: 'Site B', to: 'Depot', driver: 'Mike Brown' },
];
const fuelTrendData = [
  { name: 'Site A', Truck1: 120, Truck2: 110 },
  { name: 'Site B', Truck1: 90, Truck2: 100 },
  { name: 'Site C', Truck1: 80, Truck2: 70 },
  { name: 'Depot', Truck1: 60, Truck2: 50 },
];
const utilizationByProject = [
  { project: 'Site A', utilization: 80 },
  { project: 'Site B', utilization: 65 },
  { project: 'Site C', utilization: 50 },
];
const vehicleTypes = ['All', 'Truck', 'Excavator', 'Crane'];
const projectSites = ['All', 'Site A', 'Site B', 'Site C', 'Depot'];
const statusOptions = ['All', 'Active', 'Idle', 'Maintenance'];

type MaintenanceSchedule = {
  vehicle: string
  last: string
  next: string
  status: 'Scheduled' | 'Overdue'
  vendor?: string
  notes?: string
}

const StoreDashboard = () => {
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false)
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] = useState(false)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedItemForIssue, setSelectedItemForIssue] = useState<InventoryItem | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventoryData)
  const [vehicleType, setVehicleType] = useState('all')
  const [vehicleSite, setVehicleSite] = useState('all')
  const [vehicleStatus, setVehicleStatus] = useState('all')
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [purchaseRequests, setPurchaseRequests] = useState([
    { id: 'PR001', item: 'Steel Bars - 20 tons', project: 'Office Tower B', urgency: 'High', requestedBy: 'Site Engineer', status: 'Pending' },
    { id: 'PR002', item: 'Cement - 200 bags', project: 'Residential Complex A', urgency: 'Medium', requestedBy: 'Project Manager', status: 'Pending' },
    { id: 'PR003', item: 'Paint - 50 liters', project: 'Shopping Mall C', urgency: 'Low', requestedBy: 'Supervisor', status: 'Pending' }
  ])
  const { toast } = useToast()
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([
    { vehicle: 'Truck 1', last: '2024-05-15', next: '2024-07-15', status: 'Scheduled' },
    { vehicle: 'Truck 2', last: '2024-05-20', next: '2024-07-20', status: 'Overdue' },
    { vehicle: 'Excavator 1', last: '2024-05-10', next: '2024-07-10', status: 'Scheduled' },
  ])
  const [selectedAsset, setSelectedAsset] = useState<MaintenanceSchedule | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-500';
      case 'Low':
        return 'bg-yellow-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStockLevel = (quantity: number, minStock: number) => {
    return Math.min(100, (quantity / minStock) * 100);
  };

  const handleLogGRN = () => {
    toast({
      title: "GRN logged successfully!"
    })
    setIsGRNModalOpen(false)
  }

  const handleRaiseRequest = () => {
    toast({
      title: "Purchase request raised successfully!"
    })
    setIsRequestModalOpen(false)
  }

  const handleTransferApproval = () => {
    toast({
      title: "Transfer request approved!"
    })
    setIsTransferModalOpen(false)
  }

  const handleIssueToSite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const siteTeam = formData.get('siteTeam') as string
    const reason = formData.get('reason') as string
    const quantity = Number(formData.get('quantity'))
    const selectedItems = formData.getAll('selectedItems') as string[]
    
    if (quantity > 0) {
      // Update the inventory items with the reduced quantity
      setInventoryItems(currentItems => 
        currentItems.map(item => {
          if (selectedItems.includes(item.name)) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - quantity),
              lastUpdated: new Date().toLocaleDateString()
            }
          }
          return item
        })
      )

      toast({
        title: `Issued ${quantity} items to ${siteTeam} for ${reason}`
      })
      setIsIssueModalOpen(false)
      setSelectedItemForIssue(null)
    }
  }

  const handleUpdateStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuantity = Number(formData.get('quantity'))
    
    if (selectedItem && newQuantity >= 0) {
      // Update the inventory items with the new quantity
      setInventoryItems(currentItems => 
        currentItems.map(item => 
          item.name === selectedItem.name 
            ? { ...item, quantity: newQuantity, lastUpdated: new Date().toLocaleDateString() }
            : item
        )
      )

      toast({
        title: `Updated ${selectedItem.name} stock to ${newQuantity} ${selectedItem.unit}`
      })
      setIsUpdateStockModalOpen(false)
      setSelectedItem(null)
    }
  }

  const handleTransferStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const toLocation = formData.get('toLocation') as string
    const quantity = Number(formData.get('quantity'))
    
    if (selectedItem && quantity > 0) {
      // Update the inventory items with the new quantity after transfer
      setInventoryItems(currentItems => 
        currentItems.map(item => 
          item.name === selectedItem.name 
            ? { 
                ...item, 
                quantity: item.quantity - quantity,
                lastUpdated: new Date().toLocaleDateString()
              }
            : item
        )
      )

      toast({
        title: `Transferred ${quantity} ${selectedItem.unit} of ${selectedItem.name} to ${toLocation}`
      })
      setIsTransferStockModalOpen(false)
      setSelectedItem(null)
    }
  }

  function handleAddVehicle(vehicle) {
    toast({
      title: 'Vehicle Added',
      description: `${vehicle.name} (${vehicle.type}) was added successfully.`,
      duration: 3000,
    });
    // Optionally, update your vehicle list here
  }

  const handleReorder = (item: any) => {
    // Create a purchase request for the item
    const reorderQuantity = item.minStock * 2 - item.quantity; // Order enough to get back to 2x min stock
    
    toast({
      title: "Reorder initiated",
      description: `Ordered ${reorderQuantity} ${item.unit} of ${item.item}`,
    });

    // Update the item's status to show it's been reordered
    const updatedInventory = inventory.map((invItem) => {
      if (invItem.id === item.id) {
        return {
          ...invItem,
          status: 'Reordered'
        };
      }
      return invItem;
    });

    // In a real application, you would make an API call here to:
    // 1. Create a purchase order
    // 2. Update the item status
    // 3. Notify relevant stakeholders
  };

  const handleApproveRequest = (request: any) => {
    // Update the status of the request
    setPurchaseRequests(currentRequests =>
      currentRequests.map(req =>
        req.id === request.id
          ? { ...req, status: 'Approved' }
          : req
      )
    )

    // Show success notification
    toast({
      title: "Purchase request approved",
      description: `Request for ${request.item} has been approved`,
    })

    // In a real application, you would:
    // 1. Make an API call to update the request status
    // 2. Create a purchase order
    // 3. Notify relevant stakeholders
    // 4. Update inventory tracking system
  }

  const handleGetQuote = (request: any) => {
    // Show processing notification
    toast({
      title: "Requesting quotes",
      description: `Sending quote requests to vendors for ${request.item}`,
    })

    // In a real application, you would:
    // 1. Send quote requests to relevant vendors
    // 2. Track quote request status
    // 3. Update the request status
    // 4. Notify procurement team
  }

  const handleScheduleMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const maintenanceDate = formData.get('maintenanceDate') as string
    const vendor = formData.get('vendor') as string
    const notes = formData.get('notes') as string

    if (selectedAsset && maintenanceDate) {
      // Update the maintenance schedule
      setMaintenanceSchedules(current =>
        current.map(schedule =>
          schedule.vehicle === selectedAsset.vehicle
            ? {
                ...schedule,
                next: maintenanceDate,
                status: 'Scheduled',
                vendor,
                notes
              }
            : schedule
        )
      )

      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance for ${selectedAsset.vehicle} scheduled for ${maintenanceDate}`,
      })

      // Close the modal and reset selection
      setIsMaintenanceModalOpen(false)
      setSelectedAsset(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Manager Dashboard</h1>
          <p className="text-muted-foreground">Inventory management and logistics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsGRNModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Log GRN
          </Button>
          <Button onClick={() => setIsRequestModalOpen(true)} variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Raise Request
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 sticky top-0 z-10 bg-background">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          {/* <TabsTrigger value="warehouse">Warehouse</TabsTrigger> */}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="vehicle-tracking">Vehicle Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Inventory Value"
              value="₹45L"
              icon={Package}
              description="Across all locations"
              onClick={() => toast({
                title: "Viewing inventory details"
              })}
            />
            <StatCard
              title="Low Stock Items"
              value="7"
              icon={AlertTriangle}
              description="Need immediate attention"
              onClick={() => toast({
                title: "Viewing low stock items"
              })}
            />
            <StatCard
              title="Active Transfers"
              value="12"
              icon={Truck}
              description="In transit"
              onClick={() => toast({
                title: "Viewing active transfers"
              })}
            />
            <StatCard
              title="Monthly Consumption"
              value="₹18L"
              icon={TrendingDown}
              description="-8% vs last month"
              onClick={() => toast({
                title: "Viewing consumption trends"
              })}
            />
          </div>

          {/* Critical Alerts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Critical Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventory.filter(item => item.status === 'Critical' || item.status === 'Low').map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{item.item}</p>
                        <p className="text-sm text-gray-600">
                          Current: {item.quantity} {item.unit} | Min: {item.minStock} {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReorder(item)}
                        disabled={item.status === 'Reordered'}
                      >
                        {item.status === 'Reordered' ? 'Reordered' : 'Reorder'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'IN', item: 'Cement - 50 bags', location: 'From Vendor ABC', time: '2 hours ago' },
                    { type: 'OUT', item: 'Steel Bars - 5 tons', location: 'To Site A', time: '4 hours ago' },
                    { type: 'TRANSFER', item: 'Bricks - 10,000 pieces', location: 'Warehouse A → Site B', time: '6 hours ago' }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${transaction.type === 'IN' ? 'bg-green-500' :
                          transaction.type === 'OUT' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.item}</p>
                          <p className="text-sm text-gray-600">{transaction.location}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{transaction.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { location: 'Warehouse A', utilization: 85, capacity: '2000 sqft' },
                    { location: 'Warehouse B', utilization: 72, capacity: '1500 sqft' },
                    { location: 'Yard 1', utilization: 60, capacity: '5000 sqft' },
                    { location: 'Yard 2', utilization: 45, capacity: '3000 sqft' }
                  ].map((storage, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{storage.location}</span>
                        <span>{storage.utilization}% ({storage.capacity})</span>
                      </div>
                      <Progress value={storage.utilization} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Low Stock Items"
                value="24"
                icon={AlertTriangle}
                description="Below reorder level"
                onClick={() => toast({
                  title: "Viewing low stock alerts"
                })}
              />
              <StatCard
                title="Total Items"
                value="1,247"
                icon={Package}
                description="In inventory"
                onClick={() => toast({
                  title: "Viewing complete inventory"
                })}
              />
              <StatCard
                title="Value"
                value="₹12.5M"
                icon={Package}
                description="Total inventory value"
                onClick={() => toast({
                  title: "Viewing inventory valuation"
                })}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stock Category Overview</CardTitle>
                <CardDescription>Inventory status by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="inStock" fill="#10b981" />
                    <Bar dataKey="lowStock" fill="#f59e0b" />
                    <Bar dataKey="outOfStock" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { item: 'Steel TMT Bars', category: 'Raw Material', issue: 'Low Stock', level: 'High', action: 'Reorder' },
                    { item: 'Safety Helmets', category: 'Safety', issue: 'Expiring Soon', level: 'Medium', action: 'Use First' },
                    { item: 'Electrical Wire', category: 'Electrical', issue: 'High Usage', level: 'Low', action: 'Monitor' },
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{alert.item}</h3>
                        <p className="text-sm text-muted-foreground">{alert.category} • {alert.issue}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          alert.level === 'High' ? 'destructive' :
                            alert.level === 'Medium' ? 'default' :
                              'secondary'
                        }>
                          {alert.level}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => toast({
                            title: `${alert.action} action for ${alert.item}`
                          })}
                        >
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Site Inventory</CardTitle>
                  <CardDescription>Current stock levels across locations</CardDescription>
                </div>
                <Button onClick={() => setIsIssueModalOpen(true)} className="gap-2">
                  <Truck className="h-4 w-4" />
                  Issue to Site
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    ...inventoryColumns,
                    {
                      id: "actions",
                      header: "Actions",
                      cell: ({ row }) => (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(row.original)
                              setIsTransferStockModalOpen(true)
                            }}
                          >
                            Transfer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(row.original)
                              setIsUpdateStockModalOpen(true)
                            }}
                          >
                            Update Stock
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  data={inventoryItems}
                  searchKey="name"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfers">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Transfers"
                value="12"
                icon={Truck}
                description="Currently in transit"
                onClick={() => toast({
                  title: "Viewing active transfers"
                })}
              />
              <StatCard
                title="Completed Today"
                value="8"
                icon={CheckCircle}
                description="Successfully delivered"
                onClick={() => toast({
                  title: "Viewing completed transfers"
                })}
              />
              <StatCard
                title="Pending Approval"
                value="5"
                icon={Clock}
                description="Awaiting authorization"
                onClick={() => toast({
                  title: "Viewing pending approvals"
                })}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Status Distribution</CardTitle>
                <CardDescription>Current transfer status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transferData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {transferData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {transferData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        ></div>
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Timeline</CardTitle>
                <CardDescription>Recent transfer activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'TR001', status: 'Delivered', time: '2 hours ago', from: 'Warehouse A', to: 'Site 1' },
                    { id: 'TR002', status: 'In Transit', time: '4 hours ago', from: 'Site 2', to: 'Central' },
                    { id: 'TR003', status: 'Packed', time: '6 hours ago', from: 'Warehouse B', to: 'Site 3' },
                    { id: 'TR004', status: 'Requested', time: '8 hours ago', from: 'Site 1', to: 'Warehouse A' },
                  ].map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{transfer.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transfer.from} → {transfer.to}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{transfer.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{transfer.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Material Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={transferColumns}
                  data={transfersData}
                  searchKey="items"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="procurement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{request.item}</h4>
                        <Badge variant={request.urgency === 'High' ? 'destructive' :
                          request.urgency === 'Medium' ? 'outline' : 'secondary'}>
                          {request.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Project: {request.project}</p>
                      <p className="text-sm text-gray-600">Requested by: {request.requestedBy}</p>
                      <div className="flex space-x-2 mt-2">
                        {request.status === 'Pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApproveRequest(request)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGetQuote(request)}
                            >
                              Get Quote
                            </Button>
                          </>
                        ) : (
                          <Badge variant="default">
                            {request.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { vendor: 'ABC Materials', rating: 4.8, deliveries: 24, onTime: 96 },
                    { vendor: 'XYZ Suppliers', rating: 4.6, deliveries: 18, onTime: 89 },
                    { vendor: 'BuildCorp', rating: 4.2, deliveries: 32, onTime: 78 }
                  ].map((vendor, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{vendor.vendor}</h4>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-yellow-600 mr-1">★</span>
                          <span className="text-sm font-semibold">{vendor.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Deliveries</p>
                          <p className="font-medium">{vendor.deliveries}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">On-time %</p>
                          <p className="font-medium">{vendor.onTime}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warehouse">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Capacity"
                value="85%"
                icon={Warehouse}
                description="Warehouse utilization"
                onClick={() => toast({
                  title: "Viewing capacity details"
                })}
              />
              <StatCard
                title="AMC Due Items"
                value="12"
                icon={AlertTriangle}
                description="Maintenance required"
                onClick={() => toast({
                  title: "Viewing AMC schedule"
                })}
              />
              <StatCard
                title="Asset Value"
                value="₹45M"
                icon={Package}
                description="Total asset value"
                onClick={() => toast({
                  title: "Viewing asset register"
                })}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Central Warehouse Management</CardTitle>
                <CardDescription>Asset and inventory oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Stock by Site Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { site: 'Site 1 - Villa Complex', percentage: 35, value: '₹4.2M' },
                        { site: 'Site 2 - Commercial Tower', percentage: 28, value: '₹3.5M' },
                        { site: 'Site 3 - Apartments', percentage: 22, value: '₹2.8M' },
                        { site: 'Central Warehouse', percentage: 15, value: '₹1.8M' },
                      ].map((site) => (
                        <div key={site.site} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{site.site}</h4>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${site.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-semibold">{site.value}</div>
                            <div className="text-xs text-muted-foreground">{site.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Asset Maintenance Schedule</h3>
                    <div className="space-y-3">
                      {[
                        { vehicle: 'Excavator JCB-001', last: '2024-01-15', next: '2024-04-15', status: 'Scheduled' as const, vendor: 'Mech Services' },
                        { vehicle: 'Crane CR-002', last: '2024-01-10', next: '2024-04-10', status: 'Overdue' as const, vendor: 'Crane Care' },
                        { vehicle: 'Mixer MX-003', last: '2024-01-08', next: '2024-04-08', status: 'Scheduled' as const, vendor: 'Equipment Pro' },
                      ].map((asset) => (
                        <div key={asset.vehicle} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{asset.vehicle}</h4>
                          <p className="text-xs text-muted-foreground">Vendor: {asset.vendor}</p>
                          <div className="flex justify-between mt-2 text-xs">
                            <span>Last: {asset.last}</span>
                            <span>Next: {asset.next}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedAsset(asset)
                              setIsMaintenanceModalOpen(true)
                            }}
                          >
                            Schedule Maintenance
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Monthly Spend"
                value="₹32.5L"
                icon={BarChart3}
                description="+12% vs last month"
                onClick={() => toast({
                  title: "Viewing spend analytics"
                })}
              />
              <StatCard
                title="Stock Turnover"
                value="4.2x"
                icon={TrendingDown}
                description="Last 30 days"
                onClick={() => toast({
                  title: "Viewing turnover details"
                })}
              />
              <StatCard
                title="Dead Stock"
                value="₹8.2L"
                icon={AlertTriangle}
                description="No movement > 90 days"
                onClick={() => toast({
                  title: "Viewing dead stock"
                })}
              />
              <StatCard
                title="Avg Lead Time"
                value="12 days"
                icon={Clock}
                description="Order to delivery"
                onClick={() => toast({
                  title: "Viewing lead time analysis"
                })}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Consumption Trend</CardTitle>
                  <CardDescription>Value of materials consumed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { month: 'Sep', value: 2800000 },
                      { month: 'Oct', value: 3200000 },
                      { month: 'Nov', value: 2900000 },
                      { month: 'Dec', value: 3500000 },
                      { month: 'Jan', value: 3100000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category-wise Analysis</CardTitle>
                  <CardDescription>Stock value distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Raw Materials', value: 4500000, fill: '#3b82f6' },
                          { name: 'Consumables', value: 2800000, fill: '#10b981' },
                          { name: 'Tools & Equipment', value: 1800000, fill: '#f59e0b' },
                          { name: 'Safety Items', value: 900000, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Raw Materials', fill: '#3b82f6' },
                          { name: 'Consumables', fill: '#10b981' },
                          { name: 'Tools & Equipment', fill: '#f59e0b' },
                          { name: 'Safety Items', fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[
                      { name: 'Raw Materials', value: '₹45L', fill: '#3b82f6' },
                      { name: 'Consumables', value: '₹28L', fill: '#10b981' },
                      { name: 'Tools & Equipment', value: '₹18L', fill: '#f59e0b' },
                      { name: 'Safety Items', value: '₹9L', fill: '#ef4444' }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        ></div>
                        <span className="text-sm">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory KPI Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { metric: 'Stock Accuracy', value: '98.5%', trend: '+0.5%', status: 'positive' },
                    { metric: 'Order Fill Rate', value: '94.2%', trend: '-1.2%', status: 'negative' },
                    { metric: 'Inventory to Sales', value: '2.4x', trend: '0.0', status: 'neutral' },
                    { metric: 'Storage Utilization', value: '82%', trend: '+5%', status: 'positive' }
                  ].map((kpi) => (
                    <div key={kpi.metric} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{kpi.metric}</p>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-2xl font-semibold">{kpi.value}</span>
                        <span className={`text-sm ${kpi.status === 'positive' ? 'text-green-600' :
                          kpi.status === 'negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicle-tracking" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleSite} onValueChange={setVehicleSite}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Project Site" /></SelectTrigger>
              <SelectContent>
                {projectSites.map(site => (
                  <SelectItem key={site} value={site.toLowerCase()}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowAddVehicleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vehicle
          </Button>
            <div className="ml-auto">
              <Badge variant="outline">RFID/GPS Sync: <span className="text-green-600 ml-1">Active</span></Badge>
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleKpis.map((kpi, idx) => (
              <Card key={kpi.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                      <p className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Vehicle Movement Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Movement Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-left">From → To</th>
                      <th className="p-2 text-left">Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleMovementLogs.map((log, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{log.date}</td>
                        <td className="p-2">{log.time}</td>
                        <td className="p-2">{log.from} → {log.to}</td>
                        <td className="p-2">{log.driver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Fuel Consumption Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Consumption Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fuelTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Truck1" stroke="#0ea5e9" name="Truck 1" />
                    <Line type="monotone" dataKey="Truck2" stroke="#22c55e" name="Truck 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Maintenance Schedule & History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule & History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Vehicle</th>
                      <th className="p-2 text-left">Last Serviced</th>
                      <th className="p-2 text-left">Next Due</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceSchedules.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{row.vehicle}</td>
                        <td className="p-2">{row.last}</td>
                        <td className="p-2">{row.next}</td>
                        <td className="p-2">
                          <Badge variant={row.status === 'Overdue' ? 'destructive' : 'outline'}>{row.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Vehicle Utilization by Project */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Utilization by Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilizationByProject} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#6366f1" name="Utilization (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GRN Modal */}
      <Dialog open={isGRNModalOpen} onOpenChange={setIsGRNModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New GRN</DialogTitle>
            <DialogDescription>Record goods receipt and verification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steel-suppliers">Steel Suppliers Ltd</SelectItem>
                  <SelectItem value="cement-corp">Cement Corp</SelectItem>
                  <SelectItem value="paint-supplies">Paint Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="po">Purchase Order</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PO-001">PO-001 - Steel Materials</SelectItem>
                  <SelectItem value="PO-002">PO-002 - Cement Bags</SelectItem>
                  <SelectItem value="PO-003">PO-003 - Paint Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="photos">Upload Photos</Label>
              <Input id="photos" type="file" multiple accept="image/*" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGRNModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogGRN}>
                Save GRN
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Purchase Request</DialogTitle>
            <DialogDescription>Create new purchase request for materials</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="site">Site</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site-1">Site 1 - Villa Complex</SelectItem>
                  <SelectItem value="site-2">Site 2 - Commercial Tower</SelectItem>
                  <SelectItem value="site-3">Site 3 - Apartments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRaiseRequest}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Approval Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transfer Request</DialogTitle>
            <DialogDescription>Review and approve material transfer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transfer Details</Label>
              <div className="p-3 border rounded-lg bg-muted">
                <p className="text-sm">TR001 - Steel Rods from Warehouse A to Site 1</p>
                <p className="text-xs text-muted-foreground">Requested by: Site Manager</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                Reject
              </Button>
              <Button onClick={handleTransferApproval}>
                Approve Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue to Site Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Issue to Site Team</DialogTitle>
            <DialogDescription>Issue materials to site team</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueToSite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteTeam">Site Team</Label>
                <Select name="siteTeam" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team-a">Site Team A</SelectItem>
                    <SelectItem value="team-b">Site Team B</SelectItem>
                    <SelectItem value="team-c">Site Team C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Issue Reason</Label>
                <Select name="reason" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction Work</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="repair">Repair Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Items to Issue</Label>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                  <div>Item Name</div>
                  <div>Category</div>
                  <div>Available Quantity</div>
                  <div>Select</div>
                </div>
                <div className="space-y-2">
                  {inventoryItems.map((item) => (
                    <div key={item.name} className="grid grid-cols-4 gap-4 items-center text-sm">
                      <div>{item.name}</div>
                      <div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <div>{item.quantity} {item.unit}</div>
                      <div>
                        <input
                          type="checkbox"
                          name="selectedItems"
                          value={item.name}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Issue Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity to issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsIssueModalOpen(false)
                  setSelectedItemForIssue(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Issue Items</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Stock Modal */}
      <Dialog open={isUpdateStockModalOpen} onOpenChange={setIsUpdateStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-quantity">Current Quantity</Label>
              <Input
                id="current-quantity"
                value={selectedItem?.quantity || 0}
                disabled
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">New Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                defaultValue={selectedItem?.quantity || 0}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUpdateStockModalOpen(false)
                  setSelectedItem(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Modal */}
      <Dialog open={isTransferStockModalOpen} onOpenChange={setIsTransferStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Transfer {selectedItem?.name} to another location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromLocation">From Location</Label>
              <Input
                id="fromLocation"
                value={selectedItem?.location || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toLocation">To Location</Label>
              <Select name="toLocation" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                  <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                  <SelectItem value="Site 1">Site 1</SelectItem>
                  <SelectItem value="Site 2">Site 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentQuantity">Available Quantity</Label>
              <Input
                id="currentQuantity"
                value={`${selectedItem?.quantity || 0} ${selectedItem?.unit || ''}`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Transfer Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 0}
                required
                defaultValue="1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTransferStockModalOpen(false)
                  setSelectedItem(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Transfer Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
            {/* Add Vehicle Modal */}
            {showAddVehicleModal && (
        <AddVehicleModal onClose={() => setShowAddVehicleModal(false)} onAdd={handleAddVehicle} />
      )}

      {/* Schedule Maintenance Modal */}
      <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule maintenance for {selectedAsset?.vehicle}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleMaintenance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceDate">Maintenance Date</Label>
              <Input
                id="maintenanceDate"
                name="maintenanceDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Maintenance Vendor</Label>
              <Select name="vendor" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mech-services">Mech Services</SelectItem>
                  <SelectItem value="crane-care">Crane Care</SelectItem>
                  <SelectItem value="equipment-pro">Equipment Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Maintenance Notes</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Add any specific maintenance instructions or notes"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMaintenanceModalOpen(false)
                  setSelectedAsset(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StoreDashboard
