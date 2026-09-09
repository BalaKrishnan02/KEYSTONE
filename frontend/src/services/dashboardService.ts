import api from './api';
import { DashboardData, ReportSummary } from '../types';
import { mockStore } from './mockData';

export const dashboardService = {
  getDashboard: async (customerId?: number): Promise<DashboardData> => {
    try {
      const params = customerId ? `?customerId=${customerId}` : '';
      const response = await api.get(`/dashboard${params}`);
      if (response.data && typeof response.data.totalWorkOrders === 'number') {
        return response.data;
      }
      return mockStore.getDashboardData(customerId);
    } catch {
      return mockStore.getDashboardData(customerId);
    }
  },
  getReportSummary: async (customerId?: number): Promise<ReportSummary> => {
    try {
      const params = customerId ? `?customerId=${customerId}` : '';
      const response = await api.get(`/reports/summary${params}`);
      if (response.data && typeof response.data.totalWorkOrders === 'number') {
        return response.data;
      }
      return mockStore.getReportSummary(customerId);
    } catch {
      return mockStore.getReportSummary(customerId);
    }
  },
};
