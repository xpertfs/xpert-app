// src/services/scope.service.ts
import api from './api';
import { Scope, SubScope } from './project.service';

// Types
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

export interface ScopeUpdateData {
  name?: string;
  description?: string;
}

export interface SubScopeCreateData {
  name: string;
  code: string;
  description?: string;
}

export interface SubScopeUpdateData {
  name?: string;
  description?: string;
  percentComplete?: number;
}

export interface WorkItemAssignmentData {
  workItemId: string;
  quantity: number;
}

const scopeService = {
  // Get all scopes for a project
  getProjectScopes: (projectId: string) => {
    return api.get<Scope[]>(`/projects/${projectId}/scopes`);
  },
  
  // Get a single scope by ID
  getScope: (projectId: string, scopeId: string) => {
    return api.get<Scope>(`/projects/${projectId}/scopes/${scopeId}`);
  },
  
  // Create a new scope with sub-scopes
  createProjectScope: (projectId: string, data: ScopeCreateData) => {
    return api.post<Scope>(`/projects/${projectId}/scopes`, data);
  },
  
  // Update an existing scope
  updateScope: (projectId: string, scopeId: string, data: ScopeUpdateData) => {
    return api.put<Scope>(`/projects/${projectId}/scopes/${scopeId}`, data);
  },
  
  // Delete a scope
  deleteScope: (projectId: string, scopeId: string) => {
    return api.delete(`/projects/${projectId}/scopes/${scopeId}`);
  },
  
  // Create a new sub-scope
  createSubScope: (projectId: string, scopeId: string, data: SubScopeCreateData) => {
    return api.post<SubScope>(`/scopes/${scopeId}/sub-scopes`, data);
  },
  
  // Update an existing sub-scope
  updateSubScope: (projectId: string, scopeId: string, subScopeId: string, data: SubScopeUpdateData) => {
    return api.put<SubScope>(`/scopes/${scopeId}/sub-scopes/${subScopeId}`, data);
  },
  
  // Delete a sub-scope
  deleteSubScope: (projectId: string, scopeId: string, subScopeId: string) => {
    return api.delete(`/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}`);
  },
  
  // Add work item to sub-scope
  addWorkItemToSubScope: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string,
    quantity: number
  ) => {
    return api.post(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items`,
      { workItemId, quantity }
    );
  },
  
  // Update work item quantity in sub-scope
  updateWorkItemQuantity: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string,
    quantity: number
  ) => {
    return api.put(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items/${workItemId}`,
      { quantity }
    );
  },
  
  // Update work item completion in sub-scope
  updateWorkItemCompletion: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string,
    completed: number
  ) => {
    return api.put(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items/${workItemId}/completion`,
      { completed }
    );
  },
  
  // Remove work item from sub-scope
  removeWorkItemFromSubScope: (
    projectId: string,
    scopeId: string,
    subScopeId: string,
    workItemId: string
  ) => {
    return api.delete(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items/${workItemId}`
    );
  },
  
  // Get all work items for a sub-scope
  getSubScopeWorkItems: (projectId: string, scopeId: string, subScopeId: string) => {
    return api.get(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/work-items`
    );
  }
};

export default scopeService;