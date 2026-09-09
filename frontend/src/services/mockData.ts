import {
  Customer,
  Site,
  WorkOrder,
  WorkOrderStatusHistory,
  Part,
  PartUsage,
  TimeLog,
  User,
  Notification,
  DashboardData,
  ReportSummary,
  PageResponse,
  WorkOrderStatus,
  Priority,
  SLAState
} from '../types';

// Key for LocalStorage persistence of mock state
const STORAGE_PREFIX = 'keystone_demo_';

const getStored = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
};

// Initial Seed Data
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    organizationName: 'Apex Commercial Towers',
    contactName: 'Johnathan Hayes',
    email: 'john@apex.com',
    phone: '+1 (555) 234-5678',
    address: '100 Financial Way, Suite 400, New York, NY 10005',
    active: true,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z',
    siteCount: 3,
    workOrderCount: 12,
  },
  {
    id: 2,
    organizationName: 'Nexus Innovation Park',
    contactName: 'Elena Rostova',
    email: 'elena@nexuspark.com',
    phone: '+1 (555) 876-5432',
    address: '450 Technology Pkwy, Building B, Austin, TX 78759',
    active: true,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-03-01T11:20:00Z',
    siteCount: 4,
    workOrderCount: 8,
  },
  {
    id: 3,
    organizationName: 'Horizon Data Centers',
    contactName: 'Robert Vance',
    email: 'robert@horizondc.com',
    phone: '+1 (555) 345-6789',
    address: '880 Cyberway Blvd, Ashburn, VA 20147',
    active: true,
    createdAt: '2026-02-01T08:15:00Z',
    updatedAt: '2026-03-04T16:00:00Z',
    siteCount: 2,
    workOrderCount: 6,
  },
  {
    id: 4,
    organizationName: 'Metro Transit Authority',
    contactName: 'Sandra Martinez',
    email: 'smartinez@metrota.org',
    phone: '+1 (555) 901-2345',
    address: '1200 Terminal Loop, Chicago, IL 60607',
    active: true,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-03-05T09:45:00Z',
    siteCount: 5,
    workOrderCount: 9,
  },
  {
    id: 5,
    organizationName: 'Sterling Retail Outlets',
    contactName: 'Marcus Vance',
    email: 'mvance@sterlingmall.com',
    phone: '+1 (555) 432-1098',
    address: '77 Mall Promenade, Seattle, WA 98101',
    active: true,
    createdAt: '2026-02-20T13:00:00Z',
    updatedAt: '2026-03-06T15:10:00Z',
    siteCount: 3,
    workOrderCount: 4,
  },
];

