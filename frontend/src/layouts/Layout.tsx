import { useState, useEffect, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Columns3,
  Package,
  BarChart3,
  UserCog,
  Wrench,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Home,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/customers', label: 'Customers', icon: <Users size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/sites', label: 'Sites', icon: <Building2 size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/work-orders', label: 'Work Orders', icon: <ClipboardList size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/kanban', label: 'Kanban Board', icon: <Columns3 size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/parts', label: 'Parts', icon: <Package size={20} />, roles: ['MANAGER', 'DISPATCHER', 'TECHNICIAN'] },
  { to: '/reports', label: 'Reports', icon: <BarChart3 size={20} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/users', label: 'Users', icon: <UserCog size={20} />, roles: ['MANAGER'] },
  { to: '/my-jobs', label: 'My Jobs', icon: <Wrench size={20} />, roles: ['TECHNICIAN'] },
  { to: '/portal', label: 'My Requests', icon: <ClipboardList size={20} />, roles: ['CUSTOMER'] },
  { to: '/portal/requests', label: 'New Request', icon: <Home size={20} />, roles: ['CUSTOMER'] },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/sites': 'Sites',
  '/work-orders': 'Work Orders',
  '/kanban': 'Kanban Board',
  '/parts': 'Parts Inventory',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/my-jobs': 'My Jobs',
  '/portal': 'My Requests',
  '/portal/requests': 'New Request',
  '/notifications': 'Notifications',
};

const roleBadgeStyle = (role: string) => {
  switch (role) {
    case 'MANAGER':    return 'bg-accent-50 text-accent-600';
    case 'DISPATCHER': return 'bg-accent-50 text-accent-600';
    case 'TECHNICIAN': return 'bg-success-50 text-success-600';
    case 'CUSTOMER':   return 'bg-warning-50 text-warning-600';
    default:           return 'bg-neutral-50 text-neutral-500';
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const filteredItems = navItems.filter((item) => user && item.roles.includes(user.role));
  const currentPage = pageTitles[location.pathname] || 'KEYSTONE';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm tracking-tight">K</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">KEYSTONE</h1>
              <p className="text-neutral-400 text-[10px] tracking-widest uppercase">Facility Solutions</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setCollapsed(!collapsed);
          }}
          className="text-neutral-500 hover:text-white transition-colors lg:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {window.innerWidth < 1024 ? <X size={20} /> : collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? `sidebar-nav-item-active ${collapsed ? 'justify-center' : ''}`
                : `sidebar-nav-item-inactive ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        {user && (
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-neutral-500 text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className={`sidebar-nav-item-inactive mt-1 w-full text-danger-400 hover:text-danger-300 hover:bg-danger-600/10 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
          aria-label="Logout"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-surface-sidebar transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-icon"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-h2 text-neutral-700">{currentPage}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="hidden md:flex items-center bg-neutral-50 border border-neutral-100 rounded-control px-3 py-2 w-60 focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-accent-500 transition-all">
              <Search size={15} className="text-neutral-300 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-neutral-600 w-full placeholder:text-neutral-300"
                aria-label="Search"
              />
            </div>

            {/* Switch Persona / Launchpad Hub Button */}
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200 text-xs font-semibold transition-all shadow-sm"
              title="Return to Role & Page Launchpad"
            >
              <Users size={14} />
              <span className="hidden sm:inline">Switch Role / Pages</span>
            </NavLink>

            {/* Notification bell */}
            <NavLink
              to="/notifications"
              className="relative btn-icon"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-fade-in">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* User badge */}
            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-neutral-100">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">{user?.name}</p>
                <span className={`inline-block text-badge font-semibold uppercase px-1.5 py-0.5 rounded ${roleBadgeStyle(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">
                  {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
