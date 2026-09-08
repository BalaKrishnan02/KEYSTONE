import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { customerService } from '../services/customerService';
import { User, Customer, PageResponse, UserRole } from '../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const ROLE_OPTIONS: UserRole[] = ['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER'];

const roleBadgeVariant = (role: string): 'accent' | 'warning' | 'success' | 'neutral' => {
  switch (role) {
    case 'MANAGER':    return 'accent';
    case 'DISPATCHER': return 'accent';
    case 'TECHNICIAN': return 'success';
    case 'CUSTOMER':   return 'warning';
    default:           return 'neutral';
  }
};

const emptyForm = { name: '', email: '', password: '', role: 'TECHNICIAN' as UserRole, customerId: 0 };

export default function UserManagement() {
  const [users, setUsers] = useState<PageResponse<User> | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const size = 10;

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
      const res = await userService.getAll(roleFilter || undefined, page, size);
      setUsers(res);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (u: User, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      customerId: u.customerId || 0,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (!editing && !form.password.trim()) errors.password = 'Password is required';
    else if (!editing && form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!form.role) errors.role = 'Role is required';
    if (form.role === 'CUSTOMER' && !form.customerId) errors.customerId = 'Customer is required for CUSTOMER role';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        const updateData: Partial<User> = {
          name: form.name,
          email: form.email,
          role: form.role,
          customerId: form.role === 'CUSTOMER' ? form.customerId : undefined,
        };
        await userService.update(editing.id, updateData);
        toast.success('User updated successfully');
      } else {
        const createData: { name: string; email: string; password: string; role: string; customerId?: number } = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        if (form.role === 'CUSTOMER') createData.customerId = form.customerId;
        await userService.create(createData);
        toast.success('User created successfully');
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

  const handleFieldChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">User Management</h1>
          <p className="text-body text-neutral-400 mt-0.5">Manage user accounts, roles, and system access</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search users"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-field w-auto min-w-[160px]"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent-500" />
          </div>
        ) : !users || users.content.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Get started by inviting or creating a user account"
            action={
              <button onClick={openCreate} className="btn-primary mt-2">
                <Plus size={16} /> Add User
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-100">
                    <th className="table-header pb-3 pl-0">Name</th>
                    <th className="table-header pb-3">Email</th>
                    <th className="table-header pb-3">Role</th>
                    <th className="table-header pb-3">Status</th>
                    <th className="table-header pb-3">Customer</th>
                    <th className="table-header pb-3">Created</th>
                    <th className="table-header pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {users.content
                    .filter((u) => {
                      if (!search) return true;
                      const q = search.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="py-3 pl-0 font-medium text-neutral-700">{u.name}</td>
                      <td className="py-3 text-neutral-500">{u.email}</td>
                      <td className="py-3">
                        <StatusBadge variant={roleBadgeVariant(u.role)}>
                          {u.role}
                        </StatusBadge>
                      </td>
                      <td className="py-3">
                        <StatusBadge variant={u.active ? 'success' : 'neutral'}>
                          {u.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-neutral-500">
                        {u.customerId
                          ? customers.find((c) => c.id === u.customerId)?.organizationName || `#${u.customerId}`
                          : '—'}
                      </td>
                      <td className="py-3 text-neutral-400 text-caption">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => openEdit(u, e)}
                          className="btn-icon"
                          title="Edit"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {users.page * users.size + 1} to{' '}
                  {Math.min((users.page + 1) * users.size, users.totalElements)} of{' '}
                  {users.totalElements} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={users.first}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-3">
                    Page {users.page + 1} of {users.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={users.last}
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

      {/* Add / Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
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
            <label className="label">Name <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`input-field ${formErrors.name ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="John Doe"
            />
            {formErrors.name && <p className="field-error">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Email <span className="text-danger-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={`input-field ${formErrors.email ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="john@vertexa.com"
            />
            {formErrors.email && <p className="field-error">{formErrors.email}</p>}
          </div>
          {!editing && (
            <div>
              <label className="label">Password <span className="text-danger-500">*</span></label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`input-field ${formErrors.password ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
                placeholder="Minimum 6 characters"
              />
              {formErrors.password && <p className="field-error">{formErrors.password}</p>}
            </div>
          )}
          <div>
            <label className="label">Role <span className="text-danger-500">*</span></label>
            <select
              value={form.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className={`select-field ${formErrors.role ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {formErrors.role && <p className="field-error">{formErrors.role}</p>}
          </div>
          {form.role === 'CUSTOMER' && (
            <div>
              <label className="label">Customer Organization <span className="text-danger-500">*</span></label>
              <select
                value={form.customerId || ''}
                onChange={(e) => handleFieldChange('customerId', Number(e.target.value))}
                className={`select-field ${formErrors.customerId ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.organizationName}</option>
                ))}
              </select>
              {formErrors.customerId && <p className="field-error">{formErrors.customerId}</p>}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
