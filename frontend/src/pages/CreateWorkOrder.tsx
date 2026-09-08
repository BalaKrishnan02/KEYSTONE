import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { workOrderService } from '../services/workOrderService';
import { customerService } from '../services/customerService';
import { siteService } from '../services/siteService';
import { userService } from '../services/userService';
import { Customer, Site, User } from '../types';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export default function CreateWorkOrder() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    customerId: '',
    siteId: '',
    assignedTechnicianId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [custRes, techRes] = await Promise.all([
          customerService.getAll(undefined, 0, 500),
          userService.getAll('TECHNICIAN', 0, 500),
        ]);
        setCustomers(custRes.content);
        setTechnicians(techRes.content);
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setLoadingCustomers(false);
        setLoadingTechnicians(false);
      }
    };
    loadInit();
  }, []);

  const loadSites = useCallback(async (custId: number) => {
    setLoadingSites(true);
    setSites([]);
    try {
      const res = await siteService.getByCustomer(custId, undefined, 0, 500);
      setSites(res.content);
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setLoadingSites(false);
    }
  }, []);

  const handleCustomerChange = (custId: string) => {
    setForm((prev) => ({ ...prev, customerId: custId, siteId: '', assignedTechnicianId: '' }));
    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: '' }));
    if (custId) {
      loadSites(Number(custId));
    } else {
      setSites([]);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.customerId) e.customerId = 'Customer is required';
    if (!form.siteId) e.siteId = 'Site is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await workOrderService.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        customerId: Number(form.customerId),
        siteId: Number(form.siteId),
        assignedTechnicianId: form.assignedTechnicianId ? Number(form.assignedTechnicianId) : undefined,
      });
      toast.success('Work order created successfully');
      navigate('/work-orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-icon" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Create Work Order</h1>
          <p className="text-body text-neutral-400 mt-0.5">Fill in the details to create a new service request</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">
              Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              placeholder="e.g. HVAC maintenance check"
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Description</label>
              <span className="text-caption text-neutral-400">{form.description.length}/500</span>
            </div>
            <textarea
              value={form.description}
              maxLength={500}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="textarea-field"
              placeholder="Describe the issue or required work in detail..."
            />
          </div>

          <div>
            <label className="label">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="select-field"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Customer <span className="text-danger-500">*</span>
            </label>
            {loadingCustomers ? (
              <div className="input-field flex items-center gap-2 text-neutral-400">
                <Loader2 size={16} className="animate-spin text-accent-500" />
                Loading customers...
              </div>
            ) : (
              <select
                value={form.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className={`select-field ${errors.customerId ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.organizationName}</option>
                ))}
              </select>
            )}
            {errors.customerId && <p className="field-error">{errors.customerId}</p>}
          </div>

          <div>
            <label className="label">
              Site <span className="text-danger-500">*</span>
            </label>
            {loadingSites ? (
              <div className="input-field flex items-center gap-2 text-neutral-400">
                <Loader2 size={16} className="animate-spin text-accent-500" />
                Loading sites...
              </div>
            ) : (
              <select
                value={form.siteId}
                onChange={(e) => handleChange('siteId', e.target.value)}
                className={`select-field ${errors.siteId ? 'border-danger-400 ring-1 ring-danger-400' : ''}`}
                disabled={!form.customerId}
              >
                <option value="">{form.customerId ? 'Select a site' : 'Select a customer first'}</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            {errors.siteId && <p className="field-error">{errors.siteId}</p>}
          </div>

          <div>
            <label className="label">Assigned Technician</label>
            {loadingTechnicians ? (
              <div className="input-field flex items-center gap-2 text-neutral-400">
                <Loader2 size={16} className="animate-spin text-accent-500" />
                Loading technicians...
              </div>
            ) : (
              <select
                value={form.assignedTechnicianId}
                onChange={(e) => handleChange('assignedTechnicianId', e.target.value)}
                className="select-field"
              >
                <option value="">Unassigned</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
