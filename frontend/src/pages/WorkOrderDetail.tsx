import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Loader2, Wrench, UserPlus, XCircle, CheckCircle,
  Pause, Play, StopCircle, Plus, Package, Timer,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workOrderService } from '../services/workOrderService';
import { partService } from '../services/partService';
import { userService } from '../services/userService';
import {
  WorkOrder, WorkOrderStatusHistory, PartUsage, TimeLog, Part, User,
} from '../types';
import StatusBadge, { statusVariant, priorityVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-neutral-400 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-body font-medium text-neutral-700 mt-0.5">{value || '—'}</p>
    </div>
  );
}

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const woId = Number(id);

  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [history, setHistory] = useState<WorkOrderStatusHistory[]>([]);
  const [parts, setParts] = useState<PartUsage[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isManagerOrDispatcher = user?.role === 'MANAGER' || user?.role === 'DISPATCHER';
  const isTechnician = user?.role === 'TECHNICIAN';

  const isEditable = wo && !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(wo.status);
  const isActive = wo && ['IN_PROGRESS', 'ON_HOLD'].includes(wo.status);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [partModalOpen, setPartModalOpen] = useState(false);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState('1');
  const [addingPart, setAddingPart] = useState(false);

  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const [loggingTime, setLoggingTime] = useState(false);

  const [transitionNote, setTransitionNote] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [woRes, histRes, partsRes, timeRes] = await Promise.all([
        workOrderService.getById(woId),
        workOrderService.getHistory(woId),
        workOrderService.getParts(woId),
        workOrderService.getTimeLogs(woId),
      ]);
      setWo(woRes);
      setHistory(histRes);
      setParts(partsRes);
      setTimeLogs(timeRes);
    } catch {
      toast.error('Failed to load work order');
    } finally {
      setLoading(false);
    }
  }, [woId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openAssignModal = async () => {
    try {
      const res = await userService.getAll('TECHNICIAN', 0, 500);
      setTechnicians(res.content);
    } catch {
      toast.error('Failed to load technicians');
      return;
    }
    setSelectedTechId(wo?.assignedTechnicianId?.toString() || '');
    setAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedTechId) return;
    setAssigning(true);
    try {
      if (wo?.assignedTechnicianId) {
        await workOrderService.reassign(woId, Number(selectedTechId));
        toast.success('Technician reassigned');
      } else {
        await workOrderService.assign(woId, Number(selectedTechId));
        toast.success('Technician assigned');
      }
      setAssignModalOpen(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign technician');
    } finally {
      setAssigning(false);
    }
  };

  const openPartModal = async () => {
    try {
      const res = await partService.getAll(undefined, 0, 500);
      setAvailableParts(res.content);
    } catch {
      toast.error('Failed to load parts');
      return;
    }
    setSelectedPartId('');
    setPartQty('1');
    setPartModalOpen(true);
  };

  const handleAddPart = async () => {
    if (!selectedPartId || !partQty || Number(partQty) < 1) return;
    setAddingPart(true);
    try {
      await workOrderService.addPart(woId, {
        partId: Number(selectedPartId),
        quantity: Number(partQty),
      });
      toast.success('Part added');
      setPartModalOpen(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  const openTimeModal = () => {
    setTimeMinutes('');
    setTimeNote('');
    setTimeModalOpen(true);
  };

  const handleLogTime = async () => {
    if (!timeMinutes || Number(timeMinutes) < 1) return;
    setLoggingTime(true);
    try {
      await workOrderService.logTime(woId, {
        minutes: Number(timeMinutes),
        note: timeNote.trim() || undefined,
      });
      toast.success('Time logged');
      setTimeModalOpen(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to log time');
    } finally {
      setLoggingTime(false);
    }
  };

  const requestTransition = (status: string) => {
    setPendingTransition(status);
    setTransitionNote('');
    setNoteModalOpen(true);
  };

  const confirmTransition = async () => {
    if (!pendingTransition) return;
    setTransitioning(true);
    try {
      await workOrderService.transitionStatus(woId, pendingTransition, transitionNote.trim() || undefined);
      toast.success(`Work order ${pendingTransition.toLowerCase().replace(/_/g, ' ')}`);
      setNoteModalOpen(false);
      setPendingTransition(null);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Status transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  const totalPartsCost = parts.reduce((sum, p) => sum + p.totalCost, 0);
  const totalMinutes = timeLogs.reduce((sum, t) => sum + t.minutes, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-accent-500" />
      </div>
    );
  }

  if (!wo) {
    return (
      <EmptyState
        title="Work order not found"
        action={
          <button onClick={() => navigate('/work-orders')} className="btn-primary">
            <ArrowLeft size={16} /> Back to Work Orders
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/work-orders')} className="btn-icon" aria-label="Back to Work Orders">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-neutral-700 tracking-tight">{wo.workOrderCode}</h1>
            <StatusBadge variant={statusVariant(wo.status)}>{statusLabel(wo.status)}</StatusBadge>
            <StatusBadge variant={priorityVariant(wo.priority)}>{wo.priority}</StatusBadge>
            {wo.slaState && wo.slaDueDate && (
              <StatusBadge variant={slaVariant(wo.slaState)} dot shape="pill">
                SLA: {new Date(wo.slaDueDate).toLocaleDateString()}
              </StatusBadge>
            )}
          </div>
          <p className="text-body text-neutral-400 mt-0.5">{wo.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(isManagerOrDispatcher || isTechnician) && isEditable && wo.status === 'NEW' && (
            <button onClick={openAssignModal} className="btn-primary"><UserPlus size={16} /> Assign</button>
          )}
          {(isManagerOrDispatcher || isTechnician) && isEditable && wo.status === 'ASSIGNED' && (
            <>
              <button onClick={openAssignModal} className="btn-secondary"><UserPlus size={16} /> Reassign</button>
              <button onClick={() => requestTransition('IN_PROGRESS')} className="btn-success"><Play size={16} /> Start</button>
            </>
          )}
          {isTechnician && wo.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => requestTransition('ON_HOLD')} className="btn-secondary"><Pause size={16} /> Hold</button>
              <button onClick={() => requestTransition('COMPLETED')} className="btn-success"><CheckCircle size={16} /> Complete</button>
            </>
          )}
          {isTechnician && wo.status === 'ON_HOLD' && (
            <button onClick={() => requestTransition('IN_PROGRESS')} className="btn-success"><Play size={16} /> Resume</button>
          )}
          {isManagerOrDispatcher && wo.status === 'COMPLETED' && (
            <button onClick={() => requestTransition('CLOSED')} className="btn-primary"><StopCircle size={16} /> Close</button>
          )}
          {(isManagerOrDispatcher || isTechnician) && isEditable && !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(wo.status) && (
            <button onClick={() => requestTransition('CANCELLED')} className="btn-danger"><XCircle size={16} /> Cancel</button>
          )}
        </div>
      </div>

      {/* Details card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoRow label="Title" value={wo.title} />
            <InfoRow label="Customer" value={wo.customerName} />
            <InfoRow label="Site" value={wo.siteName} />
            <InfoRow label="Description" value={wo.description || <span className="text-neutral-300 italic">No description</span>} />
            <InfoRow label="Created By" value={wo.createdByName} />
            <InfoRow label="Created At" value={new Date(wo.createdAt).toLocaleString()} />
          </div>
          <div className="space-y-4">
            <InfoRow label="Assigned Technician" value={wo.assignedTechnicianName || <span className="text-neutral-300 italic">Unassigned</span>} />
            <InfoRow label="SLA Due" value={wo.slaDueDate ? new Date(wo.slaDueDate).toLocaleString() : '—'} />
            <InfoRow label="Total Parts Cost" value={`$${totalPartsCost.toFixed(2)}`} />
            <InfoRow label="Total Time Logged" value={`${totalMinutes} min`} />
            <InfoRow label="Completed At" value={wo.completedAt ? new Date(wo.completedAt).toLocaleString() : '—'} />
            <InfoRow label="Closed At" value={wo.closedAt ? new Date(wo.closedAt).toLocaleString() : '—'} />
          </div>
        </div>
      </div>

      {/* Status History - Timeline */}
      <div className="card">
        <h2 className="text-h3 text-neutral-700 mb-4">Status History</h2>
        {history.length === 0 ? (
          <p className="text-body text-neutral-400">No status changes recorded.</p>
        ) : (
          <Timeline items={[...history].reverse()} />
        )}
      </div>

      {/* Parts Used */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-neutral-700">Parts Used</h2>
          {isTechnician && isActive && (
            <button onClick={openPartModal} className="btn-primary"><Plus size={16} /> Add Part</button>
          )}
        </div>
        {parts.length === 0 ? (
          <EmptyState icon={<Package size={24} />} title="No parts used yet" className="py-8" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Part Code</th>
                    <th className="table-header pb-3">Name</th>
                    <th className="table-header pb-3 text-center">Qty</th>
                    <th className="table-header pb-3 text-right">Unit Cost</th>
                    <th className="table-header pb-3 text-right">Total Cost</th>
                    <th className="table-header pb-3">Logged By</th>
                    <th className="table-header pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {parts.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="py-3 pl-0 text-accent-600 font-medium">{p.partCode}</td>
                      <td className="py-3 text-neutral-700">{p.partName}</td>
                      <td className="py-3 text-center text-neutral-600">{p.quantity}</td>
                      <td className="py-3 text-right text-neutral-600">${p.unitCost.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium text-neutral-700">${p.totalCost.toFixed(2)}</td>
                      <td className="py-3 text-neutral-500">{p.loggedByName}</td>
                      <td className="py-3 text-neutral-400 text-caption">{new Date(p.loggedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-neutral-100">
              <span className="text-label font-semibold text-neutral-700">Total Parts Cost: ${totalPartsCost.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Time Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-neutral-700">Time Logs</h2>
          {isTechnician && isActive && (
            <button onClick={openTimeModal} className="btn-primary"><Plus size={16} /> Log Time</button>
          )}
        </div>
        {timeLogs.length === 0 ? (
          <EmptyState icon={<Timer size={24} />} title="No time logged yet" className="py-8" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Technician</th>
                    <th className="table-header pb-3 text-center">Minutes</th>
                    <th className="table-header pb-3">Note</th>
                    <th className="table-header pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {timeLogs.map((t) => (
                    <tr key={t.id} className="table-row">
                      <td className="py-3 pl-0 text-neutral-700 font-medium">{t.technicianName}</td>
                      <td className="py-3 text-center text-neutral-600">{t.minutes} min</td>
                      <td className="py-3 text-neutral-500 max-w-[300px] truncate">{t.note || '—'}</td>
                      <td className="py-3 text-neutral-400 text-caption">{new Date(t.loggedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-neutral-100">
              <span className="text-label font-semibold text-neutral-700">Total Time: {totalMinutes} min ({(totalMinutes / 60).toFixed(1)} hrs)</span>
            </div>
          </>
        )}
      </div>

      {/* Assign Modal */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={wo.assignedTechnicianId ? 'Reassign Technician' : 'Assign Technician'} footer={
        <>
          <button onClick={() => setAssignModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAssign} disabled={assigning || !selectedTechId} className="btn-primary">
            {assigning && <Loader2 size={16} className="animate-spin" />}
            {wo.assignedTechnicianId ? 'Reassign' : 'Assign'}
          </button>
        </>
      }>
        <div>
          <label className="label">Select Technician</label>
          <select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)} className="select-field">
            <option value="">Select a technician</option>
            {technicians.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </div>
      </Modal>

      {/* Part Modal */}
      <Modal open={partModalOpen} onClose={() => setPartModalOpen(false)} title="Add Part" footer={
        <>
          <button onClick={() => setPartModalOpen(false)} className="btn-secondary">Cancel</button>
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
              {availableParts.map((p) => (<option key={p.id} value={p.id}>{p.partCode} - {p.name} (Stock: {p.availableStock})</option>))}
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" min="1" value={partQty} onChange={(e) => setPartQty(e.target.value)} className="input-field" />
          </div>
        </div>
      </Modal>

      {/* Time Modal */}
      <Modal open={timeModalOpen} onClose={() => setTimeModalOpen(false)} title="Log Time" footer={
        <>
          <button onClick={() => setTimeModalOpen(false)} className="btn-secondary">Cancel</button>
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
            <label className="label">Note</label>
            <textarea value={timeNote} onChange={(e) => setTimeNote(e.target.value)} rows={3} className="textarea-field" placeholder="What did you do?" />
          </div>
        </div>
      </Modal>

      {/* Status Transition Modal */}
      <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} title={`${pendingTransition?.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} Work Order`} footer={
        <>
          <button onClick={() => setNoteModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={confirmTransition} disabled={transitioning} className="btn-primary">
            {transitioning && <Loader2 size={16} className="animate-spin" />}
            Confirm
          </button>
        </>
      }>
        <div>
          <label className="label">Note (optional)</label>
          <textarea value={transitionNote} onChange={(e) => setTransitionNote(e.target.value)} rows={3} className="textarea-field" placeholder="Add a note for this status change..." />
        </div>
      </Modal>
    </div>
  );
}