const INITIAL_SITES: Site[] = [
  {
    id: 1,
    name: 'Apex Tower A - Corporate HQ',
    address: '100 Financial Way, Tower A, New York, NY 10005',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    active: true,
    createdAt: '2026-01-10T09:30:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
    workOrderCount: 6,
  },
  {
    id: 2,
    name: 'Apex Tower B - North Concourse',
    address: '100 Financial Way, Tower B, New York, NY 10005',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    active: true,
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-11T10:00:00Z',
    workOrderCount: 4,
  },
  {
    id: 3,
    name: 'Apex Retail Pavilion',
    address: '102 Financial Way, Plaza Level, New York, NY 10005',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    active: true,
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
    workOrderCount: 2,
  },
  {
    id: 4,
    name: 'Nexus Main Bio-Lab Complex',
    address: '450 Technology Pkwy, Building 1, Austin, TX 78759',
    customerId: 2,
    customerName: 'Nexus Innovation Park',
    active: true,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    workOrderCount: 5,
  },
  {
    id: 5,
    name: 'Nexus Cleanroom Facility C',
    address: '450 Technology Pkwy, Cleanroom C-3, Austin, TX 78759',
    customerId: 2,
    customerName: 'Nexus Innovation Park',
    active: true,
    createdAt: '2026-01-16T14:20:00Z',
    updatedAt: '2026-01-16T14:20:00Z',
    workOrderCount: 3,
  },
  {
    id: 6,
    name: 'Horizon Primary Server Hall 1',
    address: '880 Cyberway Blvd, Pod A, Ashburn, VA 20147',
    customerId: 3,
    customerName: 'Horizon Data Centers',
    active: true,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    workOrderCount: 4,
  },
  {
    id: 7,
    name: 'Metro Union Station Concourse',
    address: '1200 Terminal Loop, Main Hall, Chicago, IL 60607',
    customerId: 4,
    customerName: 'Metro Transit Authority',
    active: true,
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
    workOrderCount: 5,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Admin / Director',
    email: 'admin@vertexa.com',
    role: 'MANAGER',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Sarah Chen (Dispatcher)',
    email: 'sarah@vertexa.com',
    role: 'DISPATCHER',
    active: true,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Mike Ramirez',
    email: 'mike@vertexa.com',
    role: 'TECHNICIAN',
    active: true,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 4,
    name: 'Alex Rivera',
    email: 'alex@vertexa.com',
    role: 'TECHNICIAN',
    active: true,
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david@vertexa.com',
    role: 'TECHNICIAN',
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 6,
    name: 'Johnathan Hayes',
    email: 'john@apex.com',
    role: 'CUSTOMER',
    customerId: 1,
    active: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 7,
    name: 'Elena Rostova',
    email: 'elena@nexuspark.com',
    role: 'CUSTOMER',
    customerId: 2,
    active: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

const INITIAL_PARTS: Part[] = [
  {
    id: 1,
    partCode: 'HVAC-CMP-5HP',
    name: 'Compressor 5HP Copeland Scroll',
    description: 'High-efficiency 3-phase scroll compressor for commercial rooftop HVAC',
    unitCost: 1250.0,
    availableStock: 6,
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 2,
    partCode: 'ELEC-CNT-30A',
    name: 'Heavy Duty Contactor 30A 24V Coil',
    description: 'Definite purpose 2-pole contactor for condenser motor control',
    unitCost: 45.0,
    availableStock: 28,
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 3,
    partCode: 'FLTR-MERV13-20X25',
    name: 'Pleated Air Filter MERV 13 (20x25x4)',
    description: 'Commercial high-efficiency particulate air filter',
    unitCost: 32.5,
    availableStock: 4, // low stock!
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 4,
    partCode: 'REFR-R410A-25LB',
    name: 'R-410A Refrigerant Cylinder (25 lbs)',
    description: 'Virgin eco-friendly hydrofluorocarbon refrigerant cylinder',
    unitCost: 220.0,
    availableStock: 12,
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 5,
    partCode: 'ELEC-BRK-50A',
    name: 'Molded Case Circuit Breaker 50A 3P',
    description: 'Industrial 480V triple-pole thermal-magnetic breaker',
    unitCost: 185.0,
    availableStock: 2, // low stock!
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 6,
    partCode: 'CTRL-THRM-BACNET',
    name: 'Digital Smart Thermostat BACnet/IP',
    description: 'Touchscreen BACnet programmable commercial thermostat',
    unitCost: 340.0,
    availableStock: 15,
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 7,
    partCode: 'MOTR-ECM-0.5HP',
    name: 'ECM Blower Fan Motor 1/2 HP Variable Speed',
    description: 'Direct drive multi-voltage electronically commutated blower motor',
    unitCost: 410.0,
    availableStock: 7,
    active: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
];

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 101,
    workOrderCode: 'WO-2026-0101',
    title: 'HVAC Chiller #2 Low Pressure Trip & Flow Alarm',
    description: 'Chiller Unit 2 on 18th floor mechanical room tripped on low refrigerant pressure safety switch. Cooling capacity impaired in west executive suites.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    siteId: 1,
    siteName: 'Apex Tower A - Corporate HQ',
    assignedTechnicianId: 3,
    assignedTechnicianName: 'Mike Ramirez',
    createdById: 6,
    createdByName: 'Johnathan Hayes',
    slaDueDate: new Date(Date.now() + 4 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    totalPartsCost: 265.0,
    totalMinutesLogged: 150,
    slaState: 'ON_TRACK',
    statusHistoryCount: 3,
  },
  {
    id: 102,
    workOrderCode: 'WO-2026-0102',
    title: 'Cleanroom ISO-5 HEPA Filtration Airflow Fluctuation',
    description: 'Differential pressure gauge in cleanroom bay 3 showing erratic drops below 0.05 in. w.g. Needs immediate airflow balancing and filter integrity scan.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    customerId: 2,
    customerName: 'Nexus Innovation Park',
    siteId: 5,
    siteName: 'Nexus Cleanroom Facility C',
    assignedTechnicianId: 4,
    assignedTechnicianName: 'Alex Rivera',
    createdById: 7,
    createdByName: 'Elena Rostova',
    slaDueDate: new Date(Date.now() + 2 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    totalPartsCost: 0,
    totalMinutesLogged: 0,
    slaState: 'AT_RISK',
    statusHistoryCount: 2,
  },
  {
    id: 103,
    workOrderCode: 'WO-2026-0103',
    title: 'UPS Battery Bank Module 4 Overheating & Replacement',
    description: 'UPS System B battery module 4 reported thermal alarm reaching 48°C. Replace thermal sensor and isolated failing battery cells.',
    priority: 'CRITICAL',
    status: 'NEW',
    customerId: 3,
    customerName: 'Horizon Data Centers',
    siteId: 6,
    siteName: 'Horizon Primary Server Hall 1',
    createdById: 1,
    createdByName: 'Admin / Director',
    slaDueDate: new Date(Date.now() - 1 * 3600000).toISOString(), // Breached
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    totalPartsCost: 0,
    totalMinutesLogged: 0,
    slaState: 'BREACHED',
    statusHistoryCount: 1,
  },
  {
    id: 104,
    workOrderCode: 'WO-2026-0104',
    title: 'Main Elevator Escalator 3 Safety Brake Re-calibration',
    description: 'Scheduled semi-annual dynamic safety brake torque test and comb-plate sensor inspection.',
    priority: 'MEDIUM',
    status: 'ON_HOLD',
    customerId: 4,
    customerName: 'Metro Transit Authority',
    siteId: 7,
    siteName: 'Metro Union Station Concourse',
    assignedTechnicianId: 5,
    assignedTechnicianName: 'David Kim',
    createdById: 2,
    createdByName: 'Sarah Chen (Dispatcher)',
    slaDueDate: new Date(Date.now() + 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    totalPartsCost: 185.0,
    totalMinutesLogged: 90,
    slaState: 'ON_TRACK',
    statusHistoryCount: 4,
  },
  {
    id: 105,
    workOrderCode: 'WO-2026-0105',
    title: 'Emergency Lighting Inverter Unit Test & Battery Swap',
    description: 'Emergency egress lighting system 90-minute discharge test failed in Section 4 retail hallway. Replaced backup lead-acid pack.',
    priority: 'LOW',
    status: 'COMPLETED',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    siteId: 3,
    siteName: 'Apex Retail Pavilion',
    assignedTechnicianId: 3,
    assignedTechnicianName: 'Mike Ramirez',
    createdById: 6,
    createdByName: 'Johnathan Hayes',
    completedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    slaDueDate: new Date(Date.now() + 48 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    totalPartsCost: 90.0,
    totalMinutesLogged: 120,
    slaState: 'ON_TRACK',
    statusHistoryCount: 4,
  },
  {
    id: 106,
    workOrderCode: 'WO-2026-0106',
    title: 'Water Leak Sensor Calibration & Sump Pump Auto-Switch',
    description: 'Basement sump pump 2 high-level water float switch stuck in closed state. Freed float valve and tested dual backup pump sequencer.',
    priority: 'MEDIUM',
    status: 'CLOSED',
    customerId: 2,
    customerName: 'Nexus Innovation Park',
    siteId: 4,
    siteName: 'Nexus Main Bio-Lab Complex',
    assignedTechnicianId: 4,
    assignedTechnicianName: 'Alex Rivera',
    createdById: 7,
    createdByName: 'Elena Rostova',
    completedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    closedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    slaDueDate: new Date(Date.now() - 40 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    totalPartsCost: 45.0,
    totalMinutesLogged: 60,
    slaState: 'ON_TRACK',
    statusHistoryCount: 5,
  },
  {
    id: 107,
    workOrderCode: 'WO-2026-0107',
    title: 'Variable Air Volume (VAV-402) Actuator Jam Repair',
    description: 'VAV damper actuator motor humming continuously with 0% travel response. Replaced damper servo actuator.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    customerId: 1,
    customerName: 'Apex Commercial Towers',
    siteId: 2,
    siteName: 'Apex Tower B - North Concourse',
    assignedTechnicianId: 3,
    assignedTechnicianName: 'Mike Ramirez',
    createdById: 2,
    createdByName: 'Sarah Chen (Dispatcher)',
    slaDueDate: new Date(Date.now() + 8 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    totalPartsCost: 340.0,
    totalMinutesLogged: 180,
    slaState: 'ON_TRACK',
    statusHistoryCount: 3,
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'SLA_BREACHED',
    title: 'SLA Breached: WO-2026-0103',
    message: 'UPS Battery Bank Module 4 Overheating has breached target SLA resolution window.',
    referenceId: 103,
    referenceType: 'WORK_ORDER',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 2,
    type: 'SLA_APPROACHING',
    title: 'SLA Approaching: WO-2026-0102',
    message: 'Cleanroom ISO-5 HEPA Filtration Airflow Fluctuation SLA expires in under 2 hours.',
    referenceId: 102,
    referenceType: 'WORK_ORDER',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 3,
    type: 'PART_LOW_STOCK',
    title: 'Low Stock Alert: Air Filter MERV 13',
    message: 'Pleated Air Filter MERV 13 stock level is below threshold (4 remaining).',
    referenceId: 3,
    referenceType: 'PART',
    read: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 4,
    type: 'WORK_ORDER_ASSIGNED',
    title: 'New Assignment: WO-2026-0101',
    message: 'You have been assigned to HVAC Chiller #2 Low Pressure Trip.',
    referenceId: 101,
    referenceType: 'WORK_ORDER',
    read: true,
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
];

// Helper Store Class
class MockStore {
  // Customers
  getRawCustomers(): Customer[] {
    return getStored('customers', INITIAL_CUSTOMERS);
  }

  saveCustomers(data: Customer[]) {
    setStored('customers', data);
  }

  getCustomers(search?: string, page = 0, size = 20): PageResponse<Customer> {
    let list = this.getRawCustomers();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.organizationName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return toPageResponse(list, page, size);
  }

  getCustomerById(id: number): Customer | undefined {
    return this.getRawCustomers().find((c) => c.id === id);
  }

  createCustomer(data: Partial<Customer>): Customer {
    const list = this.getRawCustomers();
    const newCustomer: Customer = {
      id: Math.max(...list.map((c) => c.id), 0) + 1,
      organizationName: data.organizationName || 'New Organization',
      contactName: data.contactName || 'Contact Name',
      email: data.email || 'contact@org.com',
      phone: data.phone || '',
      address: data.address || '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      siteCount: 0,
      workOrderCount: 0,
      ...data,
    };
    list.unshift(newCustomer);
    this.saveCustomers(list);
    return newCustomer;
  }

  updateCustomer(id: number, data: Partial<Customer>): Customer {
    const list = this.getRawCustomers();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveCustomers(list);
      return list[idx];
    }
    throw new Error('Customer not found');
  }

  // Sites
  getRawSites(): Site[] {
    return getStored('sites', INITIAL_SITES);
  }

  saveSites(data: Site[]) {
    setStored('sites', data);
  }

  getSites(search?: string, customerId?: number, page = 0, size = 20): PageResponse<Site> {
    let list = this.getRawSites();
    if (customerId) {
      list = list.filter((s) => s.customerId === customerId);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      );
    }
    return toPageResponse(list, page, size);
  }

  getSiteById(id: number): Site | undefined {
    return this.getRawSites().find((s) => s.id === id);
  }

  createSite(customerId: number, data: Partial<Site>): Site {
    const list = this.getRawSites();
    const customer = this.getCustomerById(customerId);
    const newSite: Site = {
      id: Math.max(...list.map((s) => s.id), 0) + 1,
      customerId,
      customerName: customer?.organizationName || 'Customer',
      name: data.name || 'New Facility',
      address: data.address || 'Address',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workOrderCount: 0,
      ...data,
    };
    list.unshift(newSite);
    this.saveSites(list);
    return newSite;
  }

  updateSite(id: number, data: Partial<Site>): Site {
    const list = this.getRawSites();
    const idx = list.findIndex((s) => s.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveSites(list);
      return list[idx];
    }
    throw new Error('Site not found');
  }

  // Users
  getRawUsers(): User[] {
    return getStored('users', INITIAL_USERS);
  }

  saveUsers(data: User[]) {
    setStored('users', data);
  }

  getUsers(role?: string, page = 0, size = 20): PageResponse<User> {
    let list = this.getRawUsers();
    if (role) {
      list = list.filter((u) => u.role === role);
    }
    return toPageResponse(list, page, size);
  }

  getUserById(id: number): User | undefined {
    return this.getRawUsers().find((u) => u.id === id);
  }

  createUser(data: any): User {
    const list = this.getRawUsers();
    const newUser: User = {
      id: Math.max(...list.map((u) => u.id), 0) + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      customerId: data.customerId,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newUser);
    this.saveUsers(list);
    return newUser;
  }

  updateUser(id: number, data: Partial<User>): User {
    const list = this.getRawUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveUsers(list);
      return list[idx];
    }
    throw new Error('User not found');
  }

  // Parts
  getRawParts(): Part[] {
    return getStored('parts', INITIAL_PARTS);
  }

  saveParts(data: Part[]) {
    setStored('parts', data);
  }

  getParts(search?: string, page = 0, size = 20): PageResponse<Part> {
    let list = this.getRawParts();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.partCode.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return toPageResponse(list, page, size);
  }

  getPartById(id: number): Part | undefined {
    return this.getRawParts().find((p) => p.id === id);
  }

  createPart(data: Partial<Part>): Part {
    const list = this.getRawParts();
    const newPart: Part = {
      id: Math.max(...list.map((p) => p.id), 0) + 1,
      partCode: data.partCode || `PRT-${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Part',
      description: data.description || '',
      unitCost: data.unitCost || 0,
      availableStock: data.availableStock ?? 10,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newPart);
    this.saveParts(list);
    return newPart;
  }

  updatePart(id: number, data: Partial<Part>): Part {
    const list = this.getRawParts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveParts(list);
      return list[idx];
    }
    throw new Error('Part not found');
  }

  getLowStockParts(): Part[] {
    return this.getRawParts().filter((p) => p.availableStock <= 5);
  }

  // Work Orders
  getWorkOrders(): WorkOrder[] {
    return getStored('work_orders', INITIAL_WORK_ORDERS);
  }

  saveWorkOrders(data: WorkOrder[]) {
    setStored('work_orders', data);
  }

  getWorkOrdersPaged(params: {
    status?: string;
    priority?: string;
    technicianId?: number;
    customerId?: number;
    siteId?: number;
    search?: string;
    page?: number;
    size?: number;
  } = {}): PageResponse<WorkOrder> {
    let list = this.getWorkOrders();
    if (params.status) list = list.filter((w) => w.status === params.status);
    if (params.priority) list = list.filter((w) => w.priority === params.priority);
    if (params.technicianId) list = list.filter((w) => w.assignedTechnicianId === params.technicianId);
    if (params.customerId) list = list.filter((w) => w.customerId === params.customerId);
    if (params.siteId) list = list.filter((w) => w.siteId === params.siteId);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (w) =>
          w.workOrderCode.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.customerName.toLowerCase().includes(q) ||
          w.siteName.toLowerCase().includes(q)
      );
    }
    return toPageResponse(list, params.page ?? 0, params.size ?? 20);
  }

  getWorkOrderById(id: number): WorkOrder | undefined {
    return this.getWorkOrders().find((w) => w.id === id);
  }

  createWorkOrder(data: {
    title: string;
    description?: string;
    priority: string;
    customerId: number;
    siteId: number;
    assignedTechnicianId?: number;
  }): WorkOrder {
    const list = this.getWorkOrders();
    const cust = this.getCustomerById(data.customerId);
    const site = this.getSiteById(data.siteId);
    const tech = data.assignedTechnicianId ? this.getUserById(data.assignedTechnicianId) : undefined;
    const nextNum = 100 + list.length + 1;

    const newWO: WorkOrder = {
      id: Math.max(...list.map((w) => w.id), 0) + 1,
      workOrderCode: `WO-2026-0${nextNum}`,
      title: data.title,
      description: data.description || '',
      status: (tech ? 'ASSIGNED' : 'NEW') as WorkOrderStatus,
      priority: data.priority as Priority,
      customerId: data.customerId,
      customerName: cust?.organizationName || 'Client',
      siteId: data.siteId,
      siteName: site?.name || 'Facility Site',
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name,
      createdById: 1,
      createdByName: 'System User',
      slaDueDate: new Date(Date.now() + 24 * 3600000).toISOString(),
      slaState: 'ON_TRACK' as SLAState,
      totalPartsCost: 0,
      totalMinutesLogged: 0,
      statusHistoryCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newWO);
    this.saveWorkOrders(list);

    // Initial status history
    this.addStatusHistory(newWO.id, {
      id: Date.now(),
      workOrderId: newWO.id,
      toStatus: newWO.status,
      changedById: 1,
      changedByName: 'System User',
      changedAt: new Date().toISOString(),
      note: 'Work order created',
    });

    return newWO;
  }

  updateWorkOrder(id: number, data: Partial<WorkOrder>): WorkOrder {
    const list = this.getWorkOrders();
    const idx = list.findIndex((w) => w.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveWorkOrders(list);
      return list[idx];
    }
    throw new Error('Work order not found');
  }

  assignWorkOrder(id: number, technicianId: number): WorkOrder {
    const tech = this.getUserById(technicianId);
    const list = this.getWorkOrders();
    const idx = list.findIndex((w) => w.id === id);
    if (idx >= 0) {
      const oldStatus = list[idx].status;
      list[idx].assignedTechnicianId = technicianId;
      list[idx].assignedTechnicianName = tech?.name || 'Technician';
      if (oldStatus === 'NEW') {
        list[idx].status = 'ASSIGNED';
      }
      list[idx].updatedAt = new Date().toISOString();
      this.saveWorkOrders(list);

      this.addStatusHistory(id, {
        id: Date.now(),
        workOrderId: id,
        fromStatus: oldStatus,
        toStatus: list[idx].status,
        changedById: 1,
        changedByName: 'Operations Dispatcher',
        changedAt: new Date().toISOString(),
        note: `Assigned to ${tech?.name}`,
      });

      return list[idx];
    }
    throw new Error('Work order not found');
  }

  transitionWorkOrderStatus(id: number, status: string, note?: string): WorkOrder {
    const list = this.getWorkOrders();
    const idx = list.findIndex((w) => w.id === id);
    if (idx >= 0) {
      const oldStatus = list[idx].status;
      list[idx].status = status as WorkOrderStatus;
      list[idx].updatedAt = new Date().toISOString();
      if (status === 'COMPLETED' && !list[idx].completedAt) {
        list[idx].completedAt = new Date().toISOString();
      }
      this.saveWorkOrders(list);

      this.addStatusHistory(id, {
        id: Date.now(),
        workOrderId: id,
        fromStatus: oldStatus,
        toStatus: list[idx].status,
        changedById: 1,
        changedByName: 'System User',
        changedAt: new Date().toISOString(),
        note: note || `Status transitioned to ${status}`,
      });

      return list[idx];
    }
    throw new Error('Work order not found');
  }

  getKanban(params: { customerId?: number; technicianId?: number; siteId?: number; priority?: string } = {}): Record<string, WorkOrder[]> {
    let list = this.getWorkOrders();
    if (params.customerId) list = list.filter((w) => w.customerId === params.customerId);
    if (params.technicianId) list = list.filter((w) => w.assignedTechnicianId === params.technicianId);
    if (params.siteId) list = list.filter((w) => w.siteId === params.siteId);
    if (params.priority) list = list.filter((w) => w.priority === params.priority);

    const cols: Record<string, WorkOrder[]> = {
      NEW: [],
      ASSIGNED: [],
      IN_PROGRESS: [],
      ON_HOLD: [],
      COMPLETED: [],
      CLOSED: [],
    };
    list.forEach((w) => {
      if (cols[w.status]) {
        cols[w.status].push(w);
      }
    });
    return cols;
  }

  // Notifications
  getNotifications(): Notification[] {
    return getStored('notifications', INITIAL_NOTIFICATIONS);
  }

  saveNotifications(data: Notification[]) {
    setStored('notifications', data);
  }

  getNotificationsPaged(page = 0, size = 20): PageResponse<Notification> {
    const list = this.getNotifications();
    return toPageResponse(list, page, size);
  }

  getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter((n) => !n.read);
  }

  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  markNotificationAsRead(id: number): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.saveNotifications(list);
    }
  }

  markAllNotificationsAsRead(): void {
    const list = this.getNotifications();
    list.forEach((n) => (n.read = true));
    this.saveNotifications(list);
  }

  // Work order sub-items
  getPartUsages(woId: number): PartUsage[] {
    const usages = getStored<Record<number, PartUsage[]>>('part_usages', {
      101: [
        {
          id: 1,
          workOrderId: 101,
          partId: 2,
          partCode: 'ELEC-CNT-30A',
          partName: 'Heavy Duty Contactor 30A 24V Coil',
          quantity: 1,
          unitCost: 45.0,
          totalCost: 45.0,
          loggedByName: 'Mike Ramirez',
          loggedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: 2,
          workOrderId: 101,
          partId: 4,
          partCode: 'REFR-R410A-25LB',
          partName: 'R-410A Refrigerant Cylinder (25 lbs)',
          quantity: 1,
          unitCost: 220.0,
          totalCost: 220.0,
          loggedByName: 'Mike Ramirez',
          loggedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        },
      ],
      104: [
        {
          id: 3,
          workOrderId: 104,
          partId: 5,
          partCode: 'ELEC-BRK-50A',
          partName: 'Molded Case Circuit Breaker 50A 3P',
          quantity: 1,
          unitCost: 185.0,
          totalCost: 185.0,
          loggedByName: 'David Kim',
          loggedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        },
      ],
      107: [
        {
          id: 4,
          workOrderId: 107,
          partId: 6,
          partCode: 'CTRL-THRM-BACNET',
          partName: 'Digital Smart Thermostat BACnet/IP',
          quantity: 1,
          unitCost: 340.0,
          totalCost: 340.0,
          loggedByName: 'Mike Ramirez',
          loggedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
      ],
    });
    return usages[woId] || [];
  }

  addPartUsage(woId: number, usage: PartUsage) {
    const usages = getStored<Record<number, PartUsage[]>>('part_usages', {});
    if (!usages[woId]) usages[woId] = [];
    usages[woId].push(usage);
    setStored('part_usages', usages);

    // Update totalPartsCost on work order
    const wos = this.getWorkOrders();
    const wo = wos.find((w) => w.id === woId);
    if (wo) {
      wo.totalPartsCost = (wo.totalPartsCost || 0) + usage.totalCost;
      this.saveWorkOrders(wos);
    }
  }

  getTimeLogs(woId: number): TimeLog[] {
    const logs = getStored<Record<number, TimeLog[]>>('time_logs', {
      101: [
        {
          id: 1,
          workOrderId: 101,
          technicianId: 3,
          technicianName: 'Mike Ramirez',
          minutes: 90,
          note: 'Refrigerant pressure diagnostics & vacuum leak test',
          loggedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: 2,
          workOrderId: 101,
          technicianId: 3,
          technicianName: 'Mike Ramirez',
          minutes: 60,
          note: 'Replaced contactor switch and initiated recharge cycle',
          loggedAt: new Date(Date.now() - 30 * 60000).toISOString(),
        },
      ],
      104: [
        {
          id: 3,
          workOrderId: 104,
          technicianId: 5,
          technicianName: 'David Kim',
          minutes: 90,
          note: 'Escalator torque inspection & brake adjustment',
          loggedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        },
      ],
      107: [
        {
          id: 4,
          workOrderId: 107,
          technicianId: 3,
          technicianName: 'Mike Ramirez',
          minutes: 180,
          note: 'Replaced VAV damper actuator and tested airflow balance',
          loggedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        },
      ],
    });
    return logs[woId] || [];
  }

  addTimeLog(woId: number, log: TimeLog) {
    const logs = getStored<Record<number, TimeLog[]>>('time_logs', {});
    if (!logs[woId]) logs[woId] = [];
    logs[woId].push(log);
    setStored('time_logs', logs);

    // Update totalMinutesLogged on work order
    const wos = this.getWorkOrders();
    const wo = wos.find((w) => w.id === woId);
    if (wo) {
      wo.totalMinutesLogged = (wo.totalMinutesLogged || 0) + log.minutes;
      this.saveWorkOrders(wos);
    }
  }

  getStatusHistory(woId: number): WorkOrderStatusHistory[] {
    const histories = getStored<Record<number, WorkOrderStatusHistory[]>>('status_histories', {
      101: [
        {
          id: 1,
          workOrderId: 101,
          toStatus: 'NEW',
          changedById: 6,
          changedByName: 'Johnathan Hayes',
          changedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
          note: 'Work order created from client portal',
        },
        {
          id: 2,
          workOrderId: 101,
          fromStatus: 'NEW',
          toStatus: 'ASSIGNED',
          changedById: 2,
          changedByName: 'Sarah Chen (Dispatcher)',
          changedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
          note: 'Assigned to Mike Ramirez',
        },
        {
          id: 3,
          workOrderId: 101,
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          changedById: 3,
          changedByName: 'Mike Ramirez',
          changedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          note: 'Arrived on-site and commenced pressure tests',
        },
      ],
    });
    return histories[woId] || [
      {
        id: 1,
        workOrderId: woId,
        toStatus: 'NEW',
        changedById: 1,
        changedByName: 'System',
        changedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        note: 'Initial work order creation',
      },
    ];
  }

  addStatusHistory(woId: number, history: WorkOrderStatusHistory) {
    const histories = getStored<Record<number, WorkOrderStatusHistory[]>>('status_histories', {});
    if (!histories[woId]) histories[woId] = [];
    histories[woId].push(history);
    setStored('status_histories', histories);
  }

  getDashboardData(customerId?: number): DashboardData {
    let wos = this.getWorkOrders();
    if (customerId) {
      wos = wos.filter((w) => w.customerId === customerId);
    }

    const total = wos.length;
    const open = wos.filter((w) => ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(w.status)).length;
    const completed = wos.filter((w) => w.status === 'COMPLETED').length;
    const closed = wos.filter((w) => w.status === 'CLOSED').length;
    const cancelled = wos.filter((w) => w.status === 'CANCELLED').length;
    const overdue = wos.filter((w) => w.slaState === 'BREACHED').length;
    const atRisk = wos.filter((w) => w.slaState === 'AT_RISK').length;

    const compliance = total > 0 ? ((total - overdue) / total) * 100 : 100;

    const statusMap: Record<string, number> = {
      NEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      COMPLETED: 0,
      CLOSED: 0,
    };
    wos.forEach((w) => {
      statusMap[w.status] = (statusMap[w.status] || 0) + 1;
    });

    const priorityMap: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    wos.forEach((w) => {
      priorityMap[w.priority] = (priorityMap[w.priority] || 0) + 1;
    });

    const techCounts: Record<string, { technicianId: number; technicianName: string; workOrderCount: number }> = {};
    wos.forEach((w) => {
      if (w.assignedTechnicianName && w.assignedTechnicianId) {
        if (!techCounts[w.assignedTechnicianName]) {
          techCounts[w.assignedTechnicianName] = {
            technicianId: w.assignedTechnicianId,
            technicianName: w.assignedTechnicianName,
            workOrderCount: 0,
          };
        }
        techCounts[w.assignedTechnicianName].workOrderCount++;
      }
    });

    return {
      totalWorkOrders: total,
      openWorkOrders: open,
      completedWorkOrders: completed,
      closedWorkOrders: closed,
      cancelledWorkOrders: cancelled,
      overdueWorkOrders: overdue,
      atRiskWorkOrders: atRisk,
      slaCompliancePercent: Math.round(compliance * 10) / 10,
      workOrdersByStatus: statusMap,
      workOrdersByPriority: priorityMap,
      workOrdersByTechnician: Object.values(techCounts),
      recentWorkOrders: wos.slice(0, 5),
    };
  }

  getReportSummary(customerId?: number): ReportSummary {
    const dashboard = this.getDashboardData(customerId);
    const wos = customerId
      ? this.getWorkOrders().filter((w) => w.customerId === customerId)
      : this.getWorkOrders();

    const totalPartsCost = wos.reduce((acc, w) => acc + (w.totalPartsCost || 0), 0);
    const totalMinutes = wos.reduce((acc, w) => acc + (w.totalMinutesLogged || 0), 0);

    const customerMap: Record<string, number> = {};
    wos.forEach((w) => {
      customerMap[w.customerName] = (customerMap[w.customerName] || 0) + 1;
    });

    return {
      totalWorkOrders: dashboard.totalWorkOrders,
      openWorkOrders: dashboard.openWorkOrders,
      completedWorkOrders: dashboard.completedWorkOrders,
      totalPartsCost: Math.round(totalPartsCost * 100) / 100,
      totalMinutesLogged: totalMinutes,
      averageCompletionTimeHours: 4.5,
      slaCompliancePercent: dashboard.slaCompliancePercent,
      workOrdersByStatus: dashboard.workOrdersByStatus,
      workOrdersByPriority: dashboard.workOrdersByPriority,
      workOrdersByCustomer: customerMap,
    };
  }
}

export const mockStore = new MockStore();

export function toPageResponse<T>(items: T[], page = 0, size = 20): PageResponse<T> {
  const start = page * size;
  const content = items.slice(start, start + size);
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size) || 1;

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}
