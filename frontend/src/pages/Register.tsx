import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, User, Mail, Lock, Building, Shield, Workflow, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserRoleType = 'CUSTOMER' | 'MANAGER' | 'DISPATCHER' | 'TECHNICIAN';

export default function Register() {
  const [role, setRole] = useState<UserRoleType>('CUSTOMER');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please enter name, email, and password');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const payload: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    };

    setLoading(true);
    try {
      await register(payload);
      toast.success('Registration successful!');
      
      // Redirect to correct workspace
      if (role === 'CUSTOMER') {
        navigate('/portal');
      } else if (role === 'TECHNICIAN') {
        navigate('/my-jobs');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'CUSTOMER' as UserRoleType,
      label: 'Customer',
      desc: 'Client portal access',
      icon: Building,
      color: 'bg-warning-50 border-warning-400 text-warning-600 ring-warning-200',
    },
    {
      value: 'MANAGER' as UserRoleType,
      label: 'Manager',
      desc: 'Admin dashboard',
      icon: Shield,
      color: 'bg-accent-50 border-accent-400 text-accent-600 ring-accent-200',
    },
    {
      value: 'DISPATCHER' as UserRoleType,
      label: 'Dispatcher',
      desc: 'Dispatch & operations',
      icon: Workflow,
      color: 'bg-accent-50 border-accent-400 text-accent-600 ring-accent-200',
    },
    {
      value: 'TECHNICIAN' as UserRoleType,
      label: 'Technician',
      desc: 'Field technical work',
      icon: Wrench,
      color: 'bg-success-50 border-success-400 text-success-600 ring-success-200',
    },
  ];

  const inputClass =
    'w-full bg-surface-sidebar/80 border border-white/10 text-neutral-100 placeholder-neutral-500 rounded-control pl-11 pr-4 h-11 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all';

  return (
    <div className="min-h-screen bg-surface-sidebar flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-success-500/6 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-10 py-6 animate-fade-in">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
              <span className="text-white font-black text-xl">K</span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-2xl tracking-tight">KEYSTONE</h1>
              <p className="text-neutral-500 text-[10px] tracking-[0.25em] uppercase font-semibold">Facility Solutions</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-700/40 backdrop-blur-2xl border border-white/10 rounded-lg-card p-8 md:p-10 shadow-dialog relative overflow-hidden">
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Create Account</h2>
            <p className="text-neutral-400 text-sm">Select a role and enter your details to register</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div>
              <label className="label text-neutral-300">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((item) => {
                  const Icon = item.icon;
                  const isActive = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`flex items-start gap-2.5 p-3 border rounded-card text-left transition-all ${
                        isActive 
                          ? `${item.color} ring-2 ring-offset-2 ring-offset-surface-sidebar` 
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:text-neutral-200 hover:bg-white/8'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded-control ${isActive ? 'bg-white/15' : 'bg-white/5'}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${isActive ? '' : 'text-white'}`}>{item.label}</p>
                        <p className="text-[9px] text-neutral-500 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credentials */}
            <div className="space-y-4">
              <div>
                <label className="label text-neutral-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="label text-neutral-300">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="label text-neutral-300">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm shadow-md shadow-accent-500/15 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-400 hover:text-accent-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="flex justify-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
