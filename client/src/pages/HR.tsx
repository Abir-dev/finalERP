import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FilterIcon, Plus, Search, Users, DollarSign, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ViewEmployeeModal } from "@/components/modals/ViewEmployeeModal";
import { AddEmployeeSalaryModal } from "@/components/modals/AddEmployeeSalaryModal";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const HR = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("employees");
    const [employees, setEmployees] = useState([]);
    const [employeeSalaries, setEmployeeSalaries] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    // Add backend state
    const [hrStats, setHrStats] = useState({ totalEmployees: 0, avgSalary: '' });

    useEffect(() => {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        axios.get(`${API_URL}/hr/employees`, { headers })
            .then(res => setEmployees(res.data))
            .catch(() => { });

            axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
            .then(res => setEmployeeSalaries(res.data))
            .catch(() => { });
            
            const totalEmployees = employees.length;
        
            // Calculate average salary from employee salaries data
            let avgSalary = "₹0";
            if (employeeSalaries.length > 0) {
                const totalSalary = employeeSalaries.reduce((sum, salary) => sum + (salary.netSalary || 0), 0);
                const avgAmount = totalSalary / employeeSalaries.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            } else if (employees.length > 0) {
                // Fallback to employee base salary if no salary records
                const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
                const avgAmount = totalSalary / employees.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            }
            
            setHrStats({
                totalEmployees,
                avgSalary
            });
    }, []);

    // Fetch employee salaries
    useEffect(() => {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
            .then(res => setEmployeeSalaries(res.data))
            .catch(() => { });
    }, []);

    // Calculate HR stats from existing data

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const filteredSalaries = employeeSalaries.filter(salary => {
        const matchesSearch =
            salary.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salary.employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });



    const handleViewEmployee = (employee: typeof employees[0]) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleAddSalary = (salaryData: any) => {
        // Refresh both employee and salary data after adding new employee with salary
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Refresh employees list
        axios.get(`${API_URL}/hr/employees`, { headers })
            .then(res => setEmployees(res.data))
            .catch(() => { });
            
        // Refresh salary data
        axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
            .then(res => setEmployeeSalaries(res.data))
            .catch(() => { });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
                    <p className="text-muted-foreground">Manage employees, departments, and attendance</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsSalaryModalOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Employees"
                    value={hrStats.totalEmployees}
                    icon={Users}
                    trend={{
                        value: 5,
                        label: "new this month"
                    }}
                />
                <StatCard
                    title="Active Employees"
                    value={employees.filter(e => e.status === "Active").length}
                    icon={Users}
                />
                <StatCard
                    title="Departments"
                    value="4"
                    description="Construction, Design, Management, Admin"
                />
                <StatCard
                    title="Avg. Salary"
                    value={hrStats.avgSalary}
                    trend={{
                        value: 3,
                        label: "increase"
                    }}
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="salaries">Salary Management</TabsTrigger>
                </TabsList>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employees</CardTitle>
                            <CardDescription>
                                View and manage all employees
                            </CardDescription>

                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon">
                                        <FilterIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead>
                                            <tr className="border-b transition-colors hover:bg-muted/50">
                                                <th className="h-12 px-4 text-left align-middle font-medium">Employee</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Salary</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEmployees.map((employee) => (
                                                <tr
                                                    key={employee.id}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`} />
                                                                <AvatarFallback>{employee.name?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{employee.name}</p>
                                                                <p className="text-xs text-muted-foreground">{employee.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">{employee.department}</td>
                                                    <td className="p-4 align-middle">{employee.role}</td>
                                                    <td className="p-4 align-middle">₹{employee.salary.toLocaleString()}</td>
                                                    <td className="p-4 align-middle">
                                                        <Badge
                                                            variant={employee.status === "Active" ? "default" : "secondary"}
                                                        >
                                                            {employee.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleViewEmployee(employee)}>
                                                                View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="salaries">
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Management</CardTitle>
                            <CardDescription>
                                View and manage employee salaries
                            </CardDescription>

                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search salary records..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon">
                                        <FilterIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead>
                                            <tr className="border-b transition-colors hover:bg-muted/50">
                                                <th className="h-12 px-4 text-left align-middle font-medium">Employee</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Net Salary</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Earnings</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Deductions</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Payment Date</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSalaries.map((salary) => (
                                                <tr
                                                    key={salary.id}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${salary.employee?.name}`} />
                                                                <AvatarFallback>{salary.employee?.name?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{salary.employee?.name}</p>
                                                                <p className="text-xs text-muted-foreground">{salary.employee?.position}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">{salary.employee?.department}</td>
                                                    <td className="p-4 align-middle">₹{salary.netSalary?.toLocaleString()}</td>
                                                    <td className="p-4 align-middle">₹{salary.earnings?.total?.toLocaleString()}</td>
                                                    <td className="p-4 align-middle">₹{salary.deductions?.total?.toLocaleString()}</td>
                                                    <td className="p-4 align-middle">
                                                        {salary.paymentDate ?
                                                            new Date(salary.paymentDate).toLocaleDateString() :
                                                            <Badge variant="secondary">Pending</Badge>
                                                        }
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <AddEmployeeSalaryModal
                open={isSalaryModalOpen}
                onClose={() => setIsSalaryModalOpen(false)}
                onAdd={handleAddSalary}
                employees={employees}
            />

            {selectedEmployee && (
                <>
                    <ViewEmployeeModal
                        open={isViewModalOpen}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setSelectedEmployee(null);
                        }}
                        employee={selectedEmployee}
                        onEdit={() => {}} // No edit functionality needed
                    />
                </>
            )}
        </div>
    );
};

export default HR;
