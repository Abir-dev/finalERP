import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EnhancedStatCard } from "@/components/enhanced-stat-card"
import { InteractiveChart } from "@/components/interactive-chart"
import { ExpandableDataTable } from "@/components/expandable-data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp, DollarSign, Users, Building2, AlertTriangle, Calendar,
  Download, Target, Zap, Clock, Shield, Activity, BarChart3
} from "lucide-react"
import axios from "axios";
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Enhanced data for hyper-detailed dashboard
// const executiveScorecard = [
//   { metric: 'Revenue Target', current: 85, target: 100, status: 'warning' },
//   { metric: 'Project Delivery', current: 92, target: 90, status: 'good' },
//   { metric: 'Client Satisfaction', current: 96, target: 95, status: 'good' },
//   { metric: 'Cost Control', current: 78, target: 85, status: 'critical' },
//   { metric: 'Team Efficiency', current: 88, target: 85, status: 'good' },
//   { metric: 'Safety Record', current: 99, target: 98, status: 'good' }
// ]

// const revenueData = [
//   { month: 'Jan', revenue: 4500000, expense: 3200000, forecast: 4300000, target: 4600000, trend: 8 },
//   { month: 'Feb', revenue: 5200000, expense: 3800000, forecast: 5100000, target: 5000000, trend: 12 },
//   { month: 'Mar', revenue: 4800000, expense: 3500000, forecast: 4900000, target: 4800000, trend: -2 },
//   { month: 'Apr', revenue: 6100000, expense: 4200000, forecast: 5900000, target: 5500000, trend: 15 },
//   { month: 'May', revenue: 5700000, expense: 4000000, forecast: 5800000, target: 5600000, trend: 3 },
//   { month: 'Jun', revenue: 6500000, expense: 4500000, forecast: 6400000, target: 6200000, trend: 9 }
// ]

interface Risk {
  id: string;
  project: string;
  riskLevel: string;
  probability: number;
  impact: string;
  mitigation: string;
  category: string;
  lastAssessment: string;
  nextReview: string;
  owner: string;
  mitigationActions: string[];
  isFlagged: boolean;
}

// const projectRiskMatrix: Risk[] = [
//   { 
//     id: '1',
//     project: 'Tower A', 
//     riskLevel: 'High', 
//     probability: 80, 
//     impact: 'Critical', 
//     mitigation: 'Resource reallocation',
//     category: 'Technical',
//     lastAssessment: '2024-02-01',
//     nextReview: '2024-02-15',
//     owner: 'John Smith',
//     mitigationActions: [
//       'Weekly stakeholder reviews',
//       'Additional resource allocation',
//       'Contingency plan activation'
//     ],
//     isFlagged: false
//   },
//   { 
//     id: '2',
//     project: 'Mall Complex', 
//     riskLevel: 'Medium', 
//     probability: 45, 
//     impact: 'Moderate', 
//     mitigation: 'Schedule adjustment',
//     category: 'Operational',
//     lastAssessment: '2024-01-28',
//     nextReview: '2024-02-11',
//     owner: 'Sarah Johnson',
//     mitigationActions: [
//       'Review timeline dependencies',
//       'Adjust resource allocation'
//     ],
//     isFlagged: false
//   },
//   { 
//     id: '3',
//     project: 'Villa Phase 2', 
//     riskLevel: 'Low', 
//     probability: 20, 
//     impact: 'Minor', 
//     mitigation: 'Monitor closely',
//     category: 'Financial',
//     lastAssessment: '2024-01-25',
//     nextReview: '2024-02-08',
//     owner: 'Mike Brown',
//     mitigationActions: [
//       'Weekly progress monitoring',
//       'Resource optimization review'
//     ],
//     isFlagged: false
//   },
//   { 
//     id: '4',
//     project: 'Office Building', 
//     riskLevel: 'High', 
//     probability: 75, 
//     impact: 'Major', 
//     mitigation: 'Stakeholder meeting',
//     category: 'Environmental',
//     lastAssessment: '2024-01-30',
//     nextReview: '2024-02-13',
//     owner: 'Emily Davis',
//     mitigationActions: [
//       'Stakeholder communication plan',
//       'Impact assessment review',
//       'Mitigation strategy update'
//     ],
//     isFlagged: false
//   }
// ];

