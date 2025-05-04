// src/services/material.service.ts
import api from './api';

// Types
export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  category?: string;
}

export interface MaterialCreateData {
  code: string;
  name: string;
  description?: string;
  unit: string;
  category?: string;
}

export interface MaterialUpdateData {
  name?: string;
  description?: string;
  unit?: string;
  category?: string;
}

export interface Vendor {
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

export interface VendorCreateData {
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

export interface VendorUpdateData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  contactName?: string;
}

export interface VendorPrice {
  id: string;
  price: number;
  effectiveDate: string;
  endDate?: string;
  notes?: string;
  vendor: Vendor;
  material: Material;
}

export interface VendorPriceCreateData {
  vendorId: string;
  price: number;
  effectiveDate: string;
  endDate?: string;
  notes?: string;
}

export interface BestPrice {
  material: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
  bestPrice: {
    id: string;
    price: number;
    vendor: Vendor;
    effectiveDate: string;
    endDate?: string;
  };
  allPrices: {
    id: string;
    vendor: string;
    price: number;
    effectiveDate: string;
    endDate?: string;
    difference: number;
    percentDifference: number;
  }[];
  priceCount: number;
}

export interface ProjectMaterial {
  id: string;
  quantity: number;
  material: Material;
  vendor?: Vendor;
  unitPrice: number;
  totalPrice: number;
}

const materialService = {
  // Get all materials with optional filters
  getMaterials: (params?: {
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<Material[]>('/materials', { params });
  },

  // Get a material by ID
  getMaterialById: (id: string) => {
    return api.get<Material & { vendorPrices: VendorPrice[] }>(`/materials/${id}`);
  },

  // Create a new material
  createMaterial: (data: MaterialCreateData) => {
    return api.post<Material>('/materials', data);
  },

  // Update a material
  updateMaterial: (id: string, data: MaterialUpdateData) => {
    return api.put<Material>(`/materials/${id}`, data);
  },

  // Delete a material
  deleteMaterial: (id: string) => {
    return api.delete(`/materials/${id}`);
  },

  // Get all vendors
  getVendors: (params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<Vendor[]>('/materials/vendors', { params });
  },

  // Get a vendor by ID
  getVendorById: (id: string) => {
    return api.get<Vendor & { vendorPrices: VendorPrice[] }>(`/materials/vendors/${id}`);
  },

  // Create a new vendor
  createVendor: (data: VendorCreateData) => {
    return api.post<Vendor>('/materials/vendors', data);
  },

  // Update a vendor
  updateVendor: (id: string, data: VendorUpdateData) => {
    return api.put<Vendor>(`/materials/vendors/${id}`, data);
  },

  // Delete a vendor
  deleteVendor: (id: string) => {
    return api.delete(`/materials/vendors/${id}`);
  },

  // Get vendor prices for a material
  getVendorPrices: (materialId: string) => {
    return api.get<VendorPrice[]>(`/materials/${materialId}/prices`);
  },

  // Create a vendor price for a material
  createVendorPrice: (materialId: string, data: VendorPriceCreateData) => {
    return api.post<VendorPrice>(`/materials/${materialId}/prices`, data);
  },

  // Update a vendor price
  updateVendorPrice: (materialId: string, priceId: string, data: VendorPriceCreateData) => {
    return api.put<VendorPrice>(`/materials/${materialId}/prices/${priceId}`, data);
  },

  // Delete a vendor price
  deleteVendorPrice: (materialId: string, priceId: string) => {
    return api.delete(`/materials/${materialId}/prices/${priceId}`);
  },

  // Get best price for a material
  getBestPrice: (materialId: string) => {
    return api.get<BestPrice>(`/materials/${materialId}/best-price`);
  },

  // Get project materials (placeholder - API endpoint not shown in files)
  getProjectMaterials: (projectId: string) => {
    return api.get<ProjectMaterial[]>(`/projects/${projectId}/materials`);
  }
};

export default materialService;