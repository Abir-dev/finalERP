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
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { DollarSign, FileText, Users, Calculator, CreditCard, AlertTriangle, Download, ArrowLeft, Plus, TrendingUp, PieChart, Check, Clock } from "lucide-react"
import { invoicesData, employeesData } from "@/lib/dummy-data"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import TaxCalculatorModal from "@/components/modals/TaxCalculatorModal"
import ReconciliationPanel from "@/components/panels/ReconciliationPanel"
import InvoiceBuilderModal from "@/components/modals/InvoiceBuilderModal"

const collectionData = [
  { month: 'Jan', invoiced: 4500000, collected: 4200000, outstanding: 300000 },
  { month: 'Feb', invoiced: 5200000, collected: 4800000, outstanding: 700000 },
  { month: 'Mar', invoiced: 4800000, collected: 4600000, outstanding: 900000 },
  { month: 'Apr', invoiced: 6100000, collected: 5800000, outstanding: 1200000 },
  { month: 'May', invoiced: 5700000, collected: 5200000, outstanding: 1700000 },
  { month: 'Jun', invoiced: 6500000, collected: 6000000, outstanding: 2200000 },
]

const budgetData = [
  { project: 'Villa Complex', budgeted: 5000000, actual: 4750000, variance: -250000 },
  { project: 'Commercial Tower', budgeted: 12000000, actual: 12500000, variance: 500000 },
  { project: 'Apartments', budgeted: 8000000, actual: 7800000, variance: -200000 },
  { project: 'Shopping Mall', budgeted: 15000000, actual: 14200000, variance: -800000 },
]

type Invoice = typeof invoicesData[0]
type Employee = typeof employeesData[0]

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: "Invoice ID",
  },
  {
    accessorKey: "clientName",
    header: "Client",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return `₹${(amount / 1000).toFixed(0)}K`
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "Paid" ? "default" : 
                     status === "Overdue" ? "destructive" : 
                     "secondary"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]

const payrollColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Employee",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }) => {
      const salary = row.getValue("salary") as number
      return `₹${(salary / 1000).toFixed(0)}K`
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge>
    },
  },
]

