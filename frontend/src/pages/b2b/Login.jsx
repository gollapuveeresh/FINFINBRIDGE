import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useB2BAuth } from '../../context/B2BAuthContext';

export default function B2BLogin() {
  const { login } = useB2BAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome, ${data.companyName}`);
      navigate('/b2b/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">account_balance</span>
            </div>
            <span className="text-2xl font-bold text-accent">FinBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Business Portal</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your company account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Business Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                placeholder="admin@yourcompany.com" required />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            New company?{' '}
            <Link to="/b2b/register" className="text-secondary hover:underline font-semibold">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
