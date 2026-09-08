import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Loader2, Briefcase, Play, Pause, CheckCircle, Calendar,
  Timer, Package, MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workOrderService } from '../services/workOrderService';
import { partService } from '../services/partService';
import { WorkOrder, Part } from '../types';
import StatusBadge, { priorityVariant, statusVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const STATUS_FILTER_OPTIONS = ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] as const;

const priorityBorderColor: Record<string, string> = {
  CRITICAL: 'border-l-danger-500',
  HIGH: 'border-l-warning-500',
  MEDIUM: 'border-l-accent-500',
  LOW: 'border-l-success-500',
};

export default function MyJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [transitioningId, setTransitioningId] = useState<number | null>(null);

  const [timeModalWoId, setTimeModalWoId] = useState<number | null>(null);
  const [timeMinutes, setTimeMinutes] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const [loggingTime, setLoggingTime] = useState(false);

  const [partModalWoId, setPartModalWoId] = useState<number | null>(null);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState('1');
  const [addingPart, setAddingPart] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{ woId: number; status: string; title: string } | null>(null);
  const [confirmNote, setConfirmNote] = useState('');
  const [confirming, setConfirming] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await workOrderService.getAll({
        technicianId: user.id,
        status: statusFilter || undefined,
        page: 0,
        size: 200,
      });
      setWorkOrders(res.content);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const allJobs = workOrders;
  const totalAssigned = allJobs.filter((wo) => wo.status === 'ASSIGNED').length;
  const inProgress = allJobs.filter((wo) => wo.status === 'IN_PROGRESS').length;
  const onHold = allJobs.filter((wo) => wo.status === 'ON_HOLD').length;
  const completedToday = allJobs.filter((wo) => {
    if (wo.status !== 'COMPLETED' || !wo.completedAt) return false;
    const completed = new Date(wo.completedAt);
    const today = new Date();
    return (
      completed.getFullYear() === today.getFullYear() &&
      completed.getMonth() === today.getMonth() &&
      completed.getDate() === today.getDate()
    );
  }).length;

  const handleTransition = async (woId: number, status: string, note?: string) => {
    setTransitioningId(woId);
    try {
      await workOrderService.transitionStatus(woId, status, note?.trim() || undefined);
      toast.success(`Work order ${status.toLowerCase().replace(/_/g, ' ')}`);
      loadJobs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Status transition failed');
    } finally {
      setTransitioningId(null);
    }
  };

  const openConfirmTransition = (woId: number, status: string, title: string) => {
    setConfirmNote('');
    setConfirmModal({ woId, status, title });
  };

  const handleConfirmTransition = async () => {
    if (!confirmModal) return;
    setConfirming(true);
    await handleTransition(confirmModal.woId, confirmModal.status, confirmNote);
    setConfirming(false);
    setConfirmModal(null);
  };

  const openTimeModal = (woId: number) => {
    setTimeMinutes('');
    setTimeNote('');
    setTimeModalWoId(woId);
  };

  const handleLogTime = async () => {
    if (!timeModalWoId || !timeMinutes || Number(timeMinutes) < 1) return;
    setLoggingTime(true);
    try {
      await workOrderService.logTime(timeModalWoId, {
        minutes: Number(timeMinutes),
        note: timeNote.trim() || undefined,
      });
      toast.success('Time logged');
      setTimeModalWoId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to log time');
    } finally {
      setLoggingTime(false);
    }
  };

  const openPartModal = async (woId: number) => {
    try {
      const res = await partService.getAll(undefined, 0, 500);
      setAvailableParts(res.content);
    } catch {
      toast.error('Failed to load parts');
      return;
    }
    setSelectedPartId('');
    setPartQty('1');
    setPartModalWoId(woId);
  };

  const handleAddPart = async () => {
    if (!partModalWoId || !selectedPartId || !partQty || Number(partQty) < 1) return;
    setAddingPart(true);
    try {
      await workOrderService.addPart(partModalWoId, {
        partId: Number(selectedPartId),
        quantity: Number(partQty),
      });
      toast.success('Part added');
      setPartModalWoId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-700 tracking-tight">My Jobs</h1>
        <p className="text-body text-neutral-400 mt-0.5">Your daily assigned work orders and service schedule</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Assigned" value={totalAssigned} icon={<Briefcase size={18} />} color="accent" />
        <KPICard label="In Progress" value={inProgress} icon={<Play size={18} />} color="warning" />
        <KPICard label="On Hold" value={onHold} icon={<Pause size={18} />} color="neutral" />
        <KPICard label="Completed Today" value={completedToday} icon={<CheckCircle size={18} />} color="success" />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field max-w-[200px]"
        >
          <option value="">All My Jobs</option>
          {STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-accent-500" />
        </div>
      ) : workOrders.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={statusFilter ? 'Try changing your status filter' : 'You have no assigned work orders at the moment.'}
        />
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => {
            const isActive = ['IN_PROGRESS', 'ON_HOLD'].includes(wo.status);
            const isTransitioning = transitioningId === wo.id;
            const borderClass = priorityBorderColor[wo.priority] || 'border-l-neutral-300';

            return (
              <div
                key={wo.id}
                onClick={() => navigate(`/work-orders/${wo.id}`)}
                className={`card border-l-[4px] ${borderClass} hover:shadow-card transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-accent-600">{wo.workOrderCode}</span>
                      <StatusBadge variant={statusVariant(wo.status)}>{statusLabel(wo.status)}</StatusBadge>
                      <StatusBadge variant={priorityVariant(wo.priority)}>{wo.priority}</StatusBadge>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-700 mb-1">{wo.title}</h3>
                    <div className="flex items-center gap-3 text-caption text-neutral-500 flex-wrap">
                      <span className="font-medium">{wo.customerName}</span>
                      {wo.siteName && (
                        <div className="flex items-center gap-1 text-neutral-400">
                          <MapPin size={12} />
                          <span>{wo.siteName}</span>
                        </div>
                      )}
                    </div>
                    {wo.slaDueDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge variant={slaVariant(wo.slaState)} dot shape="pill">
                          <Calendar size={11} className="mr-0.5" />
                          {slaLabel(wo.slaState)}: {new Date(wo.slaDueDate).toLocaleDateString()}
                        </StatusBadge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {wo.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleTransition(wo.id, 'IN_PROGRESS')}
                        disabled={isTransitioning}
                        className="btn-success btn-touch"
                      >
                        {isTransitioning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        Start Job
                      </button>
                    )}
                    {wo.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => openConfirmTransition(wo.id, 'ON_HOLD', wo.workOrderCode)}
                          disabled={isTransitioning}
                          className="btn-secondary"
                        >
                          <Pause size={14} />
                          Hold
                        </button>
                        <button
                          onClick={() => openConfirmTransition(wo.id, 'COMPLETED', wo.workOrderCode)}
                          disabled={isTransitioning}
                          className="btn-success"
                        >
                          <CheckCircle size={14} />
                          Complete
                        </button>
                      </>
                    )}
                    {wo.status === 'ON_HOLD' && (
                      <button
                        onClick={() => handleTransition(wo.id, 'IN_PROGRESS')}
                        disabled={isTransitioning}
                        className="btn-success btn-touch"
                      >
                        {isTransitioning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        Resume
                      </button>
                    )}
                    {isActive && (
                      <>
                        <button
                          onClick={() => openTimeModal(wo.id)}
                          className="btn-secondary btn-icon"
                          title="Log Time"
                          aria-label="Log Time"
                        >
                          <Timer size={16} />
                        </button>
                        <button
                          onClick={() => openPartModal(wo.id)}
                          className="btn-secondary btn-icon"
                          title="Log Parts"
                          aria-label="Log Parts"
                        >
                          <Package size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time Modal */}
      <Modal open={timeModalWoId !== null} onClose={() => setTimeModalWoId(null)} title="Log Time" footer={
        <>
          <button onClick={() => setTimeModalWoId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleLogTime} disabled={loggingTime || !timeMinutes || Number(timeMinutes) < 1} className="btn-primary">
            {loggingTime && <Loader2 size={16} className="animate-spin" />}
            Log Time
          </button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="label">Minutes</label>
            <input type="number" min="1" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} className="input-field" placeholder="e.g. 60" />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <textarea value={timeNote} onChange={(e) => setTimeNote(e.target.value)} rows={3} className="textarea-field" placeholder="What did you do?" />
          </div>
        </div>
      </Modal>

      {/* Part Modal */}
      <Modal open={partModalWoId !== null} onClose={() => setPartModalWoId(null)} title="Add Part" footer={
        <>
          <button onClick={() => setPartModalWoId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleAddPart} disabled={addingPart || !selectedPartId || !partQty || Number(partQty) < 1} className="btn-primary">
            {addingPart && <Loader2 size={16} className="animate-spin" />}
            Add Part
          </button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="label">Part</label>
            <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)} className="select-field">
              <option value="">Select a part</option>
              {availableParts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.partCode} - {p.name} (Stock: {p.availableStock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" min="1" value={partQty} onChange={(e) => setPartQty(e.target.value)} className="input-field" />
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal open={confirmModal !== null} onClose={() => !confirming && setConfirmModal(null)} title={confirmModal?.status === 'COMPLETED' ? 'Complete Work Order' : 'Put on Hold'} footer={
        <>
          <button onClick={() => setConfirmModal(null)} disabled={confirming} className="btn-secondary">Cancel</button>
          <button
            onClick={handleConfirmTransition}
            disabled={confirming}
            className={confirmModal?.status === 'COMPLETED' ? 'btn-success' : 'btn-primary'}
          >
            {confirming && <Loader2 size={16} className="animate-spin" />}
            {confirmModal?.status === 'COMPLETED' ? 'Mark Complete' : 'Put on Hold'}
          </button>
        </>
      }>
        <div className="space-y-4">
          <p className="text-body text-neutral-500">
            {confirmModal?.title}
          </p>
          <div>
            <label className="label">Note (optional)</label>
            <textarea value={confirmNote} onChange={(e) => setConfirmNote(e.target.value)} rows={3} className="textarea-field" placeholder="Add a note for this status change..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
