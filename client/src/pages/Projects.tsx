import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clipboard, Filter, Plus, Search, MapPin, Users, AlertTriangle, TrendingUp, Camera, FileText, Upload, X, Edit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";

// Enhanced project data with more details
const projectsData = [
  {
    id: 1,
    name: "Residential Complex A",
    client: "ABC Developers",
    status: "In Progress",
    progress: 65,
    budget: 2500000,
    spent: 1600000,
    deadline: "2024-12-15",
    location: "Mumbai",
    manager: "Rajesh Kumar"
  },
  {
    id: 2,
    name: "Office Tower B",
    client: "XYZ Corp",
    status: "Planning",
    progress: 30,
    budget: 5200000,
    spent: 1800000,
    deadline: "2025-06-30",
    location: "Delhi",
    manager: "Priya Sharma"
  },
  {
    id: 3,
    name: "Shopping Mall C",
    client: "DEF Enterprises",
    status: "In Progress",
    progress: 85,
    budget: 8100000,
    spent: 6900000,
    deadline: "2024-09-20",
    location: "Bangalore",
    manager: "Amit Singh"
  },
  {
    id: 4,
    name: "Luxury Villas",
    client: "GHI Builders",
    status: "Completed",
    progress: 100,
    budget: 3000000,
    spent: 2950000,
    deadline: "2024-03-15",
    location: "Pune",
    manager: "Sunita Rao"
  },
  {
    id: 5,
    name: "Industrial Complex",
    client: "JKL Industries",
    status: "On Hold",
    progress: 45,
    budget: 6500000,
    spent: 2800000,
    deadline: "2025-01-30",
    location: "Chennai",
    manager: "Vikram Patel"
  }
];

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  location: string;
  manager: string;
  designDate?: string;
  foundationDate?: string;
  structureDate?: string;
  interiorDate?: string;
  finalDate?: string;
  milestones?: Array<{
    name: string;
    date: string;
    completed: boolean;
  }>;
}

