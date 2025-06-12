import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { DataTable } from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  HardHat,
  Calendar,
  Package,
  AlertTriangle,
  Upload,
  FileText,
  Plus,
  Edit,
  DollarSign,
  Warehouse,
  Clock,
  Users,
  Truck,
  CheckCircle2,
  Banknote,
  Receipt,
  Building2,
  Briefcase,
} from "lucide-react";
import { issuesData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
interface StockAlert {
  id: number;
  item: string;
  quantity: string;
  reorderPoint: string;
  status: string;
}

interface MaterialMovement {
  id: number;
  type: "Inbound" | "Outbound";
  material: string;
  quantity: string;
  time: string;
  site: string;
}

interface StorageSection {
  id: number;
  zone: string;
  occupancy: number;
  type: string;
}
interface StockAlert {
  id: number;
  item: string;
  quantity: string;
  reorderPoint: string;
  status: string;
}

interface MaterialMovement {
  id: number;
  type: "Inbound" | "Outbound";
  material: string;
  quantity: string;
  time: string;
  site: string;
}

interface StorageSection {
  id: number;
  zone: string;
  occupancy: number;
  type: string;
}

const progressData = [
  { week: "W1", planned: 15, actual: 12 },
  { week: "W2", planned: 20, actual: 18 },
  { week: "W3", planned: 25, actual: 24 },
  { week: "W4", planned: 18, actual: 16 },
];

const materialUsageData = [
  { material: "Cement", requested: 200, used: 185 },
  { material: "Steel", requested: 1500, used: 1450 },
  { material: "Bricks", requested: 5000, used: 4800 },
  { material: "Sand", requested: 50, used: 48 },
];

// Cost Data
const costData = [
  { category: "Productive Labor", planned: 175000, actual: 190000 },
  { category: "Non-Productive Labor", planned: 75000, actual: 85000 },
  { category: "Materials", planned: 450000, actual: 425000 },
  { category: "Equipment", planned: 180000, actual: 195000 },
  { category: "Overhead", planned: 120000, actual: 115000 },
];

const laborData = [
  // Productive Labor
  { trade: "Electricians", planned: 450, actual: 420, type: "productive" },
  { trade: "Plumbers", planned: 380, actual: 400, type: "productive" },
  { trade: "Carpenters", planned: 520, actual: 480, type: "productive" },
  { trade: "Masons", planned: 600, actual: 580, type: "productive" },
  // Non-Productive Labor
  { trade: "Site Supervision", planned: 200, actual: 210, type: "non-productive" },
  { trade: "Safety Officers", planned: 160, actual: 170, type: "non-productive" },
  { trade: "Material Handlers", planned: 240, actual: 250, type: "non-productive" },
  { trade: "Quality Control", planned: 180, actual: 190, type: "non-productive" },
];

const purchaseOrdersData = [
  {
    id: "PO-2024-001",
    vendor: "Steel Corp Ltd",
    amount: 125000,
    status: "Pending",
    approver: "Bob Smith",
    timeInQueue: "48hrs",
  },
  {
    id: "PO-2024-002",
    vendor: "Cement Industries",
    amount: 85000,
    status: "Approved",
    approver: "Alice Johnson",
    timeInQueue: "24hrs",
  },
  {
    id: "PO-2024-003",
    vendor: "Hardware Solutions",
    amount: 35000,
    status: "In Review",
    approver: "Charlie Brown",
    timeInQueue: "12hrs",
  },
  {
    id: "PO-2024-004",
    vendor: "Equipment Rentals",
    amount: 75000,
    status: "Escalated",
    approver: "David Wilson",
    timeInQueue: "72hrs",
  },
];

const equipmentData = [
  {
    id: "EQ-001",
    name: "Generator Set",
    hours: 250,
    nextService: "50hrs",
    status: "Active",
  },
  {
    id: "EQ-002",
    name: "Scissor Lift",
    hours: 180,
    nextService: "20hrs",
    status: "Maintenance Due",
  },
  {
    id: "EQ-003",
    name: "Concrete Mixer",
    hours: 420,
    nextService: "Due Now",
    status: "Warning",
  },
  {
    id: "EQ-004",
    name: "Tower Crane",
    hours: 150,
    nextService: "100hrs",
    status: "Active",
  },
];

type PurchaseOrder = (typeof purchaseOrdersData)[0];
type Equipment = (typeof equipmentData)[0];

const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "id",
    header: "PO Number",
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return `₹${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Approved"
          ? "default"
          : status === "Pending"
          ? "secondary"
          : status === "Escalated"
          ? "destructive"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "approver",
    header: "Next Approver",
  },
  {
    accessorKey: "timeInQueue",
    header: "Time in Queue",
  },
];

const equipmentColumns: ColumnDef<Equipment>[] = [
  {
    accessorKey: "id",
    header: "Equipment ID",
  },
  {
    accessorKey: "name",
    header: "Equipment Name",
  },
  {
    accessorKey: "hours",
    header: "Hours Used",
  },
  {
    accessorKey: "nextService",
    header: "Next Service",
    cell: ({ row }) => {
      const nextService = row.getValue("nextService") as string;
      return (
        <Badge variant={nextService === "Due Now" ? "destructive" : "outline"}>
          {nextService}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Active"
          ? "default"
          : status === "Warning"
          ? "destructive"
          : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

type Task = {
  id: string;
  name: string;
  project: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  status: string;
  progress: number;
  phase: string;
  // dependencies: string[];
};

type Issue = (typeof issuesData)[0] & {
  escalated?: boolean;
  location?: string;
  impact?: string;
};

const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: "Task Name",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Completed"
          ? "default"
          : status === "In Progress"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      return (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs">{progress}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phase",
    header: "Phase",
    cell: ({ row }) => {
      const phase = row.getValue("phase") as string;
      return <Badge variant="outline">{phase}</Badge>;
    },
  },
];

const issueColumns: ColumnDef<Issue>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant="outline">{type}</Badge>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
      const variant =
        severity === "High"
          ? "destructive"
          : severity === "Medium"
          ? "default"
          : "secondary";
      return <Badge variant={variant}>{severity}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Resolved"
          ? "default"
          : status === "In Progress"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const SiteDashboard = () => {
  // Modal states
  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);
  const [isWPRModalOpen, setIsWPRModalOpen] = useState(false);
  const [isMaterialRequestModalOpen, setIsMaterialRequestModalOpen] =
    useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [isLaborDetailsModalOpen, setIsLaborDetailsModalOpen] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<
    (typeof laborData)[0] | null
  >(null);
  const [isBudgetAdjustModalOpen, setIsBudgetAdjustModalOpen] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState("");
  const [isPOViewModalOpen, setIsPOViewModalOpen] = useState(false);
  const [isPOApproveModalOpen, setIsPOApproveModalOpen] = useState(false);
  const [isPOExpediteModalOpen, setIsPOExpediteModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEquipmentLogsModalOpen, setIsEquipmentLogsModalOpen] =
    useState(false);
  const [isEquipmentTrackingModalOpen, setIsEquipmentTrackingModalOpen] =
    useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<
    (typeof equipmentData)[0] | null
  >(null);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    type: string;
    date: string;
    weather: string;
    photos: number;
    escalated: boolean;
  } | null>(null);
  const [isViewIssueModalOpen, setIsViewIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [storeStaff, setStoreStaff] = useState([
    { name: 'John Doe', role: 'Store Manager', status: 'On Duty', availability: 'Full-time', experience: '5 years', certifications: ['Inventory Management', 'Supply Chain'] },
    { name: 'Jane Smith', role: 'Assistant Manager', status: 'On Duty', availability: 'Full-time', experience: '3 years', certifications: ['Material Handling', 'RFID Systems'] },
    { name: 'Mike Johnson', role: 'Inventory Clerk', status: 'Off Duty', availability: 'Part-time', experience: '2 years', certifications: ['Basic Inventory'] },
  ]);
  const [issues, setIssues] = useState(
    issuesData.map((issue, index) => ({
      ...issue,
      location:
        index === 0
          ? "North Block, Level 2"
          : index === 1
          ? "South Tower Foundation"
          : "Main Building, East Wing",
      impact:
        index === 0
          ? "High - Work Stoppage"
          : index === 1
          ? "Medium - Quality Concern"
          : "Low - Schedule Impact",
    }))
  );
  const [equipmentLogs] = useState([
    {
      date: "2024-01-20",
      type: "Maintenance",
      hours: 8,
      operator: "John Smith",
      notes: "Routine service completed",
    },
    {
      date: "2024-01-18",
      type: "Operation",
      hours: 12,
      operator: "Mike Johnson",
      notes: "Used for foundation work",
    },
    {
      date: "2024-01-15",
      type: "Repair",
      hours: 4,
      operator: "Tech Team",
      notes: "Fixed hydraulic leak",
    },
    {
      date: "2024-01-12",
      type: "Operation",
      hours: 10,
      operator: "Mike Johnson",
      notes: "Site clearing work",
    },
  ]);
  const [equipmentLocations] = useState([
    {
      timestamp: "09:00 AM",
      area: "North Block",
      status: "Active",
      operator: "John Smith",
    },
    {
      timestamp: "10:30 AM",
      area: "Storage Yard",
      status: "Maintenance",
      operator: "Tech Team",
    },
    {
      timestamp: "12:00 PM",
      area: "South Block",
      status: "Active",
      operator: "Mike Johnson",
    },
    {
      timestamp: "02:30 PM",
      area: "Material Yard",
      status: "Idle",
      operator: "John Smith",
    },
  ]);
  const [stockAlerts] = useState<StockAlert[]>([
    { id: 1, item: "Cement", quantity: "50 bags", reorderPoint: "100 bags", status: "Low Stock" },
    { id: 2, item: "Steel Bars (12mm)", quantity: "2.5 tons", reorderPoint: "5 tons", status: "Low Stock" },
    { id: 3, item: "Bricks", quantity: "850 pcs", reorderPoint: "1000 pcs", status: "Reorder" }
  ]);

  const [materialMovements] = useState<MaterialMovement[]>([
    { id: 1, type: "Outbound", material: "Ready Mix Concrete", quantity: "18 mÂ³", time: "2 hours ago", site: "Block A" },
    { id: 2, type: "Inbound", material: "Steel Reinforcement", quantity: "5 tons", time: "5 hours ago", site: "Central Store" },
    { id: 3, type: "Outbound", material: "Shuttering Plates", quantity: "45 pcs", time: "8 hours ago", site: "Block B" }
  ]);

  const [storageSections] = useState<StorageSection[]>([
    { id: 1, zone: "Zone A", occupancy: 85, type: "Heavy Materials" },
    { id: 2, zone: "Zone B", occupancy: 65, type: "Finishing Items" },
    { id: 3, zone: "Zone C", occupancy: 92, type: "Tools & Equipment" },
    { id: 4, zone: "Zone D", occupancy: 45, type: "Electrical & Plumbing" }
  ]);

  // Data states
  const [purchaseOrders, setPurchaseOrders] = useState(purchaseOrdersData);
  const [equipmentList, setEquipmentList] = useState(equipmentData);
  const [laborHours, setLaborHours] = useState(laborData);
  const [budget, setBudget] = useState(costData);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TASK-1",
      name: "Foundation Work",
      project: "Main Building",
      assignedTo: "John Doe",
      startDate: "2024-01-01",
      dueDate: "2024-01-15",
      status: "Completed",
      progress: 100,
      phase: "Foundation",
      // dependencies: [],
    },
    {
      id: "TASK-2",
      name: "Steel Structure",
      project: "Main Building",
      assignedTo: "Jane Smith",
      startDate: "2024-01-16",
      dueDate: "2024-02-15",
      status: "In Progress",
      progress: 75,
      phase: "Structure",
      // dependencies: ["TASK-1"],
    },
    {
      id: "TASK-3",
      name: "Roofing Installation",
      project: "Main Building",
      assignedTo: "Mike Johnson",
      startDate: "2024-02-01",
      dueDate: "2024-02-28",
      status: "In Progress",
      progress: 45,
      phase: "Roofing",
      // dependencies: ["TASK-2"],
    },
    {
      id: "TASK-4",
      name: "Interior Finishing",
      project: "Main Building",
      assignedTo: "Sarah Wilson",
      startDate: "2024-02-20",
      dueDate: "2024-03-20",
      status: "Not Started",
      progress: 0,
      phase: "Finishing",
      // dependencies: ["TASK-3"],
    },
  ]);
  const [progressStats, setProgressStats] = useState({
    activeTasks: 24,
    completedThisWeek: 18,
    onSchedule: 85,
    resourceUtilization: 92,
  });
  const [weeklyProgress, setWeeklyProgress] = useState(progressData);
  const [projectPhases, setProjectPhases] = useState([
    {
      phase: "Foundation",
      progress: 100,
      start: "2024-01-01",
      end: "2024-01-15",
    },
    {
      phase: "Structure",
      progress: 75,
      start: "2024-01-16",
      end: "2024-02-15",
    },
    { phase: "Roofing", progress: 45, start: "2024-02-01", end: "2024-02-28" },
    { phase: "Finishing", progress: 0, start: "2024-02-20", end: "2024-03-20" },
  ]);

  // Progress Update Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Add these new state variables after the other useState declarations
  const [materialRequests, setMaterialRequests] = useState([
    {
      id: "REQ001",
      item: "Steel TMT Bars",
      quantity: "500 kg",
      status: "Approved",
      requestDate: "2024-01-18",
      expectedDelivery: "2024-01-22",
    },
    {
      id: "REQ002",
      item: "Cement Bags",
      quantity: "100 bags",
      status: "Pending",
      requestDate: "2024-01-19",
      expectedDelivery: "2024-01-23",
    },
    {
      id: "REQ003",
      item: "Electrical Cables",
      quantity: "200 m",
      status: "In Transit",
      requestDate: "2024-01-17",
      expectedDelivery: "2024-01-21",
    },
  ]);
  const [materialStats, setMaterialStats] = useState({
    pendingRequests: 8,
    receivedToday: 12,
    utilizationRate: 94,
  });
  const [materialUsage, setMaterialUsage] = useState(materialUsageData);

  // Task Management Functions
  const handleViewGantt = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      toast.info(`Viewing Gantt chart for: ${task.name}`, {
        description: `Start: ${task.startDate} - End: ${task.dueDate}`,
        duration: 3000,
      });
    }
  };

  // const handleViewDependencies = (taskId: string) => {
  //   const task = tasks.find((t) => t.id === taskId);
  //   if (task) {
  //     toast.info(`Dependencies for: ${task.name}`, {
  //       description: `Predecessor Tasks: ${
  //         task.dependencies?.join(", ") || "None"
  //       }`,
  //       duration: 3000,
  //     });
  //   }
  // };

  const handleUpdateProgress = (formData: {
    taskId: string;
    progress: number;
    notes: string;
  }) => {
    // Update task progress
    const updatedTasks = tasks.map((task) =>
      task.id === formData.taskId
        ? {
            ...task,
            progress: formData.progress,
            status:
              formData.progress === 100
                ? "Completed"
                : formData.progress > 0
                ? "In Progress"
                : "Not Started",
          }
        : task
    );
    setTasks(updatedTasks);

    // Update progress stats
    const completedTasks = updatedTasks.filter(
      (t) => t.status === "Completed"
    ).length;
    const activeTasks = updatedTasks.filter(
      (t) => t.status === "In Progress"
    ).length;
    setProgressStats((prev) => ({
      ...prev,
      activeTasks,
      completedThisWeek: completedTasks,
      onSchedule: Math.round((completedTasks / updatedTasks.length) * 100),
    }));

    // Update weekly progress
    const currentWeek = weeklyProgress[weeklyProgress.length - 1];
    setWeeklyProgress((prev) => [
      ...prev.slice(0, -1),
      {
        ...currentWeek,
        actual: Math.round((completedTasks / updatedTasks.length) * 100),
      },
    ]);

    // Update project phases
    const updatedPhases = projectPhases.map((phase) => {
      const phaseTasks = updatedTasks.filter((t) => t.phase === phase.phase);
      if (phaseTasks.length > 0) {
        const phaseProgress = Math.round(
          phaseTasks.reduce((acc, task) => acc + task.progress, 0) /
            phaseTasks.length
        );
        return { ...phase, progress: phaseProgress };
      }
      return phase;
    });
    setProjectPhases(updatedPhases);

    toast.success("Progress updated successfully!");
    setIsProgressModalOpen(false);
  };

  // Progress Update Modal
  const openProgressModal = (task: Task) => {
    setSelectedTask(task);
    setCurrentProgress(task.progress);
    setIsProgressModalOpen(true);
  };

  const handlePOView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsPOViewModalOpen(true);
  };

  const handlePOApprove = (
    po: PurchaseOrder,
    formData: {
      comments: string;
      conditions?: string;
    }
  ) => {
    const updatedPOs = purchaseOrders.map((p) =>
      p.id === po.id
        ? {
            ...p,
            status: "Approved",
            approver: "Finance Head",
            timeInQueue: "0hrs",
          }
        : p
    );
    setPurchaseOrders(updatedPOs);
    toast.success(`Purchase Order ${po.id} approved with comments`);
    setIsPOApproveModalOpen(false);
  };

  const handlePOExpedite = (
    po: PurchaseOrder,
    formData: {
      priority: "high" | "urgent";
      reason: string;
      escalateTo: string;
    }
  ) => {
    const updatedPOs = purchaseOrders.map((p) =>
      p.id === po.id
        ? {
            ...p,
            status: "In Review",
            approver: formData.escalateTo,
            timeInQueue: "0hrs",
          }
        : p
    );
    setPurchaseOrders(updatedPOs);
    toast.success(
      `Purchase Order ${po.id} expedited to ${formData.escalateTo}`
    );
    setIsPOExpediteModalOpen(false);
  };

  const handleCreatePO = (formData: {
    vendor: string;
    amount: number;
    description: string;
    priority: string;
  }) => {
    const newPO = {
      id: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
      vendor: formData.vendor,
      amount: formData.amount,
      status: "Pending",
      approver: "Bob Smith",
      timeInQueue: "0hrs",
    };
    setPurchaseOrders([...purchaseOrders, newPO]);
    toast.success("Purchase order created successfully!");
    setIsPOModalOpen(false);
  };

  const handleEquipmentMaintenance = (formData: {
    equipmentId: string;
    maintenanceType: string;
    notes: string;
    nextService: number;
  }) => {
    const updatedEquipment = equipmentList.map((eq) =>
      eq.id === formData.equipmentId
        ? {
            ...eq,
            status: "Active",
            nextService: `${formData.nextService}hrs`,
            hours: eq.hours,
          }
        : eq
    );
    setEquipmentList(updatedEquipment);
    toast.success("Equipment maintenance logged successfully!");
    setIsEquipmentModalOpen(false);
  };

  const handleLaborHours = (formData: {
    trade: string;
    workers: number;
    hours: number;
    overtime: number;
  }) => {
    const updatedLabor = laborHours.map((l) =>
      l.trade === formData.trade
        ? {
            ...l,
            actual: l.actual + formData.hours + formData.overtime,
          }
        : l
    );
    setLaborHours(updatedLabor);
    toast.success("Labor hours logged successfully!");
    setIsLaborModalOpen(false);
  };

  const handleBudgetAdjustment = (formData: {
    category: string;
    adjustmentType: "increase" | "decrease";
    amount: number;
    reason: string;
    effectiveDate: string;
    approver: string;
  }) => {
    const updatedBudget = budget.map((b) =>
      b.category === formData.category
        ? {
            ...b,
            planned:
              formData.adjustmentType === "increase"
                ? b.planned + formData.amount
                : b.planned - formData.amount,
          }
        : b
    );
    setBudget(updatedBudget);
    toast.success(
      `Budget ${
        formData.adjustmentType
      }d by ₹${formData.amount.toLocaleString()} for ${formData.category}`
    );
    setIsBudgetAdjustModalOpen(false);
  };

  const handleUploadDPR = (formData: {
    workDone: string;
    weather: string;
    photos: FileList;
    notes: string;
  }) => {
    toast.success("DPR uploaded successfully!");
    setIsDPRModalOpen(false);
  };

  const handleUploadWPR = (formData: {
    weekEnding: string;
    milestones: string;
    teamPerformance: string;
  }) => {
    toast.success("WPR uploaded successfully!");
    setIsWPRModalOpen(false);
  };

  const handleRaiseMaterialRequest = (formData: {
    materialItem: string;
    quantity: string;
    priority: string;
    useCase: string;
  }) => {
    const newRequest = {
      id: `REQ${String(materialRequests.length + 1).padStart(3, "0")}`,
      item: formData.materialItem,
      quantity: formData.quantity,
      status: "Pending",
      requestDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };

    setMaterialRequests((prev) => [...prev, newRequest]);
    setMaterialStats((prev) => ({
      ...prev,
      pendingRequests: prev.pendingRequests + 1,
    }));

    toast.success("Material request raised successfully!");
    setIsMaterialRequestModalOpen(false);
  };

  const handleAddIssue = (formData: {
    category: string;
    description: string;
    severity: string;
    responsibleParty: string;
  }) => {
    toast.success("Issue logged successfully!");
    setIsIssueModalOpen(false);
  };

  const handleAddTask = (formData: {
    name: string;
    project: string;
    assignedTo: string;
    startDate: string;
    dueDate: string;
    phase: string;
    // dependencies: string[];
  }) => {
    const newTask: Task = {
      id: `TASK-${tasks.length + 1}`,
      ...formData,
      status: "Not Started",
      progress: 0,
    };

    setTasks((prev) => [...prev, newTask]);

    // Update progress stats
    setProgressStats((prev) => ({
      ...prev,
      activeTasks: prev.activeTasks + 1,
    }));

    // Update project phases
    const updatedPhases = projectPhases.map((phase) => {
      if (phase.phase === formData.phase) {
        const phaseTasks = [...tasks, newTask].filter(
          (t) => t.phase === phase.phase
        );
        const phaseProgress = Math.round(
          phaseTasks.reduce((acc, task) => acc + task.progress, 0) /
            phaseTasks.length
        );
        return { ...phase, progress: phaseProgress };
      }
      return phase;
    });
    setProjectPhases(updatedPhases);

    toast.success("New task added successfully!");
    setIsAddTaskModalOpen(false);
  };

  // Add new functions for material request actions
  const handleTrackRequest = (requestId: string) => {
    const request = materialRequests.find((r) => r.id === requestId);
    if (request) {
      toast.info(`Tracking ${requestId}`, {
        description: `Status: ${request.status}\nExpected Delivery: ${request.expectedDelivery}`,
        duration: 3000,
      });
    }
  };

  const handleRemindRequest = (requestId: string) => {
    const updatedRequests = materialRequests.map((r) =>
      r.id === requestId ? { ...r, status: "Expedited" } : r
    );
    setMaterialRequests(updatedRequests);
    toast.success(`Reminder sent for ${requestId}`);
  };

  const handleReceiveMaterial = (material: string) => {
    // Update material usage data
    const updatedUsage = materialUsage.map((m) =>
      m.material === material
        ? {
            ...m,
            used:
              m.used +
              (m.material === "Cement"
                ? 10
                : m.material === "Steel"
                ? 100
                : 20),
          }
        : m
    );
    setMaterialUsage(updatedUsage);

    // Update stats
    setMaterialStats((prev) => ({
      ...prev,
      receivedToday: prev.receivedToday + 1,
      utilizationRate: Math.min(100, prev.utilizationRate + 1),
    }));

    toast.success(`${material} received and logged`);
  };

  const handleViewLaborDetails = (trade: string) => {
    const laborDetails = laborData.find((l) => l.trade === trade);
    if (laborDetails) {
      setSelectedLabor(laborDetails);
      setIsLaborDetailsModalOpen(true);
    }
  };

  const handleViewEquipmentLogs = (equipment: (typeof equipmentData)[0]) => {
    setSelectedEquipment(equipment);
    setIsEquipmentLogsModalOpen(true);
  };

  const handleTrackEquipment = (equipment: (typeof equipmentData)[0]) => {
    setSelectedEquipment(equipment);
    setIsEquipmentTrackingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Site Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            On-site operations and progress tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDPRModalOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload DPR
          </Button>
          <Button
            onClick={() => setIsWPRModalOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload WPR
          </Button>
        </div>
      </div>
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="timeline">Execution Timeline</TabsTrigger>
          <TabsTrigger value="reports">Daily & Weekly Reports</TabsTrigger>
          <TabsTrigger value="materials">Material Flow</TabsTrigger>
          <TabsTrigger value="issues">Issue Tracker</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="store-manager">Store Manager</TabsTrigger>
          <TabsTrigger value="central-warehouse">Central Warehouse</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Tasks"
              value={progressStats.activeTasks.toString()}
              icon={Calendar}
              description="Currently in progress"
              onClick={() => {
                const active = tasks.filter((t) => t.status === "In Progress");
                toast.info(`${active.length} tasks in progress`, {
                  description: active.map((t) => t.name).join(", "),
                  duration: 3000,
                });
              }}
            />
            <StatCard
              title="Completed This Week"
              value={progressStats.completedThisWeek.toString()}
              icon={HardHat}
              description="Tasks finished"
              trend={{ value: 12, label: "vs last week" }}
              onClick={() => {
                const completed = tasks.filter((t) => t.status === "Completed");
                toast.info(`${completed.length} tasks completed`, {
                  description: completed.map((t) => t.name).join(", "),
                  duration: 3000,
                });
              }}
            />
            <StatCard
              title="On Schedule"
              value={`${progressStats.onSchedule}%`}
              icon={Calendar}
              description="Timeline adherence"
              onClick={() => {
                const delayed = tasks.filter(
                  (t) => new Date(t.dueDate) < new Date() && t.progress < 100
                );
                toast.info(`Schedule Analysis`, {
                  description: `${delayed.length} tasks delayed: ${delayed
                    .map((t) => t.name)
                    .join(", ")}`,
                  duration: 3000,
                });
              }}
            />
            <StatCard
              title="Resource Utilization"
              value={`${progressStats.resourceUtilization}%`}
              icon={HardHat}
              description="Team efficiency"
              onClick={() => {
                toast.info("Resource Metrics", {
                  description:
                    "Team efficiency based on completed vs planned work hours",
                  duration: 3000,
                });
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress vs Plan</CardTitle>
                <CardDescription>Weekly execution tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned" fill="#3b82f6" />
                    <Bar dataKey="actual" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Gantt View</CardTitle>
                <CardDescription>Timeline visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectPhases.map((phase) => (
                    <div key={phase.phase} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{phase.phase}</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${phase.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{phase.start}</span>
                        <span>{phase.end}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Current task assignments and progress
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
                <Button
                  onClick={() => {
                    const task = tasks[0];
                    openProgressModal(task);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Update Progress
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  ...taskColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewGantt(row.original.id)}
                        >
                          Gantt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewDependencies(row.original.id)
                          }
                        >
                          Dependencies
                        </Button> */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProgressModal(row.original)}
                        >
                          Update
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={tasks}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="DPRs Submitted"
              value="28"
              icon={FileText}
              description="This month"
              onClick={() => toast.info("Viewing DPR history")}
            />
            <StatCard
              title="WPRs Completed"
              value="7"
              icon={Calendar}
              description="This month"
              onClick={() => toast.info("Viewing WPR history")}
            />
            <StatCard
              title="Average Score"
              value="4.2/5"
              icon={HardHat}
              description="Report quality"
              onClick={() => toast.info("Viewing quality metrics")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Upload Panel</CardTitle>
              <CardDescription>
                Submit daily and weekly progress reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">
                    Daily Progress Report (DPR)
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Upload today's work progress, photos, and notes
                    </div>
                    <Button
                      onClick={() => setIsDPRModalOpen(true)}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload DPR
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">
                    Weekly Progress Report (WPR)
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Submit weekly milestone progress and team performance
                    </div>
                    <Button
                      onClick={() => setIsWPRModalOpen(true)}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Upload WPR
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously submitted reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "DPR",
                    date: "2024-01-20",
                    weather: "Clear",
                    photos: 8,
                    escalated: false,
                  },
                  {
                    type: "WPR",
                    date: "2024-01-19",
                    weather: "Rain",
                    photos: 12,
                    escalated: false,
                  },
                  {
                    type: "DPR",
                    date: "2024-01-18",
                    weather: "Clear",
                    photos: 6,
                    escalated: true,
                  },
                  {
                    type: "DPR",
                    date: "2024-01-17",
                    weather: "Wind",
                    photos: 10,
                    escalated: false,
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="font-medium">{report.date}</span>
                        <Badge variant="secondary">{report.weather}</Badge>
                        {report.escalated && (
                          <Badge variant="destructive">Escalated</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.photos} photos attached
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsViewReportModalOpen(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info(
                            `Downloading ${report.type} from ${report.date}`
                          )
                        }
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Requests"
              value={materialStats.pendingRequests.toString()}
              icon={Package}
              description="Material requests"
              onClick={() => {
                const pending = materialRequests.filter(
                  (r) => r.status === "Pending"
                );
                toast.info(`${pending.length} pending requests`, {
                  description: pending
                    .map((r) => `${r.item} (${r.quantity})`)
                    .join("\n"),
                  duration: 3000,
                });
              }}
            />
            <StatCard
              title="Received Today"
              value={materialStats.receivedToday.toString()}
              icon={Package}
              description="Material deliveries"
              onClick={() => {
                toast.info("Today's deliveries", {
                  description: "Click on material items to log new deliveries",
                  duration: 3000,
                });
              }}
            />
            <StatCard
              title="Utilization Rate"
              value={`${materialStats.utilizationRate}%`}
              icon={Package}
              description="Material efficiency"
              onClick={() => {
                toast.info("Material efficiency", {
                  description: "Based on planned vs actual usage",
                  duration: 3000,
                });
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Material Usage vs Request</CardTitle>
              <CardDescription>
                Consumption tracking and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={materialUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requested" fill="#3b82f6" />
                  <Bar dataKey="used" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {materialUsage.map((material) => (
                  <Button
                    key={material.material}
                    variant="outline"
                    className="w-full"
                    onClick={() => handleReceiveMaterial(material.material)}
                  >
                    Log {material.material} Delivery
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Material Requests</CardTitle>
                <CardDescription>
                  Current and pending material requirements
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsMaterialRequestModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Raise Request
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materialRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{request.id}</h3>
                        <Badge
                          variant={
                            request.status === "Approved"
                              ? "default"
                              : request.status === "In Transit"
                              ? "secondary"
                              : request.status === "Expedited"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.item} • {request.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {request.requestDate} • Expected:{" "}
                        {request.expectedDelivery}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackRequest(request.id)}
                      >
                        Track
                      </Button>
                      {request.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemindRequest(request.id)}
                        >
                          Remind
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Open Issues"
              value="12"
              icon={AlertTriangle}
              description="Requiring attention"
              onClick={() => toast.info("Viewing open issues")}
            />
            <StatCard
              title="High Priority"
              value="3"
              icon={AlertTriangle}
              description="Critical issues"
              onClick={() => toast.info("Viewing critical issues")}
            />
            <StatCard
              title="Resolved This Week"
              value="8"
              icon={HardHat}
              description="Issues fixed"
              onClick={() => toast.info("Viewing resolution metrics")}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Site Issue Tracker</CardTitle>
                <CardDescription>
                  Safety, quality, and operational issues
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsIssueModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Issue
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  ...issueColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(row.original);
                            setIsViewIssueModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIssues((prevIssues) =>
                              prevIssues.map((issue) =>
                                issue.id === row.original.id
                                  ? { ...issue, status: "Resolved" }
                                  : issue
                              )
                            );
                            toast.success(
                              `${row.original.id} marked as resolved`
                            );
                          }}
                        >
                          Resolve
                        </Button>
                        {/* {row.original.severity === "High" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIssues((prevIssues) =>
                                prevIssues.map((issue) =>
                                  issue.id === row.original.id
                                    ? { ...issue, escalated: true }
                                    : issue
                                )
                              );
                              toast.info(`Escalating ${row.original.id}`);
                            }}
                          >
                            Escalate
                          </Button>
                        )} */}
                      </div>
                    ),
                  },
                ]}
                data={issues}
                searchKey="description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Heatmap</CardTitle>
              <CardDescription>
                Issue severity and impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {["Low", "Medium", "High"].map((severity) => (
                  <div key={severity} className="space-y-2">
                    <h3 className="font-medium text-center">
                      {severity} Severity
                    </h3>
                    {["Schedule", "Cost", "Safety"].map((impact) => (
                      <div
                        key={impact}
                        className={`p-4 rounded-lg text-center cursor-pointer transition-colors ${
                          severity === "High"
                            ? "bg-red-100 hover:bg-red-200"
                            : severity === "Medium"
                            ? "bg-yellow-100 hover:bg-yellow-200"
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                        onClick={() =>
                          toast.info(
                            `Viewing ${severity} severity ${impact} issues`
                          )
                        }
                      >
                        <div className="font-medium">{impact}</div>
                        <div className="text-sm text-muted-foreground">
                          {severity === "High"
                            ? "3"
                            : severity === "Medium"
                            ? "2"
                            : "1"}{" "}
                          issues
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Cost"
              value="₹1,250,000"
              icon={DollarSign}
              description="Projected vs Actual"
              trend={{ value: -2.5, label: "vs budget" }}
              onClick={() => toast.info("Viewing cost analysis")}
            />
            <StatCard
              title="Labor Utilization"
              value="92%"
              icon={Users}
              description="Team efficiency"
              trend={{ value: 3, label: "vs last week" }}
              onClick={() => toast.info("Viewing labor metrics")}
            />
            <StatCard
              title="Equipment Utilization"
              value="85%"
              icon={Truck}
              description="Equipment efficiency"
              trend={{ value: -1, label: "vs target" }}
              onClick={() => toast.info("Viewing equipment metrics")}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Budget vs. Actual Matrix</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.info("Exporting cost report")}
                >
                  Export Report
                </Button>
                <Button onClick={() => setIsBudgetAdjustModalOpen(true)}>
                  Adjust Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4">
                  {costData.map((item) => (
                    <div key={item.category} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.category}</h3>
                        <Badge
                          variant={
                            item.actual > item.planned
                              ? "destructive"
                              : "default"
                          }
                        >
                          {item.actual > item.planned
                            ? "Over Budget"
                            : "Under Budget"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Planned: ₹{item.planned.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Actual: ₹{item.actual.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium">
                          Variance:{" "}
                          {(
                            ((item.actual - item.planned) / item.planned) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Labor Cost Dashboard</CardTitle>
                  <CardDescription>Productive vs Non-Productive Labor</CardDescription>
                </div>
                <Button onClick={() => setIsLaborModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Hours
                </Button>
              </CardHeader>
              <CardContent>
                {/* Productive Labor Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                    Productive Labor
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={laborData.filter(item => item.type === "productive")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trade" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="planned"
                        fill="#3b82f6"
                        name="Planned Hours"
                      />
                      <Bar dataKey="actual" fill="#10b981" name="Actual Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-2">
                    {laborData.filter(item => item.type === "productive").map((item) => (
                      <div
                        key={item.trade}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.trade}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.actual} / {item.planned} hours
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.actual > item.planned * 1.15 && (
                            <Badge variant="destructive">OT Alert</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLaborDetails(item.trade)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Non-Productive Labor Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                    Non-Productive Labor
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={laborData.filter(item => item.type === "non-productive")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trade" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="planned"
                        fill="#8b5cf6"
                        name="Planned Hours"
                      />
                      <Bar dataKey="actual" fill="#d946ef" name="Actual Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-2">
                    {laborData.filter(item => item.type === "non-productive").map((item) => (
                      <div
                        key={item.trade}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.trade}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.actual} / {item.planned} hours
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.actual > item.planned * 1.15 && (
                            <Badge variant="destructive">OT Alert</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLaborDetails(item.trade)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Equipment & Fleet Control</CardTitle>
                  <CardDescription>Maintenance and Utilization</CardDescription>
                </div>
                <Button onClick={() => setIsEquipmentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Maintenance
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentList.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.id}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.status === "Active"
                              ? "default"
                              : item.status === "Warning"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hours Used:</span>
                          <span>{item.hours}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Service:</span>
                          <Badge
                            variant={
                              item.nextService === "Due Now"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.nextService}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewEquipmentLogs(item)}
                          >
                            View Logs
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleTrackEquipment(item)}
                          >
                            Track Location
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchase Orders</CardTitle>
                <CardDescription>
                  Procurement & Approval Workflow
                </CardDescription>
              </div>
              <Button onClick={() => setIsPOModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create PO
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  ...purchaseOrderColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => {
                      const po = row.original;
                      const status = po.status;
                      return (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePOView(po)}
                          >
                            View
                          </Button>
                          {status === "Pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPO(po);
                                setIsPOApproveModalOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                          )}
                          {status === "Escalated" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPO(po);
                                setIsPOExpediteModalOpen(true);
                              }}
                            >
                              Expedite
                            </Button>
                          )}
                        </div>
                      );
                    },
                  },
                ]}
                data={purchaseOrders}
                searchKey="id"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store-manager" className="space-y-6">
          {/* Store Manager Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Active Personnel"
              value="24"
              icon={Package}
              description="Currently on duty"
              onClick={() => toast.info("Viewing personnel details")}
            />
            <StatCard
              title="Store Performance"
              value="94%"
              icon={CheckCircle2}
              description="Fulfillment rate"
              onClick={() => toast.info("Viewing performance metrics")}
            />
            <StatCard
              title="Pending Actions"
              value="12"
              icon={Clock}
              description="Need attention"
              onClick={() => toast.info("Viewing pending actions")}
            />
            <StatCard
              title="Active Sites"
              value="8"
              icon={Building2}
              description="Receiving supplies"
              onClick={() => toast.info("Viewing active sites")}
            />
          </div>

          {/* Store Manager Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff Management */}
            <Card>
              <CardHeader>
                <CardTitle>Store Staff Management</CardTitle>
                <CardDescription>Manage store personnel and responsibilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storeStaff.map((staff, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{staff.name}</h3>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {staff.certifications.map((cert, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={staff.status === 'On Duty' ? 'default' : 'secondary'}>
                            {staff.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show confirmation dialog using toast
                              toast.promise(
                                new Promise((resolve) => {
                                  // Simulate a brief delay for visual feedback
                                  setTimeout(() => {
                                    // Remove the staff member
                                    setStoreStaff(prevStaff => 
                                      prevStaff.filter((_, i) => i !== index)
                                    );
                                    resolve(true);
                                  }, 300);
                                }),
                                {
                                  loading: 'Removing staff member...',
                                  success: `${staff.name} has been removed from the staff list`,
                                  error: 'Failed to remove staff member'
                                }
                              );
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                        <div>Availability: {staff.availability}</div>
                        <div>Experience: {staff.experience}</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => toast.info(`Scheduling ${staff.name}`, {
                            description: `Opening scheduler for ${staff.availability} staff member`
                          })}
                        >
                          Schedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => toast.info(`${staff.name}'s Performance Metrics`, {
                            description: `Viewing detailed performance history and metrics`
                          })}
                        >
                          Performance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setIsAddStaffModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Staff
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Store Performance Analytics</CardTitle>
                <CardDescription>Detailed performance metrics and indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Store Response Time</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Urgent Requests', value: 45, unit: 'minutes', target: 60, status: 'good' },
                        { label: 'Regular Requests', value: 4.5, unit: 'hours', target: 6, status: 'good' },
                        { label: 'Inter-site Transfers', value: 28, unit: 'hours', target: 24, status: 'warning' },
                      ].map((metric, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{metric.label}</span>
                            <span className={metric.status === 'good' ? 'text-green-600' : 'text-amber-600'}>
                              {metric.value} {metric.unit} (Target: {metric.target} {metric.unit})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${metric.status === 'good' ? 'bg-green-600' : 'bg-amber-600'}`}
                              style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Order Fulfillment Rate</h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={[
                        { month: 'Jan', rate: 92 },
                        { month: 'Feb', rate: 94 },
                        { month: 'Mar', rate: 91 },
                        { month: 'Apr', rate: 95 },
                        { month: 'May', rate: 97 },
                        { month: 'Jun', rate: 94 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[85, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rate" stroke="#10b981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.success("Report Generated", {
                      description: "Store performance report has been exported to Excel"
                    })}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Store Operations and Processes */}
          <Card>
            <CardHeader>
              <CardTitle>Store Operations & Process Management</CardTitle>
              <CardDescription>Standard operating procedures and workflow management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Process Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Goods Receiving', status: 'Optimized', efficiency: 92, lastReview: '2023-05-15', owner: 'Jane Smith', documents: 4 },
                    { name: 'Order Fulfillment', status: 'Under Review', efficiency: 78, lastReview: '2023-04-10', owner: 'Mike Johnson', documents: 6 },
                    { name: 'Quality Control', status: 'Optimized', efficiency: 95, lastReview: '2023-05-20', owner: 'John Doe', documents: 3 },
                    { name: 'Material Transfer', status: 'Needs Improvement', efficiency: 68, lastReview: '2023-03-25', owner: 'Jane Smith', documents: 5 },
                    { name: 'Returns Processing', status: 'Optimized', efficiency: 88, lastReview: '2023-05-05', owner: 'Mike Johnson', documents: 4 },
                    { name: 'Inventory Counting', status: 'Under Review', efficiency: 82, lastReview: '2023-04-15', owner: 'John Doe', documents: 7 }
                  ].map((process, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{process.name}</h3>
                        <Badge variant={
                          process.status === 'Optimized' ? 'default' :
                          process.status === 'Under Review' ? 'outline' : 'destructive'
                        }>
                          {process.status}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Process Efficiency</span>
                          <span className={
                            process.efficiency > 85 ? 'text-green-600' :
                            process.efficiency > 70 ? 'text-amber-600' : 'text-red-600'
                          }>
                            {process.efficiency}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              process.efficiency > 85 ? 'bg-green-600' :
                              process.efficiency > 70 ? 'bg-amber-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${process.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                        <div>Last Review: {process.lastReview}</div>
                        <div>Process Owner: {process.owner}</div>
                        <div>Documents: {process.documents}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => toast.info(`Managing ${process.name} Process`, {
                          description: `Opening process workflow editor with ${process.documents} associated documents`
                        })}
                      >
                        Manage Process
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Process Improvement Initiatives */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Active Process Improvement Initiatives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Digital Receiving Implementation', completion: 65, dueDate: '2023-07-15', status: 'On Track', owner: 'Jane Smith' },
                        { name: 'Barcode System Upgrade', completion: 40, dueDate: '2023-08-10', status: 'Delayed', owner: 'Mike Johnson' },
                        { name: 'Cross-Store Inventory Standardization', completion: 85, dueDate: '2023-06-30', status: 'On Track', owner: 'John Doe' }
                      ].map((initiative, idx) => (
                        <div key={idx} className="flex items-center p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{initiative.name}</h4>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-2">
                              <span>Due: {initiative.dueDate}</span>
                              <span>Owner: {initiative.owner}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${initiative.status === 'On Track' ? 'bg-green-600' : 'bg-amber-600'}`}
                                style={{ width: `${initiative.completion}%` }}
                              ></div>
                            </div>
                          </div>
                          <Badge variant={initiative.status === 'On Track' ? 'outline' : 'destructive'} className="ml-4">
                            {initiative.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {/* Store Compliance & Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Documentation Management</CardTitle>
              <CardDescription>Manage regulatory compliance and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { area: 'Safety & Hazmat', status: 'Compliant', lastAudit: '2023-05-10', nextAudit: '2023-08-10', documents: 12 },
                    { area: 'Environmental', status: 'Needs Review', lastAudit: '2023-04-15', nextAudit: '2023-07-15', documents: 8 },
                    { area: 'Quality Management', status: 'Compliant', lastAudit: '2023-05-20', nextAudit: '2023-08-20', documents: 15 },
                    { area: 'Inventory Controls', status: 'Compliant', lastAudit: '2023-05-05', nextAudit: '2023-08-05', documents: 10 }
                  ].map((area, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{area.area}</h3>
                        <Badge variant={area.status === 'Compliant' ? 'default' : 'destructive'}>
                          {area.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Last Audit: {area.lastAudit}</div>
                        <div>Next Audit: {area.nextAudit}</div>
                        <div>{area.documents} Documents</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => toast.info(`Viewing ${area.area} Documents`, {
                          description: `Opening document repository with ${area.documents} compliance documents`
                        })}
                      >
                        View Documents
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Recent Document Activity */}
                <div>
                  <h3 className="font-medium mb-3">Recent Document Activity</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'Update', document: 'Material Handling Procedure v2.3', user: 'John Doe', timestamp: '2 hours ago' },
                      { type: 'Upload', document: 'Q2 Safety Inspection Report', user: 'Jane Smith', timestamp: '5 hours ago' },
                      { type: 'Review', document: 'Hazardous Materials Storage Guidelines', user: 'Mike Johnson', timestamp: '1 day ago' },
                      { type: 'Update', document: 'Receiving Procedure v1.8', user: 'Jane Smith', timestamp: '2 days ago' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            activity.type === 'Update' ? 'bg-blue-500' :
                            activity.type === 'Upload' ? 'bg-green-500' : 'bg-amber-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm">{activity.document}</p>
                            <p className="text-xs text-muted-foreground">{activity.type} by {activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info("Upload New Document", {
                        description: "Opening document upload form"
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info("Document Repository", {
                        description: "Opening the complete document management system"
                      })}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document Repository
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status Overview</CardTitle>
              <CardDescription>Current stock levels and inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { category: 'Critical Materials', stockLevel: '92%', items: 35, value: '₹8.2M', trend: '+2%' },
                    { category: 'Regular Supplies', stockLevel: '78%', items: 120, value: '₹4.5M', trend: '-5%' },
                    { category: 'Consumables', stockLevel: '65%', items: 210, value: '₹2.3M', trend: '+1%' },
                    { category: 'Equipment & Tools', stockLevel: '88%', items: 65, value: '₹12.7M', trend: '0%' }
                  ].map((category, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h3 className="font-medium">{category.category}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Stock Level:</span>
                          <span className="font-medium">{category.stockLevel}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Items:</span>
                          <span>{category.items}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Value:</span>
                          <span>{category.value}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Trend:</span>
                          <span className={
                            category.trend.startsWith('+') ? 'text-green-600' : 
                            category.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                          }>{category.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Recent Stock Movements</h3>
                    <div className="space-y-2">
                      {[
                        { type: 'In', material: 'Steel Reinforcement', quantity: '2.5 tons', destination: 'North Block', timestamp: '3 hours ago' },
                        { type: 'Out', material: 'Portland Cement', quantity: '120 bags', destination: 'South Tower', timestamp: '5 hours ago' },
                        { type: 'In', material: 'PVC Pipes', quantity: '350 units', destination: 'Main Warehouse', timestamp: '1 day ago' },
                        { type: 'Out', material: 'Electrical Fittings', quantity: '85 boxes', destination: 'East Wing', timestamp: '1 day ago' }
                      ].map((movement, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <Badge variant={movement.type === 'In' ? 'default' : 'secondary'} className="mr-3">
                              {movement.type}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{movement.material}</p>
                              <p className="text-xs text-muted-foreground">{movement.quantity} • {movement.destination}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{movement.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Low Stock Alerts</h3>
                    <div className="space-y-2">
                      {[
                        { material: 'Waterproofing Compound', currentStock: '5 barrels', threshold: '10 barrels', priority: 'High' },
                        { material: 'Electrical Conduits', currentStock: '120 units', threshold: '200 units', priority: 'Medium' },
                        { material: 'Concrete Admixture', currentStock: '15 containers', threshold: '25 containers', priority: 'Medium' },
                        { material: 'Safety Gloves', currentStock: '30 pairs', threshold: '50 pairs', priority: 'Low' }
                      ].map((alert, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{alert.material}</p>
                              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                <span>Current: {alert.currentStock}</span>
                                <span>Threshold: {alert.threshold}</span>
                              </div>
                            </div>
                            <Badge variant={
                              alert.priority === 'High' ? 'destructive' : 
                              alert.priority === 'Medium' ? 'default' : 'outline'
                            }>
                              {alert.priority}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => toast.success(`Purchase Request Created`, {
                              description: `Request for ${alert.material} (${alert.currentStock} → ${alert.threshold}) has been submitted`
                            })}
                          >
                            Create Purchase Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="central-warehouse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Stock Availability"
              value="92%"
              icon={Warehouse}
              description="Materials in stock"
              trend={{ value: 2, label: "this week" }}
              onClick={() => toast.info("Viewing stock details")}
            />
            <StatCard
              title="Pending Deliveries"
              value="14"
              icon={Package}
              description="Inbound materials"
              onClick={() => toast.info("Viewing incoming deliveries")}
            />
            <StatCard
              title="Storage Capacity"
              value="78%"
              icon={Building2}
              description="Warehouse utilization"
              onClick={() => toast.info("Viewing capacity details")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Critical Stock Alerts</CardTitle>
              <CardDescription>Materials requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{alert.item}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Current: {alert.quantity} • Reorder Point: {alert.reorderPoint}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="destructive">{alert.status}</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsMaterialRequestModalOpen(true)}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Material Movements</CardTitle>
                <CardDescription>Last 24 hours activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={movement.type === "Inbound" ? "default" : "secondary"}>
                            {movement.type}
                          </Badge>
                          <span className="font-medium">{movement.material}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {movement.quantity} • {movement.time} • {movement.site}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Location Map</CardTitle>
                <CardDescription>Warehouse section occupancy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {storageSections.map((section) => (
                    <div key={section.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{section.zone}</h3>
                        <Badge variant={section.occupancy > 80 ? "destructive" : "secondary"}>
                          {section.occupancy}% Full
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{section.type}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            section.occupancy > 80 ? "bg-red-600" : "bg-blue-600"
                          }`}
                          style={{ width: `${section.occupancy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* DPR Upload Modal */}
      <Dialog open={isDPRModalOpen} onOpenChange={setIsDPRModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Daily Progress Report (DPR)</DialogTitle>
            <DialogDescription>
              Submit today's work progress and updates
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUploadDPR({
                workDone: formData.get("workDone") as string,
                weather: formData.get("weather") as string,
                photos: formData.get("photos") as unknown as FileList,
                notes: formData.get("notes") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="workDone">Work Done Today</Label>
              <Textarea
                id="workDone"
                name="workDone"
                placeholder="Describe today's work progress..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="weather">Weather Conditions</Label>
              <Select name="weather" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="wind">Windy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="photos">Upload Photos</Label>
              <Input
                id="photos"
                name="photos"
                type="file"
                multiple
                accept="image/*"
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Site Engineer Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes or concerns..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDPRModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit DPR</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* WPR Upload Modal */}
      <Dialog open={isWPRModalOpen} onOpenChange={setIsWPRModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Weekly Progress Report (WPR)</DialogTitle>
            <DialogDescription>
              Submit weekly milestone progress
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUploadWPR({
                weekEnding: formData.get("weekEnding") as string,
                milestones: formData.get("milestones") as string,
                teamPerformance: formData.get("teamPerformance") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="weekEnding">Week Ending</Label>
              <Input id="weekEnding" name="weekEnding" type="date" required />
            </div>
            <div>
              <Label htmlFor="milestones">Milestone Progress</Label>
              <Textarea
                id="milestones"
                name="milestones"
                placeholder="Describe milestone achievements..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="teamPerformance">Team Performance</Label>
              <Textarea
                id="teamPerformance"
                name="teamPerformance"
                placeholder="Team performance comments..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsWPRModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit WPR</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Material Request Modal */}
      <Dialog
        open={isMaterialRequestModalOpen}
        onOpenChange={setIsMaterialRequestModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Material Request</DialogTitle>
            <DialogDescription>
              Request materials for site operations
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleRaiseMaterialRequest({
                materialItem: formData.get("materialItem") as string,
                quantity: formData.get("quantity") as string,
                priority: formData.get("priority") as string,
                useCase: formData.get("useCase") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="materialItem">Material Item</Label>
              <Input
                id="materialItem"
                name="materialItem"
                placeholder="Enter material name"
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity Required</Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder="Enter quantity with unit"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select name="priority" required>
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
            <div>
              <Label htmlFor="useCase">Use Case / Task ID</Label>
              <Input
                id="useCase"
                name="useCase"
                placeholder="Link to specific task (optional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsMaterialRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Issue Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Issue</DialogTitle>
            <DialogDescription>
              Report a new site issue or concern
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddIssue({
                category: formData.get("issueCategory") as string,
                description: formData.get("issueDescription") as string,
                severity: formData.get("issueSeverity") as string,
                responsibleParty: formData.get("responsibleParty") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="issueCategory">Category</Label>
              <Select name="issueCategory" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="issueDescription">Description</Label>
              <Textarea
                id="issueDescription"
                name="issueDescription"
                placeholder="Describe the issue in detail..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="issueSeverity">Severity</Label>
              <Select name="issueSeverity" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsibleParty">Tag Responsible Party</Label>
              <Select name="responsibleParty" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site-engineer">Site Engineer</SelectItem>
                  <SelectItem value="safety-officer">Safety Officer</SelectItem>
                  <SelectItem value="quality-inspector">
                    Quality Inspector
                  </SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Issue</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Progress Update Modal */}
      <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? `Updating: ${selectedTask.name}`
                : "Update task progress"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedTask) return;
              const formData = new FormData(e.currentTarget);
              handleUpdateProgress({
                taskId: selectedTask.id,
                progress: Number(formData.get("progressSlider")),
                notes: formData.get("progressNotes") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="progressSlider">Progress Percentage</Label>
              <Input
                id="progressSlider"
                name="progressSlider"
                type="range"
                min="0"
                max="100"
                defaultValue={selectedTask?.progress || 0}
                className="mt-2"
                onChange={(e) => setCurrentProgress(Number(e.target.value))}
                required
              />
              <div className="text-sm text-muted-foreground mt-1">
                Current: {currentProgress}%
              </div>
            </div>
            <div>
              <Label htmlFor="progressNotes">Progress Notes</Label>
              <Textarea
                id="progressNotes"
                name="progressNotes"
                placeholder="Add notes about progress..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsProgressModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Progress</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Purchase Order Modal */}
      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Submit a new purchase order request
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreatePO({
                vendor: formData.get("vendor") as string,
                amount: Number(formData.get("amount")),
                description: formData.get("description") as string,
                priority: formData.get("priority") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Select name="vendor" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steel-corp">Steel Corp Ltd</SelectItem>
                  <SelectItem value="cement-ind">Cement Industries</SelectItem>
                  <SelectItem value="hardware">Hardware Solutions</SelectItem>
                  <SelectItem value="equipment">Equipment Rentals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purchase..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" required>
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
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsPOModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create PO</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Equipment Maintenance Modal */}
      <Dialog
        open={isEquipmentModalOpen}
        onOpenChange={setIsEquipmentModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Equipment Maintenance</DialogTitle>
            <DialogDescription>
              Record equipment maintenance activity
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEquipmentMaintenance({
                equipmentId: formData.get("equipment") as string,
                maintenanceType: formData.get("maintenanceType") as string,
                notes: formData.get("notes") as string,
                nextService: Number(formData.get("nextService")),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Select name="equipment" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maintenanceType">Maintenance Type</Label>
              <Select name="maintenanceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Service</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Safety Inspection</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Maintenance Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Describe the maintenance performed..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="nextService">Next Service Due</Label>
              <Input
                id="nextService"
                name="nextService"
                type="number"
                placeholder="Hours until next service"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEquipmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Log Maintenance</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Labor Entry Modal */}
      <Dialog open={isLaborModalOpen} onOpenChange={setIsLaborModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Labor Hours</DialogTitle>
            <DialogDescription>
              Record labor hours and productivity
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLaborHours({
                trade: formData.get("trade") as string,
                workers: Number(formData.get("workers")),
                hours: Number(formData.get("hours")),
                overtime: Number(formData.get("overtime")),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="trade">Trade</Label>
              <Select name="trade" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricians">Electricians</SelectItem>
                  <SelectItem value="plumbers">Plumbers</SelectItem>
                  <SelectItem value="carpenters">Carpenters</SelectItem>
                  <SelectItem value="masons">Masons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workers">Number of Workers</Label>
              <Input
                id="workers"
                name="workers"
                type="number"
                placeholder="Enter number of workers"
                required
              />
            </div>
            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                name="hours"
                type="number"
                placeholder="Enter hours worked"
                required
              />
            </div>
            <div>
              <Label htmlFor="overtime">Overtime Hours</Label>
              <Input
                id="overtime"
                name="overtime"
                type="number"
                placeholder="Enter overtime hours"
                defaultValue="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="productivity">Productivity Notes</Label>
              <Textarea
                id="productivity"
                name="productivity"
                placeholder="Add notes about productivity..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsLaborModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Log Hours</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Budget Adjustment Modal */}
      <Dialog
        open={isBudgetAdjustModalOpen}
        onOpenChange={setIsBudgetAdjustModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Budget</DialogTitle>
            <DialogDescription>
              Modify budget allocation and track changes
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleBudgetAdjustment({
                category: formData.get("category") as string,
                adjustmentType: formData.get("adjustmentType") as
                  | "increase"
                  | "decrease",
                amount: Number(formData.get("amount")),
                reason: formData.get("reason") as string,
                effectiveDate: formData.get("effectiveDate") as string,
                approver: formData.get("approver") as string,
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category">Cost Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {costData.map((item) => (
                    <SelectItem key={item.category} value={item.category}>
                      {item.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type</Label>
              <Select name="adjustmentType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Budget</SelectItem>
                  <SelectItem value="decrease">Decrease Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter adjustment amount"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Explain the reason for budget adjustment..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Approving Authority</Label>
              <Select name="approver" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">
                    Project Manager
                  </SelectItem>
                  <SelectItem value="finance-head">Finance Head</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-x-2 flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsBudgetAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Adjustment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Purchase Order View Modal */}
      <Dialog open={isPOViewModalOpen} onOpenChange={setIsPOViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              View details of the selected purchase order
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PO Number</Label>
                  <p className="font-medium">{selectedPO.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedPO.status === "Approved"
                          ? "default"
                          : selectedPO.status === "Pending"
                          ? "secondary"
                          : selectedPO.status === "Escalated"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {selectedPO.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vendor</Label>
                  <p className="font-medium">{selectedPO.vendor}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">
                    ₹{selectedPO.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Next Approver</Label>
                  <p className="font-medium">{selectedPO.approver}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time in Queue</Label>
                  <p className="font-medium">{selectedPO.timeInQueue}</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsPOViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Purchase Order Approve Modal */}
      <Dialog
        open={isPOApproveModalOpen}
        onOpenChange={setIsPOApproveModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Order</DialogTitle>
            <DialogDescription>
              {selectedPO
                ? `Approving PO: ${selectedPO.id} - ${selectedPO.vendor}`
                : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedPO) return;
              const formData = new FormData(e.currentTarget);
              handlePOApprove(selectedPO, {
                comments: formData.get("comments") as string,
                conditions: formData.get("conditions") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                name="comments"
                placeholder="Enter comments about the approval..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="conditions">Conditions (Optional)</Label>
              <Textarea
                id="conditions"
                name="conditions"
                placeholder="Enter any conditions for approving the order..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsPOApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Approve</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Purchase Order Expedite Modal */}
      <Dialog
        open={isPOExpediteModalOpen}
        onOpenChange={setIsPOExpediteModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expedite Purchase Order</DialogTitle>
            <DialogDescription>
              {selectedPO
                ? `Expediting PO: ${selectedPO.id} - ${selectedPO.vendor}`
                : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedPO) return;
              const formData = new FormData(e.currentTarget);
              handlePOExpedite(selectedPO, {
                priority: formData.get("priority") as "high" | "urgent",
                reason: formData.get("reason") as string,
                escalateTo: formData.get("escalateTo") as string,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason for Expediting</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Enter the reason for expediting the order..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="escalateTo">Escalate To</Label>
              <Select name="escalateTo" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department-head">
                    Department Head
                  </SelectItem>
                  <SelectItem value="procurement-manager">
                    Procurement Manager
                  </SelectItem>
                  <SelectItem value="project-director">
                    Project Director
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsPOExpediteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Expedite</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Task Modal */}{" "}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for the project
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddTask({
                  name: formData.get("name") as string,
                  project: formData.get("project") as string,
                  assignedTo: formData.get("assignedTo") as string,
                  startDate: formData.get("startDate") as string,
                  dueDate: formData.get("dueDate") as string,
                  phase: formData.get("phase") as string,
                  // dependencies: formData.getAll("dependencies") as string[],
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  name="project"
                  defaultValue="Main Building"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  name="assignedTo"
                  placeholder="Enter assignee name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phase">Phase</Label>
                <Select name="phase" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectPhases.map((phase) => (
                      <SelectItem key={phase.phase} value={phase.phase}>
                        {phase.phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {/* <Label htmlFor="dependencies">Dependencies</Label>
                <Select name="dependencies">
                  <SelectTrigger>
                    <SelectValue placeholder="Select dependencies" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Optional: Select a predecessor task that must be completed
                  before this one
                </p> */}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                >
                  Cancel
                </Button>{" "}
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Labor Details Modal */}
      <Dialog
        open={isLaborDetailsModalOpen}
        onOpenChange={setIsLaborDetailsModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Labor Details</DialogTitle>
            <DialogDescription>
              Detailed metrics and performance data
            </DialogDescription>
          </DialogHeader>
          {selectedLabor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Trade</Label>
                  <p className="font-medium">{selectedLabor.trade}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Labor Type</Label>
                  <Badge className={selectedLabor.type === "productive" ? "bg-blue-500" : "bg-purple-500"}>
                    {selectedLabor.type === "productive" ? "Productive" : "Non-Productive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Utilization</Label>
                  <p className="font-medium">
                    {(
                      (selectedLabor.actual / selectedLabor.planned) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Planned Hours</Label>
                  <p className="font-medium">{selectedLabor.planned}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Actual Hours</Label>
                  <p className="font-medium">{selectedLabor.actual}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Variance</Label>
                  <p
                    className={`font-medium ${
                      selectedLabor.actual > selectedLabor.planned
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {selectedLabor.actual - selectedLabor.planned} hours
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cost Impact</Label>
                  <p
                    className={`font-medium ${
                      selectedLabor.actual > selectedLabor.planned
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    ₹
                    {Math.abs(
                      (selectedLabor.actual - selectedLabor.planned) * 500
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Productivity Coefficient</Label>
                  <p className="font-medium">
                    {selectedLabor.type === "productive" ? "1.0" : "0.7"} 
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Daily Distribution
                </Label>
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          day: "Mon",
                          hours: Math.round(selectedLabor.actual / 5),
                        },
                        {
                          day: "Tue",
                          hours: Math.round(selectedLabor.actual / 5),
                        },
                        {
                          day: "Wed",
                          hours: Math.round(selectedLabor.actual / 5),
                        },
                        {
                          day: "Thu",
                          hours: Math.round(selectedLabor.actual / 5),
                        },
                        {
                          day: "Fri",
                          hours: Math.round(selectedLabor.actual / 5),
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Performance Metrics
                </Label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Productivity Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Quality Score</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Safety Compliance</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsLaborDetailsModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsLaborDetailsModalOpen(false);
                    setIsLaborModalOpen(true);
                  }}
                >
                  Log Hours
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Equipment Logs Modal */}
      <Dialog
        open={isEquipmentLogsModalOpen}
        onOpenChange={setIsEquipmentLogsModalOpen}
      >
        <DialogContent className="max-w-[90vw] w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>Equipment Logs</DialogTitle>
            <DialogDescription>
              {selectedEquipment
                ? `Viewing logs for ${selectedEquipment.name} (${selectedEquipment.id})`
                : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="bg-background px-6 py-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Total Hours
                    </Label>
                    <p className="text-2xl font-bold">
                      {selectedEquipment.hours}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Next Service
                    </Label>
                    <p
                      className={`text-2xl font-bold ${
                        selectedEquipment.nextService === "Due Now"
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {selectedEquipment.nextService}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Status
                    </Label>
                    <Badge
                      className="text-base"
                      variant={
                        selectedEquipment.status === "Active"
                          ? "default"
                          : selectedEquipment.status === "Warning"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedEquipment.status}
                    </Badge>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Utilization
                    </Label>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6">
                <div className="py-6 space-y-6">
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-background sticky top-0 z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Activity History</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEquipmentLogsModalOpen(false);
                            setIsEquipmentModalOpen(true);
                          }}
                        >
                          Add New Log
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {equipmentLogs.map((log, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  log.type === "Maintenance"
                                    ? "secondary"
                                    : log.type === "Repair"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {log.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {log.date}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {log.hours} hours
                            </span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm">{log.notes}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Operator: {log.operator}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEquipmentLogsModalOpen(false);
                                setIsEquipmentModalOpen(true);
                              }}
                            >
                              Add Note
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t bg-background px-6 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEquipmentLogsModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEquipmentLogsModalOpen(false);
                      setIsEquipmentModalOpen(true);
                    }}
                  >
                    Log Maintenance
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Equipment Tracking Modal */}
      <Dialog
        open={isEquipmentTrackingModalOpen}
        onOpenChange={setIsEquipmentTrackingModalOpen}
      >
        <DialogContent className="max-w-[90vw] w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>Equipment Location Tracking</DialogTitle>
            <DialogDescription>
              {selectedEquipment
                ? `Real-time location for ${selectedEquipment.name} (${selectedEquipment.id})`
                : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="bg-background px-6 py-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Current Location
                    </Label>
                    <p className="text-lg font-medium">
                      North Block - Section A
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Current Operator
                    </Label>
                    <p className="text-lg font-medium">John Smith</p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-muted-foreground block">
                      Status
                    </Label>
                    <Badge
                      className="text-base"
                      variant={
                        selectedEquipment.status === "Active"
                          ? "default"
                          : selectedEquipment.status === "Warning"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedEquipment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6">
                <div className="py-6 space-y-6">
                  {/* <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground">Interactive Site Map</p>
                          <Button variant="outline" size="sm" onClick={() => toast.success(`Refreshing map view for ${selectedEquipment.name}`)}>
                            Refresh Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-background sticky top-0 z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Movement History</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.success(
                              `Refreshing location data for ${selectedEquipment.name}`
                            )
                          }
                        >
                          Refresh Data
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {equipmentLocations.map((location, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{location.area}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {location.timestamp}
                                </span>
                                <Badge
                                  variant={
                                    location.status === "Active"
                                      ? "default"
                                      : location.status === "Maintenance"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {location.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {location.operator}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Operator
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t bg-background px-6 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEquipmentTrackingModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() =>
                      toast.success(
                        `Refreshing all location data for ${selectedEquipment.name}`
                      )
                    }
                  >
                    Refresh All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Equipment Maintenance Modal */}
      <Dialog
        open={isEquipmentModalOpen}
        onOpenChange={setIsEquipmentModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Equipment Maintenance</DialogTitle>
            <DialogDescription>
              Record equipment maintenance activity
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEquipmentMaintenance({
                equipmentId: formData.get("equipment") as string,
                maintenanceType: formData.get("maintenanceType") as string,
                notes: formData.get("notes") as string,
                nextService: Number(formData.get("nextService")),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Select name="equipment" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maintenanceType">Maintenance Type</Label>
              <Select name="maintenanceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Service</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Safety Inspection</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Maintenance Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Describe the maintenance performed..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="nextService">Next Service Due</Label>
              <Input
                id="nextService"
                name="nextService"
                type="number"
                placeholder="Hours until next service"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEquipmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Log Maintenance</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Labor Entry Modal */}
      <Dialog open={isLaborModalOpen} onOpenChange={setIsLaborModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Labor Hours</DialogTitle>
            <DialogDescription>
              Record labor hours and productivity
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLaborHours({
                trade: formData.get("trade") as string,
                workers: Number(formData.get("workers")),
                hours: Number(formData.get("hours")),
                overtime: Number(formData.get("overtime")),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="trade">Trade</Label>
              <Select name="trade" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricians">Electricians</SelectItem>
                  <SelectItem value="plumbers">Plumbers</SelectItem>
                  <SelectItem value="carpenters">Carpenters</SelectItem>
                  <SelectItem value="masons">Masons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workers">Number of Workers</Label>
              <Input
                id="workers"
                name="workers"
                type="number"
                placeholder="Enter number of workers"
                required
              />
            </div>
            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                name="hours"
                type="number"
                placeholder="Enter hours worked"
                required
              />
            </div>
            <div>
              <Label htmlFor="overtime">Overtime Hours</Label>
              <Input
                id="overtime"
                name="overtime"
                type="number"
                placeholder="Enter overtime hours"
                defaultValue="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="productivity">Productivity Notes</Label>
              <Textarea
                id="productivity"
                name="productivity"
                placeholder="Add notes about productivity..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsLaborModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Log Hours</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Budget Adjustment Modal */}
      <Dialog
        open={isBudgetAdjustModalOpen}
        onOpenChange={setIsBudgetAdjustModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Budget</DialogTitle>
            <DialogDescription>
              Modify budget allocation and track changes
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleBudgetAdjustment({
                category: formData.get("category") as string,
                adjustmentType: formData.get("adjustmentType") as
                  | "increase"
                  | "decrease",
                amount: Number(formData.get("amount")),
                reason: formData.get("reason") as string,
                effectiveDate: formData.get("effectiveDate") as string,
                approver: formData.get("approver") as string,
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category">Cost Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {costData.map((item) => (
                    <SelectItem key={item.category} value={item.category}>
                      {item.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type</Label>
              <Select name="adjustmentType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Budget</SelectItem>
                  <SelectItem value="decrease">Decrease Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter adjustment amount"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Explain the reason for budget adjustment..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Approving Authority</Label>
              <Select name="approver" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">
                    Project Manager
                  </SelectItem>
                  <SelectItem value="finance-head">Finance Head</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-x-2 flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsBudgetAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Adjustment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Issue Modal */}
      <Dialog
        open={isViewIssueModalOpen}
        onOpenChange={setIsViewIssueModalOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details - {selectedIssue?.id}</DialogTitle>
            <DialogDescription>View and manage site issue</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline">{selectedIssue?.type}</Badge>
              <Badge
                variant={
                  selectedIssue?.severity === "High"
                    ? "destructive"
                    : selectedIssue?.severity === "Medium"
                    ? "default"
                    : "secondary"
                }
              >
                {selectedIssue?.severity}
              </Badge>
              <Badge
                variant={
                  selectedIssue?.status === "Resolved"
                    ? "default"
                    : selectedIssue?.status === "In Progress"
                    ? "secondary"
                    : "outline"
                }
              >
                {selectedIssue?.status}
              </Badge>
              {selectedIssue?.escalated && (
                <Badge variant="destructive">Escalated</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <div className="p-4 border rounded-md">
                  <p className="text-sm">{selectedIssue?.description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm font-medium">Reported By</span>
                    <span className="text-sm">{selectedIssue?.reportedBy}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm font-medium">Reported Date</span>
                    <span className="text-sm">{selectedIssue?.dateLogged}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-sm">{selectedIssue?.location}</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-sm font-medium">Impact</span>
                    <span className="text-sm">
                      {selectedIssue?.impact || "Moderate"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              {selectedIssue?.status !== "Resolved" && (
                <Button
                  variant="default"
                  onClick={() => {
                    setIssues((prevIssues) =>
                      prevIssues.map((issue) =>
                        issue.id === selectedIssue?.id
                          ? { ...issue, status: "Resolved" }
                          : issue
                      )
                    );
                    setIsViewIssueModalOpen(false);
                    toast.success(
                      `Issue ${selectedIssue?.id} marked as resolved`
                    );
                  }}
                >
                  Resolve Issue
                </Button>
              )}
              {selectedIssue?.severity === "High" &&
                !selectedIssue?.escalated && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIssues((prevIssues) =>
                        prevIssues.map((issue) =>
                          issue.id === selectedIssue?.id
                            ? { ...issue, escalated: true }
                            : issue
                        )
                      );
                      setIsViewIssueModalOpen(false);
                      toast.info(
                        `Issue ${selectedIssue?.id} has been escalated`
                      );
                    }}
                  >
                    Escalate
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setIsViewIssueModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Report Modal */}
      <Dialog
        open={isViewReportModalOpen}
        onOpenChange={setIsViewReportModalOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.type} - {selectedReport?.date}
            </DialogTitle>
            <DialogDescription>
              Report details and attached photos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedReport?.type}</Badge>
              <Badge variant="secondary">{selectedReport?.weather}</Badge>
              {selectedReport?.escalated && (
                <Badge variant="destructive">Escalated</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Report Summary</h4>
                <div className="p-4 border rounded-md">
                  <p className="text-sm">
                    This is a {selectedReport?.type} submitted on{" "}
                    {selectedReport?.date}. Weather conditions were{" "}
                    {selectedReport?.weather}.
                    {selectedReport?.escalated &&
                      " This report was escalated for management review."}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Activities Completed
                </h4>
                <div className="p-4 border rounded-md">
                  <ul className="text-sm space-y-1">
                    <li>• Foundation work at Block A</li>
                    <li>• Material inspection and quality check</li>
                    <li>• Team coordination meeting</li>
                    <li>• Safety inspection rounds</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Photos ({selectedReport?.photos})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Array.from({
                  length: Math.min(selectedReport?.photos || 0, 8) || 0,
                }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-md flex items-center justify-center"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewReportModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Staff Modal */}
      <Dialog open={isAddStaffModalOpen} onOpenChange={setIsAddStaffModalOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Add New Staff Member
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter staff details to register a new store team member
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              // Get role display name from value
              const roleValue = formData.get("role") as string;
              const roleMap: Record<string, string> = {
                "store-manager": "Store Manager",
                "assistant-manager": "Assistant Manager",
                "inventory-clerk": "Inventory Clerk",
                "logistics-coordinator": "Logistics Coordinator",
                "warehouse-staff": "Warehouse Staff",
                "material-specialist": "Material Specialist",
                "inventory-analyst": "Inventory Analyst",
                "quality-inspector": "Quality Inspector"
              };
              
              // Get availability display name
              const availabilityValue = formData.get("availability") as string;
              const availabilityMap: Record<string, string> = {
                "full-time": "Full-time",
                "part-time": "Part-time",
                "contract": "Contract",
                "seasonal": "Seasonal",
                "on-call": "On-Call"
              };
              
              // Parse certifications
              const certificationString = formData.get("certifications") as string;
              const certifications = certificationString
                ? certificationString.split(',').map(cert => cert.trim())
                : [];
              
              // Create new staff member object
              const newStaffMember = {
                name: formData.get("fullName") as string,
                role: roleMap[roleValue] || roleValue,
                status: 'On Duty',
                availability: availabilityMap[availabilityValue] || availabilityValue,
                experience: `${formData.get("experience")} years`,
                certifications,
                contactNumber: formData.get("contactNumber") as string,
                email: formData.get("email") as string,
                specialization: formData.get("specialization") as string,
                shiftPreference: formData.get("shiftPreference") as string,
                emergencyContact: formData.get("emergencyContact") as string,
                notes: formData.get("notes") as string
              };
              
              // Add to staff list
              setStoreStaff(prevStaff => [...prevStaff, newStaffMember]);
              
              // Show success message
              toast.success("Staff Member Added Successfully", {
                description: `${newStaffMember.name} has been added as a ${newStaffMember.role}`
              });
              
              // Close the modal
              setIsAddStaffModalOpen(false);
            }}
            className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
          >
            {/* Staff Information Tab Panel */}
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
              </TabsList>
            
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-xs flex items-center gap-1">
                      Full Name <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      placeholder="John Doe" 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="contactNumber" className="text-xs flex items-center gap-1">
                      Contact <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input 
                      id="contactNumber" 
                      name="contactNumber" 
                      placeholder="+91 98765 43210" 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs flex items-center gap-1">
                      Email <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john.doe@example.com" 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="emergencyContact" className="text-xs">
                      Emergency Contact
                    </Label>
                    <Input 
                      id="emergencyContact" 
                      name="emergencyContact" 
                      placeholder="+91 98765 43210" 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs">Address</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Full address"
                    className="resize-none text-sm"
                    rows={2}
                  />
                </div>
              </TabsContent>
              
              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs flex items-center gap-1">
                      Position/Role <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Select name="role" required>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="store-manager">Store Manager</SelectItem>
                        <SelectItem value="assistant-manager">Assistant Manager</SelectItem>
                        <SelectItem value="inventory-clerk">Inventory Clerk</SelectItem>
                        <SelectItem value="logistics-coordinator">Logistics Coordinator</SelectItem>
                        <SelectItem value="warehouse-staff">Warehouse Staff</SelectItem>
                        <SelectItem value="material-specialist">Material Specialist</SelectItem>
                        <SelectItem value="inventory-analyst">Inventory Analyst</SelectItem>
                        <SelectItem value="quality-inspector">Quality Inspector</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="experience" className="text-xs flex items-center gap-1">
                      Experience (Years) <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input 
                      id="experience" 
                      name="experience" 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      placeholder="2" 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="availability" className="text-xs flex items-center gap-1">
                      Availability <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Select name="availability" required>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="on-call">On-Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="shiftPreference" className="text-xs">Shift Preference</Label>
                    <Select name="shiftPreference">
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6AM-2PM)</SelectItem>
                        <SelectItem value="day">Day (9AM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (2PM-10PM)</SelectItem>
                        <SelectItem value="night">Night (10PM-6AM)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="joiningDate" className="text-xs">Joining Date</Label>
                  <Input 
                    id="joiningDate" 
                    name="joiningDate" 
                    type="date"
                    className="h-8 text-sm"
                  />
                </div>
              </TabsContent>
              
              {/* Qualifications Tab */}
              <TabsContent value="qualifications" className="space-y-3 mt-0">
                <div className="space-y-1">
                  <Label htmlFor="certifications" className="text-xs">Certifications & Licenses</Label>
                  <Input 
                    id="certifications" 
                    name="certifications" 
                    placeholder="Inventory Management, Supply Chain, etc."
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple certifications with commas</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="specialization" className="text-xs">Area of Specialization</Label>
                  <Input 
                    id="specialization" 
                    name="specialization" 
                    placeholder="Procurement, Inventory Control, etc."
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-xs">Notes & Special Considerations</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Additional information, special skills, etc."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center pt-2 border-t">
              <p className="text-xs text-muted-foreground mr-auto">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddStaffModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Staff
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteDashboard;
