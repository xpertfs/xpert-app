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
  
  // Get all sub-scopes for a scope
  getSubScopes: (projectId: string, scopeId: string) => {
    return api.get<SubScope[]>(`/projects/${projectId}/scopes/${scopeId}/sub-scopes`);
  },
  
  // Get a single sub-scope by ID
  getSubScope: (projectId: string, scopeId: string, subScopeId: string) => {
    return api.get<SubScope>(`/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}`);
  },
  
  // Create a new sub-scope
  createSubScope: (projectId: string, scopeId: string, data: SubScopeCreateData) => {
    return api.post<SubScope>(`/projects/${projectId}/scopes/${scopeId}/sub-scopes`, data);
  },
  
  // Update an existing sub-scope
  updateSubScope: (projectId: string, scopeId: string, subScopeId: string, data: SubScopeUpdateData) => {
    return api.put<SubScope>(`/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}`, data);
  },
  
  // Delete a sub-scope
  deleteSubScope: (projectId: string, scopeId: string, subScopeId: string) => {
    return api.delete(`/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}`);
  },
  
  // Update sub-scope completion percentage
  updateSubScopeCompletion: (projectId: string, scopeId: string, subScopeId: string, percentComplete: number) => {
    return api.put<SubScope>(
      `/projects/${projectId}/scopes/${scopeId}/sub-scopes/${subScopeId}/completion`,
      { percentComplete }
    );
  }
};

export default scopeService;