import api from './api';
import { User, PageResponse } from '../types';
import { mockStore } from './mockData';

export const userService = {
  getAll: async (role?: string, page = 0, size = 20): Promise<PageResponse<User>> => {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response = await api.get(`/users?${params.toString()}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getUsers(role, page, size);
    } catch {
      return mockStore.getUsers(role, page, size);
    }
  },
  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      if (response.data && response.data.id) return response.data;
      const u = mockStore.getUserById(id);
      if (u) return u;
      throw new Error('User not found');
    } catch {
      const u = mockStore.getUserById(id);
      if (!u) throw new Error('User not found');
      return u;
    }
  },
  create: async (data: { name: string; email: string; password: string; role: string; customerId?: number }): Promise<User> => {
    try {
      const response = await api.post('/users', data);
      if (response.data && response.data.id) return response.data;
      return mockStore.createUser(data);
    } catch {
      return mockStore.createUser(data);
    }
  },
  update: async (id: number, data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.updateUser(id, data);
    } catch {
      return mockStore.updateUser(id, data);
    }
  },
};
