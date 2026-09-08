import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Building2,
  Building,
  Wrench,
  Workflow,
  Sparkles,
  Loader2,
  HardHat,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface PersonaItem {
  id: string;
  name: string;
  subtitle: string;
  email: string;
  role: UserRole;
  customerId?: number;
  route: string;
  icon: any;
  colorTheme: 'blue' | 'emerald' | 'dark' | 'amber' | 'purple';
}

export default function Login() {
  const [activePersona, setActivePersona] = useState<string>('admin');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  // Personas matching the user's reference screenshot design
  const personas: PersonaItem[] = [
    {
      id: 'admin',
      name: 'Admin / Facility Manager',
      subtitle: 'Full System Control & Management',
      email: 'admin@vertexa.com',
      role: 'MANAGER',
      route: '/dashboard',
      icon: ShieldCheck,
      colorTheme: 'blue',
    },
    {
      id: 'apex',
      name: 'Apex Commercial Towers',
      subtitle: 'Client Portal & Service Requests',
      email: 'john@apex.com',
      role: 'CUSTOMER',
      customerId: 1,
      route: '/portal',
      icon: Building2,
      colorTheme: 'emerald',
    },
    {
      id: 'dispatcher',
      name: 'Operations Dispatcher',
      subtitle: 'Sarah Jenkins • Work Order Dispatch',
      email: 'sarah@vertexa.com',
      role: 'DISPATCHER',
      route: '/kanban',
      icon: Workflow,
      colorTheme: 'purple',
    },
    {
      id: 'tech_mike',
      name: 'Field Tech • Mike Ramirez',
      subtitle: 'HVAC & Electrical Specialist',
      email: 'mike@vertexa.com',
      role: 'TECHNICIAN',
      route: '/my-jobs',
      icon: Wrench,
      colorTheme: 'dark',
    },
    {
      id: 'tech_alex',
      name: 'Field Tech • Alex Rivera',
      subtitle: 'Field Operations & Maintenance',
      email: 'alex@vertexa.com',
      role: 'TECHNICIAN',
      route: '/my-jobs',
      icon: HardHat,
      colorTheme: 'dark',
    },
    {
      id: 'nexus',
      name: 'Nexus Innovation Park',
      subtitle: 'Client Portal • Lab Complex',
      email: 'elena@nexuspark.com',
      role: 'CUSTOMER',
      customerId: 2,
      route: '/portal',
      icon: Building,
      colorTheme: 'dark',
    },
  ];

  const handleDirectAccess = async (
    id: string,
    email: string,
    role: UserRole,
    route: string,
    name: string,
    customerId?: number
  ) => {
    setLoadingId(id);
    setActivePersona(id);
    try {
      await loginAs(email, 'password123', {
        id: customerId || 1,
        name: name,
        email: email,
        role: role,
        customerId: customerId,
      });
      toast.success(`Accessing ${name}...`);
      navigate(route);
    } catch {
      toast.success(`Redirecting to ${route}...`);
      navigate(route);
    } finally {
      setLoadingId(null);
    }
  };

  const getPersonaStyle = (item: PersonaItem) => {
    const isActive = activePersona === item.id;
    if (item.colorTheme === 'blue') {
      return 'bg-blue-900/35 border-blue-500/70 text-blue-300 hover:bg-blue-800/45 shadow-lg shadow-blue-500/10';
    }
    if (item.colorTheme === 'emerald') {
      return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/45 shadow-lg shadow-emerald-500/10';
    }
    if (item.colorTheme === 'purple') {
      return 'bg-purple-950/30 border-purple-500/60 text-purple-300 hover:bg-purple-900/45';
    }
    return isActive
      ? 'bg-[#18233d] border-blue-400 text-white shadow-md'
      : 'bg-[#0f172a]/90 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-[#16213b]';
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col justify-between relative overflow-hidden selection:bg-accent-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0d1424]/80 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-extrabold text-xl">K</span>
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight leading-none">KEYSTONE</h1>
            <p className="text-slate-400 text-[10px] tracking-[0.2em] uppercase font-semibold mt-0.5">
              Vertexa Facility Solutions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full">
          <Sparkles size={14} className="text-blue-400" />
          <span>One-Click Access</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Direct Role Access
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Select Your Role
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Click any role button below to directly open your workspace without login credentials.
          </p>
        </div>

        {/* Primary Role Selector Cards (Styled in 2 columns matching user screenshot) */}
        <div className="bg-[#0b1329]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {personas.map((persona) => {
              const Icon = persona.icon;
              const isLoading = loadingId === persona.id;

              return (
                <button
                  key={persona.id}
                  onClick={() =>
                    handleDirectAccess(
                      persona.id,
                      persona.email,
                      persona.role,
                      persona.route,
                      persona.name,
                      persona.customerId
                    )
                  }
                  disabled={loadingId !== null}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left group hover:scale-[1.01] active:scale-[0.99] ${getPersonaStyle(
                    persona
                  )}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-white" />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate group-hover:text-blue-200 transition-colors">
                        {persona.name}
                      </p>
                      <p className="text-xs opacity-70 truncate mt-0.5">{persona.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Vertexa Facility Solutions Pvt. Ltd. — KEYSTONE Enterprise Platform
      </footer>
    </div>
  );
}
