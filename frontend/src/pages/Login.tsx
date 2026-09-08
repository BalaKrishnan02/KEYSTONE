import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock, Shield, Clock, BarChart3, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (eEmail: string, ePassword: string) => {
    setLoading(true);
    try {
      await login(eEmail, ePassword);
      toast.success('Welcome back!');
      const savedUser = JSON.parse(localStorage.getItem('keystone_user') || '{}');
      switch (savedUser.role) {
        case 'MANAGER':
        case 'DISPATCHER':
          navigate('/dashboard');
          break;
        case 'TECHNICIAN':
          navigate('/my-jobs');
          break;
        case 'CUSTOMER':
          navigate('/portal');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }
    handleLogin(email.trim().toLowerCase(), password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-sidebar relative overflow-hidden flex-col justify-between p-12">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-success-500/8 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/30">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl tracking-tight">KEYSTONE</h1>
              <p className="text-neutral-500 text-[10px] tracking-[0.2em] uppercase font-medium">Facility Solutions</p>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Vertexa Facility<br />Solutions Pvt. Ltd.
          </h2>
          <p className="text-neutral-400 text-base leading-relaxed max-w-md mb-10">
            Enterprise-grade facility management platform. Streamline work orders,
            manage technicians, track SLAs, and deliver exceptional service.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: <Shield size={18} />, text: 'SLA Monitoring' },
              { icon: <Clock size={18} />, text: 'Real-time Tracking' },
              { icon: <BarChart3 size={18} />, text: 'Analytics & Reports' },
              { icon: <Wrench size={18} />, text: 'Technician Portal' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-accent-400">{f.icon}</span>
                <span className="text-neutral-300 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-10">
          {[
            { label: 'Work Orders', value: '10K+' },
            { label: 'Technicians', value: '500+' },
            { label: 'SLA Compliance', value: '98%' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-neutral-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-white text-2xl font-bold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-neutral-700 font-bold text-xl tracking-tight">KEYSTONE</h1>
              <p className="text-neutral-400 text-[10px] tracking-[0.2em] uppercase font-semibold">Facility Solutions</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-700 mb-1 tracking-tight">Welcome back</h2>
          <p className="text-body text-neutral-400 mb-8">Sign in to access your KEYSTONE dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-300 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field pl-9"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-300 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-9"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm shadow-md shadow-accent-500/15 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-600 hover:text-accent-700 font-semibold transition-colors">
              Sign up
            </Link>
          </p>

          <p className="mt-8 text-center text-caption text-neutral-300">
            &copy; {new Date().getFullYear()} Vertexa Facility Solutions Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
