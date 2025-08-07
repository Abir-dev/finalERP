import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Users, Clock, Plus, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";

interface IssueReport {
  id: string;
  title: string;
  type: 'LABOR_SHORTAGE' | 'MACHINERY_DEFECT' | 'QUALITY_ISSUE' | 'SAFETY_CONCERN' | 'MATERIAL_DELAY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedBy: string;
  reportedAt: string;
  assignedToId?: string;
  assignedTo?: {
    name: any;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  description: string;
  location: string;
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  startResolutionAt?: string;
  markedResolvedAt?: string;
  isStartResolution: boolean;
  isMarkedResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  name: string;
  id: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface IssueReportingProps {
  projectId?: string;
  siteId?: string;
}

interface NewIssueForm {
  title: string;
  type: string;
  priority: string;
  reportedBy: string;
  description: string;
  location: string;
  assignedToId: string;
  estimatedResolutionTime: string;
  createdById: string;
}

export function IssueReportingFunctional({ projectId, siteId }: IssueReportingProps) {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  
  const [newIssueForm, setNewIssueForm] = useState<NewIssueForm>({
    title: '',
    type: '',
    priority: '',
    reportedBy: '',
    description: '',
    location: '',
    assignedToId: '',
    estimatedResolutionTime: '',
    createdById: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchIssues();
    fetchUsers();
    fetchProjects();
  }, []);

  const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";


  const fetchIssues = async () => {
    try {
      const response = await fetch(`${API_URL}/issue-reports`);
      if (!response.ok) throw new Error('Failed to fetch issues');
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      // Filter users with role 'client' and current users for assignment
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };

  const handleNewIssue = async () => {
    try {
      if (!newIssueForm.title || !newIssueForm.type || !newIssueForm.reportedBy || 
          !newIssueForm.description || !newIssueForm.location || !newIssueForm.createdById) {
        toast.error('Please fill in all required fields');
        return;
      }

      const issueData = {
        title: newIssueForm.title,
        type: newIssueForm.type,
        priority: newIssueForm.priority || 'MEDIUM',
        reportedBy: newIssueForm.reportedBy,
        description: newIssueForm.description,
        location: newIssueForm.location,
        createdById: newIssueForm.createdById,
        assignedToId: newIssueForm.assignedToId || null,
        estimatedResolutionTime: newIssueForm.estimatedResolutionTime ? 
          parseFloat(newIssueForm.estimatedResolutionTime) : null
      };

      const response = await fetch(`${API_URL}/issue-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create issue');
      }

      const newIssue = await response.json();
      setIssues(prev => [newIssue, ...prev]);
      setIsNewIssueOpen(false);
      
      // Reset form
      setNewIssueForm({
        title: '',
        type: '',
        priority: '',
        reportedBy: '',
        description: '',
        location: '',
        assignedToId: '',
        estimatedResolutionTime: '',
        createdById: ''
      });

      toast.success('Issue reported successfully!');
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    }
  };

  const handleStartResolution = async (issueId: string) => {
    try {
      const response = await fetch(`${API_URL}/issue-reports/${issueId}/start-resolution`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start resolution');
      }

      const updatedIssue = await response.json();
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? updatedIssue : issue
      ));
      
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updatedIssue);
      }

      toast.success('Resolution started successfully!');
    } catch (error) {
      console.error('Error starting resolution:', error);
      toast.error('Failed to start resolution');
    }
  };

  const handleMarkResolved = async (issueId: string) => {
    try {
      const response = await fetch(`${API_URL}/issue-reports/${issueId}/mark-resolved`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark as resolved');
      }

      const updatedIssue = await response.json();
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? updatedIssue : issue
      ));
      
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updatedIssue);
      }

      toast.success('Issue marked as resolved!');
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast.error('Failed to mark as resolved');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MACHINERY_DEFECT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'LABOR_SHORTAGE':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'SAFETY_CONCERN':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'destructive';
      case 'IN_PROGRESS': return 'secondary';
      case 'RESOLVED': return 'default';
      default: return 'secondary';
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const clientUsers = users.filter(user => user.role === 'client');
  const openIssues = issues.filter(i => i.status === 'OPEN').length;
  const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;
  
  const resolvedWithTime = issues.filter(i => i.status === 'RESOLVED' && i.actualResolutionTime);
  const averageResolutionTime = resolvedWithTime.length > 0 ? 
    resolvedWithTime.reduce((sum, issue) => sum + (issue.actualResolutionTime || 0), 0) / resolvedWithTime.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading issues...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedStatCard
          title="In Progress"
          value={inProgressIssues}
          icon={Clock}
          description="Currently being resolved"
          trend={{ value: 15, label: "vs last week" }}
        />
        <EnhancedStatCard
          title="Resolved Issues"
          value={resolvedIssues}
          icon={CheckCircle}
          description="Successfully completed"
          trend={{ value: 12, label: "vs last week" }}
        />
        <EnhancedStatCard
          title="Avg Resolution Time"
          value={`${averageResolutionTime.toFixed(1)}h`}
          icon={TrendingUp}
          description="Time to resolve issues"
          trend={{ value: -10, label: "vs last week" }}
        />
      </div>

      {/* Issue Detail Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-6">
              {/* Issue Header */}
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedIssue.type)}
                <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                <Badge variant={getPriorityColor(selectedIssue.priority)}>
                  {selectedIssue.priority}
                </Badge>
                <Badge variant={getStatusColor(selectedIssue.status)}>
                  {formatStatus(selectedIssue.status)}
                </Badge>
              </div>

              {/* Issue Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium mt-1">{formatType(selectedIssue.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <p className="font-medium mt-1">{selectedIssue.priority}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reported By</Label>
                  <p className="font-medium mt-1">{selectedIssue.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="font-medium mt-1">
                    {selectedIssue.assignedTo 
                      ? `${selectedIssue.assignedTo.name}`
                      : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium mt-1">{selectedIssue.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium mt-1">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedIssue.description}</p>
              </div>

              {/* Resolution Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estimated Resolution Time</Label>
                  <p className="font-medium mt-1">
                    {selectedIssue.estimatedResolutionTime 
                      ? `${selectedIssue.estimatedResolutionTime} hours`
                      : 'Not estimated'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Actual Resolution Time</Label>
                  <p className="font-medium mt-1">
                    {selectedIssue.actualResolutionTime 
                      ? `${selectedIssue.actualResolutionTime.toFixed(2)} hours`
                      : 'In progress'}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              {(selectedIssue.startResolutionAt || selectedIssue.markedResolvedAt) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedIssue.startResolutionAt && (
                    <div>
                      <Label className="text-muted-foreground">Resolution Started</Label>
                      <p className="font-medium mt-1">
                        {new Date(selectedIssue.startResolutionAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedIssue.markedResolvedAt && (
                    <div>
                      <Label className="text-muted-foreground">Marked Resolved</Label>
                      <p className="font-medium mt-1">
                        {new Date(selectedIssue.markedResolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                {selectedIssue.status === 'OPEN' && (
                  <Button 
                    onClick={() => {
                      handleStartResolution(selectedIssue.id);
                      setIsViewDetailsOpen(false);
                    }}
                  >
                    Start Resolution
                  </Button>
                )}
                {selectedIssue.status === 'IN_PROGRESS' && (
                  <Button 
                    onClick={() => {
                      handleMarkResolved(selectedIssue.id);
                      setIsViewDetailsOpen(false);
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Site Issue Tracking</CardTitle>
              <CardDescription>Real-time issue reporting and resolution management</CardDescription>
            </div>
            <Dialog open={isNewIssueOpen} onOpenChange={setIsNewIssueOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Report New Issue</DialogTitle>
                  <DialogDescription>Document site issues for quick resolution</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue-type">Issue Type *</Label>
                      <Select value={newIssueForm.type} onValueChange={(value) => 
                        setNewIssueForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LABOR_SHORTAGE">Labor Shortage</SelectItem>
                          <SelectItem value="MACHINERY_DEFECT">Machinery Defect</SelectItem>
                          <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                          <SelectItem value="SAFETY_CONCERN">Safety Concern</SelectItem>
                          <SelectItem value="MATERIAL_DELAY">Material Delay</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newIssueForm.priority} onValueChange={(value) => 
                        setNewIssueForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reported-by">Reported By *</Label>
                      <Input 
                        id="reported-by" 
                        placeholder="Enter name of person reporting" 
                        value={newIssueForm.reportedBy}
                        onChange={(e) => setNewIssueForm(prev => ({ ...prev, reportedBy: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimated-resolution">Estimated Resolution (hours)</Label>
                      <Input 
                        id="estimated-resolution" 
                        type="number"
                        placeholder="Enter estimated hours" 
                        value={newIssueForm.estimatedResolutionTime}
                        onChange={(e) => setNewIssueForm(prev => ({ ...prev, estimatedResolutionTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assigned-to">Assigned To</Label>
                      <Select value={newIssueForm.assignedToId} onValueChange={(value) => 
                        setNewIssueForm(prev => ({ ...prev, assignedToId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} 
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="created-by">Created By *</Label>
                      <Select value={newIssueForm.createdById} onValueChange={(value) => 
                        setNewIssueForm(prev => ({ ...prev, createdById: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select creator" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="Brief description of the issue" 
                      value={newIssueForm.title}
                      onChange={(e) => setNewIssueForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location" 
                      placeholder="Specific location where issue occurred" 
                      value={newIssueForm.location}
                      onChange={(e) => setNewIssueForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Provide detailed information about the issue..."
                      rows={4}
                      value={newIssueForm.description}
                      onChange={(e) => setNewIssueForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewIssueOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNewIssue}>
                      Report Issue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No issues reported yet</p>
              </div>
            ) : (
              issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(issue.type)}
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge variant={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                          <Badge variant={getStatusColor(issue.status)}>
                            {formatStatus(issue.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                          <span>By: {issue.reportedBy}</span>
                          <span>Location: {issue.location}</span>
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Assigned to:</p>
                          <p className="font-medium">
                            {issue.assignedTo 
                              ? `${issue.assignedTo.name}`
                              : 'Unassigned'}
                          </p>
                          {issue.estimatedResolutionTime && (
                            <>
                              <p className="text-muted-foreground mt-2">Est. Resolution:</p>
                              <p className="font-medium">{issue.estimatedResolutionTime}h</p>
                            </>
                          )}
                          {issue.actualResolutionTime && (
                            <>
                              <p className="text-muted-foreground mt-2">Actual Resolution:</p>
                              <p className="font-medium">{issue.actualResolutionTime.toFixed(2)}h</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-3 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setIsViewDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        {issue.status === 'OPEN' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartResolution(issue.id)}
                          >
                            Start Resolution
                          </Button>
                        )}
                        {issue.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkResolved(issue.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
