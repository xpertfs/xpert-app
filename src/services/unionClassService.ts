import api from './api';

export interface UnionClass {
  id: number;
  name: string;
  companyId: string;
  baseRates: UnionClassBaseRate[];
  customRates: UnionClassCustomRate[];
  createdAt: string;
  updatedAt: string;
}

export interface UnionClassBaseRate {
  id: number;
  unionClassId: number;
  regularRate: number;
  overtimeRate: number;
  benefitsRate: number;
  effectiveDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnionClassCustomRate {
  id: number;
  name: string;
  description?: string;
  rate: number;
  unionClassId: number;
  effectiveDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnionClassData {
  name: string;
}

export interface CreateBaseRateData {
  unionClassId: number;
  regularRate: number;
  overtimeRate: number;
  benefitsRate: number;
  effectiveDate: string;
  endDate?: string;
}

export interface CreateCustomRateData {
  unionClassId: number;
  name: string;
  description?: string;
  rate: number;
  effectiveDate: string;
  endDate?: string;
}

export const unionClassService = {
  async createUnionClass(data: CreateUnionClassData): Promise<UnionClass> {
    const response = await api.post('/union-classes', data);
    return response.data;
  },

  async getUnionClasses(): Promise<UnionClass[]> {
    const response = await api.get('/union-classes');
    return response.data;
  },

  async getUnionClassById(id: number): Promise<UnionClass> {
    const response = await api.get(`/union-classes/${id}`);
    return response.data;
  },

  async updateUnionClass(id: number, data: CreateUnionClassData): Promise<UnionClass> {
    const response = await api.put(`/union-classes/${id}`, data);
    return response.data;
  },

  async deleteUnionClass(id: number): Promise<void> {
    await api.delete(`/union-classes/${id}`);
  },

  async createBaseRate(data: CreateBaseRateData): Promise<UnionClassBaseRate> {
    const response = await api.post(`/union-classes/${data.unionClassId}/base-rates`, data);
    return response.data;
  },

  async deleteBaseRate(unionClassId: number, baseRateId: number): Promise<void> {
    await api.delete(`/union-classes/${unionClassId}/base-rates/${baseRateId}`);
  },

  async createCustomRate(data: CreateCustomRateData): Promise<UnionClassCustomRate> {
    const response = await api.post(`/union-classes/${data.unionClassId}/custom-rates`, data);
    return response.data;
  },

  async deleteCustomRate(unionClassId: number, rateId: number): Promise<void> {
    await api.delete(`/union-classes/${unionClassId}/custom-rates/${rateId}`);
  },
}; 