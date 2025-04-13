// src/services/client.service.ts
import api from './api';

// Types
export interface Client {
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

export interface ClientCreateData {
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

export interface ClientUpdateData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  contactName?: string;
}

const clientService = {
  // Get all clients with optional filters
  getClients: (params?: { 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<Client[]>('/clients', { params });
  },
  
  // Get a single client by ID
  getClientById: (id: string) => {
    return api.get<Client>(`/clients/${id}`);
  },
  
  // Create a new client
  createClient: (data: ClientCreateData) => {
    return api.post<Client>('/clients', data);
  },
  
  // Update an existing client
  updateClient: (id: string, data: ClientUpdateData) => {
    return api.put<Client>(`/clients/${id}`, data);
  },
  
  // Delete a client
  deleteClient: (id: string) => {
    return api.delete(`/clients/${id}`);
  }
};

export default clientService;