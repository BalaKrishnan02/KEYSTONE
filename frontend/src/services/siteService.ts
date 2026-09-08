import api from './api';
import { Site, PageResponse } from '../types';

export const siteService = {
  getAll: async (search?: string, customerId?: number, page = 0, size = 20): Promise<PageResponse<Site>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (customerId) params.append('customerId', customerId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    const response = await api.get(`/sites?${params.toString()}`);
    return response.data;
  },
  getByCustomer: async (customerId: number, search?: string, page = 0, size = 20): Promise<PageResponse<Site>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const response = await api.get(`/customers/${customerId}/sites?${params.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<Site> => {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  },
  create: async (customerId: number, data: Partial<Site>): Promise<Site> => {
    const response = await api.post(`/customers/${customerId}/sites`, data);
    return response.data;
  },
  update: async (id: number, data: Partial<Site>): Promise<Site> => {
    const response = await api.put(`/sites/${id}`, data);
    return response.data;
  },
};
