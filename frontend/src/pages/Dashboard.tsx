import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { ClipboardList, AlertCircle, CheckCircle2, Clock, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardData, WorkOrder } from '../types';
import KPICard from '../components/KPICard';
import StatusBadge, { statusVariant, priorityVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

const CHART_COLORS = ['#185FA5', '#3B6D11', '#854F0B', '#A32D2D', '#5AA3E3', '#7DB13A'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="Failed to fetch dashboard data. Please try refreshing the page."
        icon={<AlertCircle size={28} />}
      />
    );
  }

  const statusChartData = Object.entries(data.workOrdersByStatus || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    count: value,
  }));

  const priorityChartData = Object.entries(data.workOrdersByPriority || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const techChartData = (data.workOrdersByTechnician || []).map((t) => ({
    name: t?.technicianName ? t.technicianName.split(' ')[0] : 'Tech',
    count: t?.workOrderCount || 0,
  }));

  const slaAlerts = (data.recentWorkOrders || []).filter(
    (wo) => wo?.slaState === 'AT_RISK' || wo?.slaState === 'BREACHED'
  );

  const slaPercent = data.slaCompliancePercent ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Work Orders"
          value={data.totalWorkOrders ?? 0}
          icon={<ClipboardList size={18} />}
          color="accent"
        />
        <KPICard
          label="Open Work Orders"
          value={data.openWorkOrders ?? 0}
          icon={<Clock size={18} />}
          color="warning"
        />
        <KPICard
          label="Completed"
          value={data.completedWorkOrders ?? 0}
          icon={<CheckCircle2 size={18} />}
          color="success"
        />
        <KPICard
          label="Overdue"
          value={data.overdueWorkOrders ?? 0}
          icon={<AlertCircle size={18} />}
          color="danger"
        />
        <div className="card flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">
              SLA Compliance
            </p>
            <div className="w-9 h-9 rounded-control flex items-center justify-center bg-success-50 text-success-600">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-700 tracking-tight">
            {slaPercent.toFixed(1)}%
          </p>
          <ProgressBar
            value={slaPercent}
            color={slaPercent >= 90 ? 'success' : slaPercent >= 70 ? 'warning' : 'danger'}
            size="md"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-h3 text-neutral-700 mb-4">Work Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A887F' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8A887F' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D0CEC5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-h3 text-neutral-700 mb-4">By Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {priorityChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D0CEC5',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technician Chart */}
      {techChartData.length > 0 && (
        <div className="card">
          <h3 className="text-h3 text-neutral-700 mb-4">Work Orders by Technician</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={techChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8A887F' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8A887F' }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D0CEC5',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" fill="#185FA5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Work Orders + SLA Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 text-neutral-700">Recent Work Orders</h3>
            <Link to="/work-orders" className="text-btn text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-100">
                  <th className="table-header pb-3 pl-0">Code</th>
                  <th className="table-header pb-3">Title</th>
                  <th className="table-header pb-3">Status</th>
                  <th className="table-header pb-3">Priority</th>
                  <th className="table-header pb-3">Technician</th>
                  <th className="table-header pb-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(data.recentWorkOrders || []).slice(0, 10).map((wo: WorkOrder) => (
                  <tr key={wo.id} className="table-row">
                    <td className="py-3 pl-0">
                      <Link to={`/work-orders/${wo.id}`} className="text-accent-600 hover:text-accent-700 font-medium">
                        {wo.workOrderCode}
                      </Link>
                    </td>
                    <td className="py-3 text-neutral-600 max-w-[200px] truncate">{wo.title}</td>
                    <td className="py-3">
                      <StatusBadge variant={statusVariant(wo.status)}>
                        {statusLabel(wo.status)}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      <StatusBadge variant={priorityVariant(wo.priority)}>
                        {wo.priority}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-neutral-500">{wo.assignedTechnicianName || '—'}</td>
                    <td className="py-3 text-neutral-400 text-caption">
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLA Alerts */}
        <div className="card">
          <h3 className="text-h3 text-neutral-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning-500" />
            SLA Alerts
          </h3>
          {slaAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={18} className="text-success-500" />
              </div>
              <p className="text-body text-neutral-400">No SLA alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {slaAlerts.map((wo) => (
                <Link
                  key={wo.id}
                  to={`/work-orders/${wo.id}`}
                  className="block p-3 rounded-card border border-neutral-100 hover:border-warning-200 hover:bg-warning-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-label font-medium text-neutral-700 group-hover:text-neutral-700">{wo.workOrderCode}</p>
                      <p className="text-caption text-neutral-400 mt-0.5 truncate max-w-[180px]">{wo.title}</p>
                    </div>
                    <StatusBadge variant={slaVariant(wo.slaState)} shape="pill">
                      {slaLabel(wo.slaState)}
                    </StatusBadge>
                  </div>
                  {wo.slaDueDate && (
                    <p className="text-caption text-neutral-400 mt-1.5">
                      Due: {new Date(wo.slaDueDate).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
