import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie } from 'recharts'
import { PaintBucket, FileText, Clock, AlertTriangle, Upload, MessageSquare, CheckCircle, Eye } from "lucide-react"
import { designsData } from "@/lib/dummy-data"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

type Design = typeof designsData[0]

interface Bottleneck {
  type: string
  project: string
  days?: number
  revisions?: number
  designer: string
  status: string
  timeline?: Array<{ date: string; event: string }>
  versions?: Array<{ version: number; date: string; reviewer: string; status: string }>
  sla?: {
    sent: string
    expected: string
    overdue: boolean
  }
}

const bottlenecks: Bottleneck[] = [
  { 
    type: 'Longest Feedback Delay',
    project: 'Commercial Tower',
    days: 7,
    designer: 'Jane Smith',
    status: 'Awaiting Response',
    timeline: [
      { date: '2024-01-15', event: 'Design Submitted' },
      { date: '2024-01-18', event: 'Initial Review' },
      { date: '2024-01-22', event: 'Feedback Due' }
    ]
  },
  { 
    type: 'Rejected Multiple Times',
    project: 'Villa Complex',
    revisions: 6,
    designer: 'John Doe',
    status: 'In Revision',
    versions: [
      { version: 1, date: '2024-01-01', reviewer: 'Mike Wilson', status: 'Rejected' },
      { version: 2, date: '2024-01-05', reviewer: 'Sarah Johnson', status: 'Rejected' },
      { version: 3, date: '2024-01-10', reviewer: 'Mike Wilson', status: 'Rejected' }
    ]
  },
  { 
    type: 'Client Pending Response',
    project: 'Shopping Mall',
    days: 5,
    designer: 'Mike Johnson',
    status: 'Client Review',
    sla: {
      sent: '2024-01-17',
      expected: '2024-01-20',
      overdue: true
    }
  }
]

