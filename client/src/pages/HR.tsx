import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeesData } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { FilterIcon, Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { ViewEmployeeModal } from "@/components/modals/ViewEmployeeModal";

const HR = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [employees, setEmployees] = useState(employeesData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && employee.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleAddEmployee = (newEmployee: typeof employees[0]) => {
    setEmployees([...employees, newEmployee]);
    setIsAddModalOpen(false);
  };

  const handleEditEmployee = (updatedEmployee: typeof employees[0]) => {
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleViewEmployee = (employee: typeof employees[0]) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEditClick = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
          <p className="text-muted-foreground">Manage employees, departments, and attendance</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Employees" 
          value={employees.length} 
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
          title="Average Salary" 
          value={`₹${Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length).toLocaleString()}`} 
          trend={{
            value: 3,
            label: "increase"
          }}
        />
      </div>
      
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
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
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
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit
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

      {/* Modals */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEmployee}
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
            onEdit={handleEditClick}
          />

          <AddEmployeeModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            }}
            onAdd={handleEditEmployee}
            initialData={selectedEmployee}
          />
        </>
      )}
    </div>
  );
};

export default HR;
