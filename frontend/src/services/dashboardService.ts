import api from './api';
import { DashboardData, ReportSummary } from '../types';

export const dashboardService = {
  getDashboard: async (customerId?: number): Promise<DashboardData> => {
    const params = customerId ? `?customerId=${customerId}` : '';
    const response = await api.get(`/dashboard${params}`);
    return response.data;
  },
  getReportSummary: async (customerId?: number): Promise<ReportSummary> => {
    const params = customerId ? `?customerId=${customerId}` : '';
    const response = await api.get(`/reports/summary${params}`);
    return response.data;
  },
};
