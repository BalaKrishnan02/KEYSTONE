import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { siteService } from '../services/siteService';
import { customerService } from '../services/customerService';
import { Site, Customer, PageResponse } from '../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const emptyForm = { name: '', address: '', customerId: 0 };

export default function Sites() {
  const [sites, setSites] = useState<PageResponse<Site> | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerIdFilter, setCustomerIdFilter] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const size = 10;

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customerService.getAll(undefined, 0, 1000);
      setCustomers(res.content);
    } catch {
      toast.error('Failed to load customers');
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const custId = customerIdFilter !== '' ? customerIdFilter : undefined;
      const res = await siteService.getAll(search || undefined, custId, page, size);
      setSites(res);
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, [search, page, customerIdFilter]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, customerIdFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (s: Site, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(s);
    setForm({ name: s.name, address: s.address, customerId: s.customerId });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Site name is required';
    if (!form.address.trim()) errors.address = 'Address is required';
    if (!form.customerId) errors.customerId = 'Customer is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await siteService.update(editing.id, { name: form.name, address: form.address, customerId: form.customerId });
        toast.success('Site updated');
      } else {
        await siteService.create(form.customerId, { name: form.name, address: form.address });
        toast.success('Site created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Sites & Locations</h1>
          <p className="text-body text-neutral-400 mt-0.5">Manage customer facilities, branches, and service sites</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Site
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search sites"
            />
          </div>
          <select
            value={customerIdFilter}
            onChange={(e) => setCustomerIdFilter(e.target.value ? Number(e.target.value) : '')}
            className="select-field w-auto min-w-[180px]"
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
        ) : !sites || sites.content.length === 0 ? (
          <EmptyState
            title="No sites found"
            description="Get started by registering a facility or location"
            action={
              <button onClick={openCreate} className="btn-primary mt-2">
                <Plus size={16} /> Add Site
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Site Name</th>
                    <th className="table-header pb-3">Address</th>
                    <th className="table-header pb-3">Customer</th>
                    <th className="table-header pb-3 text-center">Work Orders</th>
                    <th className="table-header pb-3">Status</th>
                    <th className="table-header pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {sites.content.map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="py-3 pl-0 font-medium text-neutral-700">{s.name}</td>
                      <td className="py-3 text-neutral-500 max-w-[200px] truncate">{s.address}</td>
                      <td className="py-3 text-accent-600">{s.customerName}</td>
                      <td className="py-3 text-center text-neutral-700 font-medium">{s.workOrderCount}</td>
                      <td className="py-3">
                        <StatusBadge variant={s.active ? 'success' : 'neutral'}>
                          {s.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => openEdit(s, e)}
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sites.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {sites.page * sites.size + 1} to{' '}
                  {Math.min((sites.page + 1) * sites.size, sites.totalElements)} of{' '}
                  {sites.totalElements} sites
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={sites.first}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-3">
                    Page {sites.page + 1} of {sites.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={sites.last}
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

      {/* Add / Edit Site Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Site' : 'Add Site'}
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
            <label className="label">Site Name <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`input-field ${formErrors.name ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Main Office / Building A"
            />
            {formErrors.name && <p className="field-error">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Address <span className="text-danger-500">*</span></label>
            <textarea
              value={form.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              rows={3}
              className={`textarea-field ${formErrors.address ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="123 Main St, City, State, ZIP"
            />
            {formErrors.address && <p className="field-error">{formErrors.address}</p>}
          </div>
          <div>
            <label className="label">Customer <span className="text-danger-500">*</span></label>
            <select
              value={form.customerId || ''}
              onChange={(e) => handleFieldChange('customerId', Number(e.target.value))}
              className={`select-field ${formErrors.customerId ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              disabled={!!editing}
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.organizationName}</option>
              ))}
            </select>
            {formErrors.customerId && <p className="field-error">{formErrors.customerId}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
