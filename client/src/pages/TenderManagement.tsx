import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Plus, FileText, Calendar, DollarSign, Users, Edit, Eye } from "lucide-react";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { TenderDashboard } from "@/components/tender-management/tender-dashboard";
import BidPreparationModal from "@/components/modals/BidPreparationModal";
import { read, utils, write } from 'xlsx';
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const TenderManagement = () => {
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isViewMode, setIsViewMode] = useState(true)
  const [submissionData, setSubmissionData] = useState({
    status: '',
    notes: '',
    followUpDate: '',
    contactPerson: '',
    submissionStatus: ''
  })
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/tender`, { headers })
      .then(res => setTenders(res.data))
      .catch(() => {});
  }, []);

  function handleExport() {
    const tendersSheet = utils.json_to_sheet(
      tenders.map((t) => ({
        ID: t.id,
        Project: t.projectName,
        Client: t.client,
        Value: t.estimatedValue,
        Submission: t.submissionDate,
        Status: t.status,
        Completion: t.completionPercentage,
        Category: t.category,
        Location: t.location,
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, tendersSheet, "Tenders");
    const wbout = write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "tenders-report.xlsx");
  }

  const handleOpenBoqTool = () => {
    setIsBoqModalOpen(true)
    toast({
      title: "Opening BOQ Tool",
      description: "Loading Bill of Quantities generator..."
    })
  }

  const handleStartAnalysis = () => {
    setIsAnalysisModalOpen(true)
    toast({
      title: "Starting Rate Analysis",
      description: "Loading cost analysis tools..."
    })
  }

  const handlePlanSchedule = () => {
    setIsScheduleModalOpen(true)
    toast({
      title: "Opening Schedule Planner",
      description: "Loading project scheduler..."
    })
  }

  const handlePlanResources = () => {
    setIsResourceModalOpen(true)
    toast({
      title: "Opening Resource Planner",
      description: "Loading resource allocation tools..."
    })
  }

  const handleAccessTemplates = () => {
    setIsTemplateModalOpen(true)
    toast({
      title: "Opening Templates",
      description: "Loading document templates..."
    })
  }

  const handleBuildTeam = () => {
    setIsTeamModalOpen(true)
    toast({
      title: "Opening Team Builder",
      description: "Loading organization chart tools..."
    })
  }

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setSubmissionData({
      status: submission.status,
      notes: submission.notes || '',
      followUpDate: submission.followUpDate || '',
      contactPerson: submission.contactPerson || '',
      submissionStatus: submission.submissionStatus || 'submitted'
    })
    setIsViewMode(true)
    setIsSubmissionModalOpen(true)
  }

  const handleEditSubmission = (submission) => {
    setSelectedSubmission(submission)
    setSubmissionData({
      status: submission.status,
      notes: submission.notes || '',
      followUpDate: submission.followUpDate || '',
      contactPerson: submission.contactPerson || '',
      submissionStatus: submission.submissionStatus || 'submitted'
    })
    setIsViewMode(false)
    setIsSubmissionModalOpen(true)
  }

  const handleSaveSubmission = () => {
    // Update the submission data in the mock data
    toast({
      title: "Submission Updated",
      description: "Tender submission has been updated successfully"
    })
    setIsSubmissionModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tender Management</h1>
          <p className="text-muted-foreground">Comprehensive bid preparation, submission tracking, and tender analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setShowBidModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="preparation">Bid Preparation</TabsTrigger>
          <TabsTrigger value="tracking">Submission Tracking</TabsTrigger>
          <TabsTrigger value="active-tenders">Active Tenders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard 
              title="Active Tenders" 
              value="18" 
              icon={FileText}
              trend={{ value: 3, label: "new this month" }}
              threshold={{ status: 'good', message: 'Strong pipeline' }}
            />
            <EnhancedStatCard 
              title="Pipeline Value" 
              value="₹124Cr" 
              icon={DollarSign}
              trend={{ value: 15, label: "increase from last quarter" }}
              threshold={{ status: 'good', message: 'Excellent growth' }}
            />
            <EnhancedStatCard 
              title="Win Rate" 
              value="68%" 
              description="Success rate in last 12 months"
              icon={Calendar}
              trend={{ value: 8, label: "improvement" }}
              threshold={{ status: 'good', message: 'Above industry average' }}
            />
            <EnhancedStatCard 
              title="Under Evaluation" 
              value="5" 
              description="Awaiting client decisions"
              icon={Users}
              threshold={{ status: 'warning', message: 'Follow up required' }}
            />
          </div>

          {/* All Tenders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Tenders Overview</CardTitle>
              <CardDescription>Complete list of all tenders including active, submitted, and rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter and Search Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under-evaluation">Under Evaluation</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-categories">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button onClick={() => setShowBidModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Tender
                    </Button>
                  </div>
                </div>

                {/* Tenders Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Estimated Value</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenders.length > 0 ? (
                        tenders.map((tender) => (
                          <TableRow key={tender.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {tender.projectName}
                            </TableCell>
                            <TableCell>{tender.client}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{tender.category}</Badge>
                            </TableCell>
                            <TableCell>{tender.location}</TableCell>
                            <TableCell className="font-semibold">
                              ₹{(tender.estimatedValue / 10000000).toFixed(1)}Cr
                            </TableCell>
                            <TableCell>
                              {new Date(tender.submissionDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                tender.status === 'awarded' ? 'default' :
                                tender.status === 'submitted' ? 'secondary' :
                                tender.status === 'under-evaluation' ? 'outline' :
                                tender.status === 'rejected' ? 'destructive' :
                                'outline'
                              }>
                                {tender.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${tender.completionPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {tender.completionPercentage}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewSubmission({
                                    id: tender.id,
                                    tender: tender.projectName,
                                    client: tender.client,
                                    submissionDate: tender.submissionDate,
                                    status: tender.status,
                                    notes: `Tender details for ${tender.projectName}`,
                                    followUpDate: '',
                                    contactPerson: 'Project Manager',
                                    submissionStatus: tender.status
                                  })}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditSubmission({
                                    id: tender.id,
                                    tender: tender.projectName,
                                    client: tender.client,
                                    submissionDate: tender.submissionDate,
                                    status: tender.status,
                                    notes: `Tender details for ${tender.projectName}`,
                                    followUpDate: '',
                                    contactPerson: 'Project Manager',
                                    submissionStatus: tender.status
                                  })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                              <h3 className="text-lg font-medium text-muted-foreground">No Tenders Found</h3>
                              <p className="text-muted-foreground">Start by creating your first tender.</p>
                              <Button onClick={() => setShowBidModal(true)} className="mt-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Tender
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {tenders.filter(t => t.status === 'submitted' || t.status === 'under-evaluation').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Active Tenders</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {tenders.filter(t => t.status === 'awarded').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Awarded</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {tenders.filter(t => t.status === 'rejected').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{(tenders.reduce((sum, t) => sum + t.estimatedValue, 0) / 10000000).toFixed(1)}Cr
                        </p>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bid Preparation Workspace</CardTitle>
              <CardDescription>Comprehensive tools for tender document preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">BOQ Generator</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate comprehensive Bill of Quantities with automated rate analysis and material calculations.
                    </p>
                    <Button className="w-full" onClick={handleOpenBoqTool}>Open BOQ Tool</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold">Rate Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed cost breakdowns for each item with labor, material, and overhead calculations.
                    </p>
                    <Button className="w-full" onClick={handleStartAnalysis}>Start Analysis</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Project Scheduler</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create detailed project schedules with Gantt charts and milestone planning.
                    </p>
                    <Button className="w-full" onClick={handlePlanSchedule}>Plan Schedule</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold">Resource Planning</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Labor histogram and machinery deployment schedules for optimal resource allocation.
                    </p>
                    <Button className="w-full" onClick={handlePlanResources}>Plan Resources</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold">Document Templates</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Standard templates for general conditions, special conditions, and technical specifications.
                    </p>
                    <Button className="w-full" onClick={handleAccessTemplates}>Access Templates</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <h3 className="font-semibold">Team Builder</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create organization charts and team structures for project proposals.
                    </p>
                    <Button className="w-full" onClick={handleBuildTeam}>Build Team</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Tracking</CardTitle>
              <CardDescription>Monitor tender submissions and client responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    tender: 'Commercial Complex - Phase 1',
                    client: 'ABC Developers',
                    submissionDate: '2024-01-15',
                    status: 'Under Evaluation',
                    value: '₹25Cr',
                    daysElapsed: 15,
                    submissionStatus: 'submitted',
                    notes: 'Initial submission completed. Awaiting client response.',
                    followUpDate: '2024-02-01',
                    contactPerson: 'John Smith'
                  },
                  {
                    tender: 'Residential Towers',
                    client: 'XYZ Properties',
                    submissionDate: '2024-01-20',
                    status: 'Technical Evaluation',
                    value: '₹45Cr',
                    daysElapsed: 10,
                    submissionStatus: 'submitted',
                    notes: 'Technical evaluation in progress. Client may require clarifications.',
                    followUpDate: '2024-01-30',
                    contactPerson: 'Sarah Johnson'
                  },
                  {
                    tender: 'Infrastructure Development',
                    client: 'Government Agency',
                    submissionDate: '2024-01-25',
                    status: 'Financial Evaluation',
                    value: '₹80Cr',
                    daysElapsed: 5,
                    submissionStatus: 'submitted',
                    notes: 'Financial evaluation phase. All documents submitted.',
                    followUpDate: '2024-02-05',
                    contactPerson: 'Michael Brown'
                  }
                ].map((submission, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="font-medium">{submission.tender}</h4>
                        <p className="text-sm text-muted-foreground">{submission.client}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium">{submission.submissionDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={submission.submissionStatus === 'submitted' ? 'default' : 'secondary'}>
                            {submission.submissionStatus}
                          </Badge>
                          <p className="font-medium">{submission.status}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Value</p>
                        <p className="font-medium">{submission.value}</p>
                        <p className="text-xs text-muted-foreground">{submission.daysElapsed} days ago</p>
                      </div>
                      <div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditSubmission(submission)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-tenders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Tenders</CardTitle>
              <CardDescription>Monitor and manage all active tender submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenders.filter(tender => tender.status !== 'rejected').map((tender) => (
                  <div key={tender.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{tender.projectName}</h3>
                        <p className="text-muted-foreground">{tender.client}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          tender.status === 'awarded' ? 'default' :
                          tender.status === 'submitted' ? 'secondary' :
                          tender.status === 'under-evaluation' ? 'outline' :
                          'destructive'
                        }>
                          {tender.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {new Date(tender.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Estimated Value</span>
                        <p className="font-semibold">₹{(tender.estimatedValue / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Category</span>
                        <p className="font-semibold">{tender.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Location</span>
                        <p className="font-semibold">{tender.location}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Completion Progress</span>
                        <span className="text-sm font-medium">{tender.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${tender.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubmission({
                          id: tender.id,
                          tender: tender.projectName,
                          client: tender.client,
                          submissionDate: tender.submissionDate,
                          status: tender.status,
                          notes: `Active tender for ${tender.projectName}`,
                          followUpDate: '',
                          contactPerson: 'Project Manager',
                          submissionStatus: tender.status
                        })}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSubmission({
                          id: tender.id,
                          tender: tender.projectName,
                          client: tender.client,
                          submissionDate: tender.submissionDate,
                          status: tender.status,
                          notes: `Active tender for ${tender.projectName}`,
                          followUpDate: '',
                          contactPerson: 'Project Manager',
                          submissionStatus: tender.status
                        })}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {tender.status === 'draft' && (
                        <Button size="sm" variant="default">
                          <FileText className="h-4 w-4 mr-1" />
                          Submit Tender
                        </Button>
                      )}
                      {tender.status === 'under-evaluation' && (
                        <Button size="sm" variant="secondary">
                          <Calendar className="h-4 w-4 mr-1" />
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {tenders.filter(tender => tender.status !== 'rejected').length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Active Tenders</h3>
                    <p className="text-muted-foreground mb-4">You don't have any active tenders at the moment.</p>
                    <Button onClick={() => setShowBidModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Tender
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showBidModal && (
        <div className="top-0 ">
        
        <BidPreparationModal onClose={() => setShowBidModal(false)} />
        </div>)}

      {/* BOQ Tool Modal */}
      <Dialog open={isBoqModalOpen} onOpenChange={setIsBoqModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Bill of Quantities Generator</DialogTitle>
            <DialogDescription>Create and manage detailed BOQs for your tender</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Commercial Complex - Phase 1</SelectItem>
                    <SelectItem value="project2">Residential Towers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>BOQ Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil Works</SelectItem>
                    <SelectItem value="mep">MEP Works</SelectItem>
                    <SelectItem value="finishing">Finishing Works</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure Works</SelectItem>
                    <SelectItem value="landscape">Landscape Works</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Package</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation Works</SelectItem>
                    <SelectItem value="structure">Structural Works</SelectItem>
                    <SelectItem value="finishing">Finishing Works</SelectItem>
                    <SelectItem value="external">External Works</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Import Data Source</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="file" accept=".xlsx,.csv" className="col-span-2" />
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>BOQ Settings</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit System" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric System</SelectItem>
                      <SelectItem value="imperial">Imperial System</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Additional Options</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contingency (%)</Label>
                  <Input type="number" placeholder="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Overhead (%)</Label>
                  <Input type="number" placeholder="15" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Profit (%)</Label>
                  <Input type="number" placeholder="10" min="0" max="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Database</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select database" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Market Rates</SelectItem>
                      <SelectItem value="historical">Historical Rates</SelectItem>
                      <SelectItem value="custom">Custom Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Analysis Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="comparative">Comparative Analysis</SelectItem>
                      <SelectItem value="historical">Historical Data Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Template
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsBoqModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "BOQ Generated",
                    description: "Bill of Quantities has been generated successfully"
                  })
                  setIsBoqModalOpen(false)
                }}>Generate BOQ</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Rate Analysis</DialogTitle>
            <DialogDescription>Analyze costs and rates for tender items</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Item Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil Works</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="summary">Summary Analysis</SelectItem>
                    <SelectItem value="comparative">Comparative Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="custom">Custom Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Cost Components</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Labor Cost Index</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select index" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Market</SelectItem>
                      <SelectItem value="government">Government Rates</SelectItem>
                      <SelectItem value="custom">Custom Rates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Material Cost Basis</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Survey</SelectItem>
                      <SelectItem value="quotation">Vendor Quotations</SelectItem>
                      <SelectItem value="historical">Historical Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipment Rates</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Company Owned</SelectItem>
                      <SelectItem value="rental">Market Rental</SelectItem>
                      <SelectItem value="mixed">Mixed Fleet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Overhead (%)</Label>
                  <Input type="number" placeholder="15" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Profit (%)</Label>
                  <Input type="number" placeholder="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Contingency (%)</Label>
                  <Input type="number" placeholder="5" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="18" min="0" max="100" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Analysis Parameters</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price Escalation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Escalation</SelectItem>
                      <SelectItem value="linear">Linear Projection</SelectItem>
                      <SelectItem value="custom">Custom Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Market Volatility</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select factor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (±5%)</SelectItem>
                      <SelectItem value="medium">Medium (±10%)</SelectItem>
                      <SelectItem value="high">High (±15%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Analysis
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAnalysisModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Analysis Started",
                    description: "Rate analysis process has been initiated"
                  })
                  setIsAnalysisModalOpen(false)
                }}>Start Analysis</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Project Schedule Planner</DialogTitle>
            <DialogDescription>Create and manage project timelines</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min="1" placeholder="24" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Working Calendar</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (5 days)</SelectItem>
                    <SelectItem value="extended">Extended (6 days)</SelectItem>
                    <SelectItem value="continuous">Continuous (7 days)</SelectItem>
                    <SelectItem value="custom">Custom Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Schedule Components</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Breakdown Structure</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select WBS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Template</SelectItem>
                      <SelectItem value="detailed">Detailed Template</SelectItem>
                      <SelectItem value="custom">Custom Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Critical Path Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic Calculation</SelectItem>
                      <SelectItem value="manual">Manual Definition</SelectItem>
                      <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Milestone Types</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractual">Contractual</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="payment">Payment Linked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dependencies</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fs">Finish-to-Start</SelectItem>
                      <SelectItem value="ss">Start-to-Start</SelectItem>
                      <SelectItem value="ff">Finish-to-Finish</SelectItem>
                      <SelectItem value="sf">Start-to-Finish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Float Calculation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Float</SelectItem>
                      <SelectItem value="free">Free Float</SelectItem>
                      <SelectItem value="both">Both Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Import/Export Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Import Schedule</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="file" accept=".mpp,.xer,.xml" className="col-span-2" />
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      MS Project
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Primavera P6
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Templates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Schedule
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Schedule Created",
                    description: "Project schedule has been created successfully"
                  })
                  setIsScheduleModalOpen(false)
                }}>Create Schedule</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Planning Modal */}
      <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Resource Planning</DialogTitle>
            <DialogDescription>Plan and allocate project resources</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manpower">Manpower</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project Phase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="execution">Execution</SelectItem>
                    <SelectItem value="closeout">Closeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Calendar</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (8 hours)</SelectItem>
                    <SelectItem value="extended">Extended (12 hours)</SelectItem>
                    <SelectItem value="shift">Shift Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Resource Requirements</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Skill Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unskilled">Unskilled</SelectItem>
                      <SelectItem value="semiskilled">Semi-skilled</SelectItem>
                      <SelectItem value="skilled">Skilled</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience Required</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">0-2 years</SelectItem>
                      <SelectItem value="junior">2-5 years</SelectItem>
                      <SelectItem value="senior">5-10 years</SelectItem>
                      <SelectItem value="expert">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Time</SelectItem>
                      <SelectItem value="part">Part Time</SelectItem>
                      <SelectItem value="oncall">On Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Loading</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="frontloaded">Front Loaded</SelectItem>
                      <SelectItem value="backloaded">Back Loaded</SelectItem>
                      <SelectItem value="custom">Custom Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resource Leveling</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Cost & Productivity</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cost Basis</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="daily">Daily Rate</SelectItem>
                      <SelectItem value="monthly">Monthly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Productivity Factor</Label>
                  <Input type="number" placeholder="1.0" min="0.1" max="2.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Overtime Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (1.5x)</SelectItem>
                      <SelectItem value="double">Double (2x)</SelectItem>
                      <SelectItem value="custom">Custom Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Resources Planned",
                    description: "Resource allocation plan has been created"
                  })
                  setIsResourceModalOpen(false)
                }}>Create Plan</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Document Templates</DialogTitle>
            <DialogDescription>Access and customize tender document templates</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Template Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Specifications</SelectItem>
                    <SelectItem value="commercial">Commercial Terms</SelectItem>
                    <SelectItem value="legal">Legal Documents</SelectItem>
                    <SelectItem value="quality">Quality Documents</SelectItem>
                    <SelectItem value="hse">HSE Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conditions">General Conditions</SelectItem>
                    <SelectItem value="specifications">Specifications</SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="schedules">Schedules</SelectItem>
                    <SelectItem value="drawings">Drawing Templates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry Standard</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fidic">FIDIC</SelectItem>
                    <SelectItem value="jct">JCT</SelectItem>
                    <SelectItem value="nec">NEC</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Template Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Microsoft Word</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Microsoft Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Template Version</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest Version</SelectItem>
                      <SelectItem value="2023">2023 Edition</SelectItem>
                      <SelectItem value="2022">2022 Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="uae">UAE</SelectItem>
                      <SelectItem value="uk">UK</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contract Value</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (&lt;₹10Cr)</SelectItem>
                      <SelectItem value="medium">Medium (₹10-50Cr)</SelectItem>
                      <SelectItem value="large">Large (&gt;₹50Cr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Customization Options</h4>
              <div className="grid grid-cols-1 gap-2">
                <Input placeholder="Company Name" />
                <Input placeholder="Project Reference" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Style Guide
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Template Generated",
                    description: "Document template has been generated"
                  })
                  setIsTemplateModalOpen(false)
                }}>Generate Document</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Building Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Team Builder</DialogTitle>
            <DialogDescription>Create project team structure and organization chart</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (5-15)</SelectItem>
                    <SelectItem value="medium">Medium (16-50)</SelectItem>
                    <SelectItem value="large">Large (50+)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (100+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Term (&lt;1 year)</SelectItem>
                    <SelectItem value="medium">Medium Term (1-2 years)</SelectItem>
                    <SelectItem value="long">Long Term (&gt;2 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Organization Structure</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Structure Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="matrix">Matrix</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="projectized">Projectized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Lines</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="matrix">Matrix</SelectItem>
                      <SelectItem value="dotted">Dotted Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Key Positions</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Set</SelectItem>
                      <SelectItem value="extended">Extended Set</SelectItem>
                      <SelectItem value="custom">Custom Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Departments</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="all">All Departments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Support Staff</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Team Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Technical Expertise</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Primary skills" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="mep">MEP</SelectItem>
                        <SelectItem value="structural">Structural</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-5 years)</SelectItem>
                        <SelectItem value="mid">Mid (5-10 years)</SelectItem>
                        <SelectItem value="senior">Senior (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Certifications Required</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pmp">PMP</SelectItem>
                        <SelectItem value="professional">Professional Engineer</SelectItem>
                        <SelectItem value="safety">Safety Certifications</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandatory">Mandatory</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Preview Chart
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Structure
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Team Structure Created",
                    description: "Project team structure has been generated"
                  })
                  setIsTeamModalOpen(false)
                }}>Create Structure</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission View/Edit Modal */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'View Submission' : 'Edit Submission'} - {selectedSubmission?.tender}
            </DialogTitle>
            <DialogDescription>
              {isViewMode ? 'View submission details and status' : 'Update submission status and details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Submission Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.tender}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission?.client}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Submission Date</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.submissionDate}</p>
                </div>
              </div>
            </div>

            {/* Status and Submission Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">{submissionData.status}</p>
                  </div>
                ) : (
                  <Select value={submissionData.status} onValueChange={(value) => setSubmissionData({...submissionData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Evaluation">Under Evaluation</SelectItem>
                      <SelectItem value="Technical Evaluation">Technical Evaluation</SelectItem>
                      <SelectItem value="Financial Evaluation">Financial Evaluation</SelectItem>
                      <SelectItem value="Awarded">Awarded</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Clarification Required">Clarification Required</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Submission Status</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <Badge variant={submissionData.submissionStatus === 'submitted' ? 'default' : 'secondary'}>
                      {submissionData.submissionStatus}
                    </Badge>
                  </div>
                ) : (
                  <Select value={submissionData.submissionStatus} onValueChange={(value) => setSubmissionData({...submissionData, submissionStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select submission status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="not-submitted">Not Submitted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resubmitted">Resubmitted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Contact Person and Follow-up Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">{submissionData.contactPerson}</p>
                  </div>
                ) : (
                  <Input
                    value={submissionData.contactPerson}
                    onChange={(e) => setSubmissionData({...submissionData, contactPerson: e.target.value})}
                    placeholder="Enter contact person name"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">{submissionData.followUpDate}</p>
                  </div>
                ) : (
                  <Input
                    type="date"
                    value={submissionData.followUpDate}
                    onChange={(e) => setSubmissionData({...submissionData, followUpDate: e.target.value})}
                  />
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              {isViewMode ? (
                <div className="p-2 bg-gray-50 rounded border min-h-20">
                  <p>{submissionData.notes}</p>
                </div>
              ) : (
                <Textarea
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData({...submissionData, notes: e.target.value})}
                  placeholder="Enter notes about the submission..."
                  rows={4}
                />
              )}
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Value</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.value}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Days Since Submission</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.daysElapsed} days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              {isViewMode ? (
                <Button variant="outline" onClick={() => setIsViewMode(false)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Submission
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsViewMode(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Mode
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSubmissionModalOpen(false)}>
                Cancel
              </Button>
              {!isViewMode && (
                <Button onClick={handleSaveSubmission}>
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenderManagement;
