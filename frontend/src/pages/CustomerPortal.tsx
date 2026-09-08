import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClipboardList, Clock, Play, CheckCircle2, ShieldCheck,
  Plus, Loader2, AlertTriangle, Calendar, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workOrderService } from '../services/workOrderService';
import { customerService } from '../services/customerService';
import { WorkOrder, Customer, PageResponse } from '../types';
import StatusBadge, { statusVariant, priorityVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workOrders, setWorkOrders] = useState<PageResponse<WorkOrder> | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [woRes, custRes] = await Promise.all([
        workOrderService.getAll({ page: 0, size: 200 }),
        user.customerId ? customerService.getById(user.customerId) : Promise.resolve(null),
      ]);
      setWorkOrders(woRes);
      setCustomer(custRes);
    } catch {
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-accent-500" />
      </div>
    );
  }

  const orders = workOrders?.content ?? [];
  const totalRequests = orders.length;
  const openCount = orders.filter((wo) => ['NEW', 'ASSIGNED'].includes(wo.status)).length;
  const inProgressCount = orders.filter((wo) => ['IN_PROGRESS', 'ON_HOLD'].includes(wo.status)).length;
  const completedCount = orders.filter((wo) => ['COMPLETED', 'CLOSED'].includes(wo.status)).length;

  const recentOrders = orders
    .filter((wo) => !['CANCELLED'].includes(wo.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const slaOrders = orders.filter((wo) => wo.slaState && wo.slaState !== 'ON_TRACK');
  const onTrackCount = orders.filter((wo) => wo.slaState === 'ON_TRACK').length;
  const atRiskCount = orders.filter((wo) => wo.slaState === 'AT_RISK').length;
  const breachedCount = orders.filter((wo) => wo.slaState === 'BREACHED').length;
  const ordersWithSla = orders.filter((wo) => wo.slaState).length;
  const slaCompliancePercent = ordersWithSla > 0 ? (onTrackCount / ordersWithSla) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">
            Welcome{customer ? `, ${customer.organizationName}` : ''}
          </h1>
          <p className="text-body text-neutral-400 mt-0.5">Your customer service request overview</p>
        </div>
        <button
          onClick={() => navigate('/portal/requests?create=1')}
          className="btn-primary"
        >
          <Plus size={16} />
          New Service Request
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Requests" value={totalRequests} icon={<ClipboardList size={18} />} color="accent" />
        <KPICard label="Open" value={openCount} icon={<Clock size={18} />} color="warning" />
        <KPICard label="In Progress" value={inProgressCount} icon={<Play size={18} />} color="accent" />
        <KPICard label="Completed" value={completedCount} icon={<CheckCircle2 size={18} />} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 text-neutral-700">Recent Requests</h3>
            <Link
              to="/portal/requests"
              className="text-btn text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Submit your first maintenance or service request"
              action={
                <button
                  onClick={() => navigate('/portal/requests?create=1')}
                  className="btn-primary mt-2"
                >
                  <Plus size={16} /> New Request
                </button>
              }
            />
          ) : (
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
                    <th className="table-header pb-3">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentOrders.map((wo) => (
                    <tr
                      key={wo.id}
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                      className="table-row cursor-pointer"
                    >
                      <td className="py-3 pl-0 text-accent-600 font-medium">{wo.workOrderCode}</td>
                      <td className="py-3 text-neutral-700 max-w-[180px] truncate">{wo.title}</td>
                      <td className="py-3">
                        <StatusBadge variant={statusVariant(wo.status)}>
                          {statusLabel(wo.status)}
                        </StatusBadge>
                      </td>
                      <td className="py-3">
                        <StatusBadge variant={priorityVariant(wo.priority)}>{wo.priority}</StatusBadge>
                      </td>
                      <td className="py-3 text-neutral-500">{wo.assignedTechnicianName || '—'}</td>
                      <td className="py-3 text-neutral-400 text-caption">
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {wo.slaState ? (
                          <StatusBadge variant={slaVariant(wo.slaState)} dot shape="pill">
                            {slaLabel(wo.slaState)}
                          </StatusBadge>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-h3 text-neutral-700 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent-500" />
              SLA Overview
            </h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-caption text-neutral-500 font-medium">Compliance Rate</span>
                <span className="text-sm font-bold text-neutral-700">{ordersWithSla > 0 ? `${slaCompliancePercent.toFixed(1)}%` : '—'}</span>
              </div>
              <ProgressBar value={slaCompliancePercent} color="success" size="md" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-success-50 rounded-control">
                <span className="text-caption font-medium text-success-700">On Track</span>
                <span className="text-sm font-bold text-success-700">{onTrackCount}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-warning-50 rounded-control">
                <span className="text-caption font-medium text-warning-700">At Risk</span>
                <span className="text-sm font-bold text-warning-700">{atRiskCount}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-danger-50 rounded-control">
                <span className="text-caption font-medium text-danger-700">Breached</span>
                <span className="text-sm font-bold text-danger-700">{breachedCount}</span>
              </div>
            </div>
          </div>

          {slaOrders.length > 0 && (
            <div className="card">
              <h3 className="text-h4 text-neutral-700 mb-3 flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} className="text-warning-500" />
                Attention Needed
              </h3>
              <div className="space-y-2">
                {slaOrders.slice(0, 5).map((wo) => (
                  <Link
                    key={wo.id}
                    to={`/work-orders/${wo.id}`}
                    className="block p-3 rounded-card border border-neutral-100 hover:border-warning-200 hover:bg-warning-50/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-label font-medium text-neutral-700">{wo.workOrderCode}</p>
                        <p className="text-caption text-neutral-400 mt-0.5 truncate">{wo.title}</p>
                      </div>
                      <StatusBadge variant={slaVariant(wo.slaState)} shape="pill" className="shrink-0 ml-2">
                        {slaLabel(wo.slaState)}
                      </StatusBadge>
                    </div>
                    {wo.slaDueDate && (
                      <p className="text-caption text-neutral-400 mt-1.5 flex items-center gap-1">
                        <Calendar size={11} />
                        Due: {new Date(wo.slaDueDate).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
