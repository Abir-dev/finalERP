import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { EmployeeSalaryFormData, UserRole, Employee } from "@/types/dummy-data-types";
import axios from "axios";

interface AddEmployeeSalaryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (salaryData: EmployeeSalaryFormData) => void;
  employees?: Employee[];
}

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

export function AddEmployeeSalaryModal({ open, onClose, onAdd, employees }: AddEmployeeSalaryModalProps) {
  const [formData, setFormData] = useState<EmployeeSalaryFormData>({
    employeeName: "",
    role: "",
    status: "Active",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    netSalary: 0,
    grossSalary: 0,
    earnings: {
      basic: 0,
      da: 0,
      hra: 0,
      conveyance: 0,
      allowance: 0,
      medicalAllowance: 0,
      others: 0,
    },
    deductions: {
      tds: 0,
      esi: 0,
      pf: 0,
      leave: 0,
      profTax: 0,
      labourWelfare: 0,
      others: 0,
    },
    remarks: "",
  });

  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Fetch available roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const response = await fetch('/api/users/roles');
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const rolesData: UserRole[] = await response.json();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to hardcoded roles if API fails
        const fallbackRoles: UserRole[] = [
          { value: 'admin', label: 'Admin' },
          { value: 'md', label: 'MD' },
          { value: 'client-manager', label: 'Client Manager' },
          { value: 'store', label: 'Store' },
          { value: 'accounts', label: 'Accounts' },
          { value: 'site', label: 'Site' },
          { value: 'client', label: 'Client' }
        ];
        setRoles(fallbackRoles);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleEarningsChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      earnings: {
        ...formData.earnings,
        [field]: value,
      },
    });
  };

  const handleDeductionsChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      deductions: {
        ...formData.deductions,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      
      // Create employee first since the form is for "Add Employee" with salary details
      const employeePayload = {
        position: formData.role,
        department: "General", // You can make this dynamic
        salary: formData.grossSalary,
        joinedAt: new Date(),
      };

      const employeeResponse = await axios.post(`${API_URL}/hr/employees`, employeePayload, { headers });
      const employeeId = employeeResponse.data.id;

      // Then create the salary record
      const salaryPayload = {
        employeeId: employeeId,
        netSalary: formData.netSalary || formData.grossSalary,
        paymentDate: null,
        remarks: formData.remarks,
        earnings: formData.earnings,
        deductions: formData.deductions
      };

      await axios.post(`${API_URL}/hr-salary/employee-salaries`, salaryPayload, { headers });
      
      onAdd(formData);
      onClose();
    } catch (error) {
      console.error('Error creating employee and salary:', error);
      alert('Failed to create employee and salary record. Please try again.');
    }
  };

  const addNewEarning = () => {
    // This would typically open another modal or form to add custom earning types
    console.log("Add new earning type");
  };

  const addNewDeduction = () => {
    // This would typically open another modal or form to add custom deduction types
    console.log("Add new deduction type");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Add Employee</DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Enter employee name"
              />
            </div>

            <div className="space-y-2">
            <Label htmlFor="grossSalary">Net Salary</Label>
              <Input
                id="grossSalary"
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData({ ...formData, grossSalary: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          {/* <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                placeholder="2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="netSalary">Net Salary</Label>
              <Input
                id="netSalary"
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({ ...formData, netSalary: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div> */}

          {/* <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Employee Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select employee role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* Earnings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Earnings</h3>
              {/* <Button
                type="button"
                variant="link"
                className="text-black p-0 h-auto"
                onClick={addNewEarning}
              >
                + Add New
              </Button> */}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic">Basic</Label>
                <Input
                  id="basic"
                  type="number"
                  value={formData.earnings.basic}
                  onChange={(e) => handleEarningsChange("basic", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="da">DA(40%)</Label>
                <Input
                  id="da"
                  type="number"
                  value={formData.earnings.da}
                  onChange={(e) => handleEarningsChange("da", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hra">HRA(15%)</Label>
                <Input
                  id="hra"
                  type="number"
                  value={formData.earnings.hra}
                  onChange={(e) => handleEarningsChange("hra", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conveyance">Conveyance</Label>
                <Input
                  id="conveyance"
                  type="number"
                  value={formData.earnings.conveyance}
                  onChange={(e) => handleEarningsChange("conveyance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowance">Allowance</Label>
                <Input
                  id="allowance"
                  type="number"
                  value={formData.earnings.allowance}
                  onChange={(e) => handleEarningsChange("allowance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                <Input
                  id="medicalAllowance"
                  type="number"
                  value={formData.earnings.medicalAllowance}
                  onChange={(e) => handleEarningsChange("medicalAllowance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="earningsOthers">Others</Label>
                <Input
                  id="earningsOthers"
                  type="number"
                  value={formData.earnings.others}
                  onChange={(e) => handleEarningsChange("others", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Deductions</h3>
              {/* <Button
                type="button"
                variant="link"
                className="text-black p-0 h-auto"
                onClick={addNewDeduction}
              >
                + Add New
              </Button> */}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tds">TDS</Label>
                <Input
                  id="tds"
                  type="number"
                  value={formData.deductions.tds}
                  onChange={(e) => handleDeductionsChange("tds", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="esi">ESI</Label>
                <Input
                  id="esi"
                  type="number"
                  value={formData.deductions.esi}
                  onChange={(e) => handleDeductionsChange("esi", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pf">PF</Label>
                <Input
                  id="pf"
                  type="number"
                  value={formData.deductions.pf}
                  onChange={(e) => handleDeductionsChange("pf", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave">Leave</Label>
                <Input
                  id="leave"
                  type="number"
                  value={formData.deductions.leave}
                  onChange={(e) => handleDeductionsChange("leave", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profTax">Prof.Tax</Label>
                <Input
                  id="profTax"
                  type="number"
                  value={formData.deductions.profTax}
                  onChange={(e) => handleDeductionsChange("profTax", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="labourWelfare">Labour Welfare</Label>
                <Input
                  id="labourWelfare"
                  type="number"
                  value={formData.deductions.labourWelfare}
                  onChange={(e) => handleDeductionsChange("labourWelfare", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deductionsOthers">Others</Label>
                <Input
                  id="deductionsOthers"
                  type="number"
                  value={formData.deductions.others}
                  onChange={(e) => handleDeductionsChange("others", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Enter any additional remarks"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black">
              Add Employee Salary
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
