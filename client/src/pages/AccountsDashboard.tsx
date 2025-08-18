import { useState, useEffect, useMemo } from "react"
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
import { DollarSign, FileText, Users, Calculator, CreditCard, AlertTriangle, Download, ArrowLeft, Plus, TrendingUp, PieChart, Check, Clock, ChevronDown, Trash2 } from "lucide-react"
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import GenerateTaxModal from "@/components/modals/GenerateTaxModal"
import EditTaxModal from "@/components/modals/EditTaxModal"
import ReconciliationPanel from "@/components/panels/ReconciliationPanel"
import InvoiceBuilderModal from "@/components/modals/InvoiceBuilderModal"
import LabourWagesModal from "@/components/modals/LabourWagesModal"
import type { Invoice, Employee, Tax } from "@/types/dummy-data-types";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Remove typeof ...Data[0] types
// type Invoice = typeof invoicesData[0]
// type Employee = typeof employeesData[0]

const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "invoiceNumber",
        header: "Invoice #",
    },
    {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row }) => {
            const invoice = row.original
            return invoice.client?.name || invoice.clientName || "N/A"
        },
    },
    {
        accessorKey: "project.name",
        header: "Project",
        cell: ({ row }) => {
            const invoice = row.original
            return invoice.project?.name || "N/A"
        },
    },
    {
        accessorKey: "total",
        header: "Total Amount",
        cell: ({ row }) => {
            const amount = row.getValue("total") as number
            return `₹${(amount / 1000).toFixed(0)}K`
        },
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => {
            const date = row.getValue("dueDate") as string
            return new Date(date).toLocaleDateString()
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const variant = status === "PAID" ? "default" :
                status === "OVERDUE" ? "destructive" :
                    "secondary"
            return <Badge variant={variant}>{status}</Badge>
        },
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
            const invoice = row.original
            const items = invoice.items || []

            if (items.length === 0) return "No items"

            return (
                <Select>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={`${items.length} items`} />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map((item: any, idx: number) => (
                            <SelectItem key={idx} value={item.id}>
                                <div className="text-left">
                                    <div className="font-medium">{item.item}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.quantity} {item.unit} × ₹{item.rate}
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
    },
]

const payrollColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Employee",
    },
    {
        accessorKey: "position",
        header: "Role",
    },
    {
        accessorKey: "department",
        header: "Department",
    },
    {
        accessorKey: "latestNetSalary",
        header: "Salary",
        cell: ({ row }) => {
            const salary = row.getValue("latestNetSalary") as number | null | undefined;
            if (typeof salary === "number" && !Number.isNaN(salary)) {
                return `₹${(salary / 1000).toFixed(0)}K`;
            }
            return "N/A";
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            // Backend doesn't provide status on Employee; default to Active unless leftAt is set
            const status = (row.original as any).leftAt ? "Inactive" : "Active";
            return <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge>
        },
    },
]