const AccountsDashboard = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false)
  const [showTaxModal, setShowTaxModal] = useState(false)

  const handleGenerateInvoice = () => {
    toast.success("Invoice generated and sent successfully!")
    setIsInvoiceModalOpen(false)
  }

  const handleProcessPayroll = () => {
    toast.success("Payroll processed successfully!")
    setIsPayrollModalOpen(false)
  }

  const handleSetBudgetCap = () => {
    toast.success("Budget cap configured successfully!")
    setIsBudgetModalOpen(false)
  }

  const handleAutoMatch = () => {
    toast.success("Bank receipts auto-matched successfully!")
    setIsReconcileModalOpen(false)
  }

  const handleBulkReminder = () => {
    toast.success("Bulk reminder sent to all overdue clients!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts Dashboard</h1>
          <p className="text-muted-foreground">Financial management and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsInvoiceModalOpen(true)} className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
          <Button onClick={() => setShowTaxModal(true)} className="gap-2">
            <Calculator className="h-4 w-4" />
            Tax Calculator
          </Button>
          <Button onClick={handleBulkReminder} variant="outline" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Bulk Reminder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="budget">Budget Control</TabsTrigger>
          <TabsTrigger value="payroll">Payroll & Compliance</TabsTrigger>
          <TabsTrigger value="taxes">Tax Management</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Outstanding"
              value="₹8.2M"
              icon={DollarSign}
              description="Pending collections"
              trend={{ value: -5, label: "vs last month" }}
              onClick={() => toast.info("Viewing outstanding breakdown")}
            />
            <StatCard
              title="Overdue Amount"
              value="₹2.1M"
              icon={AlertTriangle}
              description="Past due date"
              onClick={() => toast.info("Opening overdue analysis")}
            />
            <StatCard
              title="Collected This Month"
              value="₹6.0M"
              icon={DollarSign}
              description="Payment received"
              trend={{ value: 12, label: "vs last month" }}
              onClick={() => toast.info("Viewing collection report")}
            />
            <StatCard
              title="Collection Rate"
              value="92%"
              icon={FileText}
              description="Payment efficiency"
              onClick={() => toast.info("Viewing efficiency metrics")}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Collection Trends</CardTitle>
              <CardDescription>Monthly invoicing and collection analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${(Number(value) / 1000000).toFixed(1)}M`, '']} />
                  <Line type="monotone" dataKey="invoiced" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="outstanding" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Invoiced"
              value="₹32.8M"
              icon={FileText}
              description="This month"
              trend={{ value: 8, label: "vs last month" }}
            />
            <StatCard
              title="Paid Invoices"
              value="₹28.5M"
              icon={Check}
              description="This month"
              trend={{ value: 12, label: "vs last month" }}
            />
            <StatCard
              title="Pending"
              value="₹4.3M"
              icon={AlertTriangle}
              description="Awaiting payment"
              trend={{ value: -15, label: "vs last month" }}
            />
            <StatCard
              title="Average Payment Time"
              value="12 days"
              icon={Clock}
              description="Payment cycle"
              trend={{ value: -2, label: "vs last month" }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Track and manage invoice status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={invoiceColumns} data={invoicesData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Budget"
              value="₹40M"
              icon={DollarSign}
              description="All projects"
            />
            <StatCard
              title="Spent"
              value="₹39.25M"
              icon={TrendingUp}
              description="Total expenses"
              trend={{ value: -5, label: "under budget" }}
            />
            <StatCard
              title="Remaining"
              value="₹0.75M"
              icon={PieChart}
              description="Available funds"
            />
            <StatCard
              title="Projects"
              value="4"
              icon={Users}
              description="Active projects"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Project-wise comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${(Number(value) / 1000000).toFixed(1)}M`, '']} />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budget" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Details</CardTitle>
                <CardDescription>Project-wise breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.map((project, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{project.project}</span>
                        <span className={project.variance < 0 ? "text-green-600" : "text-red-600"}>
                          {project.variance < 0 ? "Under" : "Over"} by ₹{Math.abs(project.variance / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <Progress 
                        value={(project.actual / project.budgeted) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Spent: ₹{(project.actual / 1000000).toFixed(1)}M</span>
                        <span>Budget: ₹{(project.budgeted / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value="148"
              icon={Users}
              description="Active staff"
              trend={{ value: 3, label: "vs last month" }}
            />
            <StatCard
              title="Payroll Amount"
              value="₹12.5M"
              icon={DollarSign}
              description="This month"
              trend={{ value: 5, label: "vs last month" }}
            />
            <StatCard
              title="Avg. Salary"
              value="₹84.5K"
              icon={TrendingUp}
              description="Per employee"
            />
            <StatCard
              title="Compliance"
              value="100%"
              icon={Check}
              description="Documents verified"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>Manage employee information and payroll</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={payrollColumns} data={employeesData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Document verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { doc: 'PF Registration', status: 'Verified', date: '15 Jan 2024' },
                    { doc: 'ESI Compliance', status: 'Verified', date: '22 Jan 2024' },
                    { doc: 'Labor License', status: 'Verified', date: '10 Feb 2024' },
                    { doc: 'Professional Tax', status: 'Pending', date: '05 Mar 2024' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.doc}</p>
                        <p className="text-sm text-muted-foreground">Last updated: {item.date}</p>
                      </div>
                      <Badge variant={item.status === 'Verified' ? 'default' : 'outline'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taxes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tax: 'GST (SGST)', amount: '₹18L', dueDate: '20 Jun 2024', status: 'Pending' },
                    { tax: 'GST (CGST)', amount: '₹18L', dueDate: '20 Jun 2024', status: 'Pending' },
                    { tax: 'Income Tax', amount: '₹22L', dueDate: '15 Jul 2024', status: 'Calculated' },
                    { tax: 'TDS Payment', amount: '₹5L', dueDate: '07 Jun 2024', status: 'Paid' }
                  ].map((tax, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{tax.tax}</p>
                        <p className="text-sm text-gray-600">Due: {tax.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{tax.amount}</p>
                        <Badge variant={tax.status === 'Paid' ? 'default' : 
                                  tax.status === 'Pending' ? 'destructive' : 'outline'}>
                          {tax.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowTaxModal(true)}>
                    <Calculator className="h-4 w-4 mr-2" />
                    GST Calculator
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowTaxModal(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    TDS Calculator
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowTaxModal(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Income Tax Planner
                  </Button>
                  {/* <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Tax Payment Portal
                  </Button> */}
                  {/* <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Returns
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationPanel />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showTaxModal && <TaxCalculatorModal onClose={() => setShowTaxModal(false)} />}
      
      {/* Replace old Generate Invoice modal with InvoiceBuilderModal */}
      {isInvoiceModalOpen && (
        <div className="-top-10 ">
          <InvoiceBuilderModal onClose={() => setIsInvoiceModalOpen(false)} />
        </div>
      )}

      <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
            <DialogDescription>Generate payroll for current month</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="month">Payroll Month</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan-2024">January 2024</SelectItem>
                  <SelectItem value="feb-2024">February 2024</SelectItem>
                  <SelectItem value="mar-2024">March 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Payroll Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Employees:</span>
                  <span>148</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Salary:</span>
                  <span>₹14.2M</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>₹1.7M</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Net Payable:</span>
                  <span>₹12.5M</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPayrollModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayroll}>
                Process Payroll
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Budget Cap</DialogTitle>
            <DialogDescription>Set budget limits and alerts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budgetProject">Project</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa-complex">Villa Complex</SelectItem>
                  <SelectItem value="commercial-tower">Commercial Tower</SelectItem>
                  <SelectItem value="apartments">Apartments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxLimit">Maximum Budget Limit</Label>
              <Input id="maxLimit" type="number" placeholder="Enter budget limit" />
            </div>
            <div>
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBudgetModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetBudgetCap}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Match Bank Receipts</DialogTitle>
            <DialogDescription>Automatically match bank transactions with invoices</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdfc-current">HDFC Bank - Current</SelectItem>
                  <SelectItem value="icici-savings">ICICI Bank - Savings</SelectItem>
                  <SelectItem value="sbi-project">SBI - Project Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Match Preview</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Transactions to Process:</span>
                  <span>25</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Matches:</span>
                  <span>22</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Review Required:</span>
                  <span>3</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReconcileModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAutoMatch}>
                Start Auto-Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountsDashboard

