import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Plus, MapPin, Mail, Phone, Building2, Loader2, ArrowRight } from 'lucide-react';
import { customerService } from '../services/customerService';
import { siteService } from '../services/siteService';
import { workOrderService } from '../services/workOrderService';
import { Customer, Site, WorkOrder, PageResponse } from '../types';
import StatusBadge, { priorityVariant, statusVariant, slaVariant, statusLabel, slaLabel } from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sites, setSites] = useState<PageResponse<Site> | null>(null);
  const [workOrders, setWorkOrders] = useState<PageResponse<WorkOrder> | null>(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ organizationName: '', contactName: '', email: '', phone: '', address: '' });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: '', address: '' });
  const [siteErrors, setSiteErrors] = useState<Record<string, string>>({});

  const loadCustomer = useCallback(async () => {
    try {
      const res = await customerService.getById(customerId);
      setCustomer(res);
    } catch {
      toast.error('Failed to load customer');
    }
  }, [customerId]);

  const loadSites = useCallback(async () => {
    try {
      const res = await siteService.getByCustomer(customerId, undefined, 0, 100);
      setSites(res);
    } catch {
      toast.error('Failed to load sites');
    }
  }, [customerId]);

  const loadWorkOrders = useCallback(async () => {
    try {
      const res = await workOrderService.getAll({ customerId, page: 0, size: 100 });
      setWorkOrders(res);
    } catch {
      toast.error('Failed to load work orders');
    }
  }, [customerId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadCustomer(), loadSites(), loadWorkOrders()]);
      setLoading(false);
    };
    load();
  }, [loadCustomer, loadSites, loadWorkOrders]);

  const openEditModal = () => {
    if (!customer) return;
    setEditForm({
      organizationName: customer.organizationName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const validateEdit = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editForm.organizationName.trim()) errors.organizationName = 'Organization name is required';
    if (!editForm.contactName.trim()) errors.contactName = 'Contact name is required';
    if (!editForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errors.email = 'Invalid email format';
    if (!editForm.phone.trim()) errors.phone = 'Phone is required';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEdit()) return;
    setSubmitting(true);
    try {
      await customerService.update(customerId, editForm);
      toast.success('Customer updated');
      setEditModalOpen(false);
      loadCustomer();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateSite = (): boolean => {
    const errors: Record<string, string> = {};
    if (!siteForm.name.trim()) errors.name = 'Site name is required';
    if (!siteForm.address.trim()) errors.address = 'Address is required';
    setSiteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSite()) return;
    setSubmitting(true);
    try {
      await siteService.create(customerId, siteForm);
      toast.success('Site created');
      setSiteModalOpen(false);
      setSiteForm({ name: '', address: '' });
      loadSites();
      loadCustomer();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create site');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-accent-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        action={
          <Link to="/customers" className="btn-primary">
            <ArrowLeft size={16} /> Back to Customers
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/customers" className="btn-icon" aria-label="Back to customers">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-neutral-700 tracking-tight">{customer.organizationName}</h1>
            <StatusBadge variant={customer.active ? 'success' : 'neutral'}>
              {customer.active ? 'Active' : 'Inactive'}
            </StatusBadge>
          </div>
          <p className="text-body text-neutral-400 mt-0.5">Customer Details & Sites</p>
        </div>
        <button onClick={openEditModal} className="btn-secondary">
          <Edit2 size={16} />
          Edit
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-50 text-accent-600 rounded-control">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">Organization</p>
              <p className="text-body font-medium text-neutral-700 mt-0.5">{customer.organizationName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-50 text-accent-600 rounded-control">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">Contact</p>
              <p className="text-body font-medium text-neutral-700 mt-0.5">{customer.contactName}</p>
              <p className="text-caption text-neutral-500">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-50 text-accent-600 rounded-control">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">Phone</p>
              <p className="text-body font-medium text-neutral-700 mt-0.5">{customer.phone}</p>
            </div>
          </div>
          {customer.address && (
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="p-2 bg-accent-50 text-accent-600 rounded-control">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-caption text-neutral-400 font-medium uppercase tracking-wider">Address</p>
                <p className="text-body text-neutral-700 mt-0.5">{customer.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sites */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-neutral-700">Sites & Locations</h2>
          <button
            onClick={() => { setSiteForm({ name: '', address: '' }); setSiteErrors({}); setSiteModalOpen(true); }}
            className="btn-primary"
          >
            <Plus size={16} />
            Add Site
          </button>
        </div>
        {!sites || sites.content.length === 0 ? (
          <EmptyState
            icon={<MapPin size={24} />}
            title="No sites added yet"
            description="Add facilities or branch locations for this customer"
            className="py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-100">
                  <th className="table-header pb-3 pl-0">Name</th>
                  <th className="table-header pb-3">Address</th>
                  <th className="table-header pb-3 text-center">Work Orders</th>
                  <th className="table-header pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {sites.content.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="py-3 pl-0 font-medium text-neutral-700">{s.name}</td>
                    <td className="py-3 text-neutral-500">{s.address}</td>
                    <td className="py-3 text-center text-neutral-700 font-medium">{s.workOrderCount}</td>
                    <td className="py-3">
                      <StatusBadge variant={s.active ? 'success' : 'neutral'}>
                        {s.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-neutral-700">Work Orders</h2>
          <Link
            to={`/work-orders?customerId=${customerId}`}
            className="text-btn text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {!workOrders || workOrders.content.length === 0 ? (
          <EmptyState
            title="No work orders"
            description="No work orders created for this customer yet"
            className="py-8"
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
                  <th className="table-header pb-3">SLA Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {workOrders.content.map((wo) => (
                  <tr key={wo.id} className="table-row">
                    <td className="py-3 pl-0">
                      <Link to={`/work-orders/${wo.id}`} className="text-accent-600 hover:text-accent-700 font-medium">
                        {wo.workOrderCode}
                      </Link>
                    </td>
                    <td className="py-3 text-neutral-700 max-w-[200px] truncate">{wo.title}</td>
                    <td className="py-3">
                      <StatusBadge variant={statusVariant(wo.status)}>
                        {statusLabel(wo.status)}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      <StatusBadge variant={priorityVariant(wo.priority)}>
                        {wo.priority}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-neutral-500">{wo.assignedTechnicianName || '—'}</td>
                    <td className="py-3 text-neutral-400 text-caption">{new Date(wo.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      {wo.slaDueDate ? (
                        <StatusBadge variant={slaVariant(wo.slaState)} dot shape="pill">
                          {new Date(wo.slaDueDate).toLocaleDateString()}
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

      {/* Edit Customer Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Customer"
        footer={
          <>
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleEditSubmit} disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Update
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="label">Organization Name <span className="text-danger-500">*</span></label>
            <input type="text" value={editForm.organizationName} onChange={(e) => handleEditFieldChange('organizationName', e.target.value)} className={`input-field ${editErrors.organizationName ? 'border-danger-400 ring-1 ring-danger-400' : ''}`} />
            {editErrors.organizationName && <p className="field-error">{editErrors.organizationName}</p>}
          </div>
          <div>
            <label className="label">Contact Name <span className="text-danger-500">*</span></label>
            <input type="text" value={editForm.contactName} onChange={(e) => handleEditFieldChange('contactName', e.target.value)} className={`input-field ${editErrors.contactName ? 'border-danger-400 ring-1 ring-danger-400' : ''}`} />
            {editErrors.contactName && <p className="field-error">{editErrors.contactName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email <span className="text-danger-500">*</span></label>
              <input type="email" value={editForm.email} onChange={(e) => handleEditFieldChange('email', e.target.value)} className={`input-field ${editErrors.email ? 'border-danger-400 ring-1 ring-danger-400' : ''}`} />
              {editErrors.email && <p className="field-error">{editErrors.email}</p>}
            </div>
            <div>
              <label className="label">Phone <span className="text-danger-500">*</span></label>
              <input type="tel" value={editForm.phone} onChange={(e) => handleEditFieldChange('phone', e.target.value)} className={`input-field ${editErrors.phone ? 'border-danger-400 ring-1 ring-danger-400' : ''}`} />
              {editErrors.phone && <p className="field-error">{editErrors.phone}</p>}
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea value={editForm.address} onChange={(e) => handleEditFieldChange('address', e.target.value)} rows={3} className="textarea-field" />
          </div>
        </form>
      </Modal>

      {/* Add Site Modal */}
      <Modal
        open={siteModalOpen}
        onClose={() => setSiteModalOpen(false)}
        title="Add Site"
        footer={
          <>
            <button type="button" onClick={() => setSiteModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSiteSubmit} disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Create Site
            </button>
          </>
        }
      >
        <form onSubmit={handleSiteSubmit} className="space-y-4">
          <div>
            <label className="label">Site Name <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={siteForm.name}
              onChange={(e) => { setSiteForm((p) => ({ ...p, name: e.target.value })); if (siteErrors.name) setSiteErrors((p) => ({ ...p, name: '' })); }}
              className={`input-field ${siteErrors.name ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="Main Office / Building A"
            />
            {siteErrors.name && <p className="field-error">{siteErrors.name}</p>}
          </div>
          <div>
            <label className="label">Address <span className="text-danger-500">*</span></label>
            <textarea
              value={siteForm.address}
              onChange={(e) => { setSiteForm((p) => ({ ...p, address: e.target.value })); if (siteErrors.address) setSiteErrors((p) => ({ ...p, address: '' })); }}
              rows={3}
              className={`textarea-field ${siteErrors.address ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="456 Industrial Blvd, City, State"
            />
            {siteErrors.address && <p className="field-error">{siteErrors.address}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
