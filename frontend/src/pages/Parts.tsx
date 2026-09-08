import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { partService } from '../services/partService';
import { Part, PageResponse } from '../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const emptyForm = { partCode: '', name: '', description: '', unitCost: 0, availableStock: 0 };

export default function Parts() {
  const { user } = useAuth();
  const [parts, setParts] = useState<PageResponse<Part> | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const size = 10;
  const isManager = user?.role === 'MANAGER';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partService.getAll(search || undefined, page, size);
      setParts(res);
    } catch {
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const loadLowStock = useCallback(async () => {
    try {
      const res = await partService.getLowStock();
      setLowStockCount(res.length);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadLowStock(); }, [loadLowStock]);
  useEffect(() => { setPage(0); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (p: Part, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(p);
    setForm({
      partCode: p.partCode,
      name: p.name,
      description: p.description,
      unitCost: p.unitCost,
      availableStock: p.availableStock,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.partCode.trim()) errors.partCode = 'Part code is required';
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (form.unitCost < 0) errors.unitCost = 'Unit cost must be 0 or greater';
    if (form.availableStock < 0) errors.availableStock = 'Stock must be 0 or greater';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await partService.update(editing.id, form);
        toast.success('Part updated successfully');
      } else {
        await partService.create(form);
        toast.success('Part created successfully');
      }
      setModalOpen(false);
      load();
      loadLowStock();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-card px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-danger-500 flex-shrink-0" />
          <p className="text-sm text-danger-700 font-medium">
            {lowStockCount} part{lowStockCount !== 1 ? 's are' : ' is'} running low on stock (≤ 5 units remaining).
          </p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Parts Inventory</h1>
          <p className="text-body text-neutral-400 mt-0.5">Track spare parts, materials, and inventory levels</p>
        </div>
        {isManager && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            Add Part
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="Search parts by code, name, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search parts"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent-500" />
          </div>
        ) : !parts || parts.content.length === 0 ? (
          <EmptyState
            title="No parts found"
            description={search ? 'Try adjusting your search query' : 'Get started by adding items to the inventory'}
            action={
              isManager && !search ? (
                <button onClick={openCreate} className="btn-primary mt-2">
                  <Plus size={16} /> Add Part
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Part Code</th>
                    <th className="table-header pb-3">Name</th>
                    <th className="table-header pb-3">Description</th>
                    <th className="table-header pb-3 text-right">Unit Cost</th>
                    <th className="table-header pb-3 text-center">Available Stock</th>
                    {isManager && <th className="table-header pb-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {parts.content.map((p) => {
                    const isLow = p.availableStock <= 5;
                    return (
                      <tr
                        key={p.id}
                        className={`table-row ${isLow ? 'bg-danger-50/30' : ''}`}
                      >
                        <td className="py-3 pl-0 font-medium text-accent-600">{p.partCode}</td>
                        <td className="py-3 text-neutral-700 font-medium">{p.name}</td>
                        <td className="py-3 text-neutral-500 max-w-[220px] truncate">{p.description}</td>
                        <td className="py-3 text-neutral-700 text-right">
                          ${p.unitCost.toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`font-semibold ${isLow ? 'text-danger-600' : 'text-neutral-700'}`}>
                              {p.availableStock}
                            </span>
                            {isLow && (
                              <StatusBadge variant="danger" shape="pill">
                                Low
                              </StatusBadge>
                            )}
                          </div>
                        </td>
                        {isManager && (
                          <td className="py-3 text-right">
                            <button
                              onClick={(e) => openEdit(p, e)}
                              className="btn-icon"
                              title="Edit"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {parts.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {parts.page * parts.size + 1} to{' '}
                  {Math.min((parts.page + 1) * parts.size, parts.totalElements)} of{' '}
                  {parts.totalElements} parts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={parts.first}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-3">
                    Page {parts.page + 1} of {parts.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={parts.last}
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

      {/* Add / Edit Part Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Part' : 'Add Part'}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editing ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Part Code <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={form.partCode}
              onChange={(e) => handleFieldChange('partCode', e.target.value)}
              className={`input-field ${formErrors.partCode ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="BRK-001"
            />
            {formErrors.partCode && <p className="field-error">{formErrors.partCode}</p>}
          </div>
          <div>
            <label className="label">Part Name <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`input-field ${formErrors.name ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Brake Pad Set"
            />
            {formErrors.name && <p className="field-error">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Description <span className="text-danger-500">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className={`textarea-field ${formErrors.description ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Front brake pad replacement set..."
            />
            {formErrors.description && <p className="field-error">{formErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Unit Cost ($) <span className="text-danger-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unitCost}
                onChange={(e) => handleFieldChange('unitCost', parseFloat(e.target.value) || 0)}
                className={`input-field ${formErrors.unitCost ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              />
              {formErrors.unitCost && <p className="field-error">{formErrors.unitCost}</p>}
            </div>
            <div>
              <label className="label">Available Stock <span className="text-danger-500">*</span></label>
              <input
                type="number"
                min="0"
                value={form.availableStock}
                onChange={(e) => handleFieldChange('availableStock', parseInt(e.target.value) || 0)}
                className={`input-field ${formErrors.availableStock ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              />
              {formErrors.availableStock && <p className="field-error">{formErrors.availableStock}</p>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
