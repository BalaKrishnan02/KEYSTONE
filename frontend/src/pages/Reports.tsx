import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
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
  Legend,
} from 'recharts';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  DollarSign,
  Timer,
  TrendingUp,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { customerService } from '../services/customerService';
import { ReportSummary, Customer } from '../types';
import KPICard from '../components/KPICard';
import EmptyState from '../components/EmptyState';

const CHART_COLORS = ['#185FA5', '#3B6D11', '#854F0B', '#A32D2D', '#5AA3E3', '#7DB13A', '#D89A2C'];

export default function Reports() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customerService.getAll(undefined, 0, 500);
      setCustomers(res.content);
    } catch {
      // silent
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const custId = customerId !== '' ? customerId : undefined;
      const res = await dashboardService.getReportSummary(custId);
      setReport(res);
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);
  useEffect(() => { load(); }, [load]);

  const statusChartData = report
    ? Object.entries(report.workOrdersByStatus || {}).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        count: value,
      }))
    : [];

  const priorityChartData = report
    ? Object.entries(report.workOrdersByPriority || {}).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const customerChartData = report
    ? Object.entries(report.workOrdersByCustomer || {}).map(([name, value]) => ({
        name,
        count: value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Analytics & Reports</h1>
          <p className="text-body text-neutral-400 mt-0.5">Comprehensive operations, SLA, and parts analytics</p>
        </div>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : '')}
          className="select-field min-w-[200px]"
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.organizationName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-accent-500" />
        </div>
      ) : !report ? (
        <EmptyState
          title="No report data available"
          description="Analytics will appear here once work order operations are recorded"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            <KPICard label="Total" value={report.totalWorkOrders} icon={<ClipboardList size={16} />} color="accent" />
            <KPICard label="Open" value={report.openWorkOrders} icon={<Clock size={16} />} color="warning" />
            <KPICard label="Completed" value={report.completedWorkOrders} icon={<CheckCircle2 size={16} />} color="success" />
            <KPICard
              label="Parts Cost"
              value={`$${report.totalPartsCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<DollarSign size={16} />}
              color="accent"
            />
            <KPICard
              label="Logged Time"
              value={`${report.totalMinutesLogged}m`}
              icon={<Timer size={16} />}
              color="accent"
            />
            <KPICard
              label="Avg Time"
              value={`${report.averageCompletionTimeHours.toFixed(1)}h`}
              icon={<TrendingUp size={16} />}
              color="accent"
            />
            <KPICard
              label="SLA Compliance"
              value={`${report.slaCompliancePercent.toFixed(1)}%`}
              icon={<ShieldCheck size={16} />}
              color={report.slaCompliancePercent >= 90 ? 'success' : report.slaCompliancePercent >= 70 ? 'warning' : 'danger'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
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
              <h3 className="text-h3 text-neutral-700 mb-4">Work Orders by Priority</h3>
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {customerChartData.length > 0 && (
            <div className="card">
              <h3 className="text-h3 text-neutral-700 mb-4">Work Orders by Customer</h3>
              <ResponsiveContainer width="100%" height={Math.max(300, customerChartData.length * 45)}>
                <BarChart data={customerChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8A887F' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8A887F' }} width={150} />
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
        </>
      )}
    </div>
  );
}
