import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FilterIcon, Plus, Search, Users, DollarSign, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ViewEmployeeModal } from "@/components/modals/ViewEmployeeModal";
import { AddEmployeeSalaryModal } from "@/components/modals/AddEmployeeSalaryModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpandableDataTable } from "@/components/expandable-data-table";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const HR = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("employees");
    const [employees, setEmployees] = useState([]);
    const [employeeSalaries, setEmployeeSalaries] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    // Add edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState<{ employee: any; salary?: any } | null>(null);
    // Add delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
    // Add backend state
    const [hrStats, setHrStats] = useState({ totalEmployees: 0, avgSalary: '' });

    useEffect(() => {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch employees and salaries
        Promise.all([
            axios.get(`${API_URL}/hr/employees`, { headers }),
            axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
        ]).then(([employeesRes, salariesRes]) => {
            const employeesData = employeesRes.data;
            const salariesData = salariesRes.data;
            
            setEmployees(employeesData);
            setEmployeeSalaries(salariesData);
            
            // Calculate HR stats
            const totalEmployees = employeesData.length;
            
            // Calculate average salary from employee salaries data
            let avgSalary = "₹0";
            if (salariesData.length > 0) {
                const totalSalary = salariesData.reduce((sum, salary) => sum + (salary.netSalary || 0), 0);
                const avgAmount = totalSalary / salariesData.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            }
            
            setHrStats({
                totalEmployees,
                avgSalary
            });
        }).catch(() => {
            // Handle errors silently
        });
    }, []);

    // Calculate HR stats from existing data

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Add searchable name field to salary data for better search functionality
    const salariesWithSearchableName = employeeSalaries.map(salary => ({
        ...salary,
        name: salary.employee?.name || '',
        department: salary.employee?.department || ''
    }));

    const filteredSalaries = salariesWithSearchableName.filter(salary => {
        const matchesSearch =
            salary.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salary.employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });



    const handleViewEmployee = (employee: typeof employees[0]) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleEditEmployee = (employee: typeof employees[0]) => {
        // Find the salary record for this employee
        const employeeSalary = employeeSalaries.find(salary => 
            salary.employeeId === employee.id
        );
        
        setEditData({
            employee: employee,
            salary: employeeSalary
        });
        setIsEditMode(true);
        setIsSalaryModalOpen(true);
        setIsViewModalOpen(false); // Close the view modal
    };

    const handleAddSalary = (salaryData: any) => {
        // Refresh both employee and salary data after adding new employee with salary
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Refresh both employees and salaries data
        Promise.all([
            axios.get(`${API_URL}/hr/employees`, { headers }),
            axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
        ]).then(([employeesRes, salariesRes]) => {
            setEmployees(employeesRes.data);
            setEmployeeSalaries(salariesRes.data);
            
            // Recalculate HR stats
            const totalEmployees = employeesRes.data.length;
            let avgSalary = "₹0";
            if (salariesRes.data.length > 0) {
                const totalSalary = salariesRes.data.reduce((sum, salary) => sum + (salary.netSalary || 0), 0);
                const avgAmount = totalSalary / salariesRes.data.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            }
            
            setHrStats({
                totalEmployees,
                avgSalary
            });
        }).catch(() => {
            // Handle errors silently
        });
    };

    const handleEditSalary = (salaryData: any) => {
        // Refresh both employee and salary data after editing
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Refresh both employees and salaries data
        Promise.all([
            axios.get(`${API_URL}/hr/employees`, { headers }),
            axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
        ]).then(([employeesRes, salariesRes]) => {
            setEmployees(employeesRes.data);
            setEmployeeSalaries(salariesRes.data);
            
            // Recalculate HR stats
            const totalEmployees = employeesRes.data.length;
            let avgSalary = "₹0";
            if (salariesRes.data.length > 0) {
                const totalSalary = salariesRes.data.reduce((sum, salary) => sum + (salary.netSalary || 0), 0);
                const avgAmount = totalSalary / salariesRes.data.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            }
            
            setHrStats({
                totalEmployees,
                avgSalary
            });
        }).catch(() => {
            // Handle errors silently
        });
        
        // Reset edit mode
        setIsEditMode(false);
        setEditData(null);
    };

    const handleDeleteEmployee = (employee: any) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    // Define columns for employees table
    const employeeColumns = [
        {
            key: 'employee',
            label: 'Employee',
            type: 'text' as const,
            render: (value: any, row: any) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.name}`} />
                        <AvatarFallback>{row.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{row.name}</p>
                    </div>
                </div>
            )
        },
        { key: 'position', label: 'Position', type: 'text' as const },
        { key: 'department', label: 'Department', type: 'text' as const },
        {
            key: 'joinedAt',
            label: 'Joined At',
            type: 'text' as const,
            render: (value: any) => value ?
                new Date(value).toLocaleDateString() :
                <Badge variant="secondary">N/A</Badge>
        },
        {
            key: 'netSalary',
            label: 'Net Salary',
            type: 'text' as const,
            render: (value: any, row: any) => {
                const employeeSalary = employeeSalaries.find(salary => 
                    salary.employeeId === row.id
                );
                return employeeSalary ? 
                    `₹${employeeSalary.netSalary?.toLocaleString()}` : 
                    <Badge variant="secondary">No Salary Record</Badge>;
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions' as const,
            render: (value: any, row: any) => (
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditEmployee(row)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteEmployee(row)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    // Expandable content for employee details
    const employeeExpandableContent = (employee: any) => {
        const employeeSalary = employeeSalaries.find(salary => 
            salary.employeeId === employee.id
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Employee Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {/* <div className="text-muted-foreground">Employee ID:</div>
                        <div className="font-medium">{employee.id}</div> */}
                        
                        <div className="text-muted-foreground">Full Name:</div>
                        <div className="font-medium">{employee.name}</div>
                        
                        <div className="text-muted-foreground">Position:</div>
                        <div className="font-medium">{employee.position}</div>
                        
                        <div className="text-muted-foreground">Department:</div>
                        <div className="font-medium">{employee.department}</div>
                        
                        <div className="text-muted-foreground">Join Date:</div>
                        <div className="font-medium">
                            {employee.joinedAt ? 
                                new Date(employee.joinedAt).toLocaleDateString() : 
                                'N/A'
                            }
                        </div>
                    </div>
                </div>

                {employeeSalary && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Salary Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Net Salary:</div>
                            <div className="font-medium">₹{employeeSalary.netSalary?.toLocaleString()}</div>
                            
                            <div className="text-muted-foreground">Total Earnings:</div>
                            <div className="font-medium">₹{employeeSalary.earnings?.total?.toLocaleString()}</div>
                            
                            <div className="text-muted-foreground">Total Deductions:</div>
                            <div className="font-medium">₹{employeeSalary.deductions?.total?.toLocaleString()}</div>
                            
                            {/* <div className="text-muted-foreground">Last Payment:</div>
                            <div className="font-medium">
                                {employeeSalary.paymentDate ?
                                    new Date(employeeSalary.paymentDate).toLocaleDateString() :
                                    'Pending'
                                }
                            </div> */}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Handle row actions for employees table
    const handleEmployeeRowAction = (action: string, row: any, updatedData?: any) => {
        switch (action) {
            case 'edit':
                // Handle edit functionality if needed
                break;
            case 'flag':
                // Handle flag functionality if needed
                break;
            default:
                break;
        }
    };

    // Define columns for salary management table
    const salaryColumns = [
        {
            key: 'employee',
            label: 'Employee',
            type: 'text' as const,
            render: (value: any, row: any) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.employee?.name}`} />
                        <AvatarFallback>{row.employee?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{row.employee?.name}</p>
                        <p className="text-xs text-muted-foreground">{row.employee?.position}</p>
                    </div>
                </div>
            )
        },
        { 
            key: 'department', 
            label: 'Department', 
            type: 'text' as const,
            render: (value: any, row: any) => row.employee?.department
        },
        {
            key: 'netSalary',
            label: 'Net Salary',
            type: 'text' as const,
            render: (value: any) => `₹${value?.toLocaleString()}`
        },
        {
            key: 'earnings',
            label: 'Earnings',
            type: 'text' as const,
            render: (value: any) => `₹${value?.total?.toLocaleString()}`
        },
        {
            key: 'deductions',
            label: 'Deductions',
            type: 'text' as const,
            render: (value: any) => `₹${value?.total?.toLocaleString()}`
        },
        // {
        //     key: 'paymentDate',
        //     label: 'Payment Date',
        //     type: 'text' as const,
        //     render: (value: any) => value ?
        //         new Date(value).toLocaleDateString() :
        //         <Badge variant="secondary">Pending</Badge>
        // },
        {
            key: 'actions',
            label: 'Actions',
            type: 'actions' as const,
            render: (value: any, row: any) => (
                <div className="flex gap-2">
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteEmployee(row.employee)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    // Expandable content for salary details
    const salaryExpandableContent = (salary: any) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Employee Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {/* <div className="text-muted-foreground">Employee ID:</div>
                        <div className="font-medium">{salary.employee?.id}</div> */}
                        
                        <div className="text-muted-foreground">Full Name:</div>
                        <div className="font-medium">{salary.employee?.name}</div>
                        
                        <div className="text-muted-foreground">Position:</div>
                        <div className="font-medium">{salary.employee?.position}</div>
                        
                        <div className="text-muted-foreground">Department:</div>
                        <div className="font-medium">{salary.employee?.department}</div>
                        
                        <div className="text-muted-foreground">Join Date:</div>
                        <div className="font-medium">
                            {salary.employee?.joinedAt ? 
                                new Date(salary.employee.joinedAt).toLocaleDateString() : 
                                'N/A'
                            }
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Earnings Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Basic:</div>
                        <div className="font-medium">₹{salary.earnings?.basic?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">DA (40%):</div>
                        <div className="font-medium">₹{salary.earnings?.da?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">HRA (15%):</div>
                        <div className="font-medium">₹{salary.earnings?.hra?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Conveyance:</div>
                        <div className="font-medium">₹{salary.earnings?.conveyance?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Allowance:</div>
                        <div className="font-medium">₹{salary.earnings?.allowance?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Medical Allowance:</div>
                        <div className="font-medium">₹{salary.earnings?.medicalAllowance?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Others:</div>
                        <div className="font-medium">₹{salary.earnings?.others?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground border-t pt-2 font-semibold">Total Earnings:</div>
                        <div className="font-semibold border-t pt-2">₹{salary.earnings?.total?.toLocaleString() || '0'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Deductions Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">TDS:</div>
                        <div className="font-medium">₹{salary.deductions?.tds?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">ESI:</div>
                        <div className="font-medium">₹{salary.deductions?.esi?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">PF:</div>
                        <div className="font-medium">₹{salary.deductions?.pf?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Leave:</div>
                        <div className="font-medium">₹{salary.deductions?.leave?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Prof. Tax:</div>
                        <div className="font-medium">₹{salary.deductions?.profTax?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Labour Welfare:</div>
                        <div className="font-medium">₹{salary.deductions?.labourWelfare?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground">Others:</div>
                        <div className="font-medium">₹{salary.deductions?.others?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground border-t pt-2 font-semibold">Total Deductions:</div>
                        <div className="font-semibold border-t pt-2">₹{salary.deductions?.total?.toLocaleString() || '0'}</div>
                        
                        <div className="text-muted-foreground border-t pt-2 font-bold text-green-600">Net Salary:</div>
                        <div className="font-bold border-t pt-2 text-green-600">₹{salary.netSalary?.toLocaleString() || '0'}</div>
                    </div>
                </div>
            </div>
        );
    };

    // Handle row actions for salary table
    const handleSalaryRowAction = (action: string, row: any, updatedData?: any) => {
        switch (action) {
            case 'edit':
                // Handle edit functionality if needed
                break;
            case 'flag':
                // Handle flag functionality if needed
                break;
            default:
                break;
        }
    };

    const confirmDeleteEmployee = async () => {
        if (!employeeToDelete) return;
        
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            // Delete employee (this should cascade delete salary records due to Prisma schema)
            await axios.delete(`${API_URL}/hr/employees/${employeeToDelete.id}`, { headers });
            
            // Refresh data after deletion
            const [employeesRes, salariesRes] = await Promise.all([
                axios.get(`${API_URL}/hr/employees`, { headers }),
                axios.get(`${API_URL}/hr-salary/employee-salaries`, { headers })
            ]);
            
            setEmployees(employeesRes.data);
            setEmployeeSalaries(salariesRes.data);
            
            // Recalculate HR stats
            const totalEmployees = employeesRes.data.length;
            let avgSalary = "₹0";
            if (salariesRes.data.length > 0) {
                const totalSalary = salariesRes.data.reduce((sum, salary) => sum + (salary.netSalary || 0), 0);
                const avgAmount = totalSalary / salariesRes.data.length;
                avgSalary = `₹${Math.round(avgAmount).toLocaleString()}`;
            }
            
            setHrStats({
                totalEmployees,
                avgSalary
            });
            
            // Close delete modal and reset state
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
            
            // Show success message
            alert(`Employee "${employeeToDelete.name}" deleted successfully`);
        } catch (error: any) {
            console.error('Error deleting employee:', error);
            
            let errorMessage = 'Failed to delete employee. Please try again.';
            if (error.response?.status === 404) {
                errorMessage = 'Employee not found. It may have already been deleted.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to delete employees.';
            } else if (error.response?.data?.error) {
                errorMessage = `Error: ${error.response.data.error}`;
            }
            
            alert(errorMessage);
        }
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
                    <ExpandableDataTable
                        title="Employees"
                        description="View and manage all employees"
                        data={filteredEmployees}
                        columns={employeeColumns}
                        expandableContent={employeeExpandableContent}
                        searchKey="name"
                        filters={[
                            {
                                key: 'department',
                                label: 'Department',
                                options: [...new Set(employees.map(emp => emp.department).filter(Boolean))]
                            },
                            {
                                key: 'position',
                                label: 'Position',
                                options: [...new Set(employees.map(emp => emp.position).filter(Boolean))]
                            }
                        ]}
                        onRowAction={handleEmployeeRowAction}
                        showExport={true}
                    />
                </TabsContent>

                <TabsContent value="salaries">
                    <ExpandableDataTable
                        title="Salary Management"
                        description="View and manage employee salaries"
                        data={filteredSalaries}
                        columns={salaryColumns}
                        expandableContent={salaryExpandableContent}
                        searchKey="name"
                        filters={[
                            {
                                key: 'department',
                                label: 'Department',
                                options: [...new Set(salariesWithSearchableName.map(salary => salary.employee?.department).filter(Boolean))]
                            }
                        ]}
                        onRowAction={handleSalaryRowAction}
                        showExport={true}
                    />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <AddEmployeeSalaryModal
                open={isSalaryModalOpen}
                onClose={() => {
                    setIsSalaryModalOpen(false);
                    setIsEditMode(false);
                    setEditData(null);
                }}
                onAdd={handleAddSalary}
                onEdit={handleEditSalary}
                employees={employees}
                editMode={isEditMode}
                editData={editData}
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
                        onEdit={() => handleEditEmployee(selectedEmployee!)}
                        onDelete={() => handleDeleteEmployee(selectedEmployee!)}
                    />
                </>
            )}

            {/* Delete Confirmation Modal */}
            {employeeToDelete && (
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete <strong>{employeeToDelete.name}</strong>? 
                                This action cannot be undone and will also delete all associated salary records.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setEmployeeToDelete(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={confirmDeleteEmployee}
                                >
                                    Delete Employee
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default HR;
