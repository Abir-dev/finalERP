import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, Phone, AlertTriangle, FileText, Calendar, DollarSign, Mail } from "lucide-react"
import { clientsData, invoicesData } from "@/lib/dummy-data"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

const engagementData = [
  { month: 'Jan', calls: 45, meetings: 12, quality: 4.2 },
  { month: 'Feb', calls: 52, meetings: 18, quality: 4.5 },
  { month: 'Mar', calls: 38, meetings: 15, quality: 4.1 },
  { month: 'Apr', calls: 61, meetings: 22, quality: 4.7 },
  { month: 'May', calls: 49, meetings: 16, quality: 4.3 },
  { month: 'Jun', calls: 55, meetings: 20, quality: 4.6 },
]

const approvalDelayData = [
  { client: 'ABC Developers', boq: 2, design: 1, invoice: 0 },
  { client: 'XYZ Corp', boq: 5, design: 3, invoice: 2 },
  { client: 'Home Builders', boq: 1, design: 0, invoice: 1 },
  { client: 'Retail Group', boq: 7, design: 4, invoice: 3 },
]

type Client = typeof clientsData[0]
type Invoice = typeof invoicesData[0]

const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Client Name",
  },
  {
    accessorKey: "totalProjects",
    header: "Total Projects",
  },
  {
    accessorKey: "activeProjects",
    header: "Active Projects",
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const value = row.getValue("totalValue") as number
      return `₹${(value / 1000000).toFixed(1)}M`
    },
  },
  {
    accessorKey: "lastContact",
    header: "Last Contact",
  },
]

