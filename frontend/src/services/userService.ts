import api from './api';
import { User, PageResponse } from '../types';

export const userService = {
  getAll: async (role?: string, page = 0, size = 20): Promise<PageResponse<User>> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: { name: string; email: string; password: string; role: string; customerId?: number }): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};
