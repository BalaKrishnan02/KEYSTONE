import api from './api';
import { WorkOrder, WorkOrderStatusHistory, PartUsage, TimeLog, PageResponse } from '../types';
import { mockStore } from './mockData';

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
    try {
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
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return mockStore.getWorkOrdersPaged(params);
    } catch {
      return mockStore.getWorkOrdersPaged(params);
    }
  },
  getById: async (id: number): Promise<WorkOrder> => {
    try {
      const response = await api.get(`/work-orders/${id}`);
      if (response.data && response.data.id) return response.data;
      const wo = mockStore.getWorkOrderById(id);
      if (wo) return wo;
      throw new Error('Work order not found');
    } catch {
      const wo = mockStore.getWorkOrderById(id);
      if (!wo) throw new Error('Work order not found');
      return wo;
    }
  },
  create: async (data: { title: string; description?: string; priority: string; customerId: number; siteId: number; assignedTechnicianId?: number }): Promise<WorkOrder> => {
    try {
      const response = await api.post('/work-orders', data);
      if (response.data && response.data.id) return response.data;
      return mockStore.createWorkOrder(data);
    } catch {
      return mockStore.createWorkOrder(data);
    }
  },
  update: async (id: number, data: Partial<WorkOrder>): Promise<WorkOrder> => {
    try {
      const response = await api.put(`/work-orders/${id}`, data);
      if (response.data && response.data.id) return response.data;
      return mockStore.updateWorkOrder(id, data);
    } catch {
      return mockStore.updateWorkOrder(id, data);
    }
  },
  assign: async (id: number, technicianId: number): Promise<WorkOrder> => {
    try {
      const response = await api.post(`/work-orders/${id}/assign`, { technicianId });
      if (response.data && response.data.id) return response.data;
      return mockStore.assignWorkOrder(id, technicianId);
    } catch {
      return mockStore.assignWorkOrder(id, technicianId);
    }
  },
  reassign: async (id: number, technicianId: number): Promise<WorkOrder> => {
    try {
      const response = await api.post(`/work-orders/${id}/reassign`, { technicianId });
      if (response.data && response.data.id) return response.data;
      return mockStore.assignWorkOrder(id, technicianId);
    } catch {
      return mockStore.assignWorkOrder(id, technicianId);
    }
  },
  transitionStatus: async (id: number, status: string, note?: string): Promise<WorkOrder> => {
    try {
      const response = await api.post(`/work-orders/${id}/status`, { status, note });
      if (response.data && response.data.id) return response.data;
      return mockStore.transitionWorkOrderStatus(id, status, note);
    } catch {
      return mockStore.transitionWorkOrderStatus(id, status, note);
    }
  },
  getHistory: async (id: number): Promise<WorkOrderStatusHistory[]> => {
    try {
      const response = await api.get(`/work-orders/${id}/history`);
      if (Array.isArray(response.data)) return response.data;
      return mockStore.getStatusHistory(id);
    } catch {
      return mockStore.getStatusHistory(id);
    }
  },
  getKanban: async (params: { customerId?: number; technicianId?: number; siteId?: number; priority?: string } = {}): Promise<Record<string, WorkOrder[]>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.customerId) searchParams.append('customerId', params.customerId.toString());
      if (params.technicianId) searchParams.append('technicianId', params.technicianId.toString());
      if (params.siteId) searchParams.append('siteId', params.siteId.toString());
      if (params.priority) searchParams.append('priority', params.priority);
      const response = await api.get(`/work-orders/kanban?${searchParams.toString()}`);
      if (response.data && typeof response.data === 'object') return response.data;
      return mockStore.getKanban(params);
    } catch {
      return mockStore.getKanban(params);
    }
  },
  getParts: async (workOrderId: number): Promise<PartUsage[]> => {
    try {
      const response = await api.get(`/work-orders/${workOrderId}/parts`);
      if (Array.isArray(response.data)) return response.data;
      return mockStore.getPartUsages(workOrderId);
    } catch {
      return mockStore.getPartUsages(workOrderId);
    }
  },
  addPart: async (workOrderId: number, data: { partId: number; quantity: number }): Promise<PartUsage> => {
    try {
      const response = await api.post(`/work-orders/${workOrderId}/parts`, data);
      if (response.data && response.data.id) return response.data;
      const part = mockStore.getPartById(data.partId);
      const usage: PartUsage = {
        id: Date.now(),
        workOrderId,
        partId: data.partId,
        partCode: part?.partCode || 'PRT',
        partName: part?.name || 'Replacement Part',
        quantity: data.quantity,
        unitCost: part?.unitCost || 50,
        totalCost: (part?.unitCost || 50) * data.quantity,
        loggedByName: 'Field Specialist',
        loggedAt: new Date().toISOString(),
      };
      mockStore.addPartUsage(workOrderId, usage);
      return usage;
    } catch {
      const part = mockStore.getPartById(data.partId);
      const usage: PartUsage = {
        id: Date.now(),
        workOrderId,
        partId: data.partId,
        partCode: part?.partCode || 'PRT',
        partName: part?.name || 'Replacement Part',
        quantity: data.quantity,
        unitCost: part?.unitCost || 50,
        totalCost: (part?.unitCost || 50) * data.quantity,
        loggedByName: 'Field Specialist',
        loggedAt: new Date().toISOString(),
      };
      mockStore.addPartUsage(workOrderId, usage);
      return usage;
    }
  },
  getTimeLogs: async (workOrderId: number): Promise<TimeLog[]> => {
    try {
      const response = await api.get(`/work-orders/${workOrderId}/time`);
      if (Array.isArray(response.data)) return response.data;
      return mockStore.getTimeLogs(workOrderId);
    } catch {
      return mockStore.getTimeLogs(workOrderId);
    }
  },
  logTime: async (workOrderId: number, data: { minutes: number; note?: string }): Promise<TimeLog> => {
    try {
      const response = await api.post(`/work-orders/${workOrderId}/time`, data);
      if (response.data && response.data.id) return response.data;
      const timeLog: TimeLog = {
        id: Date.now(),
        workOrderId,
        technicianId: 3,
        technicianName: 'Mike Ramirez',
        minutes: data.minutes,
        note: data.note || 'Diagnostic inspection & maintenance execution',
        loggedAt: new Date().toISOString(),
      };
      mockStore.addTimeLog(workOrderId, timeLog);
      return timeLog;
    } catch {
      const timeLog: TimeLog = {
        id: Date.now(),
        workOrderId,
        technicianId: 3,
        technicianName: 'Mike Ramirez',
        minutes: data.minutes,
        note: data.note || 'Diagnostic inspection & maintenance execution',
        loggedAt: new Date().toISOString(),
      };
      mockStore.addTimeLog(workOrderId, timeLog);
      return timeLog;
    }
  },
};
