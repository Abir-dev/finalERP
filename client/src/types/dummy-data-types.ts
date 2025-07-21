// Project type (merged backend and frontend fields)
export type Project = {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  deadline?: string;
  location?: string;
  manager?: string;
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
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

// InventoryItem type (merged backend and frontend fields)
export type InventoryItem = {
  id: string;
  name: string;
  category: string | string[];
  quantity: number;
  unit: string;
  location?: string;
  lastUpdated?: string;
  reorderLevel?: number;
  maxStock?: number;
  safetyStock?: number;
  isFlagged?: boolean;
  primarySupplier?: string;
  unitCost?: number;
  description?: string;
  lastOrderDate?: string;
  nextOrderDate?: string;
  qualityScore?: number;
  photos?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Invoice type (merged backend and frontend fields)
export type Invoice = {
  id: string;
  clientName?: string;
  projectId?: string;
  clientId?: string;
  amount: number;
  dueDate: string;
  sentDate?: string;
  paymentMethod?: string;
  status: string;
  verified?: boolean;
  paid?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Employee type (merged backend and frontend fields)
export type Employee = {
  id: string;
  name: string;
  role?: string;
  department?: string;
  salary?: number;
  status?: string;
  position?: string;
  joinedAt?: string;
  leftAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Task type (merged backend and frontend fields)
export type Task = {
  id: string;
  name: string;
  project: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  progress: number;
  startDate?: string;
  phase?: string;
  progressHistory?: Array<{
    progress: number;
    remarks: string;
    timestamp: string;
  }>;
};

// Issue type (merged backend and frontend fields)
export type Issue = {
  id: string;
  type?: string;
  description: string;
  reportedBy?: string;
  severity: string;
  status: string;
  dateLogged?: string;
  escalated?: boolean;
  location?: string;
  impact?: string;
  category?: string;
  responsibleParty?: string;
};

// Other types remain unchanged
export type Client = {
  id: string;
  name: string;
  totalProjects: number;
  activeProjects: number;
  totalValue: number;
  lastContact: string;
};

export type Design = {
  id: string;
  name: string;
  client: string;
  designer: string;
  status: string;
  revisions: number;
  uploadDate: string;
}; 