import api from './api';
import { WorkOrder, WorkOrderStatusHistory, PartUsage, TimeLog, PageResponse } from '../types';

export const workOrderService = {
  getAll: async (params: {
    status?: string;
    priority?: string;
    technicianId?: number;
    customerId?: number;
    siteId?: number;
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<WorkOrder>> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.technicianId) searchParams.append('technicianId', params.technicianId.toString());
    if (params.customerId) searchParams.append('customerId', params.customerId.toString());
    if (params.siteId) searchParams.append('siteId', params.siteId.toString());
    if (params.search) searchParams.append('search', params.search);
    searchParams.append('page', (params.page ?? 0).toString());
    searchParams.append('size', (params.size ?? 20).toString());
    const response = await api.get(`/work-orders?${searchParams.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<WorkOrder> => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },
  create: async (data: { title: string; description?: string; priority: string; customerId: number; siteId: number; assignedTechnicianId?: number }): Promise<WorkOrder> => {
    const response = await api.post('/work-orders', data);
    return response.data;
  },
  update: async (id: number, data: Partial<WorkOrder>): Promise<WorkOrder> => {
    const response = await api.put(`/work-orders/${id}`, data);
    return response.data;
  },
  assign: async (id: number, technicianId: number): Promise<WorkOrder> => {
    const response = await api.post(`/work-orders/${id}/assign`, { technicianId });
    return response.data;
  },
  reassign: async (id: number, technicianId: number): Promise<WorkOrder> => {
    const response = await api.post(`/work-orders/${id}/reassign`, { technicianId });
    return response.data;
  },
  transitionStatus: async (id: number, status: string, note?: string): Promise<WorkOrder> => {
    const response = await api.post(`/work-orders/${id}/status`, { status, note });
    return response.data;
  },
  getHistory: async (id: number): Promise<WorkOrderStatusHistory[]> => {
    const response = await api.get(`/work-orders/${id}/history`);
    return response.data;
  },
  getKanban: async (params: { customerId?: number; technicianId?: number; siteId?: number; priority?: string } = {}): Promise<Record<string, WorkOrder[]>> => {
    const searchParams = new URLSearchParams();
    if (params.customerId) searchParams.append('customerId', params.customerId.toString());
    if (params.technicianId) searchParams.append('technicianId', params.technicianId.toString());
    if (params.siteId) searchParams.append('siteId', params.siteId.toString());
    if (params.priority) searchParams.append('priority', params.priority);
    const response = await api.get(`/work-orders/kanban?${searchParams.toString()}`);
    return response.data;
  },
  getParts: async (workOrderId: number): Promise<PartUsage[]> => {
    const response = await api.get(`/work-orders/${workOrderId}/parts`);
    return response.data;
  },
  addPart: async (workOrderId: number, data: { partId: number; quantity: number }): Promise<PartUsage> => {
    const response = await api.post(`/work-orders/${workOrderId}/parts`, data);
    return response.data;
  },
  getTimeLogs: async (workOrderId: number): Promise<TimeLog[]> => {
    const response = await api.get(`/work-orders/${workOrderId}/time`);
    return response.data;
  },
  logTime: async (workOrderId: number, data: { minutes: number; note?: string }): Promise<TimeLog> => {
    const response = await api.post(`/work-orders/${workOrderId}/time`, data);
    return response.data;
  },
};
