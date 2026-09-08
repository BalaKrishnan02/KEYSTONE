import api from './api';
import { LoginResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  register: async (data: any): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },
};
