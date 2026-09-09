import api from './api';
import { Customer, PageResponse } from '../types';
import { mockStore } from './mockData';

export const customerService = {
  getAll: async (search?: string, page = 0, size = 20): Promise<PageResponse<Customer>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response = await api.get(`/customers?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getCustomers(search, page, size);
    } catch {
      return mockStore.getCustomers(search, page, size);
    }
  },
  getById: async (id: number): Promise<Customer> => {
    try {
      const response = await api.get(`/customers/${id}`);
      if (response.data && response.data.id) return response.data;
      const c = mockStore.getCustomerById(id);
      if (c) return c;
      throw new Error('Customer not found');
    } catch {
      const cust = mockStore.getCustomerById(id);
      if (!cust) throw new Error('Customer not found');
      return cust;
    }
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.post('/customers', data);
      if (response.data && response.data.id) return response.data;
      return mockStore.createCustomer(data);
    } catch {
      return mockStore.createCustomer(data);
    }
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.updateCustomer(id, data);
    } catch {
      return mockStore.updateCustomer(id, data);
    }
  },
};
