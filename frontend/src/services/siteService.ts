import api from './api';
import { Site, PageResponse } from '../types';
import { mockStore } from './mockData';

export const siteService = {
  getAll: async (search?: string, customerId?: number, page = 0, size = 20): Promise<PageResponse<Site>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (customerId) params.append('customerId', customerId.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response = await api.get(`/sites?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getSites(search, customerId, page, size);
    } catch {
      return mockStore.getSites(search, customerId, page, size);
    }
  },
  getByCustomer: async (customerId: number, search?: string, page = 0, size = 20): Promise<PageResponse<Site>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response = await api.get(`/customers/${customerId}/sites?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getSites(search, customerId, page, size);
    } catch {
      return mockStore.getSites(search, customerId, page, size);
    }
  },
  getById: async (id: number): Promise<Site> => {
    try {
      const response = await api.get(`/sites/${id}`);
      if (response.data && response.data.id) return response.data;
      const s = mockStore.getSiteById(id);
      if (s) return s;
      throw new Error('Site not found');
    } catch {
      const s = mockStore.getSiteById(id);
      if (!s) throw new Error('Site not found');
      return s;
    }
  },
  create: async (customerId: number, data: Partial<Site>): Promise<Site> => {
    try {
      const response = await api.post(`/customers/${customerId}/sites`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.createSite(customerId, data);
    } catch {
      return mockStore.createSite(customerId, data);
    }
  },
  update: async (id: number, data: Partial<Site>): Promise<Site> => {
    try {
      const response = await api.put(`/sites/${id}`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.updateSite(id, data);
    } catch {
      return mockStore.updateSite(id, data);
    }
  },
};
