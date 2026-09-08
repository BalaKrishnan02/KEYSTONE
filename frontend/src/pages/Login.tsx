import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Columns3,
  Wrench,
  Package,
  Users,
  Building2,
  BarChart3,
  UserCog,
  Bell,
  Home,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface PageLink {
  to: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  targetRole?: UserRole;
  category: 'operations' | 'field' | 'facilities' | 'admin';
}

const PAGES: PageLink[] = [
  // Operations & Workflows
  {
    to: '/dashboard',
    title: 'Operations Dashboard',
    description: 'Executive overview, real-time KPI metrics, active jobs, and SLA breach monitors.',
    badge: 'Core Analytics',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <LayoutDashboard size={22} />,
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-600',
    targetRole: 'MANAGER',
    category: 'operations',
  },
  {
    to: '/work-orders',
    title: 'Work Orders Directory',
    description: 'Comprehensive table to search, filter, assign, and track all maintenance work orders.',
    badge: 'Operations',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: <ClipboardList size={22} />,
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-600',
    targetRole: 'MANAGER',
    category: 'operations',
  },
  {
    to: '/work-orders/new',
    title: 'Create Work Order',
    description: 'Dispatch new emergency or scheduled maintenance orders with priority and SLA rules.',
    badge: 'Quick Action',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <PlusCircle size={22} />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-600',
    targetRole: 'DISPATCHER',
    category: 'operations',
  },
  {
    to: '/kanban',
    title: 'Kanban Workflow Board',
    description: 'Visual status pipeline to monitor and drag work orders across progress stages.',
    badge: 'Interactive',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <Columns3 size={22} />,
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-600',
    targetRole: 'DISPATCHER',
    category: 'operations',
  },

  // Field Operations & Inventory
  {
    to: '/my-jobs',
    title: 'My Jobs (Technician Portal)',
    description: 'Field technician mobile-first workspace with step progress, time logger, and parts usage.',
    badge: 'Field Tech',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Wrench size={22} />,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-600',
    targetRole: 'TECHNICIAN',
    category: 'field',
  },
  {
    to: '/parts',
    title: 'Parts & Inventory',
    description: 'Warehouse catalogue, replacement part stock tracking, costs, and consumption logs.',
    badge: 'Inventory',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: <Package size={22} />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-600',
    targetRole: 'MANAGER',
    category: 'field',
  },

  // Facilities & Client Relations
  {
    to: '/customers',
    title: 'Customer Directory',
    description: 'Corporate client profiles, contact personnel, service history, and SLA commitments.',
    badge: 'CRM',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: <Users size={22} />,
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    iconColor: 'text-sky-600',
    targetRole: 'MANAGER',
    category: 'facilities',
  },
  {
    to: '/sites',
    title: 'Facility Sites & Buildings',
    description: 'Building locations, property addresses, and physical plant management.',
    badge: 'Properties',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: <Building2 size={22} />,
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-600',
    targetRole: 'MANAGER',
    category: 'facilities',
  },
  {
    to: '/portal',
    title: 'Customer Self-Service Portal',
    description: 'Dedicated customer view to review ongoing repairs, asset status, and work summaries.',
    badge: 'Client Portal',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: <Home size={22} />,
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    iconColor: 'text-orange-600',
    targetRole: 'CUSTOMER',
    category: 'facilities',
  },
  {
    to: '/portal/requests',
    title: 'Submit Service Request',
    description: 'Client form to log new facility issues, maintenance requests, and site incidents.',
    badge: 'Client Form',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <PlusCircle size={22} />,
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-600',
    targetRole: 'CUSTOMER',
    category: 'facilities',
  },

  // Analytics & Administration
  {
    to: '/reports',
    title: 'Reports & SLA Compliance',
    description: 'Detailed reporting on SLA adherence, resolution speed, and technician performance.',
    badge: 'Reporting',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: <BarChart3 size={22} />,
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    iconColor: 'text-violet-600',
    targetRole: 'MANAGER',
    category: 'admin',
  },
  {
    to: '/notifications',
    title: 'Alerts & Notifications',
    description: 'System-wide event log, assignment alerts, and proactive SLA escalation warnings.',
    badge: 'Live Feed',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: <Bell size={22} />,
    iconBg: 'bg-pink-500/10 border-pink-500/20',
    iconColor: 'text-pink-600',
    targetRole: 'MANAGER',
    category: 'admin',
  },
  {
    to: '/users',
    title: 'User & Access Management',
    description: 'Manage staff accounts, dispatchers, technicians, customers, and role privileges.',
    badge: 'Administration',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <UserCog size={22} />,
    iconBg: 'bg-slate-500/10 border-slate-500/20',
    iconColor: 'text-slate-600',
    targetRole: 'MANAGER',
    category: 'admin',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Pages' },
  { id: 'operations', label: 'Operations & Work Orders' },
  { id: 'field', label: 'Field Technician & Inventory' },
  { id: 'facilities', label: 'Facilities & Client Portal' },
  { id: 'admin', label: 'Reports & Administration' },
];

export default function Login() {
  const navigate = useNavigate();
  const { user, switchToRole } = useAuth();

  const handleOpenPage = async (page: PageLink) => {
    if (page.targetRole && user?.role !== page.targetRole) {
      await switchToRole(page.targetRole);
    }
    navigate(page.to);
  };

  const handleRoleSelect = async (role: UserRole) => {
    await switchToRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-accent-500 selection:text-white relative overflow-hidden flex flex-col">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-accent-400 via-accent-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/25">
              <span className="text-white font-black text-xl tracking-tight">K</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-extrabold text-xl tracking-tight">KEYSTONE</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Direct Access Mode
                </span>
              </div>
              <p className="text-slate-400 text-[11px] tracking-wider uppercase font-medium">
                Vertexa Facility Solutions Pvt. Ltd.
              </p>
            </div>
          </div>

          {/* Quick Active Persona Switcher */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5">
            <span className="text-xs text-slate-400 px-2 font-medium hidden md:inline">
              Active Persona:
            </span>
            {(['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as UserRole[]).map((r) => {
              const active = user?.role === r;
              const demo = DEMO_ACCOUNTS[r];
              return (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-accent-500 text-white shadow-md shadow-accent-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Switch to ${demo.name} (${r})`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles size={14} className="text-accent-400" />
            <span>Select any module below to open it immediately</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Keystone Platform Navigator
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Click on any page card below to launch that interface directly without needing to enter credentials.
          </p>
        </div>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Work Orders & SLAs', value: 'Live Tracking', icon: Shield, color: 'text-blue-400' },
            { label: 'Drag & Drop Kanban', value: '6 Stages', icon: Layers, color: 'text-purple-400' },
            { label: 'Technician Tools', value: 'Time & Parts', icon: Clock, color: 'text-amber-400' },
            { label: 'Direct Access', value: 'No Login Required', icon: CheckCircle2, color: 'text-emerald-400' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
              >
                <div className={`p-2.5 rounded-lg bg-white/5 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-medium">{item.label}</p>
                  <p className="text-white text-sm font-bold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-accent-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Available Pages ({PAGES.length})</h3>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Click any card to launch</p>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {PAGES.map((page) => (
            <div
              key={page.to}
              onClick={() => handleOpenPage(page)}
              className="group bg-slate-900/70 hover:bg-slate-900 border border-white/10 hover:border-accent-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-accent-500/10 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon + Badge + Route */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${page.iconBg} ${page.iconColor}`}
                  >
                    {page.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${page.badgeColor}`}
                    >
                      {page.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                      {page.to}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-white font-bold text-base mb-1.5 group-hover:text-accent-400 transition-colors flex items-center gap-1.5">
                  {page.title}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {page.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {page.targetRole ? `Persona: ${page.targetRole}` : 'Open directly'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPage(page);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-accent-500 text-slate-200 group-hover:text-white text-xs font-semibold transition-all"
                >
                  <span>Open Page</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-slate-900/40 py-6 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Vertexa Facility Solutions Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
