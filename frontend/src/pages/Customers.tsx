import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer, PageResponse } from '../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const emptyForm = { organizationName: '', contactName: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState<PageResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const size = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll(search || undefined, page, size);
      setCustomers(res);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: Customer, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(c);
    setForm({
      organizationName: c.organizationName,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      address: c.address,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.organizationName.trim()) errors.organizationName = 'Organization name is required';
    if (!form.contactName.trim()) errors.contactName = 'Contact name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.phone.trim()) errors.phone = 'Phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await customerService.update(editing.id, form);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(form);
        toast.success('Customer created successfully');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Customers</h1>
          <p className="text-body text-neutral-400 mt-0.5">Manage customer organizations and facilities</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search customers"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent-500" />
          </div>
        ) : !customers || customers.content.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Get started by registering a new customer organization"
            action={
              <button onClick={openCreate} className="btn-primary mt-2">
                <Plus size={16} /> Add Customer
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Organization Name</th>
                    <th className="table-header pb-3">Contact Name</th>
                    <th className="table-header pb-3">Email</th>
                    <th className="table-header pb-3">Phone</th>
                    <th className="table-header pb-3 text-center">Sites</th>
                    <th className="table-header pb-3 text-center">Work Orders</th>
                    <th className="table-header pb-3">Status</th>
                    <th className="table-header pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {customers.content.map((c) => (
                    <tr key={c.id} className="table-row">
                      <td className="py-3 pl-0">
                        <Link to={`/customers/${c.id}`} className="text-accent-600 hover:text-accent-700 font-medium">
                          {c.organizationName}
                        </Link>
                      </td>
                      <td className="py-3 text-neutral-700">{c.contactName}</td>
                      <td className="py-3 text-neutral-500">{c.email}</td>
                      <td className="py-3 text-neutral-500">{c.phone}</td>
                      <td className="py-3 text-center text-neutral-700 font-medium">{c.siteCount}</td>
                      <td className="py-3 text-center text-neutral-700 font-medium">{c.workOrderCount}</td>
                      <td className="py-3">
                        <StatusBadge variant={c.active ? 'success' : 'neutral'}>
                          {c.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/customers/${c.id}`}
                            className="btn-icon"
                            title="View"
                            aria-label={`View ${c.organizationName}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={(e) => openEdit(c, e)}
                            className="btn-icon"
                            title="Edit"
                            aria-label={`Edit ${c.organizationName}`}
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {customers.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {customers.page * customers.size + 1} to{' '}
                  {Math.min((customers.page + 1) * customers.size, customers.totalElements)} of{' '}
                  {customers.totalElements} customers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={customers.first}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-3">
                    Page {customers.page + 1} of {customers.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={customers.last}
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

      {/* Customer Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
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
            <label className="label">
              Organization Name <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.organizationName}
              onChange={(e) => handleFieldChange('organizationName', e.target.value)}
              className={`input-field ${formErrors.organizationName ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Acme Corp"
            />
            {formErrors.organizationName && <p className="field-error">{formErrors.organizationName}</p>}
          </div>
          <div>
            <label className="label">
              Contact Name <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => handleFieldChange('contactName', e.target.value)}
              className={`input-field ${formErrors.contactName ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="John Doe"
            />
            {formErrors.contactName && <p className="field-error">{formErrors.contactName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Email <span className="text-danger-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`input-field ${formErrors.email ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
                placeholder="contact@acme.com"
              />
              {formErrors.email && <p className="field-error">{formErrors.email}</p>}
            </div>
            <div>
              <label className="label">
                Phone <span className="text-danger-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`input-field ${formErrors.phone ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
                placeholder="+1 555-0123"
              />
              {formErrors.phone && <p className="field-error">{formErrors.phone}</p>}
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              rows={3}
              className="textarea-field"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