const ClientManagerDashboard = () => {
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isContactAccountsModalOpen, setIsContactAccountsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleAddInteraction = (client: Client) => {
    setSelectedClient(client)
    setIsInteractionModalOpen(true)
  }

  const handleEscalate = (client: Client) => {
    setSelectedClient(client)
    setIsEscalationModalOpen(true)
  }

  const handleSendReminder = () => {
    toast.success("Reminder sent successfully!")
    setIsReminderModalOpen(false)
  }

  const handleSaveInteraction = () => {
    toast.success("Interaction logged successfully!")
    setIsInteractionModalOpen(false)
    setSelectedClient(null)
  }

  const handleSaveEscalation = () => {
    toast.success("Escalation raised successfully!")
    setIsEscalationModalOpen(false)
    setSelectedClient(null)
  }

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client)
    setIsProfileModalOpen(true)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceContent = `
Invoice ID: ${invoice.id}
Client: ${invoice.clientName}
Amount: ₹${(invoice.amount / 1000).toFixed(0)}K
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
    `
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoice.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success("Invoice downloaded successfully!")
  }

  const handleContactAccounts = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsContactAccountsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
          <p className="text-muted-foreground">Client engagement and relationship management</p>
        </div>
        <Button onClick={() => setIsReminderModalOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          Send Reminder
        </Button>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">Client Engagement</TabsTrigger>
          <TabsTrigger value="approvals">Approvals & Escalations</TabsTrigger>
          <TabsTrigger value="billing">Billing Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Calls/Meetings Logged"
              value="156"
              icon={Phone}
              description="This month"
              trend={{ value: 12, label: "vs last month" }}
              onClick={() => toast.info("Viewing interaction logs")}
            />
            <StatCard
              title="Escalations Raised"
              value="8"
              icon={AlertTriangle}
              description="Pending resolution"
              onClick={() => toast.info("Opening escalation list")}
            />
            <StatCard
              title="Client Satisfaction"
              value="4.6/5"
              icon={Users}
              description="Average rating"
              trend={{ value: 0.3, label: "improvement" }}
              onClick={() => toast.info("Viewing satisfaction survey")}
            />
            <StatCard
              title="Response Rate"
              value="94%"
              icon={FileText}
              description="Client responsiveness"
              onClick={() => toast.info("Viewing response analytics")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Quality Trend</CardTitle>
                <CardDescription>Monthly client interaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="meetings" stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Interaction Timeline</CardTitle>
                <CardDescription>Recent client touchpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { client: 'ABC Developers', type: 'Video Call', outcome: 'Follow-up Required', time: '2 hours ago' },
                    { client: 'XYZ Corp', type: 'Site Visit', outcome: 'Closed', time: '1 day ago' },
                    { client: 'Home Builders', type: 'Phone Call', outcome: 'Escalated', time: '2 days ago' },
                    { client: 'Retail Group', type: 'Email', outcome: 'Pending Response', time: '3 days ago' },
                  ].map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{interaction.client}</h3>
                        <p className="text-sm text-muted-foreground">{interaction.type}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          interaction.outcome === 'Closed' ? 'default' :
                          interaction.outcome === 'Escalated' ? 'destructive' :
                          'secondary'
                        }>
                          {interaction.outcome}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{interaction.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Relationship Management</CardTitle>
              <CardDescription>Client portfolio and engagement tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  ...clientColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddInteraction(row.original)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(row.original)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(`Scheduling next meeting with ${row.original.name}`)}
                        >
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={clientsData} 
                searchKey="name" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Approvals"
              value="24"
              icon={FileText}
              description="Awaiting client approval"
              onClick={() => toast.info("Viewing approval queue")}
            />
            <StatCard
              title="Average Delay"
              value="5.2 days"
              icon={AlertTriangle}
              description="Approval turnaround"
              trend={{ value: -1.2, label: "improvement" }}
              onClick={() => toast.info("Opening delay analysis")}
            />
            <StatCard
              title="SLA Breaches"
              value="3"
              icon={AlertTriangle}
              description="This month"
              onClick={() => toast.info("Viewing SLA report")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Approval Delay Analysis</CardTitle>
              <CardDescription>Client-wise approval delays by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalDelayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, '']} />
                  <Bar dataKey="boq" fill="#3b82f6" />
                  <Bar dataKey="design" fill="#10b981" />
                  <Bar dataKey="invoice" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>Items pending client approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { item: 'BOQ-2024-001', client: 'ABC Developers', type: 'BOQ', daysWaiting: 3, amount: '₹2.5M' },
                  { item: 'DES-2024-005', client: 'XYZ Corp', type: 'Design', daysWaiting: 7, amount: '-' },
                  { item: 'INV-2024-012', client: 'Home Builders', type: 'Invoice', daysWaiting: 2, amount: '₹750K' },
                  { item: 'BOQ-2024-003', client: 'Retail Group', type: 'BOQ', daysWaiting: 12, amount: '₹5.2M' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{item.item}</h3>
                        <Badge variant="outline">{item.type}</Badge>
                        {item.daysWaiting > 7 && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.client} • {item.amount !== '-' && `Amount: ${item.amount}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for {item.daysWaiting} days
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEscalate({ id: item.client, name: item.client, totalProjects: 0, activeProjects: 0, totalValue: 0, lastContact: '' })}
                      >
                        Escalate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsReminderModalOpen(true)}
                      >
                        Remind
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Outstanding Amount"
              value="₹8.2M"
              icon={DollarSign}
              description="Pending collections"
              onClick={() => toast.info("Viewing outstanding invoices")}
            />
            <StatCard
              title="Overdue Invoices"
              value="12"
              icon={AlertTriangle}
              description="Past due date"
              onClick={() => toast.info("Opening overdue list")}
            />
            <StatCard
              title="Collection Rate"
              value="92%"
              icon={DollarSign}
              description="This month"
              trend={{ value: 3, label: "vs last month" }}
              onClick={() => toast.info("Viewing collection analytics")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Payment Status</CardTitle>
              <CardDescription>Invoice and payment tracking by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoicesData.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{invoice.id}</h3>
                        <Badge variant={
                          invoice.status === 'Paid' ? 'default' :
                          invoice.status === 'Overdue' ? 'destructive' :
                          'secondary'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.clientName} • Due: {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{(invoice.amount / 1000).toFixed(0)}K</div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactAccounts(invoice)}
                        >
                          Contact Accounts
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isInteractionModalOpen} onOpenChange={setIsInteractionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Interaction</DialogTitle>
            <DialogDescription>
              Log a new interaction with {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="interactionType">Interaction Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="site-visit">Site Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up Required</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add interaction details..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInteractionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInteraction}>
                Save Interaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEscalationModalOpen} onOpenChange={setIsEscalationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Escalation</DialogTitle>
            <DialogDescription>
              Escalate issue for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalationReason">Escalation Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment-delay">Payment Delay</SelectItem>
                  <SelectItem value="approval-delay">Approval Delay</SelectItem>
                  <SelectItem value="communication-issue">Communication Issue</SelectItem>
                  <SelectItem value="project-concern">Project Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalationTarget">Escalate To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">Project Manager</SelectItem>
                  <SelectItem value="accounts-head">Accounts Head</SelectItem>
                  <SelectItem value="managing-director">Managing Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalationNote">Internal Note</Label>
              <Textarea id="escalationNote" placeholder="Add internal notes for escalation..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEscalationModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEscalation}>
                Raise Escalation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send reminder to clients for pending items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <Input id="recipients" placeholder="Select recipients..." />
            </div>
            <div>
              <Label htmlFor="reminderNote">Optional Note</Label>
              <Textarea id="reminderNote" placeholder="Add custom message..." rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReminder}>
                Send Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {selectedClient && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-sm font-medium">{selectedClient.lastContact}</p>
                  </div>
                  <div>
                    <Label>Total Projects</Label>
                    <p className="text-sm font-medium">{selectedClient.totalProjects}</p>
                  </div>
                  <div>
                    <Label>Active Projects</Label>
                    <p className="text-sm font-medium">{selectedClient.activeProjects}</p>
                  </div>
                  <div>
                    <Label>Total Value</Label>
                    <p className="text-sm font-medium">₹{(selectedClient.totalValue / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Recent Interactions</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'Meeting', date: '2024-02-15', notes: 'Project review meeting' },
                      { type: 'Call', date: '2024-02-10', notes: 'Follow-up on pending approvals' },
                      { type: 'Email', date: '2024-02-05', notes: 'Invoice reminder sent' }
                    ].map((interaction, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-sm text-muted-foreground">{interaction.date}</span>
                        </div>
                        <p className="text-sm mt-2">{interaction.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Project Status</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Project A', status: 'In Progress', completion: '75%' },
                      { name: 'Project B', status: 'Planning', completion: '20%' },
                      { name: 'Project C', status: 'Completed', completion: '100%' }
                    ].map((project, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{project.name}</span>
                          <Badge>{project.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completion: {project.completion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactAccountsModalOpen} onOpenChange={setIsContactAccountsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Accounts Team</DialogTitle>
            <DialogDescription>
              Send a message to accounts team regarding Invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter subject..." />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Enter your message to the accounts team..." 
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="cc">CC</Label>
              <Input id="cc" placeholder="Add email addresses to CC..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsContactAccountsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Message sent to accounts team!")
                setIsContactAccountsModalOpen(false)
              }}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientManagerDashboard
