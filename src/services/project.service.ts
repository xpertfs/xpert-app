// src/services/project.service.ts
import api from './api';

// Types
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  startDate: string;
  endDate: string;
  status: string;
  value: number;
  client: {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    contactName: string;
  };
  scopes: Scope[];
  finances: {
    contractValue: number;
    completedValue: number;
    laborCost: number;
    expenseCost: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
  };
}

export interface Scope {
  id: string;
  name: string;
  code: string;
  subScopes: SubScope[];
}

export interface SubScope {
  id: string;
  name: string;
  code: string;
  percentComplete: number;
  workItems: WorkItem[];
}

export interface WorkItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  completed: number;
  unitPrice: number;
}

export interface ProjectCreateData {
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  value?: number;
  clientId: string;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  value?: number;
  clientId?: string;
}

export interface ScopeCreateData {
  name: string;
  code: string;
  description?: string;
  subScopes?: {
    name: string;
    code: string;
    description?: string;
  }[];
}

export interface SubScopeUpdateData {
  id: string;
  percentComplete: number;
  workItems?: {
    id: string;
    completed: number;
  }[];
}

const projectService = {
  // Get all projects with optional filters
  getProjects: (params?: { 
    search?: string;
    status?: string;
    clientId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<Project[]>('/projects', { params });
  },
  
  // Get a single project by ID
  getProjectById: (id: string) => {
    return api.get<Project>(`/projects/${id}`);
  },
  
  // Create a new project
  createProject: (data: ProjectCreateData) => {
    return api.post<Project>('/projects', data);
  },
  
  // Update an existing project
  updateProject: (id: string, data: ProjectUpdateData) => {
    return api.put<Project>(`/projects/${id}`, data);
  },
  
  // Delete a project
  deleteProject: (id: string) => {
    return api.delete(`/projects/${id}`);
  },
  
  // Get project scopes
  getProjectScopes: (projectId: string) => {
    return api.get<Scope[]>(`/projects/${projectId}/scopes`);
  },
  
  // Create a project scope
  createProjectScope: (projectId: string, data: ScopeCreateData) => {
    return api.post<Scope>(`/projects/${projectId}/scopes`, data);
  },
  
  // Update project completion
  updateProjectCompletion: (projectId: string, subScopes: SubScopeUpdateData[]) => {
    return api.put(`/projects/${projectId}/completion`, { subScopes });
  },
  
  // Get project financial summary
  getProjectFinancialSummary: (projectId: string) => {
    return api.get(`/reports/project/${projectId}/financial`);
  },
  
  // Get project labor cost breakdown
  getProjectLaborCost: (projectId: string) => {
    return api.get(`/reports/project/${projectId}/labor`);
  },
  
  // Get project expense breakdown
  getProjectExpenses: (projectId: string) => {
    return api.get(`/reports/project/${projectId}/expenses`);
  },
  
  // Get project profit analysis
  getProjectProfit: (projectId: string) => {
    return api.get(`/reports/project/${projectId}/profit`);
  },
  
  // Get project completion report
  getProjectCompletion: (projectId: string) => {
    return api.get(`/reports/project/${projectId}/completion`);
  }
};

export default projectService;