const designColumns: ColumnDef<Design>[] = [
  {
    accessorKey: "name",
    header: "Design Name",
  },
  {
    accessorKey: "client",
    header: "Client",
  },
  {
    accessorKey: "designer",
    header: "Designer",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "Approved" ? "default" : 
                     status === "Under Review" ? "secondary" : 
                     status === "Rejected" ? "destructive" : "outline"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "revisions",
    header: "Revisions",
    cell: ({ row }) => {
      const revisions = row.getValue("revisions") as number
      return (
        <div className="flex items-center gap-2">
          <span>{revisions}</span>
          {revisions > 3 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </div>
      )
    },
  },
  {
    accessorKey: "uploadDate",
    header: "Upload Date",
  },
]

const DesignDashboard = () => {
  const [designStats, setDesignStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [approvalTrendData, setApprovalTrendData] = useState([]);
  const [turnaroundData, setTurnaroundData] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [isAnalyticModalOpen, setIsAnalyticModalOpen] = useState(false)
  const [isBottleneckModalOpen, setIsBottleneckModalOpen] = useState(false)
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [selectedAnalytic, setSelectedAnalytic] = useState<string | null>(null)
  const [selectedBottleneck, setSelectedBottleneck] = useState<any | null>(null)
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/design/stats`, { headers })
      .then(res => setDesignStats(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/design/approval-trends`, { headers })
      .then(res => setApprovalTrendData(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/design/turnaround`, { headers })
      .then(res => setTurnaroundData(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/designs`, { headers })
      .then(res => setDesigns(res.data))
      .catch(() => {});
  }, []);

  const handleUploadRevision = (design: Design) => {
    setSelectedDesign(design)
    setIsUploadModalOpen(true)
  }

  const handleAddComment = (design: Design) => {
    setSelectedDesign(design)
    setIsCommentModalOpen(true)
  }

  const handleEscalate = (design: Design) => {
    toast.success(`Design "${design.name}" escalated to Design Head`)
  }

  const handleSubmitRevision = () => {
    toast.success("Design revision uploaded successfully!")
    setIsUploadModalOpen(false)
    setSelectedDesign(null)
  }

  const handleSubmitComment = () => {
    toast.success("Comment added successfully!")
    setIsCommentModalOpen(false)
    setSelectedDesign(null)
  }

  const handleSendToReview = (design: Design) => {
    setDesigns(prevDesigns => 
      prevDesigns.map(d => 
        d.id === design.id 
          ? { ...d, status: "Under Review" }
          : d
      )
    )
    toast.success(`Design "${design.name}" sent for review`)
  }

  const handleViewDetails = (design: Design) => {
    setSelectedDesign(design)
    setIsDetailsModalOpen(true)
  }

  const handleApproveDesign = (design: Design) => {
    setDesigns(prevDesigns => 
      prevDesigns.map(d => 
        d.id === design.id 
          ? { ...d, status: "Approved" }
          : d
      )
    )
    toast.success(`Design "${design.name}" approved`)
    setIsDetailsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Dashboard</h1>
          <p className="text-muted-foreground">Design approval workflow and analytics</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Submit New Design
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Design Overview</TabsTrigger>
          <TabsTrigger value="analytics">Approval Analytics</TabsTrigger>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Designs"
              value={designStats.total}
              icon={FileText}
              description="All design submissions"
              trend={{ value: 12, label: "this month" }}
              onClick={() => toast.info("Viewing all designs")}
            />
            <StatCard
              title="Pending Approvals"
              value={designStats.pending}
              icon={Clock}
              description="Awaiting review"
              onClick={() => toast.info("Opening pending approvals")}
            />
            <StatCard
              title="Approved This Month"
              value={designStats.approved}
              icon={CheckCircle}
              description="Successfully approved"
              trend={{ value: 8, label: "vs last month" }}
              onClick={() => toast.info("Viewing approved designs")}
            />
            <StatCard
              title="Rejected Designs"
              value={designStats.rejected}
              icon={AlertTriangle}
              description="Requiring revisions"
              onClick={() => toast.info("Viewing rejection reasons")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload vs Approval Trends</CardTitle>
                <CardDescription>Weekly submission and approval tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Designer Performance</CardTitle>
                <CardDescription>Average turnaround time by designer</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnaroundData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="designer" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Avg. Turnaround']} />
                    <Bar dataKey="avgDays" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Design Gallery</CardTitle>
              <CardDescription>Recent design submissions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  ...designColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(row.original)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddComment(row.original)}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUploadRevision(row.original)}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        {row.original.status !== "Under Review" && row.original.status !== "Approved" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendToReview(row.original)}
                          >
                            Send to Review
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={designs} 
                searchKey="name" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Avg Turnaround Time"
              value="3.4 days"
              icon={Clock}
              description="Design review cycle"
              trend={{ value: -0.5, label: "improvement" }}
              onClick={() => {
                setSelectedAnalytic("turnaround")
                setIsAnalyticModalOpen(true)
              }}
            />
            <StatCard
              title="Feedback Delays"
              value="2"
              icon={AlertTriangle}
              description="Delayed responses"
              onClick={() => {
                setSelectedAnalytic("delays")
                setIsAnalyticModalOpen(true)
              }}
            />
            <StatCard
              title="Design Efficiency"
              value="94%"
              icon={PaintBucket}
              description="First-time approval rate"
              trend={{ value: 3, label: "this quarter" }}
              onClick={() => {
                setSelectedAnalytic("efficiency")
                setIsAnalyticModalOpen(true)
              }}
            />
            <StatCard
              title="Most Reviewed"
              value="6"
              icon={FileText}
              description="Highest revision count"
              onClick={() => {
                setSelectedAnalytic("revisions")
                setIsAnalyticModalOpen(true)
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bottleneck Analysis</CardTitle>
              <CardDescription>Critical design process delays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottlenecks.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                       onClick={() => {
                         setSelectedBottleneck(item)
                         setIsBottleneckModalOpen(true)
                       }}>
                    <div>
                      <h3 className="font-medium">{item.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.project} - {item.designer}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-orange-600">
                        {'days' in item ? `${item.days} days` : `${item.revisions} revisions`}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEscalation(item)
                          setIsEscalateModalOpen(true)
                        }}
                      >
                        Escalate to Design Head
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>Designs awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {designs.filter(d => d.status === "Under Review").map((design, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{design.name}</h3>
                      <p className="text-sm text-muted-foreground">{design.client} • {design.designer}</p>
                      <Badge variant="secondary">{design.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddComment(design)}>
                        Comment
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(design)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => handleApproveDesign(design)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Design Revision</DialogTitle>
            <DialogDescription>
              Upload a new revision for {selectedDesign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Design File</Label>
              <Input id="file" type="file" accept=".pdf,.dwg,.jpg,.png" />
            </div>
            <div>
              <Label htmlFor="notes">Revision Notes</Label>
              <Textarea id="notes" placeholder="Describe the changes made..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRevision}>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add feedback for {selectedDesign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea id="comment" placeholder="Enter your feedback..." />
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
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCommentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>Add Comment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Design Details</DialogTitle>
            <DialogDescription>
              Comprehensive view of the design and feedback
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {selectedDesign && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{selectedDesign.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span>{selectedDesign.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Designer:</span>
                          <span>{selectedDesign.designer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={
                            selectedDesign.status === "Approved" ? "default" :
                            selectedDesign.status === "Under Review" ? "secondary" :
                            "outline"
                          }>{selectedDesign.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Upload Date:</span>
                          <span>{selectedDesign.uploadDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revisions:</span>
                          <span>{selectedDesign.revisions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>{selectedDesign.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-4">Design Preview</h4>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-4">Comments & Feedback</h4>
                    <div className="space-y-4">
                      {[
                        { user: 'John Doe', comment: 'Please adjust the dimensions of the north elevation.', date: '2024-01-20 10:30', priority: 'high' },
                        { user: 'Jane Smith', comment: 'Color scheme looks great, but consider alternative materials.', date: '2024-01-20 09:45', priority: 'medium' },
                        { user: 'Mike Johnson', comment: 'Approved all structural elements.', date: '2024-01-19 16:20', priority: 'low' },
                      ].map((comment, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{comment.user}</span>
                              <Badge variant="outline" className="ml-2">{comment.priority}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{comment.date}</span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
            {selectedDesign?.status === "Under Review" && (
              <Button onClick={() => handleApproveDesign(selectedDesign)}>
                Approve Design
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Detail Modal */}
      <Dialog open={isAnalyticModalOpen} onOpenChange={setIsAnalyticModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAnalytic === 'turnaround' ? 'Turnaround Time Analysis' :
               selectedAnalytic === 'delays' ? 'Feedback Delays' :
               selectedAnalytic === 'efficiency' ? 'Design Cycle Efficiency' :
               selectedAnalytic === 'revisions' ? 'Most Reviewed Designs' : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <>
                {selectedAnalytic === 'turnaround' ? (
                  <LineChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="review" name="Review Time" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="redesign" name="Redesign Time" stroke="#10b981" />
                    <Line type="monotone" dataKey="approval" name="Approval Time" stroke="#f59e0b" />
                  </LineChart>
                ) : selectedAnalytic === 'delays' ? (
                  <BarChart data={turnaroundData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="designer" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="delays" fill="#ef4444" />
                  </BarChart>
                ) : selectedAnalytic === 'efficiency' ? (
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={[
                        { name: 'Ideal Cycle', value: 70 },
                        { name: 'Extended Cycle', value: 30 }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      fill="#3b82f6"
                    />
                  </PieChart>
                ) : null}
              </>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottleneck Detail Modal */}
      <Dialog open={isBottleneckModalOpen} onOpenChange={setIsBottleneckModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedBottleneck?.type}</DialogTitle>
            <DialogDescription>
              {selectedBottleneck?.project} - {selectedBottleneck?.designer}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {selectedBottleneck?.timeline && (
              <div className="space-y-4">
                <h4 className="font-medium">Timeline</h4>
                {selectedBottleneck.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 border-l-2 border-primary">
                    <span>{event.event}</span>
                    <span className="text-muted-foreground">{event.date}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedBottleneck?.versions && (
              <div className="space-y-4">
                <h4 className="font-medium">Submission History</h4>
                {selectedBottleneck.versions.map((version: any, index: number) => (
                  <div key={index} className="p-2 border rounded">
                    <div className="flex justify-between">
                      <span>Version {version.version}</span>
                      <Badge variant={version.status === 'Rejected' ? 'destructive' : 'default'}>
                        {version.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Reviewed by {version.reviewer} on {version.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedBottleneck?.sla && (
              <div className="space-y-4">
                <h4 className="font-medium">SLA Details</h4>
                <div className="p-4 border rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sent Date</p>
                      <p className="font-medium">{selectedBottleneck.sla.sent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Response</p>
                      <p className="font-medium">{selectedBottleneck.sla.expected}</p>
                    </div>
                  </div>
                  {selectedBottleneck.sla.overdue && (
                    <Badge variant="destructive" className="mt-4">Overdue</Badge>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Escalation Modal */}
      <Dialog open={isEscalateModalOpen} onOpenChange={setIsEscalateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Design Head</DialogTitle>
            <DialogDescription>
              Confirm escalation for {selectedEscalation?.project}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalation-note">Additional Notes (Optional)</Label>
              <Textarea 
                id="escalation-note" 
                placeholder="Add any specific concerns or context..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEscalateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success(`Escalated ${selectedEscalation?.project} to Design Head`)
                setIsEscalateModalOpen(false)
              }}>
                Confirm Escalation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DesignDashboard