interface Department {
  department: string;
  efficiency: number;
  utilization: number;
  issues: number;
  trend: number;
  isFlagged?: boolean;
}

// const teamPerformanceData = [
//   { department: 'Construction', efficiency: 92, utilization: 88, issues: 2, trend: 5 },
//   { department: 'Design', efficiency: 89, utilization: 94, issues: 1, trend: 3 },
//   { department: 'Project Management', efficiency: 94, utilization: 90, issues: 0, trend: 8 },
//   { department: 'Quality Assurance', efficiency: 87, utilization: 85, issues: 3, trend: -2 }
// ]

const MDDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  // Replace static arrays with backend data
  const [executiveScorecard, setExecutiveScorecard] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [risks, setRisks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/md/scorecard`, { headers })
      .then(res => setExecutiveScorecard(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/md/revenue`, { headers })
      .then(res => setRevenueData(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/md/risks`, { headers })
      .then(res => setRisks(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/md/team-performance`, { headers })
      .then(res => setDepartments(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/projects`, { headers })
      .then(res => setProjects(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/clients`, { headers })
      .then(res => setClients(res.data))
      .catch(() => {});
  }, []);

  const handleExportSnapshot = () => {
    // Generate comprehensive dashboard report
    const timestamp = new Date().toISOString().split('T')[0];
    const reportData = {
      reportTitle: "MD Dashboard Executive Snapshot",
      generatedOn: new Date().toLocaleString(),
      timeRange: selectedTimeRange,
      
      executiveScorecard: executiveScorecard.map(item => ({
        metric: item.metric,
        current: `${item.current}%`,
        target: `${item.target}%`,
        status: item.status,
        performance: item.current >= item.target ? 'Above Target' : 'Below Target'
      })),
      
      keyMetrics: {
        activeProjects: 24,
        totalRevenue: "₹50M",
        monthlyGrowth: "15.2%",
        teamUtilization: "87%"
      },
      
      financialSummary: revenueData.map(item => ({
        month: item.month,
        revenue: `₹${(item.revenue / 1000000).toFixed(1)}M`,
        expense: `₹${(item.expense / 1000000).toFixed(1)}M`,
        profit: `₹${((item.revenue - item.expense) / 1000000).toFixed(1)}M`,
        profitMargin: `${(((item.revenue - item.expense) / item.revenue) * 100).toFixed(1)}%`
      })),
      
      teamPerformance: departments.map(dept => ({
        department: dept.department,
        efficiency: `${dept.efficiency}%`,
        utilization: `${dept.utilization}%`,
        openIssues: dept.issues,
        trend: dept.trend > 0 ? `+${dept.trend}%` : `${dept.trend}%`
      })),
      
      riskSummary: {
        highRiskProjects: risks.filter(r => r.riskLevel === 'High').length,
        mediumRiskProjects: risks.filter(r => r.riskLevel === 'Medium').length,
        lowRiskProjects: risks.filter(r => r.riskLevel === 'Low').length,
        avgRiskScore: "3.2/10",
        mitigationRate: "76%"
      },
      
      criticalAlerts: [
        "2 projects exceeding budget variance threshold",
        "3 departments below optimal utilization",
        "4 high-risk projects requiring immediate attention",
        "Cost control measures needed for Q2 targets"
      ],
      
      recommendations: [
        "Implement enhanced cost control measures for budget variance projects",
        "Increase resource allocation for underutilized departments",
        "Escalate risk mitigation plans for high-risk projects",
        "Review and adjust Q2 financial targets based on current performance"
      ]
    };

    // Convert to formatted text report
    const reportContent = `
MANAGING DIRECTOR DASHBOARD - EXECUTIVE SNAPSHOT
Generated: ${reportData.generatedOn}
Time Range: ${reportData.timeRange}

==========================================
EXECUTIVE SCORECARD
==========================================
${reportData.executiveScorecard.map(item => 
  `${item.metric}: ${item.current} (Target: ${item.target}) - ${item.status.toUpperCase()}`
).join('\n')}

==========================================
KEY PERFORMANCE METRICS
==========================================
Active Projects: ${reportData.keyMetrics.activeProjects}
Total Revenue (FY): ${reportData.keyMetrics.totalRevenue}
Monthly Growth: ${reportData.keyMetrics.monthlyGrowth}
Team Utilization: ${reportData.keyMetrics.teamUtilization}

==========================================
FINANCIAL SUMMARY (6-MONTH)
==========================================
${reportData.financialSummary.map(item => 
  `${item.month}: Revenue ${item.revenue} | Expense ${item.expense} | Profit ${item.profit} (${item.profitMargin} margin)`
).join('\n')}

==========================================
TEAM PERFORMANCE BY DEPARTMENT
==========================================
${reportData.teamPerformance.map(dept => 
  `${dept.department}: ${dept.efficiency} efficiency | ${dept.utilization} utilization | ${dept.openIssues} issues | Trend: ${dept.trend}`
).join('\n')}

==========================================
RISK ASSESSMENT SUMMARY
==========================================
High Risk Projects: ${reportData.riskSummary.highRiskProjects}
Medium Risk Projects: ${reportData.riskSummary.mediumRiskProjects}
Low Risk Projects: ${reportData.riskSummary.lowRiskProjects}
Average Risk Score: ${reportData.riskSummary.avgRiskScore}
Risk Mitigation Rate: ${reportData.riskSummary.mitigationRate}

==========================================
CRITICAL ALERTS
==========================================
${reportData.criticalAlerts.map((alert, index) => `${index + 1}. ${alert}`).join('\n')}

==========================================
STRATEGIC RECOMMENDATIONS
==========================================
${reportData.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

==========================================
DETAILED PROJECT RISK MATRIX
==========================================
${risks.map(risk => 
  `${risk.project}: ${risk.riskLevel} Risk (${risk.probability}% probability) - ${risk.impact} impact
   Category: ${risk.category} | Owner: ${risk.owner}
   Mitigation: ${risk.mitigation}
   Next Review: ${risk.nextReview}`
).join('\n\n')}

Report End - Generated by MD Dashboard System
    `.trim();

    // Create and download the file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MD_Dashboard_Snapshot_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Executive dashboard snapshot downloaded successfully!");
  };

  const handleDrillDown = (data: any) => {
    toast.info(`Drilling down into ${data.month || data.name} data...`)
  }

  const enhancedProjectColumns = [
    { key: 'name', label: 'Project Name', type: 'text' as const },
    { key: 'client', label: 'Client', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge' as const,
      options: ['In Progress', 'Completed', 'Planning', 'On Hold']
    },
    { key: 'progress', label: 'Progress', type: 'progress' as const },
    { key: 'budget', label: 'Budget', render: (value: number) => `₹${(value / 1000000).toFixed(1)}M` },
    { 
      key: 'riskLevel', 
      label: 'Risk', 
      type: 'badge' as const,
      options: ['Low', 'Medium', 'High']
    },
    { key: 'actions', label: 'Actions', type: 'actions' as const }
  ]

  const projectExpandableContent = (row: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 className="font-medium mb-2">Key Metrics</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Budget Utilization:</span>
            <span className="font-medium">{row.budgetUtilization || 67}%</span>
          </div>
          <div className="flex justify-between">
            <span>Timeline Adherence:</span>
            <span className="font-medium">{row.timelineAdherence || 94}%</span>
          </div>
          <div className="flex justify-between">
            <span>Quality Score:</span>
            <span className="font-medium">{row.qualityScore || 8.5}/10</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Recent Milestones</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Foundation completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Design approval received</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Material procurement in progress</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Alerts & Actions</h4>
        <div className="space-y-1 text-sm">
          {row.alerts?.map((alert: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{alert}</span>
            </div>
          )) || (
              <div className="text-green-600">No active alerts</div>
            )}
        </div>
      </div>
    </div>
  )

  const handleRiskAction = (action: string, risk: Risk, updatedData?: any) => {
    switch (action) {
      case 'edit':
        const updatedRisks = risks.map(r => 
          r.id === risk.id ? { ...r, ...updatedData } : r
        );
        setRisks(updatedRisks);
        toast.success('Risk updated successfully');
        break;
      
      case 'flag':
        const flaggedRisks = risks.map(r => 
          r.id === risk.id ? { ...r, isFlagged: !r.isFlagged } : r
        );
        setRisks(flaggedRisks);
        toast.success(`Risk ${risk.isFlagged ? 'unflagged' : 'flagged'} successfully`);
        break;
    }
  };

  const handleDepartmentAction = (action: string, department: Department, updatedData?: any) => {
    switch (action) {
      case 'edit':
        const updatedDepartments = departments.map(d => 
          d.department === department.department ? { ...d, ...updatedData } : d
        );
        setDepartments(updatedDepartments);
        toast.success('Department updated successfully');
        break;
      
      case 'flag':
        const flaggedDepartments = departments.map(d => 
          d.department === department.department ? { ...d, isFlagged: !d.isFlagged } : d
        );
        setDepartments(flaggedDepartments);
        toast.success(`Department ${department.isFlagged ? 'unflagged' : 'flagged'} successfully`);
        break;
    }
  };

  const handleProjectAction = (action: string, project: any, updatedData?: any) => {
    switch (action) {
      case 'edit':
        const updatedProjects = projects.map(p => 
          p.name === project.name ? { ...p, ...updatedData } : p
        );
        setProjects(updatedProjects);
        toast.success('Project updated successfully');
        break;
      
      case 'flag':
        const flaggedProjects = projects.map(p => 
          p.name === project.name ? { ...p, isFlagged: !p.isFlagged } : p
        );
        setProjects(flaggedProjects);
        toast.success(`Project ${project.isFlagged ? 'unflagged' : 'flagged'} successfully`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Managing Director Dashboard</h1>
          <p className="text-muted-foreground">Strategic overview and executive insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportSnapshot} className="gap-2">
            <Download className="h-4 w-4" />
            Export Snapshot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="executive">Executive Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Performance</TabsTrigger>
          <TabsTrigger value="financials">Financial Insights</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="risks">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {/* Executive Scorecard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Executive Scorecard
              </CardTitle>
              <CardDescription>Key performance indicators with targets and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {executiveScorecard.map((item) => (
                  <div key={item.metric} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <Badge variant={item.status === 'good' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold">{item.current}%</span>
                      <span className="text-sm text-muted-foreground">of {item.target}%</span>
                    </div>
                    <Progress value={item.current} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Active Projects"
              value={24}
              icon={Building2}
              description="Currently in progress"
              trend={{
                value: 12,
                label: "from last month",
                data: [{ value: 20 }, { value: 22 }, { value: 21 }, { value: 24 }]
              }}
              threshold={{
                status: 'good',
                message: 'Project count within optimal range'
              }}
              comparison={{
                period: 'Last quarter',
                value: '21',
                change: 14
              }}
              onClick={() => toast.info("Viewing active projects breakdown")}
            />
            <EnhancedStatCard
              title="Total Revenue"
              value="₹50M"
              icon={DollarSign}
              description="This fiscal year"
              trend={{
                value: 8,
                label: "growth rate",
                data: [{ value: 45 }, { value: 47 }, { value: 49 }, { value: 50 }]
              }}
              threshold={{
                status: 'warning',
                message: 'Revenue slightly below target'
              }}
              comparison={{
                period: 'Same period last year',
                value: '₹46M',
                change: 8
              }}
              onClick={() => toast.info("Opening revenue breakdown")}
            />
            <EnhancedStatCard
              title="Monthly Growth"
              value="15.2%"
              icon={TrendingUp}
              description="Compared to last month"
              trend={{
                value: 3.2,
                label: "improvement",
                data: [{ value: 12 }, { value: 13.5 }, { value: 14.8 }, { value: 15.2 }]
              }}
              threshold={{
                status: 'good',
                message: 'Growth exceeding expectations'
              }}
              onClick={() => toast.info("Viewing growth analytics")}
            />
            <EnhancedStatCard
              title="Team Utilization"
              value="87%"
              icon={Users}
              description="Resource efficiency"
              trend={{
                value: -2,
                label: "from last week",
                data: [{ value: 89 }, { value: 88 }, { value: 89 }, { value: 87 }]
              }}
              threshold={{
                status: 'warning',
                message: 'Utilization below optimal threshold'
              }}
              onClick={() => toast.info("Opening utilization matrix")}
            />
          </div>

          {/* Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              title="Revenue vs Expense vs Forecast"
              description="6-month financial overview with predictive trends"
              data={revenueData}
              type="line"
              dataKey="revenue"
              secondaryDataKey="forecast"
              xAxisKey="month"
              timeRanges={['30d', '90d', '6m', '1y']}
              onDrillDown={handleDrillDown}
              showComparison={true}
            />

            <InteractiveChart
              title="Department Performance Matrix"
              description="Efficiency and utilization by department"
              data={departments}
              type="bar"
              dataKey="efficiency"
              secondaryDataKey="utilization"
              xAxisKey="department"
              onDrillDown={handleDrillDown}
            />
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="On-Time Projects"
              value="18"
              icon={Calendar}
              description="Meeting deadlines"
              trend={{ value: 5, label: "this month" }}
              threshold={{ status: 'good', message: 'Excellent project delivery performance' }}
              onClick={() => toast.info("Viewing on-time project details")}
            />
            <EnhancedStatCard
              title="At Risk Projects"
              value="3"
              icon={AlertTriangle}
              description="Requiring attention"
              trend={{ value: -1, label: "vs last month" }}
              threshold={{ status: 'warning', message: 'Monitor risk mitigation progress' }}
              onClick={() => toast.info("Opening risk assessment")}
            />
            <EnhancedStatCard
              title="Cost Overruns"
              value="2"
              icon={DollarSign}
              description="Exceeding budget"
              threshold={{ status: 'critical', message: 'Immediate cost control needed' }}
              onClick={() => toast.info("Opening cost overrun analysis")}
            />
            <EnhancedStatCard
              title="Quality Score"
              value="8.7/10"
              icon={Shield}
              description="Average project quality"
              trend={{ value: 2, label: "improvement" }}
              threshold={{ status: 'good', message: 'Quality standards maintained' }}
              onClick={() => toast.info("Viewing quality metrics")}
            />
          </div>

          <ExpandableDataTable
            title="Project Performance Matrix"
            description="Comprehensive project tracking with expandable details"
            data={projects}
            columns={enhancedProjectColumns}
            expandableContent={projectExpandableContent}
            searchKey="name"
            filters={[
              { key: 'status', label: 'Status', options: ['In Progress', 'Completed', 'Planning', 'On Hold'] },
              { key: 'riskLevel', label: 'Risk Level', options: ['Low', 'Medium', 'High'] }
            ]}
            onRowAction={handleProjectAction}
          />
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Cash Flow"
              value="₹8.2M"
              icon={Activity}
              description="Monthly net cash flow"
              trend={{ value: 12, label: "improvement" }}
              threshold={{ status: 'good', message: 'Healthy cash flow position' }}
            />
            <EnhancedStatCard
              title="Receivables"
              value="₹12M"
              icon={Clock}
              description="Outstanding payments"
              trend={{ value: -5, label: "reduction" }}
              threshold={{ status: 'warning', message: 'Monitor collection efforts' }}
            />
            <EnhancedStatCard
              title="Profit Margin"
              value="18.5%"
              icon={TrendingUp}
              description="Net profit margin"
              trend={{ value: 2.3, label: "increase" }}
              threshold={{ status: 'good', message: 'Margin above industry average' }}
            />
            <EnhancedStatCard
              title="Cost Control"
              value="92%"
              icon={Target}
              description="Budget adherence"
              trend={{ value: -3, label: "vs target" }}
              threshold={{ status: 'warning', message: 'Cost control measures needed' }}
            />
          </div>

          <InteractiveChart
            title="Comprehensive Financial Analysis"
            description="Revenue, expenses, and profit trends with forecasting"
            data={revenueData}
            type="area"
            dataKey="revenue"
            secondaryDataKey="expense"
            xAxisKey="month"
            onDrillDown={handleDrillDown}
            showComparison={true}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Team Efficiency"
              value="89%"
              icon={Zap}
              description="Overall performance"
              trend={{ value: 4, label: "this quarter" }}
              threshold={{ status: 'good', message: 'Team performing above expectations' }}
            />
            <EnhancedStatCard
              title="Resource Utilization"
              value="94%"
              icon={Activity}
              description="Optimal allocation"
              trend={{ value: 2, label: "improvement" }}
              threshold={{ status: 'good', message: 'Excellent resource utilization' }}
            />
            <EnhancedStatCard
              title="Skill Gap Issues"
              value="5"
              icon={AlertTriangle}
              description="Training needed"
              trend={{ value: -2, label: "reduction" }}
              threshold={{ status: 'warning', message: 'Address skill gaps proactively' }}
            />
            <EnhancedStatCard
              title="Employee Satisfaction"
              value="8.4/10"
              icon={Users}
              description="Latest survey results"
              trend={{ value: 3, label: "improvement" }}
              threshold={{ status: 'good', message: 'High employee satisfaction' }}
            />
          </div>

          <ExpandableDataTable
            title="Department Performance Analysis"
            description="Detailed team metrics with drill-down capabilities"
            data={departments}
            columns={[
              { key: 'department', label: 'Department', type: 'text' as const },
              { key: 'efficiency', label: 'Efficiency %', type: 'progress' as const },
              { key: 'utilization', label: 'Utilization %', type: 'progress' as const },
              { 
                key: 'issues', 
                label: 'Open Issues', 
                type: 'number' as const,
                min: 0,
                max: 100,
                step: 1
              },
              { key: 'actions', label: 'Actions', type: 'actions' as const }
            ]}
            expandableContent={(row) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Team Composition</h4>
                  <div className="text-sm space-y-1">
                    <div>Total Members: 25</div>
                    <div>Senior: 8 | Mid: 12 | Junior: 5</div>
                    <div>Contractor: 3 | Permanent: 22</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recent Activities</h4>
                  <div className="text-sm space-y-1">
                    <div>• Project Alpha milestone completed</div>
                    <div>• 2 new team members onboarded</div>
                    <div>• Training session scheduled</div>
                  </div>
                </div>
              </div>
            )}
            searchKey="department"
            onRowAction={handleDepartmentAction}
          />
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EnhancedStatCard
              title="High Risk Projects"
              value="4"
              icon={AlertTriangle}
              description="Requiring immediate attention"
              threshold={{ status: 'critical', message: 'Escalate risk mitigation plans' }}
            />
            <EnhancedStatCard
              title="Risk Mitigation Rate"
              value="76%"
              icon={Shield}
              description="Successfully managed risks"
              trend={{ value: 8, label: "improvement" }}
              threshold={{ status: 'good', message: 'Effective risk management' }}
            />
            <EnhancedStatCard
              title="Avg Risk Score"
              value="3.2/10"
              icon={BarChart3}
              description="Portfolio risk level"
              trend={{ value: -5, label: "reduction" }}
              threshold={{ status: 'good', message: 'Risk levels under control' }}
            />
          </div>

          <ExpandableDataTable
            title="Project Risk Matrix"
            description="Comprehensive risk assessment and mitigation tracking"
            data={risks}
            columns={[
              { key: 'project', label: 'Project', type: 'text' as const },
              { 
                key: 'riskLevel', 
                label: 'Risk Level', 
                type: 'badge' as const,
                options: ['Low', 'Medium', 'High']
              },
              { 
                key: 'probability', 
                label: 'Probability %', 
                type: 'progress' as const 
              },
              { 
                key: 'impact', 
                label: 'Impact', 
                type: 'badge' as const,
                options: ['Minor', 'Moderate', 'Major', 'Critical']
              },
              { 
                key: 'mitigation', 
                label: 'Mitigation Strategy', 
                type: 'text' as const 
              },
              { key: 'actions', label: 'Actions', type: 'actions' as const }
            ]}
            expandableContent={(row) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Risk Details</h4>
                  <div className="text-sm space-y-1">
                    <div>Risk Category: {row.category}</div>
                    <div>Last Assessment: {row.lastAssessment}</div>
                    <div>Next Review: {row.nextReview}</div>
                    <div>Assigned Owner: {row.owner}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Mitigation Actions</h4>
                  <div className="text-sm space-y-1">
                    {row.mitigationActions.map((action, index) => (
                      <div key={index}>• {action}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            searchKey="project"
            filters={[
              { key: 'riskLevel', label: 'Risk Level', options: ['Low', 'Medium', 'High'] },
              { key: 'impact', label: 'Impact', options: ['Minor', 'Moderate', 'Major', 'Critical'] }
            ]}
            onRowAction={handleRiskAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MDDashboard
