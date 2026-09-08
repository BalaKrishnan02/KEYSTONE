import api from './api';
import { Part, PageResponse } from '../types';

export const partService = {
  getAll: async (search?: string, page = 0, size = 20): Promise<PageResponse<Part>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const response = await api.get(`/parts?${params.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<Part> => {
    const response = await api.get(`/parts/${id}`);
    return response.data;
  },
  create: async (data: Partial<Part>): Promise<Part> => {
    const response = await api.post('/parts', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Part>): Promise<Part> => {
    const response = await api.put(`/parts/${id}`, data);
    return response.data;
  },
  getLowStock: async (): Promise<Part[]> => {
    const response = await api.get('/parts/low-stock');
    return response.data;
  },
};