const StatCard = ({ title, value, icon: Icon, trend, onClick = undefined }) => (
  <Card 
    className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      {trend && (
        <p className={`text-xs mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
        </p>
      )}
    </CardContent>
  </Card>
);

const ProjectHeatmap = ({ projects, handleViewDetails }) => {
  const weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapProjects = [
    { name: 'Residential Complex A', data: [0.8, 0.6, 0.9, 0.7, 0.5, 0.3, 0.1] },
    { name: 'Office Tower B', data: [0.4, 0.7, 0.3, 0.8, 0.6, 0.2, 0.0] },
    { name: 'Shopping Mall C', data: [0.9, 0.8, 0.7, 0.6, 0.8, 0.4, 0.2] },
    { name: 'Luxury Villas', data: [0.2, 0.1, 0.3, 0.2, 0.1, 0.0, 0.0] },
    { name: 'Industrial Complex', data: [0.5, 0.4, 0.2, 0.1, 0.3, 0.0, 0.0] }
  ];
  
  const getIntensityColor = (intensity) => {
    if (intensity === 0) return 'bg-gray-100 border border-gray-200';
    if (intensity <= 0.2) return 'bg-green-100 border border-green-200';
    if (intensity <= 0.4) return 'bg-green-200 border border-green-300';
    if (intensity <= 0.6) return 'bg-green-300 border border-green-400';
    if (intensity <= 0.8) return 'bg-green-400 border border-green-500';
    return 'bg-green-500 border border-green-600';
  };
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center">
        <div className="w-40 text-sm font-medium text-muted-foreground">Projects</div>
        <div className="flex gap-1">
          {weeks.map(day => (
            <div key={day} className="w-8 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
      </div>
      
      {/* Heatmap Grid */}
      {heatmapProjects.map((project) => (
        <div key={project.name} className="flex items-center">
          <div className="w-40 text-sm font-medium truncate pr-2" title={project.name}>
            {project.name}
          </div>
          <div className="flex gap-1">
            {project.data.map((intensity, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-8 h-8 rounded ${getIntensityColor(intensity)} cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${project.name} - ${weeks[dayIndex]}: ${Math.round(intensity * 100)}% activity`}
                onClick={() => {
                  // Find the project and show its details
                  const projectData = projects.find(p => p.name === project.name);
                  if (projectData) {
                    handleViewDetails(projectData);
                  }
                }}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground">Activity Level</div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Less</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded ${getIntensityColor(intensity)}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">More</span>
        </div>
      </div>
    </div>
  );
};

const GanttChart = () => {
  const tasks = [
    { name: 'Foundation', start: 0, duration: 20, progress: 100 },
    { name: 'Structure', start: 15, duration: 30, progress: 75 },
    { name: 'Roofing', start: 35, duration: 15, progress: 30 },
    { name: 'Interiors', start: 45, duration: 25, progress: 0 },
  ];

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{task.name}</span>
            <span>{task.progress}%</span>
          </div>
          <div className="relative h-6 bg-gray-200 rounded">
            <div 
              className="absolute h-full bg-blue-500 rounded"
              style={{ 
                left: `${(task.start / 70) * 100}%`,
                width: `${(task.duration / 70) * 100}%`,
                opacity: 0.7
              }}
            />
            <div 
              className="absolute h-full bg-blue-600 rounded"
              style={{ 
                left: `${(task.start / 70) * 100}%`,
                width: `${((task.progress / 100) * task.duration / 70) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const DPRModal = ({ onClose }) => {
  const [files, setFiles] = useState([]);
  const [progressNotes, setProgressNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("DPR Submitted", {
        project: selectedProject,
        notes: progressNotes,
        files: files.map(f => f.name)
      });
      setIsSubmitting(false);
      onClose();
      setFiles([]);
      setProgressNotes("");
      setSelectedProject("");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Submit Daily Progress Report</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Project</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a project</option>
              {projectsData.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.location}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Progress Notes</Label>
            <Textarea
              placeholder="Describe today's progress, challenges, and next steps..."
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, PDF, DOC (max 10MB each)</p>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!selectedProject || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                onClose();
                setFiles([]);
                setProgressNotes("");
                setSelectedProject("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("overview");
  const [showDPRModal, setShowDPRModal] = useState(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectType, setProjectType] = useState("");
  const [projects, setProjects] = useState(projectsData);
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const [editMilestones, setEditMilestones] = useState([]);
  const [editSpent, setEditSpent] = useState(0);
  
  // Add subview state management
  const [subview, setSubview] = useState<'main' | 'activeProjects' | 'onSchedule' | 'budgetAnalysis' | 'alerts' | 'resourceAllocation' | 'materialStatus' | 'dprSubmissions'>('main');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    client: '',
    status: 'Planning',
    progress: 0,
    budget: 0,
    spent: 0,
    deadline: '',
    location: '',
    manager: '',
    designDate: '',
    foundationDate: '',
    structureDate: '',
    interiorDate: '',
    finalDate: ''
  });

  const filteredProjects = projects.filter(
    project => project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setEditProgress(project.progress);
    setEditStatus(project.status);
    setEditSpent(project.spent);
    
    // Initialize milestones based on project progress
    const milestones = [
      { name: 'Design Approval', date: '2024-01-15', completed: true },
      { name: 'Foundation Complete', date: '2024-03-20', completed: project.progress > 20 },
      { name: 'Structure Complete', date: '2024-06-30', completed: project.progress > 50 },
      { name: 'Interior Work', date: '2024-09-15', completed: project.progress > 80 },
      { name: 'Final Inspection', date: project.deadline, completed: project.progress === 100 }
    ];
    setEditMilestones(milestones);
    setShowProjectDetailsModal(true);
  };

  const handleSaveChanges = () => {
    const updatedProjects = projects.map(project => 
      project.id === selectedProject.id 
        ? { ...project, progress: editProgress, status: editStatus, spent: editSpent }
        : project
    );
    setProjects(updatedProjects);
    setSelectedProject({ ...selectedProject, progress: editProgress, status: editStatus, spent: editSpent });
    setIsEditing(false);
  };

  const toggleMilestoneStatus = (index) => {
    const updatedMilestones = [...editMilestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      completed: !updatedMilestones[index].completed
    };
    setEditMilestones(updatedMilestones);
  };

  const [selectedProjectForResources, setSelectedProjectForResources] = useState("");
const [selectedResources, setSelectedResources] = useState([]);
const [resourceAssignmentStartDate, setResourceAssignmentStartDate] = useState("");
const [resourceAssignmentDuration, setResourceAssignmentDuration] = useState(1);
const [resourceAssignmentNotes, setResourceAssignmentNotes] = useState("");
const [isAssigningResources, setIsAssigningResources] = useState(false);

// Sample available resources data
const availableResources = [
  {
    id: 1,
    name: "Construction Crew A",
    type: "Labor",
    availability: "High",
    nextAvailable: "Immediate",
    dailyRate: 15000
  },
  {
    id: 2,
    name: "Crane Operator",
    type: "Equipment",
    availability: "Medium",
    nextAvailable: "Tomorrow",
    dailyRate: 25000
  },
  // Add more resources as needed
];
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-500 hover:bg-green-600';
      case 'Planning':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Completed':
        return 'bg-green-700 hover:bg-green-800';
      case 'On Hold':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const [showProgressReportModal, setShowProgressReportModal] = useState(false);
const [showSitePhotosModal, setShowSitePhotosModal] = useState(false);
const [showResourceAssignmentModal, setShowResourceAssignmentModal] = useState(false);
const [showSafetyAlertModal, setShowSafetyAlertModal] = useState(false);

const generateTextReport = (project: any) => {
  return `
PROJECT STATUS REPORT
=====================

Project: ${project.name}
Location: ${project.location}
Client: ${project.client}
Status: ${project.status}
Manager: ${project.manager}

PROGRESS
--------
Completion: ${project.progress}%
Budget: ₹${project.spent.toLocaleString()} / ₹${project.budget.toLocaleString()}
Deadline: ${project.deadline}

MILESTONES
----------
${getMilestoneText(project)}

NOTES
-----
Add any additional notes here...
`;
};

const getMilestoneText = (project: any) => {
  const milestones = [
    { name: 'Design Approval', date: '2024-01-15', completed: true },
    { name: 'Foundation', date: '2024-03-20', completed: true },
    { name: 'Structure', date: '2024-06-30', completed: false },
    { name: 'Interiors', date: '2024-09-15', completed: false },
    { name: 'Final Inspection', date: project.deadline, completed: false }
  ];
  
  return milestones.map(m => 
    `${m.completed ? '✓' : '◻'} ${m.name} (${m.date})`
  ).join('\n');
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">Manage all your construction projects in one place</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowDPRModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Camera className="mr-2 h-4 w-4" />
            Submit DPR
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new construction project with key milestones
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4 px-4 overflow-y-auto flex-1">
                {/* Basic Project Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Project Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input 
                      id="project-name" 
                      placeholder="Enter project name"
                      value={newProject.name || ''}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client</Label>
                      <Input 
                        id="client" 
                        placeholder="Enter client name"
                        value={newProject.client || ''}
                        onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input 
                        id="budget" 
                        type="number" 
                        placeholder="Enter project budget"
                        value={newProject.budget || ''}
                        onChange={(e) => setNewProject({...newProject, budget: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Enter project location"
                        value={newProject.location || ''}
                        onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager">Project Manager</Label>
                      <Input 
                        id="manager" 
                        placeholder="Assign project manager"
                        value={newProject.manager || ''}
                        onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Project Deadline</Label>
                    <Input 
                      id="deadline" 
                      type="date"
                      value={newProject.deadline || ''}
                      onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Residential', 'Commercial', 'Industrial', 'Infrastructure'].map((type) => (
                        <Button
                          key={type}
                          variant={projectType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setProjectType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Project Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Planning', 'In Progress', 'On Hold'].map((status) => (
                        <Button
                          key={status}
                          variant={newProject.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewProject({...newProject, status})}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Milestones Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Key Milestones</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Design Approval', dateKey: 'designDate' },
                      { name: 'Foundation Complete', dateKey: 'foundationDate' },
                      { name: 'Structure Complete', dateKey: 'structureDate' },
                      { name: 'Interior Work', dateKey: 'interiorDate' },
                      { name: 'Final Inspection', dateKey: 'finalDate' }
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-32">
                          <p className="text-sm">{milestone.name}</p>
                        </div>
                        <Input 
                          type="date" 
                          className="flex-1"
                          value={newProject[milestone.dateKey] || ''}
                          onChange={(e) => setNewProject({
                            ...newProject, 
                            [milestone.dateKey]: e.target.value
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setNewProject({
                    name: '',
                    client: '',
                    status: 'Planning',
                    progress: 0,
                    budget: 0,
                    spent: 0,
                    deadline: '',
                    location: '',
                    manager: '',
                    designDate: '',
                    foundationDate: '',
                    structureDate: '',
                    interiorDate: '',
                    finalDate: ''
                  })}
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => {
                    // Create the new project object
                    const projectToAdd: Project = {
                      id: Math.max(...projects.map(p => p.id)) + 1,
                      name: newProject.name || '',
                      client: newProject.client || '',
                      status: newProject.status || 'Planning',
                      progress: newProject.progress || 0,
                      budget: newProject.budget || 0,
                      spent: newProject.spent || 0,
                      deadline: newProject.deadline || '',
                      location: newProject.location || '',
                      manager: newProject.manager || '',
                      milestones: [
                        { name: 'Design Approval', date: newProject.designDate || '', completed: false },
                        { name: 'Foundation Complete', date: newProject.foundationDate || '', completed: false },
                        { name: 'Structure Complete', date: newProject.structureDate || '', completed: false },
                        { name: 'Interior Work', date: newProject.interiorDate || '', completed: false },
                        { name: 'Final Inspection', date: newProject.finalDate || newProject.deadline || '', completed: false }
                      ]
                    };
                    
                    // Add to projects list
                    setProjects([...projects, projectToAdd]);
                    
                    // Reset form
                    setNewProject({
                      name: '',
                      client: '',
                      status: 'Planning',
                      progress: 0,
                      budget: 0,
                      spent: 0,
                      deadline: '',
                      location: '',
                      manager: '',
                      designDate: '',
                      foundationDate: '',
                      structureDate: '',
                      interiorDate: '',
                      finalDate: ''
                    });
                    
                    // Show success message
                    toast({
                      title: "Project Created",
                      description: `${projectToAdd.name} has been added to your projects`,
                    });
                  }}
                  disabled={!newProject.name || !newProject.client}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {subview === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Active Projects" 
            value={projects.filter(p => p.status === "In Progress").length} 
            icon={Clipboard}
            trend={{
              value: 12,
              label: "vs last month"
            }}
            onClick={() => setSubview('activeProjects')}
          />
          <StatCard 
            title="Projects On Schedule" 
            value={projects.filter(p => p.status === "In Progress" && p.progress >= 50).length} 
            icon={Calendar}
            trend={{
              value: 5,
              label: "vs last month"
            }}
            onClick={() => setSubview('onSchedule')}
          />
          <StatCard 
            title="Total Budget" 
            value={`₹${(projects.reduce((sum, p) => sum + p.budget, 0) / 10000000).toFixed(1)}Cr`}
            icon={FileText}
            trend={{
              value: 8,
              label: "vs last month"
            }}
            onClick={() => setSubview('budgetAnalysis')}
          />
          <StatCard 
            title="Alerts" 
            value={projects.filter(p => p.status === "On Hold").length} 
            icon={AlertTriangle}
            trend={{
              value: -2,
              label: "decrease"
            }}
            onClick={() => setSubview('alerts')}
          />
        </div>
      )}
      
      {subview === 'main' && (
        <Card>
        <CardHeader className="pb-3">
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            View and manage all your projects
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              
              <Tabs defaultValue="overview" className="w-auto" onValueChange={(v) => setView(v)}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "list" && (
            <div className="rounded-md border">
              <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Client</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Progress</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Budget</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle font-medium">{project.name}</td>
                        <td className="p-4 align-middle">{project.client}</td>
                        <td className="p-4 align-middle">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full bg-secondary rounded-full">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs w-9 text-right">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">₹{project.budget.toLocaleString()}</td>
                        <td className="p-4 align-middle">{project.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {view === "kanban" && (
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {["Planning", "In Progress", "On Hold", "Completed"].map((status) => (
                  <div key={status} className="rounded-lg border bg-card">
                    <div className="p-3 border-b font-medium">{status}</div>
                    <div className="p-2 space-y-2">
                      {filteredProjects
                        .filter(project => project.status === status)
                        .map(project => (
                          <div key={project.id} className="rounded-md border p-3 bg-background cursor-pointer hover:shadow transition-all" onClick={() => handleViewDetails(project)}>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-muted-foreground">{project.client}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {project.location}
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-full bg-secondary rounded-full">
                                  <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs w-9 text-right">{project.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "timeline" && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart />
                </CardContent>
              </Card>
            </div>
          )}

          {view === "overview" && (
            <div className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectHeatmap projects={projects} handleViewDetails={handleViewDetails} />
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                        >
                          View Details
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">{project.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">{project.manager}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">{project.deadline}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Budget: ₹{project.spent.toLocaleString()} / ₹{project.budget.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Project Details Modal */}
          {selectedProject && (
            <Dialog open={showProjectDetailsModal} onOpenChange={setShowProjectDetailsModal}>
              <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{selectedProject.name}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedProject.progress}% complete
                    </span>
                  </div>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Project Status</Label>
                        <div className="flex flex-wrap gap-2">
                          {['Planning', 'In Progress', 'On Hold', 'Completed'].map((status) => (
                            <Button
                              key={status}
                              variant={editStatus === status ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setEditStatus(status)}
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Project Progress</Label>
                        <div className="flex items-center gap-4">
                          <Slider 
                            value={[editProgress]}
                            onValueChange={([value]) => setEditProgress(value)}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm w-12 text-right">{editProgress}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Budget Spent</Label>
                        <div className="flex items-center gap-4">
                          <Slider 
                            value={[editSpent]}
                            onValueChange={([value]) => setEditSpent(value)}
                            max={selectedProject?.budget || 100}
                            step={1000}
                            className="flex-1"
                          />
                          <span className="text-sm w-20 text-right">₹{(editSpent / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Spent: ₹{(editSpent / 100000).toFixed(1)}L</span>
                          <span>Remaining: ₹{((selectedProject?.budget - editSpent) / 100000).toFixed(1)}L</span>
                          <span>Total: ₹{(selectedProject?.budget / 100000).toFixed(1)}L</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Client</Label>
                          <p>{selectedProject.client}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Location</Label>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            <p>{selectedProject.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Project Manager</Label>
                          <p>{selectedProject.manager}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Deadline</Label>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <p>{selectedProject.deadline}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Budget</Label>
                        <div className="space-y-1">
                          <p>₹{selectedProject.budget.toLocaleString()}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Spent: ₹{selectedProject.spent.toLocaleString()}</span>
                            <span>
                              Remaining: ₹{(selectedProject.budget - selectedProject.spent).toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={(selectedProject.spent / selectedProject.budget) * 100} 
                            className="h-2 mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Project Progress</Label>
                        <Progress value={selectedProject.progress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Started: {selectedProject.deadline}</span>
                          <span>Target: {selectedProject.deadline}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Key Milestones</Label>
                    <div className="space-y-2">
                      {editMilestones.map((milestone, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-3 ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm">{milestone.name}</p>
                            <p className="text-xs text-muted-foreground">{milestone.date}</p>
                          </div>
                          {isEditing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs cursor-pointer transition-colors ${
                                milestone.completed 
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                              onClick={() => toggleMilestoneStatus(index)}
                            >
                              {milestone.completed ? 'Completed' : 'Pending'}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {milestone.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveChanges}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setShowProjectDetailsModal(false)}>
                        Close
                      </Button>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {view === "resources" && (
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Engineers', 'Workers', 'Supervisors', 'Equipment'].map((resource, index) => (
                        <div key={resource} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{resource}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={[85, 70, 90, 60][index]} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{[85, 70, 90, 60][index]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Material Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Cement', status: 'Available', quantity: '150 bags' },
                        { name: 'Steel Bars', status: 'Low Stock', quantity: '25 tons' },
                        { name: 'Bricks', status: 'Available', quantity: '50,000 units' },
                        { name: 'Sand', status: 'Critical', quantity: '10 cubic meters' }
                      ].map((material) => (
                        <div key={material.name} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">{material.quantity}</p>
                          </div>
                          <Badge 
                            variant={material.status === 'Critical' ? 'destructive' : 
                                    material.status === 'Low Stock' ? 'outline' : 'default'}
                          >
                            {material.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {view === "reports" && (
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent DPR Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { project: 'Residential Complex A', date: '2024-05-26', status: 'Approved', progress: '65%' },
                        { project: 'Office Tower B', date: '2024-05-25', status: 'Pending', progress: '30%' },
                        { project: 'Shopping Mall C', date: '2024-05-24', status: 'Approved', progress: '85%' }
                      ].map((dpr, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{dpr.project}</p>
                            <p className="text-sm text-muted-foreground">{dpr.date}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={dpr.status === 'Approved' ? 'default' : 'outline'}>
                              {dpr.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">Progress: {dpr.progress}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowProgressReportModal(true)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Progress Report
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowSitePhotosModal(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Site Photos
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowResourceAssignmentModal(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Assign Resources
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowSafetyAlertModal(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Create Safety Alert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* Active Projects Subview */}
      {subview === 'activeProjects' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Projects currently in progress</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSubview('main')}>
                Back to Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.filter(p => p.status === "In Progress").map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.manager}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{project.progress}%</span>
                        <Badge variant="secondary">{project.status}</Badge>
                      </div>
                      <Progress value={project.progress} className="w-32" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* On Schedule Projects Subview */}
      {subview === 'onSchedule' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects On Schedule</CardTitle>
                <CardDescription>Projects meeting their timeline expectations</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSubview('main')}>
                Back to Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.filter(p => p.status === "In Progress" && p.progress >= 50).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg border-green-200 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800">{project.name}</h3>
                      <p className="text-sm text-green-600">{project.client}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">{project.manager}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-green-800">{project.progress}%</span>
                        <Badge variant="default" className="bg-green-600">On Track</Badge>
                      </div>
                      <Progress value={project.progress} className="w-32" />
                      <p className="text-sm text-green-600 mt-1">
                        Budget: ₹{(project.budget / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Analysis Subview */}
      {subview === 'budgetAnalysis' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Analysis</CardTitle>
                <CardDescription>Financial overview of all projects</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSubview('main')}>
                Back to Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Budget Utilization</h3>
                {projects.map((project) => {
                  const utilization = (project.spent / project.budget) * 100;
                  return (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={utilization} className="mb-2" />
                      <div className="flex justify-between text-sm">
                        <span>Spent: ₹{(project.spent / 1000000).toFixed(1)}M</span>
                        <span>Budget: ₹{(project.budget / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + p.budget, 0) / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + p.spent, 0) / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold">₹{((projects.reduce((sum, p) => sum + p.budget, 0) - projects.reduce((sum, p) => sum + p.spent, 0)) / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg Utilization</p>
                    <p className="text-2xl font-bold">{((projects.reduce((sum, p) => sum + p.spent, 0) / projects.reduce((sum, p) => sum + p.budget, 0)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Subview */}
      {subview === 'alerts' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Alerts</CardTitle>
                <CardDescription>Issues and attention-required items</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSubview('main')}>
                Back to Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.filter(p => p.status === "On Hold").map((project) => (
                <div key={project.id} className="p-4 border rounded-lg border-red-200 bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">{project.name}</h3>
                      <p className="text-sm text-red-600">{project.client}</p>
                      <p className="text-sm text-red-700 mt-1">
                        Project is on hold. Progress: {project.progress}%
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">{project.manager}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">On Hold</Badge>
                      <p className="text-sm text-red-600 mt-1">
                        Budget: ₹{(project.budget / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {projects.filter(p => p.status === "On Hold").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p>No active alerts. All projects are running smoothly!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

{/* Progress Report Modal */}
<Dialog open={showProgressReportModal} onOpenChange={setShowProgressReportModal}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle className="text-xl flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Generate Progress Report
      </DialogTitle>
    </DialogHeader>
    
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Select Project</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>Select a project</option>
          {filteredProjects.map((project: any) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.location})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Report Period</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Project-to-date</option>
            <option>Custom range</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Detail Level</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Summary</option>
            <option>Detailed</option>
            <option>Technical</option>
          </select>
        </div>
      </div>
    </div>

    <DialogFooter>
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => setShowProgressReportModal(false)}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 gap-2" 
          onClick={() => {
            const selectElement = document.querySelector('select') as HTMLSelectElement;
            const selectedProjectId = parseInt(selectElement.value);
            const selectedProject = filteredProjects.find(
              (p: any) => p.id === selectedProjectId
            );
            
            if (selectedProject) {
              const reportText = generateTextReport(selectedProject);
              downloadTextFile(reportText, `${selectedProject.name}-report.txt`);
              setShowProgressReportModal(false);
            }
          }}
        >
          <FileText className="h-4 w-4" />
          Download Report
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Site Photos Modal */}
<Dialog open={showSitePhotosModal} onOpenChange={setShowSitePhotosModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upload Site Photos</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <input type="file" accept="image/*" multiple />
      {/* Add photo upload form here */}
    </div>
    <DialogFooter>
      <Button onClick={() => setShowSitePhotosModal(false)}>
        Upload Photos
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Resource Assignment Modal */}
<Dialog open={showResourceAssignmentModal} onOpenChange={setShowResourceAssignmentModal}>
  <DialogContent className="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle className="text-xl flex items-center gap-2">
        <Users className="w-5 h-5" />
        Assign Resources to Project
      </DialogTitle>
    </DialogHeader>
    
    <div className="grid gap-6 py-4">
      {/* Project Selection */}
      <div className="space-y-2">
        <Label>Select Project</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedProjectForResources || ""}
          onChange={(e) => setSelectedProjectForResources(e.target.value)}
        >
          <option value="" disabled>Select a project</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.location})
            </option>
          ))}
        </select>
      </div>

      {/* Resource Selection */}
      <div className="space-y-2">
        <Label>Available Resources</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
          {availableResources.map((resource) => (
            <div 
              key={resource.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedResources.some(r => r.id === resource.id)
                  ? "bg-blue-50 border-blue-200"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedResources(prev => 
                  prev.some(r => r.id === resource.id)
                    ? prev.filter(r => r.id !== resource.id)
                    : [...prev, resource]
                );
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{resource.name}</h4>
                  <p className="text-sm text-muted-foreground">{resource.type}</p>
                </div>
                <Badge 
                  variant={
                    resource.availability === "High" ? "default" :
                    resource.availability === "Medium" ? "secondary" : "destructive"
                  }
                >
                  {resource.availability} Availability
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {resource.nextAvailable}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {resource.dailyRate ? `₹${resource.dailyRate}/day` : "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Resources Summary */}
      {selectedResources.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Resources ({selectedResources.length})</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
            {selectedResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{resource.name}</p>
                  <p className="text-sm text-muted-foreground">{resource.type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedResources(prev => 
                      prev.filter(r => r.id !== resource.id)
                    );
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input 
            type="date" 
            value={resourceAssignmentStartDate}
            onChange={(e) => setResourceAssignmentStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label>Duration (days)</Label>
          <Input 
            type="number" 
            min={1}
            value={resourceAssignmentDuration}
            onChange={(e) => setResourceAssignmentDuration(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Assignment Notes */}
      <div className="space-y-2">
        <Label>Assignment Notes</Label>
        <Textarea
          placeholder="Add special instructions or requirements..."
          value={resourceAssignmentNotes}
          onChange={(e) => setResourceAssignmentNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>

    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => {
          setSelectedResources([]);
          setSelectedProjectForResources("");
          setResourceAssignmentStartDate("");
          setResourceAssignmentDuration(1);
          setResourceAssignmentNotes("");
          setShowResourceAssignmentModal(false);
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={() => {
          if (!selectedProjectForResources || selectedResources.length === 0) {
            toast({
              title: "Missing Information",
              description: "Please select a project and at least one resource",
              variant: "destructive",
            });
            return;
          }

          // Create the assignment
          const assignment = {
            projectId: selectedProjectForResources,
            resources: selectedResources,
            startDate: resourceAssignmentStartDate,
            duration: resourceAssignmentDuration,
            notes: resourceAssignmentNotes,
            status: "Pending",
            assignedAt: new Date().toISOString(),
          };

          // In a real app, you would send this to your API
          console.log("Creating assignment:", assignment);
          
          // Show success message
          toast({
            title: "Resources Assigned",
            description: `${selectedResources.length} resources have been assigned to the project`,
          });

          // Reset form
          setSelectedResources([]);
          setSelectedProjectForResources("");
          setResourceAssignmentStartDate("");
          setResourceAssignmentDuration(1);
          setResourceAssignmentNotes("");
          setShowResourceAssignmentModal(false);
        }}
        disabled={isAssigningResources}
      >
        {isAssigningResources ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning...
          </>
        ) : (
          "Confirm Assignment"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Safety Alert Modal */}
<Dialog open={showSafetyAlertModal} onOpenChange={setShowSafetyAlertModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Safety Alert</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Textarea placeholder="Describe the safety concern..." />
      {/* Add safety alert form here */}
    </div>
    <DialogFooter>
      <Button onClick={() => setShowSafetyAlertModal(false)}>
        Submit Alert
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* DPR Modal */}
      {showDPRModal && (
        <DPRModal onClose={() => setShowDPRModal(false)} />
      )}
    </div>
  );
};

export default Projects;