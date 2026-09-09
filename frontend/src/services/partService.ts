import api from './api';
import { Part, PageResponse } from '../types';
import { mockStore } from './mockData';

export const partService = {
  getAll: async (search?: string, page = 0, size = 20): Promise<PageResponse<Part>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response = await api.get(`/parts?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getParts(search, page, size);
    } catch {
      return mockStore.getParts(search, page, size);
    }
  },
  getById: async (id: number): Promise<Part> => {
    try {
      const response = await api.get(`/parts/${id}`);
      if (response.data && response.data.id) return response.data;
      const p = mockStore.getPartById(id);
      if (p) return p;
      throw new Error('Part not found');
    } catch {
      const p = mockStore.getPartById(id);
      if (!p) throw new Error('Part not found');
      return p;
    }
  },
  create: async (data: Partial<Part>): Promise<Part> => {
    try {
      const response = await api.post('/parts', data);
      if (response.data && response.data.id) return response.data;
      return mockStore.createPart(data);
    } catch {
      return mockStore.createPart(data);
    }
  },
  update: async (id: number, data: Partial<Part>): Promise<Part> => {
    try {
      const response = await api.put(`/parts/${id}`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.updatePart(id, data);
    } catch {
      return mockStore.updatePart(id, data);
    }
  },
  getLowStock: async (): Promise<Part[]> => {
    try {
      const response = await api.get('/parts/low-stock');
      if (Array.isArray(response.data)) return response.data;
      return mockStore.getLowStockParts();
    } catch {
      return mockStore.getLowStockParts();
    }
  },
};
