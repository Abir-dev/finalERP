// Project type for use throughout the client
export interface Project {
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