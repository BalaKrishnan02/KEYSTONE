import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, ArrowLeft, Loader2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workOrderService } from '../services/workOrderService';
import { siteService } from '../services/siteService';
import { WorkOrder, WorkOrderStatusHistory, Site, PageResponse } from '../types';
import StatusBadge, { statusVariant, priorityVariant, statusLabel } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const TABS = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const;
const TAB_STATUS_MAP: Record<string, string[]> = {
  ALL: [],
  OPEN: ['NEW', 'ASSIGNED'],
  IN_PROGRESS: ['IN_PROGRESS', 'ON_HOLD'],
  COMPLETED: ['COMPLETED', 'CLOSED'],
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export default function CustomerRequests() {
  const { id: viewId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [workOrders, setWorkOrders] = useState<PageResponse<WorkOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const size = 12;

  const [showCreate, setShowCreate] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', siteId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [viewDetail, setViewDetail] = useState<WorkOrder | null>(null);
  const [detailHistory, setDetailHistory] = useState<WorkOrderStatusHistory[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadWorkOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const statuses = TAB_STATUS_MAP[activeTab] || [];
      const res = await workOrderService.getAll({
        customerId: user.customerId,
        status: statuses.length === 1 ? statuses[0] : undefined,
        page,
        size,
      });

      if (statuses.length > 1 && res.content.length > 0) {
        res.content = res.content.filter((wo) => statuses.includes(wo.status));
      }

      setWorkOrders(res);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, page]);

  const loadSites = useCallback(async () => {
    if (!user?.customerId) return;
    setLoadingSites(true);
    try {
      const res = await siteService.getByCustomer(user.customerId, undefined, 0, 500);
      setSites(res.content);
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setLoadingSites(false);
    }
  }, [user]);

  useEffect(() => { loadWorkOrders(); }, [loadWorkOrders]);
  useEffect(() => { loadSites(); }, [loadSites]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === '1') {
      setShowCreate(true);
    }
  }, []);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    if (!viewId) {
      setViewDetail(null);
      return;
    }
    const wo = workOrders?.content.find((w) => w.id === Number(viewId));
    if (wo) {
      setViewDetail(wo);
      setLoadingDetail(true);
      workOrderService
        .getHistory(wo.id)
        .then(setDetailHistory)
        .catch(() => setDetailHistory([]))
        .finally(() => setLoadingDetail(false));
    }
  }, [viewId, workOrders]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.siteId) errors.siteId = 'Please select a site';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await workOrderService.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        customerId: user!.customerId!,
        siteId: Number(form.siteId),
      });
      toast.success('Service request created');
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', siteId: '' });
      loadWorkOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (viewDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/portal/requests')}
            className="btn-icon"
            aria-label="Back to requests"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-700 tracking-tight">{viewDetail.workOrderCode}</h1>
              <StatusBadge variant={statusVariant(viewDetail.status)}>
                {statusLabel(viewDetail.status)}
              </StatusBadge>
              <StatusBadge variant={priorityVariant(viewDetail.priority)}>
                {viewDetail.priority}
              </StatusBadge>
            </div>
            <p className="text-body text-neutral-400 mt-0.5">{viewDetail.title}</p>
          </div>
        </div>

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow label="Title" value={viewDetail.title} />
              <InfoRow label="Site" value={viewDetail.siteName} />
              <InfoRow
                label="Description"
                value={
                  viewDetail.description || (
                    <span className="text-neutral-300 italic">No description</span>
                  )
                }
              />
              <InfoRow
                label="Assigned Technician"
                value={
                  viewDetail.assignedTechnicianName || (
                    <span className="text-neutral-300 italic">Unassigned</span>
                  )
                }
              />
              <InfoRow
                label="Created At"
                value={new Date(viewDetail.createdAt).toLocaleString()}
              />
            </div>
            <div className="space-y-4">
              <InfoRow
                label="SLA Due"
                value={
                  viewDetail.slaDueDate
                    ? new Date(viewDetail.slaDueDate).toLocaleString()
                    : '—'
                }
              />
              <InfoRow label="SLA State" value={viewDetail.slaState || '—'} />
              <InfoRow label="Parts Cost" value={`$${viewDetail.totalPartsCost.toFixed(2)}`} />
              <InfoRow label="Time Logged" value={`${viewDetail.totalMinutesLogged} min`} />
              <InfoRow
                label="Completed At"
                value={
                  viewDetail.completedAt
                    ? new Date(viewDetail.completedAt).toLocaleString()
                    : '—'
                }
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-h3 text-neutral-700 mb-4">Status Timeline</h2>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-accent-500" />
            </div>
          ) : detailHistory.length === 0 ? (
            <p className="text-body text-neutral-400">No status changes recorded.</p>
          ) : (
            <Timeline items={[...detailHistory].reverse()} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">My Requests</h1>
          <p className="text-body text-neutral-400 mt-0.5">Submit and monitor maintenance requests</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-100">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-200'
              }`}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-accent-500" />
        </div>
      ) : !workOrders || workOrders.content.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={
            activeTab === 'ALL'
              ? 'Create your first service request'
              : `No ${activeTab.replace(/_/g, ' ').toLowerCase()} requests`
          }
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary mt-2"
            >
              <Plus size={16} /> New Request
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workOrders.content.map((wo) => (
              <div
                key={wo.id}
                onClick={() => navigate(`/work-orders/${wo.id}`)}
                className="card hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-caption font-semibold text-accent-600">
                      {wo.workOrderCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge variant={priorityVariant(wo.priority)}>
                        {wo.priority}
                      </StatusBadge>
                      <StatusBadge variant={statusVariant(wo.status)}>
                        {statusLabel(wo.status)}
                      </StatusBadge>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-700 mb-1.5 line-clamp-1">
                    {wo.title}
                  </h3>
                  <p className="text-caption text-neutral-400 mb-3 line-clamp-2">
                    {wo.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-caption text-neutral-400 pt-3 border-t border-neutral-100">
                  <span>{new Date(wo.createdAt).toLocaleDateString()}</span>
                  {wo.updatedAt !== wo.createdAt && (
                    <span>Updated {new Date(wo.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {workOrders.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
              <p className="text-caption text-neutral-400">
                Showing {workOrders.page * workOrders.size + 1} to{' '}
                {Math.min((workOrders.page + 1) * workOrders.size, workOrders.totalElements)} of{' '}
                {workOrders.totalElements} requests
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

      {/* New Request Modal */}
      <Modal open={showCreate} onClose={() => !submitting && setShowCreate(false)} title="New Service Request" footer={
        <>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            disabled={submitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Submit Request
          </button>
        </>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">
              Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className={`input-field ${formErrors.title ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Brief summary of the issue (e.g. Lobby AC leaking)"
              disabled={submitting}
            />
            {formErrors.title && (
              <p className="field-error">{formErrors.title}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Description</label>
              <span className="text-caption text-neutral-400">{form.description.length}/500</span>
            </div>
            <textarea
              value={form.description}
              maxLength={500}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={4}
              className="textarea-field"
              placeholder="Describe the issue, location, or urgency in detail..."
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                className="select-field"
                disabled={submitting}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Site <span className="text-danger-500">*</span>
              </label>
              {loadingSites ? (
                <div className="input-field flex items-center gap-2 text-neutral-400">
                  <Loader2 size={16} className="animate-spin text-accent-500" />
                  Loading...
                </div>
              ) : (
                <select
                  value={form.siteId}
                  onChange={(e) => handleFormChange('siteId', e.target.value)}
                  className={`select-field ${formErrors.siteId ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
                  disabled={submitting}
                >
                  <option value="">Select a site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              {formErrors.siteId && (
                <p className="field-error">{formErrors.siteId}</p>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-neutral-400 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-body font-medium text-neutral-700 mt-0.5">{value || '—'}</p>
    </div>
  );
}
