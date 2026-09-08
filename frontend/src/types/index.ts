export type UserRole = 'MANAGER' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';
export type WorkOrderStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SLAState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
export type NotificationType = 'WORK_ORDER_ASSIGNED' | 'WORK_ORDER_REASSIGNED' | 'WORK_ORDER_STARTED' | 'WORK_ORDER_ON_HOLD' | 'WORK_ORDER_RESUMED' | 'WORK_ORDER_COMPLETED' | 'WORK_ORDER_CLOSED' | 'WORK_ORDER_CANCELLED' | 'SLA_APPROACHING' | 'SLA_BREACHED' | 'PART_LOW_STOCK';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  customerId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    customerId?: number;
  };
}

export interface Customer {
  id: number;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  siteCount: number;
  workOrderCount: number;
}

export interface Site {
  id: number;
  name: string;
  address: string;
  customerId: number;
  customerName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  workOrderCount: number;
}

export interface WorkOrder {
  id: number;
  workOrderCode: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  createdById: number;
  createdByName: string;
  slaDueDate?: string;
  completedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  totalPartsCost: number;
  totalMinutesLogged: number;
  slaState?: SLAState;
  statusHistoryCount: number;
}

export interface WorkOrderStatusHistory {
  id: number;
  workOrderId: number;
  fromStatus?: WorkOrderStatus;
  toStatus: WorkOrderStatus;
  changedById: number;
  changedByName: string;
  changedAt: string;
  note?: string;
}

export interface Part {
  id: number;
  partCode: string;
  name: string;
  description: string;
  unitCost: number;
  availableStock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartUsage {
  id: number;
  workOrderId: number;
  partId: number;
  partCode: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  loggedByName: string;
  loggedAt: string;
}

export interface TimeLog {
  id: number;
  workOrderId: number;
  technicianId: number;
  technicianName: string;
  minutes: number;
  note?: string;
  loggedAt: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardData {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  closedWorkOrders: number;
  cancelledWorkOrders: number;
  overdueWorkOrders: number;
  atRiskWorkOrders: number;
  slaCompliancePercent: number;
  workOrdersByStatus: Record<string, number>;
  workOrdersByPriority: Record<string, number>;
  workOrdersByTechnician: { technicianId: number; technicianName: string; workOrderCount: number }[];
  recentWorkOrders: WorkOrder[];
}

export interface ReportSummary {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  totalPartsCost: number;
  totalMinutesLogged: number;
  averageCompletionTimeHours: number;
  slaCompliancePercent: number;
  workOrdersByStatus: Record<string, number>;
  workOrdersByPriority: Record<string, number>;
  workOrdersByCustomer: Record<string, number>;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
  path?: string;
}