const AccountsDashboard = () => {
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false)
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false)
    const [showGenerateTaxModal, setShowGenerateTaxModal] = useState(false)
    const [showEditTaxModal, setShowEditTaxModal] = useState(false)
    const [selectedTax, setSelectedTax] = useState<Tax | null>(null)
    const [isLabourWagesModalOpen, setIsLabourWagesModalOpen] = useState(false)
    const [labourWages, setLabourWages] = useState([])
    const [collections, setCollections] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [collectionTrends, setCollectionTrends] = useState([]);
    const [budgetData, setBudgetData] = useState([]);
    const [payrollStats, setPayrollStats] = useState({ totalEmployees: 0, payrollAmount: '', avgSalary: '', compliance: '' }); // legacy, not displayed
    const [kpiData, setKpiData] = useState({
        totalOutstanding: 0,
        overdueAmount: 0,
        paidThisMonth: 0
    });
    const [taxes, setTaxes] = useState([]);
    const [taxCharges, setTaxCharges] = useState([]);
    const [projects, setProjects] = useState([]);
    const [payments, setPayments] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [budgetMetrics, setBudgetMetrics] = useState({
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        projectCount: 0
    });

    // Memoized Payroll KPIs derived from employees with latestNetSalary
    const payrollKPIs = useMemo(() => {
        const active = employees.filter(e => !e.leftAt);
        const totalEmployees = active.length;
        const totalPayroll = active.reduce((sum, e) => sum + (typeof e.latestNetSalary === 'number' ? e.latestNetSalary : 0), 0);
        const countWithSalary = active.reduce((c, e) => c + (typeof e.latestNetSalary === 'number' && e.latestNetSalary > 0 ? 1 : 0), 0);
        const avg = countWithSalary ? totalPayroll / countWithSalary : 0;
        return {
            totalEmployees,
            payrollAmountLabel: `₹${(totalPayroll / 1000000).toFixed(1)}M`,
            avgSalaryLabel: `₹${(avg / 1000).toFixed(0)}K`
        };
    }, [employees]);

    useEffect(() => {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch collections and invoices
        axios.get(`${API_URL}/accounts/collections`, { headers })
            .then(res => setCollections(res.data))
            .catch(() => { });

        axios.get(`${API_URL}/billing/invoices`, { headers })
            .then(res => {
                setInvoices(res.data);
                // Calculate KPI data from invoices
                calculateKPIData(res.data);
            })
            .catch(() => { });

        axios.get(`${API_URL}/hr/employees`, { headers })
            .then(async res => {
                const baseEmployees = res.data as any[];
                // Fetch all salaries and map latest net salary per employee
                try {
                    const salariesRes = await axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers });
                    const salaries = salariesRes.data as any[];
                    // Build latest net salary map by employeeId
                    const latestMap = new Map<string, number>();
                    for (const s of salaries) {
                        const empId = s.employeeId;
                        const current = latestMap.get(empId);
                        const date = s.paymentDate || s.createdAt;
                        // Store by the latest date
                        if (!current) {
                            latestMap.set(empId, s.netSalary || 0);
                        }
                    }
                    const enriched = baseEmployees.map(e => ({ ...e, latestNetSalary: latestMap.get(e.id) ?? null }));
                    setEmployees(enriched);
                } catch (e) {
                    // If salaries fetch fails, still render employees with N/A salary
                    const enriched = baseEmployees.map(e => ({ ...e, latestNetSalary: null }));
                    setEmployees(enriched);
                }
            })
            .catch(() => { });

        // Fetch projects data
        fetchProjects();

        // Fetch payments data
        axios.get(`${API_URL}/billing/payments`, { headers })
            .then(res => setPayments(res.data))
            .catch(() => { });

        // Fetch labour wages data
        fetchLabourWages();
    }, []);

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/projects`, { headers });
            const projectsData = response.data;
            setProjects(projectsData);

            // Calculate budget metrics from projects data
            calculateBudgetMetrics(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to fetch project data");
            // Set fallback empty data to prevent UI crashes
            setProjects([]);
            setBudgetMetrics({
                totalBudget: 0,
                totalSpent: 0,
                remaining: 0,
                projectCount: 0
            });
            setBudgetData([]);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchLabourWages = async () => {
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/non-billables`, { headers });
            setLabourWages(response.data);
        } catch (error) {
            console.error("Error fetching labour wages:", error);
        }
    };

    const calculateBudgetMetrics = (projectsData: any[]) => {
        let totalBudget = 0;
        let totalSpent = 0;

        // For each project, calculate budget and spent amounts
        const updatedBudgetData = projectsData.map((project: any) => {
            // Use actual project budget from the budget field
            const projectBudget = project.budget || 0;

            // Calculate spent amount as sum of non-billables (labour wages) + invoices for this project
            const projectNonBillables = project.nonBillables || [];
            const nonBillableTotal = projectNonBillables.reduce((sum: number, nb: any) =>
                sum + (nb.amount || 0), 0);
            
            const projectInvoices = project.invoices || [];
            const invoiceTotal = projectInvoices.reduce((sum: number, invoice: any) =>
                sum + (invoice.total || invoice.amount || 0), 0);
            
            const projectSpent = nonBillableTotal + invoiceTotal;

            totalBudget += projectBudget;
            totalSpent += projectSpent;

            return {
                project: project.name,
                budgeted: projectBudget,
                actual: projectSpent,
                variance: projectBudget - projectSpent
            };
        });

        setBudgetData(updatedBudgetData);
        setBudgetMetrics({
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            projectCount: projectsData.length
        });
    };

    const calculateKPIData = (invoicesData: Invoice[]) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Total outstanding: sum of all unpaid/overdue invoices
        const totalOutstanding = invoicesData
            .filter(invoice => invoice.status !== 'PAID')
            .reduce((sum, invoice) => sum + (invoice.total || invoice.amount || 0), 0);

        // Overdue amount: invoices past due date minus payments
        const overdueAmount = invoicesData
            .filter(invoice => {
                const dueDate = new Date(invoice.dueDate);
                return dueDate < currentDate && invoice.status !== 'PAID';
            })
            .reduce((sum, invoice) => {
                const invoiceAmount = invoice.total || invoice.amount || 0;
                const paymentsSum = (invoice.Payment || [])
                    .filter((payment: any) => payment.paymentType === 'RECEIVE')
                    .reduce((paySum, payment) => paySum + payment.total, 0);
                return sum + Math.max(0, invoiceAmount - paymentsSum);
            }, 0);

        // Paid this month: sum of payments in current month
        const paidThisMonth = invoicesData
            .flatMap(invoice => invoice.Payment || [])
            .filter(payment => {
                const paymentDate = new Date(payment.postingDate);
                return paymentDate.getMonth() === currentMonth &&
                    paymentDate.getFullYear() === currentYear &&
                    payment.paymentType === 'RECEIVE';
            })
            .reduce((sum, payment) => sum + payment.total, 0);

        setKpiData({
            totalOutstanding,
            overdueAmount,
            paidThisMonth
        });
    };

    useEffect(() => {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        axios.get(`${API_URL}/accounts/collection-trends`, { headers })
            .then(res => setCollectionTrends(res.data))
            .catch(() => { });
        // Budget data is now calculated from projects in fetchProjects()
        axios.get(`${API_URL}/accounts/payroll-stats`, { headers })
            .then(res => setPayrollStats(res.data))
            .catch(() => { });

        // Fetch tax data
        axios.get(`${API_URL}/tax/taxes`, { headers })
            .then(res => setTaxes(res.data))
            .catch(() => { });

        axios.get(`${API_URL}/tax/tax-charges`, { headers })
            .then(res => setTaxCharges(res.data))
            .catch(() => { });
    }, []);

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

    const handleEditTax = (tax: Tax) => {
        setSelectedTax(tax)
        setShowEditTaxModal(true)
    }

    const handleDeleteTax = async (tax: Tax) => {
        if (!confirm(`Are you sure you want to delete the tax "${tax.title}"? This will also delete all associated tax charges.`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Delete the tax (this should cascade and delete tax charges)
            await axios.delete(`${API_URL}/tax/taxes/${tax.id}`, { headers });

            // Refresh the tax data
            const [taxesResponse, taxChargesResponse] = await Promise.all([
                axios.get(`${API_URL}/tax/taxes`, { headers }),
                axios.get(`${API_URL}/tax/tax-charges`, { headers })
            ]);

            setTaxes(taxesResponse.data);
            setTaxCharges(taxChargesResponse.data);
            toast.success("Tax deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting tax:", error);
            toast.error(error.response?.data?.message || "Failed to delete tax");
        }
    }

    const handleLabourWagesSuccess = () => {
        fetchLabourWages();
        fetchProjects(); // Refresh projects to update budget calculations
    };

    const handleDeleteLabourWage = async (wageId: string, wageName: string) => {
        if (!confirm(`Are you sure you want to delete the labour wage entry "${wageName}"?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.delete(`${API_URL}/non-billables/${wageId}`, { headers });
            
            toast.success("Labour wage entry deleted successfully!");
            fetchLabourWages(); // Refresh the labour wages list
            fetchProjects(); // Refresh projects to update budget calculations
        } catch (error: any) {
            console.error("Error deleting labour wage:", error);
            toast.error(error.response?.data?.message || "Failed to delete labour wage entry");
        }
    };

    const handleDeleteTaxCharge = async (taxCharge: any) => {
        if (!confirm(`Are you sure you want to delete this tax charge (${taxCharge.type} - ${taxCharge.accountHead})?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Delete the tax charge
            await axios.delete(`${API_URL}/tax/tax-charges/${taxCharge.id}`, { headers });

            // Refresh the tax charges data
            const taxChargesResponse = await axios.get(`${API_URL}/tax/tax-charges`, { headers });
            setTaxCharges(taxChargesResponse.data);
            toast.success("Tax charge deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting tax charge:", error);
            toast.error(error.response?.data?.message || "Failed to delete tax charge");
        }
    }

    const handleTaxUpdated = async (updatedTax: Tax) => {
        // Refresh the tax data from backend to get updated tax charges
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [taxesResponse, taxChargesResponse] = await Promise.all([
                axios.get(`${API_URL}/tax/taxes`, { headers }),
                axios.get(`${API_URL}/tax/tax-charges`, { headers })
            ]);

            setTaxes(taxesResponse.data);
            setTaxCharges(taxChargesResponse.data);
            toast.success("Tax updated successfully!");
        } catch (error) {
            console.error("Error refreshing tax data:", error);
            // Fallback to local update if refresh fails
            setTaxes(taxes.map(tax =>
                tax.id === updatedTax.id ? updatedTax : tax
            ))
            toast.success("Tax updated successfully!");
        }
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
                    <Button onClick={() => setShowGenerateTaxModal(true)} className="gap-2">
                        <Calculator className="h-4 w-4" />
                        Generate Tax
                    </Button>
                    <Button onClick={handleBulkReminder} variant="outline" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Bulk Reminder
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
                    <TabsTrigger value="budget">Budget Control</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll & Compliance</TabsTrigger>
                    <TabsTrigger value="taxes">Tax Management</TabsTrigger>
                    {/* <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger> */}
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Outstanding"
                            value={`₹${(kpiData.totalOutstanding / 100000).toFixed(2)}L`}
                            icon={DollarSign}
                            description="Pending collections"
                            trend={{ value: -5, label: "vs last month" }}
                            onClick={() => toast.info("Viewing outstanding breakdown")}
                        />
                        <StatCard
                            title="Overdue Amount"
                            value={`₹${(kpiData.overdueAmount / 100000).toFixed(2)}L`}
                            icon={AlertTriangle}
                            description="Past due date"
                            onClick={() => toast.info("Opening overdue analysis")}
                        />
                        <StatCard
                            title="Paid This Month"
                            value={`₹${(kpiData.paidThisMonth / 100000).toFixed(2)}L`}
                            icon={DollarSign}
                            description="Payment received"
                            trend={{ value: 12, label: "vs last month" }}
                            onClick={() => toast.info("Viewing collection report")}
                        />
                        {/* <StatCard
              title="Collection Rate"
              value="92%"
              icon={FileText}
              description="Payment efficiency"
              onClick={() => toast.info("Viewing efficiency metrics")}
            /> */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Collection Trends</CardTitle>
                                <CardDescription>Monthly invoicing and collection analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={collectionTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`₹${(Number(value) / 100000).toFixed(1)}L`, '']} />
                                        <Line type="monotone" dataKey="invoiced" stroke="#3b82f6" strokeWidth={2} />
                                        <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} />
                                        <Line type="monotone" dataKey="outstanding" stroke="#ef4444" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Tracking</CardTitle>
                                <CardDescription>Recent payment activities and status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {collections.slice(0, 5).map((payment: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{payment.partyName || payment.party}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.modeOfPayment || 'Bank Transfer'} • {new Date(payment.postingDate || payment.createdAt).toLocaleDateString()}
                                                </p>
                                                <Badge variant={payment.paymentType === 'RECEIVE' ? 'default' : 'secondary'} className="mt-1">
                                                    {payment.paymentType}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">₹{((payment.total || payment.amount || 0) / 1000).toFixed(0)}K</p>
                                                <p className="text-sm text-muted-foreground">{payment.accountPaidTo || 'Main Account'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {collections.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                            <p>No recent payments</p>
                                            <p className="text-sm">Payment activities will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Cash Flow Summary</CardTitle>
                            <CardDescription>Inflow vs outflow for the current month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        ₹{(kpiData.paidThisMonth / 100000).toFixed(1)}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Cash Inflow</p>
                                    <p className="text-xs text-green-600">Payments received</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        ₹{((kpiData.totalOutstanding - kpiData.overdueAmount) / 100000).toFixed(1)}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Cash Outflow</p>
                                    <p className="text-xs text-red-600">Payments made</p>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${kpiData.paidThisMonth > (kpiData.totalOutstanding - kpiData.overdueAmount) ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{((kpiData.paidThisMonth - (kpiData.totalOutstanding - kpiData.overdueAmount)) / 100000).toFixed(1)}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                                    <p className={`text-xs ${kpiData.paidThisMonth > (kpiData.totalOutstanding - kpiData.overdueAmount) ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpiData.paidThisMonth > (kpiData.totalOutstanding - kpiData.overdueAmount) ? 'Positive' : 'Negative'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoicing" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Invoiced"
                            value={`₹${(invoices.reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0) / 100000).toFixed(2)}L`}
                            icon={FileText}
                            description="This month"
                            trend={{ value: 8, label: "vs last month" }}
                        />
                        <StatCard
                            title="Paid Invoices"
                            value={`₹${(payments.filter((payment: any) => payment.paymentType === 'RECEIVE').reduce((sum, payment) => sum + (payment.total || 0), 0) / 100000).toFixed(2)}L`}
                            icon={Check}
                            description="Total payments received"
                            trend={{ value: 12, label: "vs last month" }}
                        />
                        <StatCard
                            title="Pending Amount"
                            value={`₹${((invoices.reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0) - payments.filter((payment: any) => payment.paymentType === 'RECEIVE').reduce((sum, payment) => sum + (payment.total || 0), 0)) / 100000).toFixed(2)}L`}
                            icon={AlertTriangle}
                            description="Total Invoiced - Paid Invoices"
                            trend={{ value: -15, label: "vs last month" }}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Invoices</CardTitle>
                            <CardDescription>Track and manage invoice status with detailed information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {invoices.slice(0, 10).map((invoice: any) => (
                                    <div key={invoice.id} className="border rounded-lg">
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const expanded = document.getElementById(`invoice-${invoice.id}`);
                                                        if (expanded) {
                                                            expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
                                                        }
                                                    }}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                                <div>
                                                    <div className="font-medium">{invoice.invoiceNumber || `INV-${invoice.id?.slice(0, 8)}`}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {invoice.client?.name || invoice.clientName || 'N/A'} • {invoice.project?.name || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-semibold">₹{((invoice.total || invoice.amount || 0) / 100000).toFixed(1)}L</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    invoice.status === 'PAID' ? 'default' :
                                                        invoice.status === 'OVERDUE' ? 'destructive' :
                                                            'secondary'
                                                }>
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div id={`invoice-${invoice.id}`} style={{ display: 'none' }} className="border-t bg-muted/50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <h4 className="font-medium mb-2 text-sm">Invoice Details</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div>Invoice Date: {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-IN')}</div>
                                                        <div>Type: {invoice.type || 'STANDARD'}</div>
                                                        <div>Work Progress: {invoice.workCompletedPercent || 0}%</div>
                                                        <div>GST Applied: {invoice.applyGst ? 'Yes' : 'No'}</div>
                                                        <div>Retention: {invoice.applyRetention ? 'Yes' : 'No'}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2 text-sm">Amount Breakdown</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div>Subtotal: ₹{((invoice.subtotal || 0) / 100000).toFixed(1)}L</div>
                                                        <div>Tax Amount: ₹{((invoice.taxAmount || 0) / 1000).toFixed(0)}K</div>
                                                        {invoice.retentionAmount > 0 && (
                                                            <div>Retention: ₹{((invoice.retentionAmount || 0) / 1000).toFixed(0)}K</div>
                                                        )}
                                                        <div className="font-medium border-t pt-1">
                                                            Total: ₹{((invoice.total || invoice.amount || 0) / 100000).toFixed(1)}L
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2 text-sm">Invoice Items</h4>
                                                    <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                                        {(invoice.items || []).length > 0 ? (
                                                            (invoice.items || []).map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between">
                                                                    <span>• {item.item}</span>
                                                                    <span>{item.quantity} {item.unit}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground">No items listed</div>
                                                        )}
                                                    </div>
                                                    {(invoice.Payment || []).length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="font-medium text-xs mb-1">Payments Received</h5>
                                                            <div className="space-y-1 text-xs">
                                                                {(invoice.Payment || []).slice(0, 3).map((payment: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between">
                                                                        <span>₹{((payment.total || 0) / 1000).toFixed(0)}K</span>
                                                                        <span>{new Date(payment.postingDate).toLocaleDateString('en-IN')}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {invoices.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>No invoices found</p>
                                        <p className="text-sm">Generated invoices will appear here</p>
                                    </div>
                                )}
                                {invoices.length > 10 && (
                                    <Button variant="outline" className="w-full">
                                        View All {invoices.length} Invoices
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="budget" className="space-y-6">
                    {projectsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-8 bg-muted rounded w-1/2"></div>
                                    <div className="h-3 bg-muted rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Budget"
                            value={`₹${(budgetMetrics.totalBudget / 100000).toFixed(2)}L`}
                            icon={DollarSign}
                            description="All projects"
                            trend={{
                                value: budgetMetrics.totalBudget > 0 ? 8 : 0,
                                label: "project allocations"
                            }}
                        />
                        <StatCard
                            title="Spent"
                            value={`₹${(budgetMetrics.totalSpent / 100000).toFixed(2)}L`}
                            icon={TrendingUp}
                            description="Total expenses"
                            trend={{
                                value: budgetMetrics.totalBudget > 0 ?
                                    Math.round(((budgetMetrics.totalBudget - budgetMetrics.totalSpent) / budgetMetrics.totalBudget) * 100) - 100 : 0,
                                label: budgetMetrics.totalSpent <= budgetMetrics.totalBudget ? "under budget" : "over budget"
                            }}
                        />
                        <StatCard
                            title="Remaining"
                            value={`₹${(budgetMetrics.remaining / 100000).toFixed(2)}L`}
                            icon={PieChart}
                            description="Available funds"
                            trend={{
                                value: budgetMetrics.totalBudget > 0 ?
                                    Math.round((budgetMetrics.remaining / budgetMetrics.totalBudget) * 100) : 0,
                                label: "of total budget"
                            }}
                        />
                        <StatCard
                            title="Projects"
                            value={budgetMetrics.projectCount.toString()}
                            icon={Users}
                            description="Active projects"
                            trend={{
                                value: budgetMetrics.projectCount > 0 ?
                                    Math.round(budgetMetrics.totalBudget / budgetMetrics.projectCount / 100000) : 0,
                                label: "avg ₹L per project"
                            }}
                        />
                        </div>
                    )}

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
                                        <Tooltip formatter={(value) => [`₹${(Number(value) / 100000).toFixed(1)}L`, '']} />
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
                                                <span className={project.variance > 0 ? "text-green-600" : "text-red-600"}>
                                                    {project.variance > 0 ? "Under" : "Over"} by ₹{Math.abs(project.variance / 100000).toFixed(2)}L
                                                </span>
                                            </div>
                                            <Progress
                                                value={(project.actual / project.budgeted) * 100}
                                                className="h-2"
                                            />
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Spent: ₹{(project.actual / 100000).toFixed(2)}L</span>
                                                <span>Budget: ₹{(project.budgeted / 100000).toFixed(2)}L</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                            <CardDescription>Detailed breakdown of active projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.slice(0, 6).map((project: any) => {
                                    const projectBudget = project.budget || 0;
                                    const nonBillableTotal = (project.nonBillables || []).reduce((sum: number, nb: any) =>
                                        sum + (nb.amount || 0), 0);
                                    const invoiceTotal = (project.invoices || []).reduce((sum: number, invoice: any) =>
                                        sum + (invoice.total || invoice.amount || 0), 0);
                                    const projectSpent = nonBillableTotal + invoiceTotal;
                                    const completionPercentage = projectBudget > 0 ? (projectSpent / projectBudget) * 100 : 0;

                                    return (
                                        <div key={project.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">{project.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {project.client?.name || 'No client'}
                                                    </p>
                                                </div>
                                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                                    {project.status}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Budget:</span>
                                                    <span>₹{(projectBudget / 100000).toFixed(2)}L</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Spent:</span>
                                                    <span>₹{(projectSpent / 100000).toFixed(1)}L</span>
                                                </div>
                                                <Progress value={Math.min(completionPercentage, 100)} className="h-2" />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{completionPercentage.toFixed(1)}% utilized</span>
                                                    <span>{project.invoices?.length || 0} invoices</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Start: {new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                                                <span>End: {new Date(project.endDate).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {projects.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>No projects found</p>
                                        <p className="text-sm">Create projects to see budget analysis</p>
                                    </div>
                                )}

                                {projects.length > 6 && (
                                    <div className="col-span-full">
                                        <Button variant="outline" className="w-full">
                                            View All {projects.length} Projects
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payroll" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Employees"
                            value={payrollKPIs.totalEmployees}
                            icon={Users}
                            description="Active staff"
                            trend={{ value: 0, label: "vs last month" }}
                        />
                        {/* <StatCard
                            title="Payroll Amount"
                            value={payrollKPIs.payrollAmountLabel}
                            icon={DollarSign}
                            description="Sum of latest net salaries"
                            trend={{ value: 0, label: "vs last month" }}
                        /> */}
                        <StatCard
                            title="Avg. Salary"
                            value={payrollKPIs.avgSalaryLabel}
                            icon={TrendingUp}
                            description="Per active employee"
                        />
                        <StatCard
                            title="Labour Wages"
                            value={`₹${(labourWages.reduce((sum: number, wage: any) => sum + (wage.amount || 0), 0) / 1000).toFixed(0)}K`}
                            icon={Users}
                            description="Total labour costs"
                            trend={{ value: labourWages.length, label: "wage entries" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employee Directory</CardTitle>
                                <CardDescription>Manage employee information and payroll</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable columns={payrollColumns} data={employees} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Labour Wages</CardTitle>
                                    <CardDescription>All labour wage entries across projects</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setIsLabourWagesModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Labour Wage
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {labourWages.length > 0 ? labourWages.slice(0, 4).map((wage: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg group hover:border-muted-foreground/20 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium">{wage.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {wage.project?.name || 'No project'} • {new Date(wage.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                                {wage.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">{wage.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-medium">₹{(wage.amount / 1000).toFixed(1)}K</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        by {wage.creator?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteLabourWage(wage.id, wage.name)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium">No Labour Wages</p>
                                            <p className="text-sm">Click "Add Labour Wage" to create your first entry.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="taxes" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Tax Entities"
                            value={taxes.length.toString()}
                            icon={FileText}
                            description="Active tax configurations"
                        />
                        <StatCard
                            title="Tax Charges"
                            value={taxCharges.length.toString()}
                            icon={Calculator}
                            description="Individual tax line items"
                        />
                        <StatCard
                            title="Total Tax Amount"
                            value={`₹${(taxCharges.reduce((sum: number, charge: any) => sum + (charge.total || 0), 0) / 100000).toFixed(1)}L`}
                            icon={DollarSign}
                            description="Total tax liability"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Tax Entities</CardTitle>
                                        <CardDescription>Manage tax configurations and categories</CardDescription>
                                    </div>
                                    <Button onClick={() => setShowGenerateTaxModal(true)} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Tax
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {taxes.map((tax: any) => (
                                        <div key={tax.id} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{tax.title}</p>
                                                <p className="text-sm text-muted-foreground">{tax.company}</p>
                                                {tax.taxCategory && (
                                                    <Badge variant="outline" className="mt-1">{tax.taxCategory}</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditTax(tax)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteTax(tax)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {taxes.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                            <p>No tax entities configured</p>
                                            <p className="text-sm">Add a tax entity to get started</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tax Charges</CardTitle>
                                <CardDescription>Individual tax line items and calculations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {taxCharges.slice(0, 10).map((charge: any) => (
                                        <div key={charge.id} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={
                                                        charge.type === 'GST' ? 'default' :
                                                            charge.type === 'TDS' ? 'secondary' :
                                                                'outline'
                                                    }>
                                                        {charge.type}
                                                    </Badge>
                                                    <span className="font-medium">{charge.accountHead}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Rate: {charge.taxRate}% | Amount: ₹{(charge.amount / 1000).toFixed(1)}K
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{(charge.total / 1000).toFixed(1)}K</p>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDeleteTaxCharge(charge)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {taxCharges.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                            <p>No tax charges found</p>
                                            <p className="text-sm">Tax charges will appear here</p>
                                        </div>
                                    )}
                                    {taxCharges.length > 10 && (
                                        <Button variant="outline" className="w-full">
                                            View All {taxCharges.length} Tax Charges
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Tax Management Tools</CardTitle>
                            <CardDescription>Quick actions for tax management</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start" onClick={() => setShowGenerateTaxModal(true)}>
                                    <Calculator className="h-5 w-5 mb-2" />
                                    <span className="font-medium">GST Calculator</span>
                                    <span className="text-sm text-muted-foreground">Calculate GST amounts</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start" onClick={() => setShowGenerateTaxModal(true)}>
                                    <FileText className="h-5 w-5 mb-2" />
                                    <span className="font-medium">TDS Calculator</span>
                                    <span className="text-sm text-muted-foreground">Calculate TDS deductions</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start">
                                    <Download className="h-5 w-5 mb-2" />
                                    <span className="font-medium">Generate Reports</span>
                                    <span className="text-sm text-muted-foreground">Export tax reports</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start">
                                    <TrendingUp className="h-5 w-5 mb-2" />
                                    <span className="font-medium">Tax Analytics</span>
                                    <span className="text-sm text-muted-foreground">View tax trends</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card> */}
                </TabsContent>

                <TabsContent value="reconciliation">
                    <ReconciliationPanel />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            {showGenerateTaxModal && (
                <GenerateTaxModal
                    onClose={() => setShowGenerateTaxModal(false)}
                    onTaxCreated={async (tax) => {
                        toast.success(`Tax "${tax.title}" created successfully!`);
                        // Refresh the tax data

            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
             const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const [taxesResponse, taxChargesResponse] = await Promise.all([
                axios.get(`${API_URL}/tax/taxes`, { headers }),
                axios.get(`${API_URL}/tax/tax-charges`, { headers })
            ]);

            setTaxes(taxesResponse.data);
            setTaxCharges(taxChargesResponse.data);
                    }}
                />
            )}

            {showEditTaxModal && selectedTax && (
                <EditTaxModal
                    onClose={() => {
                        setShowEditTaxModal(false)
                        setSelectedTax(null)
                    }}
                    onTaxUpdated={handleTaxUpdated}
                    tax={selectedTax}
                />
            )}

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

            <LabourWagesModal
                isOpen={isLabourWagesModalOpen}
                onClose={() => setIsLabourWagesModalOpen(false)}
                onSuccess={handleLabourWagesSuccess}
            />
        </div>
    )
}

export default AccountsDashboard

