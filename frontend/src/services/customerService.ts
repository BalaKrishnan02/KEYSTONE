import api from './api';
import { Customer, PageResponse } from '../types';

export const customerService = {
  getAll: async (search?: string, page = 0, size = 20): Promise<PageResponse<Customer>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
};
