import api from './api';
import { Notification, PageResponse } from '../types';

export const notificationService = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Notification>> => {
    const response = await api.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },
  getUnread: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/count');
    return response.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
