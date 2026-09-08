import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workOrderService } from '../services/workOrderService';
import { customerService } from '../services/customerService';
import { WorkOrder, Customer, PageResponse } from '../types';
import StatusBadge, { statusVariant, priorityVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const STATUS_OPTIONS = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED', 'CANCELLED'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export default function WorkOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [workOrders, setWorkOrders] = useState<PageResponse<WorkOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [page, setPage] = useState(0);
  const size = 20;

  const isManagerOrDispatcher = user?.role === 'MANAGER' || user?.role === 'DISPATCHER';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workOrderService.getAll({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        customerId: customerId ? Number(customerId) : undefined,
        page,
        size,
      });
      setWorkOrders(res);
    } catch {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, customerId, page]);

  const loadCustomers = useCallback(async () => {
    if (!isManagerOrDispatcher) return;
    try {
      const res = await customerService.getAll(undefined, 0, 500);
      setCustomers(res.content);
    } catch {
      // silent
    }
  }, [isManagerOrDispatcher]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    setPage(0);
  }, [search, status, priority, customerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body text-neutral-400 mt-0.5">Manage and track all service requests</p>
        </div>
        {isManagerOrDispatcher && (
          <button onClick={() => navigate('/work-orders/new')} className="btn-primary">
            <Plus size={16} />
            Create Work Order
          </button>
        )}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search work orders"
            />
          </div>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field w-auto min-w-[140px]">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select-field w-auto min-w-[140px]">
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {isManagerOrDispatcher && (
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="select-field w-auto min-w-[180px]">
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.organizationName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent-500" />
          </div>
        ) : !workOrders || workOrders.content.length === 0 ? (
          <EmptyState
            title="No work orders found"
            description="Try adjusting your filters or create a new work order"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Code</th>
                    <th className="table-header pb-3">Title</th>
                    <th className="table-header pb-3">Customer</th>
                    <th className="table-header pb-3">Site</th>
                    <th className="table-header pb-3">Priority</th>
                    <th className="table-header pb-3">Status</th>
                    <th className="table-header pb-3">Technician</th>
                    <th className="table-header pb-3">SLA Due</th>
                    <th className="table-header pb-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {workOrders.content.map((wo) => (
                    <tr
                      key={wo.id}
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                      className="table-row cursor-pointer"
                    >
                      <td className="py-3 pl-0 text-accent-600 font-medium">{wo.workOrderCode}</td>
                      <td className="py-3 text-neutral-700 max-w-[200px] truncate">{wo.title}</td>
                      <td className="py-3 text-neutral-500 max-w-[140px] truncate">{wo.customerName}</td>
                      <td className="py-3 text-neutral-500 max-w-[140px] truncate">{wo.siteName}</td>
                      <td className="py-3">
                        <StatusBadge variant={priorityVariant(wo.priority)}>{wo.priority}</StatusBadge>
                      </td>
                      <td className="py-3">
                        <StatusBadge variant={statusVariant(wo.status)}>{statusLabel(wo.status)}</StatusBadge>
                      </td>
                      <td className="py-3 text-neutral-500">{wo.assignedTechnicianName || '—'}</td>
                      <td className="py-3">
                        {wo.slaDueDate ? (
                          <StatusBadge variant={slaVariant(wo.slaState)} dot>
                            {new Date(wo.slaDueDate).toLocaleDateString()}
                          </StatusBadge>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-neutral-400 text-caption">{new Date(wo.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {workOrders.totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {workOrders.page * workOrders.size + 1} to{' '}
                  {Math.min((workOrders.page + 1) * workOrders.size, workOrders.totalElements)} of{' '}
                  {workOrders.totalElements} work orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={workOrders.first}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-3">
                    Page {workOrders.page + 1} of {workOrders.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={workOrders.last}
                    className="btn-secondary"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
