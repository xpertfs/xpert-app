// src/services/contractor.service.ts
import api from './api';

// Types
export interface Contractor {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  contactName?: string;
}

export interface ContractorCreateData {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  contactName?: string;
}

export interface ContractorUpdateData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  contactName?: string;
}

const contractorService = {
  // Get all contractors with optional filters
  getContractors: (params?: { 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<Contractor[]>('/contractors', { params });
  },
  
  // Get a single contractor by ID
  getContractorById: (id: string) => {
    return api.get<Contractor>(`/contractors/${id}`);
  },
  
  // Create a new contractor
  createContractor: (data: ContractorCreateData) => {
    return api.post<Contractor>('/contractors', data);
  },
  
  // Update an existing contractor
  updateContractor: (id: string, data: ContractorUpdateData) => {
    return api.put<Contractor>(`/contractors/${id}`, data);
  },
  
  // Delete a contractor
  deleteContractor: (id: string) => {
    return api.delete(`/contractors/${id}`);
  }
};

export default contractorService;