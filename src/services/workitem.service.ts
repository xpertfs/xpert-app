// src/services/workitem.service.ts
import api from './api';

// Types
export interface WorkItem {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
}

export interface WorkItemCreateData {
  code: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
}

export interface WorkItemUpdateData {
  name?: string;
  description?: string;
  unit?: string;
  unitPrice?: number;
}

export interface SubScopeWorkItem {
  id: string;
  workItemId: string;
  subScopeId: string;
  quantity: number;
  completed: number;
  workItem: WorkItem;
}

export interface SubScopeWorkItemUpdateData {
  quantity?: number;
  completed?: number;
}

const workItemService = {
  // Get all work items for a project
  getProjectWorkItems: (projectId: string) => {
    return api.get<WorkItem[]>(`/projects/${projectId}/work-items`);
  },
  
  // Get a single work item by ID
  getWorkItem: (projectId: string, workItemId: string) => {
    return api.get<WorkItem>(`/projects/${projectId}/work-items/${workItemId}`);
  },
  
  // Create a new work item
  createWorkItem: (projectId: string, data: WorkItemCreateData) => {
    return api.post<WorkItem>(`/projects/${projectId}/work-items`, data);
  },
  
  // Update an existing work item
  updateWorkItem: (projectId: string, workItemId: string, data: WorkItemUpdateData) => {
    return api.put<WorkItem>(`/projects/${projectId}/work-items/${workItemId}`, data);
  },
  
  // Delete a work item
  deleteWorkItem: (projectId: string, workItemId: string) => {
    return api.delete(`/projects/${projectId}/work-items/${workItemId}`);
  },
  
  // Get work items for a specific sub-scope
  getSubScopeWorkItems: (projectId: string, scopeId: string, subScopeId: string) => {
    return api.get<SubScopeWorkItem[]>(`/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items`);
  },
  
  // Assign work item to a sub-scope
  assignWorkItemToSubScope: (
    projectId: string, 
    scopeId: string, 
    subScopeId: string, 
    workItemId: string,
    quantity: number
  ) => {
    return api.post<SubScopeWorkItem>(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items`,
      { workItemId, quantity }
    );
  },
  
  // Update work item in a sub-scope
  updateSubScopeWorkItem: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string,
    data: SubScopeWorkItemUpdateData
  ) => {
    return api.put<SubScopeWorkItem>(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items/${workItemId}`,
      data
    );
  },
  
  // Remove work item from a sub-scope
  removeWorkItemFromSubScope: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string
  ) => {
    return api.delete(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items/${workItemId}`
    );
  }
};

export default workItemService;