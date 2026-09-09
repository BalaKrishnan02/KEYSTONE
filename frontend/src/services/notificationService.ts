import api from './api';
import { Notification, PageResponse } from '../types';
import { mockStore } from './mockData';

export const notificationService = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Notification>> => {
    try {
      const response = await api.get(`/notifications?page=${page}&size=${size}`);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getNotificationsPaged(page, size);
    } catch {
      return mockStore.getNotificationsPaged(page, size);
    }
  },
  getUnread: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications/unread');
      if (Array.isArray(response.data)) return response.data;
      return mockStore.getUnreadNotifications();
    } catch {
      return mockStore.getUnreadNotifications();
    }
  },
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/notifications/count');
      if (typeof response.data === 'number') return response.data;
      return mockStore.getUnreadCount();
    } catch {
      return mockStore.getUnreadCount();
    }
  },
  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      mockStore.markNotificationAsRead(id);
    }
  },
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.post('/notifications/read-all');
    } catch {
      mockStore.markAllNotificationsAsRead();
    }
  },
};
