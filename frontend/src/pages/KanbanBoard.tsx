import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { Loader2, Filter, X, MapPin, User as UserIcon } from 'lucide-react';
import { workOrderService } from '../services/workOrderService';
import { userService } from '../services/userService';
import { customerService } from '../services/customerService';
import { WorkOrder, WorkOrderStatus, User, Customer } from '../types';
import StatusBadge, { priorityVariant, slaVariant, slaLabel } from '../components/StatusBadge';

const KANBAN_COLUMNS: { key: WorkOrderStatus; label: string; headerBg: string; headerText: string; dotColor: string }[] = [
  { key: 'NEW', label: 'New', headerBg: 'bg-accent-50', headerText: 'text-accent-700', dotColor: 'bg-accent-500' },
  { key: 'ASSIGNED', label: 'Assigned', headerBg: 'bg-accent-100', headerText: 'text-accent-700', dotColor: 'bg-accent-600' },
  { key: 'IN_PROGRESS', label: 'In Progress', headerBg: 'bg-warning-50', headerText: 'text-warning-700', dotColor: 'bg-warning-500' },
  { key: 'ON_HOLD', label: 'On Hold', headerBg: 'bg-neutral-100', headerText: 'text-neutral-600', dotColor: 'bg-neutral-400' },
  { key: 'COMPLETED', label: 'Completed', headerBg: 'bg-success-50', headerText: 'text-success-700', dotColor: 'bg-success-500' },
];

const priorityBorderColor: Record<string, string> = {
  CRITICAL: 'border-l-danger-500',
  HIGH: 'border-l-warning-500',
  MEDIUM: 'border-l-accent-500',
  LOW: 'border-l-success-500',
};

export default function KanbanBoard() {
  const navigate = useNavigate();

  const [kanbanData, setKanbanData] = useState<Record<string, WorkOrder[]>>({});
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const [technicians, setTechnicians] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [priority, setPriority] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadKanban = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workOrderService.getKanban({
        priority: priority || undefined,
        technicianId: technicianId ? Number(technicianId) : undefined,
        customerId: customerId ? Number(customerId) : undefined,
      });
      setKanbanData(data);
    } catch {
      toast.error('Failed to load kanban data');
    } finally {
      setLoading(false);
    }
  }, [priority, technicianId, customerId]);

  const loadFilters = useCallback(async () => {
    try {
      const [techRes, custRes] = await Promise.all([
        userService.getAll('TECHNICIAN', 0, 500),
        customerService.getAll(undefined, 0, 500),
      ]);
      setTechnicians(techRes.content);
      setCustomers(custRes.content);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { loadFilters(); }, [loadFilters]);
  useEffect(() => { loadKanban(); }, [loadKanban]);

  const onDragEnd = async (result: DropResult) => {
    if (transitioning) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;
    const woId = Number(draggableId);

    if (toStatus === 'COMPLETED') {
      const confirmed = window.confirm('Are you sure you want to mark this work order as completed?');
      if (!confirmed) return;
    }

    setTransitioning(true);
    const previousData = { ...kanbanData };

    const updatedSource = kanbanData[fromStatus]?.filter((wo) => wo.id !== woId) || [];
    const movingWo = kanbanData[fromStatus]?.find((wo) => wo.id === woId);
    if (movingWo) {
      const updatedWo = { ...movingWo, status: toStatus as WorkOrderStatus };
      const updatedDest = [...(kanbanData[toStatus] || []), updatedWo];
      setKanbanData({
        ...kanbanData,
        [fromStatus]: updatedSource,
        [toStatus]: updatedDest,
      });
    }

    try {
      await workOrderService.transitionStatus(woId, toStatus);
      toast.success(`Work order moved to ${toStatus.replace(/_/g, ' ').toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to transition status');
      setKanbanData(previousData);
    } finally {
      setTransitioning(false);
    }
  };

  const clearFilters = () => {
    setPriority('');
    setTechnicianId('');
    setCustomerId('');
  };

  const hasFilters = priority || technicianId || customerId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Kanban Board</h1>
          <p className="text-body text-neutral-400 mt-0.5">Drag and drop cards across pipeline stages</p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="btn-secondary"
        >
          <Filter size={16} />
          Filters
          {hasFilters && (
            <span className="bg-accent-600 text-white text-badge px-1.5 py-0.5 rounded-pill">
              {[priority, technicianId, customerId].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4 text-neutral-700 font-semibold">Filter Work Orders</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-caption text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium">
                <X size={14} /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[160px]">
              <label className="label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="select-field"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="min-w-[180px]">
              <label className="label">Technician</label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="select-field"
              >
                <option value="">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px]">
              <label className="label">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="select-field"
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.organizationName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {KANBAN_COLUMNS.map((col) => {
            const cards = kanbanData[col.key] || [];
            return (
              <div key={col.key} className="min-w-[290px] w-[290px] flex-shrink-0 flex flex-col">
                <div className={`rounded-t-card px-4 py-3 ${col.headerBg} border border-b-0 border-neutral-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <h3 className={`font-semibold text-sm ${col.headerText}`}>
                        {col.label}
                      </h3>
                    </div>
                    <span className={`text-badge font-semibold ${col.headerText} bg-white/70 px-2 py-0.5 rounded-pill`}>
                      {cards.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-b-card border border-neutral-100 p-2.5 space-y-2.5 min-h-[220px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-accent-50/50 border-accent-200' : 'bg-surface-3'
                      }`}
                    >
                      {cards.map((wo, index) => {
                        const borderClass = priorityBorderColor[wo.priority] || 'border-l-neutral-300';
                        return (
                          <Draggable key={wo.id} draggableId={String(wo.id)} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => navigate(`/work-orders/${wo.id}`)}
                                className={`bg-white rounded-card border border-neutral-100 border-l-[3px] ${borderClass} p-3 cursor-pointer hover:shadow-card transition-all ${
                                  dragSnapshot.isDragging ? 'shadow-card-hover ring-2 ring-accent-400' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <span className="text-caption font-semibold text-accent-600">
                                    {wo.workOrderCode}
                                  </span>
                                  <StatusBadge variant={priorityVariant(wo.priority)}>
                                    {wo.priority}
                                  </StatusBadge>
                                </div>
                                <h4 className="text-sm font-semibold text-neutral-700 mb-1.5 line-clamp-2">
                                  {wo.title}
                                </h4>
                                <p className="text-caption text-neutral-500 mb-1 truncate">
                                  {wo.customerName}
                                </p>
                                {wo.siteName && (
                                  <div className="flex items-center gap-1 text-caption text-neutral-400 mb-2 truncate">
                                    <MapPin size={11} className="flex-shrink-0" />
                                    <span className="truncate">{wo.siteName}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                                  <div className="flex items-center gap-1 text-caption text-neutral-500 truncate max-w-[130px]">
                                    <UserIcon size={11} className="flex-shrink-0" />
                                    <span className="truncate">{wo.assignedTechnicianName || 'Unassigned'}</span>
                                  </div>
                                  {wo.slaState && (
                                    <StatusBadge variant={slaVariant(wo.slaState)} dot shape="pill">
                                      {slaLabel(wo.slaState)}
                                    </StatusBadge>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {cards.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-neutral-400 text-caption font-medium">
                          No work orders
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {transitioning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-sidebar text-white px-4 py-2 rounded-control shadow-dialog flex items-center gap-2 text-sm z-50">
          <Loader2 size={16} className="animate-spin text-accent-400" />
          Updating status...
        </div>
      )}
    </div>
  );
}
